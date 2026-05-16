import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  WASocket,
  proto,
  makeCacheableSignalKeyStore,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import path from "path";
import * as qrcodeTerminal from "qrcode-terminal";
import { ENV } from "../config/env";
import { extractTransaction, applyCorrection, generateReport } from "./groq";
import {
  setPending,
  getPending,
  clearPending,
  hasPending,
  formatConfirmationMessage,
} from "./state";
import { saveToDatabase, getSummary } from "./supabase";

// ── Logger ──────────────────────────────────────────────────────────────────
// Baileys is very chatty; keep it silent unless we need to debug.
const logger = pino({ level: "silent" });

/**
 * Start the WhatsApp socket connection.
 * Returns the active socket so other modules can send messages later.
 */
export async function startWhatsApp(): Promise<WASocket> {
  // ── 1. Load / create auth state ────────────────────────────────────────
  const authDir = path.resolve(ENV.AUTH_DIR);
  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  console.log(`📂 Auth session directory: ${authDir}`);

  // ── 2. Create the socket ───────────────────────────────────────────────
  const sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    logger,
    printQRInTerminal: false,
    browser: ["FinanceTracker", "Chrome", "1.0.0"],
  });

  // ── 3. Persist credentials on every update ─────────────────────────────
  sock.ev.on("creds.update", saveCreds);

  // ── 4. Connection status handler ───────────────────────────────────────
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrcodeTerminal.generate(qr, { small: true });
      console.log("📱 Scan the QR code above to link your WhatsApp account.");
    }

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log(
        `❌ Connection closed (code ${statusCode}). ` +
          (shouldReconnect
            ? "Reconnecting…"
            : "Session logged out — please delete auth_sessions and restart.")
      );

      if (shouldReconnect) {
        startWhatsApp();
      }
    }

    if (connection === "open") {
      console.log("✅ WhatsApp connection established successfully!");
    }
  });

  // ── 5. Incoming message listener ───────────────────────────────────────
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      if (msg.key.fromMe) continue;

      const sender = msg.key.remoteJid;
      if (!sender) continue;

      const pushName = msg.pushName || "Unknown";

      // Extract text content if available
      const textContent =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        null;

      // ── PENDING STATE LOGIC ────────────────────────────────────────────
      if (hasPending(sender) && textContent) {
        console.log("─".repeat(50));
        console.log(`💬 User responding to pending state (${sender}):`);
        console.log(`   "${textContent}"`);
        console.log("─".repeat(50));

        const pendingEntry = getPending(sender)!;

        // If user confirms
        if (textContent.trim().toLowerCase() === "ya") {
          console.log("💾 Saving to database:", JSON.stringify(pendingEntry.data));
          
          const success = await saveToDatabase(sender, pendingEntry.data);
          
          if (success) {
            clearPending(sender);
            await sock.sendMessage(sender, { text: "✅ Transaksi berhasil dicatat!" });
          } else {
            await sock.sendMessage(sender, { text: "❌ Gagal menyimpan transaksi. Terjadi kesalahan pada database." });
          }
          continue;
        } 
        
        // If user sends a correction
        await sock.sendMessage(sender, { text: "🔄 Memperbarui data..." });
        
        const correctedData = await applyCorrection(pendingEntry.data, textContent);
        
        if (correctedData) {
          setPending(sender, correctedData);
          await sock.sendMessage(sender, { 
            text: formatConfirmationMessage(correctedData) 
          });
        } else {
          await sock.sendMessage(sender, { 
            text: "⚠️ Gagal memahami perbaikan. Silakan coba lagi." 
          });
        }
        
        continue;
      }

      // ── COMMAND INTERCEPTORS ──────────────────────────────────────────
      if (textContent) {
        const command = textContent.trim().toLowerCase();
        
        // Check for reporting keywords
        if (["laporan", "cek saldo", "total", "rekap"].some(keyword => command.includes(keyword))) {
          await sock.sendMessage(sender, { text: "🔍 Menyiapkan laporan keuangan Anda..." });
          
          const summary = await getSummary(sender);
          if (!summary) {
            await sock.sendMessage(sender, { text: "❌ Gagal mengambil data keuangan dari database." });
            continue;
          }

          if (summary.transactionCount === 0) {
            await sock.sendMessage(sender, { text: "📊 Anda belum mencatat transaksi apa pun di bulan ini." });
            continue;
          }

          const reportText = await generateReport(summary);
          
          if (reportText) {
            await sock.sendMessage(sender, { text: reportText });
          } else {
            await sock.sendMessage(sender, { text: "⚠️ Berhasil mengambil data, tetapi AI gagal membuat laporan. Coba lagi." });
          }
          
          continue;
        }
      }

      // ── TEXT → New Transaction Extraction ─────────────────────────────
      if (textContent) {
        console.log("─".repeat(50));
        console.log(`💬 Text from ${pushName} (${sender})`);
        console.log(`   "${textContent}"`);
        console.log("─".repeat(50));

        await sock.sendMessage(sender, { text: "🔍 Mengekstrak data..." });
        const result = await extractTransaction(textContent);

        if (result) {
          console.log("✅ Extracted transaction:", JSON.stringify(result, null, 2));
          
          setPending(sender, result);
          await sock.sendMessage(sender, { text: formatConfirmationMessage(result) });
        } else {
          await sock.sendMessage(sender, {
            text: "⚠️ Maaf, saya tidak bisa mengekstrak data transaksi dari pesan ini. Coba kirim ulang dengan format yang lebih jelas, contoh: \"Beli kopi di Starbucks 55000\"",
          });
        }

        continue;
      }

      // ── IMAGE → Unsupported ─────────────────────────────────────────
      const imageMessage = msg.message?.imageMessage || null;
      if (imageMessage) {
        await sock.sendMessage(sender, { 
          text: "⚠️ Maaf, fitur deteksi nota/struk otomatis dari gambar telah dinonaktifkan sepenuhnya. Silakan ketik transaksi Anda secara manual." 
        });
        continue;
      }

      // ── Protocol / System Messages (ignore) ───────────────────────────
      const messageType = Object.keys(msg.message || {})[0];
      if (
        !messageType ||
        messageType === "protocolMessage" ||
        messageType === "senderKeyDistributionMessage" ||
        messageType === "messageContextInfo" ||
        messageType === "reactionMessage"
      ) {
        continue;
      }

      // ── Other message types ────────────────────────────────────────────
      console.log(`📩 Unsupported message type (${messageType}) from ${sender}`);
    }
  });

  return sock;
}
