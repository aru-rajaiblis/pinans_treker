/**
 * Environment Configuration
 * Loads and validates environment variables from .env file.
 */

import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  /** Port for the Express server */
  PORT: parseInt(process.env.PORT || "3000", 10),

  /** Supabase project URL */
  SUPABASE_URL: process.env.SUPABASE_URL || "",

  /** Supabase service-role or anon key */
  SUPABASE_KEY: process.env.SUPABASE_KEY || "",

  /** Directory to persist WhatsApp auth session files */
  AUTH_DIR: process.env.AUTH_DIR || "./auth_sessions",

  /** Groq API key for text extraction */
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
} as const;
