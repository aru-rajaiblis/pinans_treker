/**
 * Pending Transaction State
 *
 * In-memory store for transactions awaiting user confirmation.
 * Keyed by the user's WhatsApp JID (remoteJid).
 *
 * Flow:
 *  1. AI extracts data → stored here as "pending"
 *  2. User replies "ya" → confirmed & cleared
 *  3. User sends correction → re-extracted & updated here
 */

import { TransactionData } from "./groq";

// ── Types ────────────────────────────────────────────────────────────────────

/** Union of all extractable data shapes */
export type PendingData = TransactionData;

export interface PendingEntry {
  /** The extracted data awaiting confirmation */
  data: PendingData;
  /** Timestamp when it was stored (for potential TTL cleanup later) */
  createdAt: number;
}

// ── Store ────────────────────────────────────────────────────────────────────

const pendingTransactions = new Map<string, PendingEntry>();

/**
 * Store a pending transaction for a user.
 */
export function setPending(jid: string, data: PendingData): void {
  pendingTransactions.set(jid, { data, createdAt: Date.now() });
  console.log(`📋 Pending transaction stored for ${jid}`);
}

/**
 * Get the pending transaction for a user, if any.
 */
export function getPending(jid: string): PendingEntry | undefined {
  return pendingTransactions.get(jid);
}

/**
 * Clear (confirm) the pending transaction for a user.
 */
export function clearPending(jid: string): void {
  pendingTransactions.delete(jid);
  console.log(`🗑️  Pending transaction cleared for ${jid}`);
}

/**
 * Check if a user has a pending transaction.
 */
export function hasPending(jid: string): boolean {
  return pendingTransactions.has(jid);
}

/**
 * Format a PendingData object into a human-readable WhatsApp confirmation message.
 */
export function formatConfirmationMessage(data: PendingData): string {
  const t = data as TransactionData;
  return (
    `🔍 *Data Terdeteksi!*\n\n` +
    `📌 Tipe     : ${t.type === "income" ? "💰 Pemasukan" : "💸 Pengeluaran"}\n` +
    `💵 Nominal  : Rp ${t.amount.toLocaleString("id-ID")}\n` +
    `🏷️ Kategori : ${t.category}\n` +
    `📝 Ket      : ${t.description}\n\n` +
    `Ketik *'ya'* untuk simpan, atau balas dengan perbaikan.\n` +
    `Contoh: _"salah, itu buat bensin 50000"_`
  );
}
