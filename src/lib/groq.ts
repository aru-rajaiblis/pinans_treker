/**
 * Groq API Integration
 *
 * Uses the groq-sdk for:
 *  - Text extraction (Llama 3.3 70B) → extractTransaction()
 *  - Receipt image OCR (Llama 3.2 Vision) → processReceipt()
 */

import Groq from "groq-sdk";
import { ENV } from "../config/env";

// ── Types ────────────────────────────────────────────────────────────────────

/** Structured transaction extracted from text */
export interface TransactionData {
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
}

// ── Groq Client ──────────────────────────────────────────────────────────────

const groq = new Groq({ apiKey: ENV.GROQ_API_KEY });

// ── Prompts ──────────────────────────────────────────────────────────────────

const TEXT_SYSTEM_PROMPT = `You are a financial data extractor. Extract the transaction details from the user's text. Respond ONLY with a valid JSON object containing: { "type": "income" | "expense", "amount": number, "category": string, "description": string }. If the text is a pasted bank mutation, extract the exact amount and merchant. Do not include any markdown formatting, code fences, or extra text — output raw JSON only.`;

// ══════════════════════════════════════════════════════════════════════════════
// TEXT EXTRACTION (Llama 3.3 70B)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Send a user's text message to Groq and extract transaction data.
 * Returns the parsed TransactionData, or null if extraction fails.
 */
export async function extractTransaction(
  userText: string
): Promise<TransactionData | null> {
  try {
    console.log("🤖 Sending text to Groq for extraction…");

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: TEXT_SYSTEM_PROMPT },
        { role: "user", content: userText },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const rawText = chatCompletion.choices[0]?.message?.content?.trim();

    if (!rawText) {
      console.error("🤖 Groq returned an empty response.");
      return null;
    }

    const parsed: TransactionData = JSON.parse(rawText);

    if (!parsed.type || !parsed.amount || !parsed.category) {
      console.error("🤖 Groq returned incomplete data:", parsed);
      return null;
    }

    return parsed;
  } catch (err) {
    console.error("🤖 Groq text extraction failed:", err);
    return null;
  }
}

/**
 * Apply a user's correction to an existing pending transaction.
 */
export async function applyCorrection(
  previousData: any,
  correctionText: string
): Promise<TransactionData | null> {
  try {
    console.log("🤖 Sending correction to Groq…");

    const prompt = `You are a financial data assistant. The user wants to correct this existing transaction data:
${JSON.stringify(previousData, null, 2)}

User's correction: "${correctionText}"

Update the JSON object to reflect the user's correction. Respond ONLY with a valid JSON object matching the exact structure of the previous data. Do not include any markdown formatting, code fences, or extra text — output raw JSON only.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const rawText = chatCompletion.choices[0]?.message?.content?.trim();

    if (!rawText) return null;

    const parsed = JSON.parse(rawText);
    return parsed;
  } catch (err) {
    console.error("🤖 Groq correction failed:", err);
    return null;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// AI REPORT GENERATION (Llama 3.3 70B)
// ══════════════════════════════════════════════════════════════════════════════

const REPORT_SYSTEM_PROMPT = `You are a friendly and professional financial advisor. Based on the provided financial data for this month, write a short and friendly summary of the user's finances. 
Highlight their total income, total expenses, and their net balance. Mention their biggest spending category and offer a brief encouraging tip.
Format the response nicely for WhatsApp (use emojis and bold text like *this*). ALWAYS format currency values in Indonesian Rupiah (e.g., "Rp 50.000"). MUST write the entire response in friendly Bahasa Indonesia. Do not invent any numbers. If there is no data, tell them they haven't made any transactions this month.`;

/**
 * Generate a friendly text report based on aggregate financial data.
 */
export async function generateReport(summaryData: any): Promise<string | null> {
  try {
    console.log("🤖 Generating financial report via Groq…");

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: REPORT_SYSTEM_PROMPT },
        { role: "user", content: `Here is the data for this month: ${JSON.stringify(summaryData)}` },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
    });

    const reportText = chatCompletion.choices[0]?.message?.content?.trim();
    return reportText || null;
  } catch (err) {
    console.error("🤖 Groq report generation failed:", err);
    return null;
  }
}
