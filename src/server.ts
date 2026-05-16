/**
 * Express Server
 * Provides HTTP endpoints (health check, future webhooks, etc.)
 */

import express, { Request, Response } from "express";
import { ENV } from "./config/env";

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());

// ── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Start the Express server and return the app instance.
 */
export function startServer() {
  app.listen(ENV.PORT, () => {
    console.log(`🚀 Express server running on http://localhost:${ENV.PORT}`);
    console.log(`   Health check → http://localhost:${ENV.PORT}/health`);
  });

  return app;
}
