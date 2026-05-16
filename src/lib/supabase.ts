/**
 * Supabase Client
 * Singleton instance of the Supabase client for database operations.
 * Handles insertion and querying of transaction data.
 */

import { createClient } from "@supabase/supabase-js";
import { ENV } from "../config/env";
import { TransactionData } from "./groq";

// Only create the client if credentials are provided
export const supabase =
  ENV.SUPABASE_URL && ENV.SUPABASE_KEY
    ? createClient(ENV.SUPABASE_URL, ENV.SUPABASE_KEY)
    : null;

if (!supabase) {
  console.warn(
    "⚠️  Supabase credentials not set — database features will be disabled."
  );
}

/**
 * Save a confirmed transaction to the database.
 * @param userId - The user's WhatsApp JID
 * @param data - The extracted and confirmed transaction data
 */
export async function saveToDatabase(
  userId: string,
  data: TransactionData
): Promise<boolean> {
  if (!supabase) {
    console.error("❌ Supabase client is not initialized.");
    return false;
  }

  try {
    const { error } = await supabase.from("transactions").insert([
      {
        user_id: userId,
        amount: data.amount,
        type: data.type,
        category: data.category,
        description: data.description,
      },
    ]);

    if (error) {
      console.error("❌ Supabase insert error:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("❌ Failed to save transaction to database:", err);
    return false;
  }
}

/**
 * Get the total net balance for a user (Income - Expense).
 */
export async function getTotalBalance(userId: string): Promise<number | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("amount, type")
      .eq("user_id", userId);

    if (error) {
      console.error("❌ Supabase query error:", error.message);
      return null;
    }

    let total = 0;
    for (const tx of data) {
      if (tx.type === "income") {
        total += Number(tx.amount);
      } else if (tx.type === "expense") {
        total -= Number(tx.amount);
      }
    }

    return total;
  } catch (err) {
    console.error("❌ Failed to query total balance:", err);
    return null;
  }
}

/**
 * Get the total expenses for a user.
 */
export async function getTotalExpense(userId: string): Promise<number | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", userId)
      .eq("type", "expense");

    if (error) {
      console.error("❌ Supabase query error:", error.message);
      return null;
    }

    let total = 0;
    for (const tx of data) {
      total += Number(tx.amount);
    }

    return total;
  } catch (err) {
    console.error("❌ Failed to query total expense:", err);
    return null;
  }
}

// ── AI Reporting Aggregation ──────────────────────────────────────────────────

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  expensesByCategory: Record<string, number>;
  transactionCount: number;
}

/**
 * Fetch and aggregate all transactions for the current calendar month.
 */
export async function getSummary(userId: string): Promise<FinancialSummary | null> {
  if (!supabase) return null;

  try {
    // Get the first day of the current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data, error } = await supabase
      .from("transactions")
      .select("amount, type, category")
      .eq("user_id", userId)
      .gte("created_at", firstDay);

    if (error) {
      console.error("❌ Supabase query error:", error.message);
      return null;
    }

    const summary: FinancialSummary = {
      totalIncome: 0,
      totalExpense: 0,
      netBalance: 0,
      expensesByCategory: {},
      transactionCount: data.length,
    };

    if (data.length === 0) return summary;

    for (const tx of data) {
      const amount = Number(tx.amount);
      if (tx.type === "income") {
        summary.totalIncome += amount;
      } else if (tx.type === "expense") {
        summary.totalExpense += amount;
        
        // Group by category
        const cat = tx.category || "other";
        summary.expensesByCategory[cat] = (summary.expensesByCategory[cat] || 0) + amount;
      }
    }

    summary.netBalance = summary.totalIncome - summary.totalExpense;

    return summary;
  } catch (err) {
    console.error("❌ Failed to query summary:", err);
    return null;
  }
}
