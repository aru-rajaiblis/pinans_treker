/**
 * Finance Tracker Bot — Entry Point
 *
 * Boots up:
 *  1. Express HTTP server (health check & future API routes)
 *  2. WhatsApp connection via Baileys (QR scan, message listener)
 */

import { startServer } from "./server";
import { startWhatsApp } from "./lib/whatsapp";

async function main() {
  console.log("═".repeat(50));
  console.log("  💰 Finance Tracker Bot — Starting Up");
  console.log("═".repeat(50));

  // 1. Start Express
  startServer();

  // 2. Connect to WhatsApp
  console.log("\n🔌 Connecting to WhatsApp…");
  await startWhatsApp();
}

main().catch((err) => {
  console.error("🔥 Fatal error during startup:", err);
  process.exit(1);
});
