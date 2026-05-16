# Product Requirements Document (PRD): Dual-Interface Finance Tracker

## 1. Product Overview
The Finance Tracker is a modern, AI-powered personal finance management system designed to provide a frictionless experience for logging and analyzing expenses and incomes. It features a seamless dual-interface approach:
1. **WhatsApp Bot**: A highly accessible, conversational interface powered by Groq (Llama 3) for logging transactions on the go using natural language.
2. **Web Dashboard**: A responsive, rich analytics web application built with Next.js and Tremor to visualize financial data stored in Supabase.

## 2. Target Audience
- Individuals who find traditional budgeting apps tedious and prefer logging expenses conversationally.
- Users who want real-time, AI-generated insights into their spending habits via WhatsApp.
- Users who require a comprehensive visual overview of their finances through a dedicated web dashboard.

## 3. Core Features & Capabilities

### 3.1. WhatsApp Bot Interface (Backend)
- **Natural Language Processing**: Users can send unstructured text (e.g., "I just spent $15 on a burger at McDonald's"). The bot uses Groq's `llama-3.3-70b-versatile` model to extract structured data (`type`, `amount`, `category`, `description`).
- **Transaction Confirmation Workflow**: 
  - Extracted data is held in an in-memory pending state (`pendingTransactions`).
  - The bot asks for user confirmation ("ya") before committing to the database.
- **AI-Powered Corrections**: If the AI misinterprets the text, users can reply with corrections (e.g., "No, it was for gas"). The bot intelligently applies the correction using AI before saving.
- **On-Demand Financial Reporting**: Users can request summaries using keywords ("laporan", "cek saldo", "rekap"). The bot aggregates current month data from Supabase and uses Groq to generate a friendly, human-readable financial advisory report.
- **Session Persistence**: Multi-device auth session is saved locally so the bot doesn't require frequent QR re-scanning.

### 3.2. Web Dashboard (Frontend)
- **Visual Analytics**: Interactive charts and graphs built with Tremor and Tailwind CSS to display spending trends, category breakdowns, and income vs. expense comparisons.
- **Responsive Design**: Accessible on both desktop and mobile browsers.
- **Real-Time Data**: Directly queries Supabase to ensure data consistency with the WhatsApp bot.

## 4. Technical Stack
- **Backend**: Node.js, TypeScript, Express.js.
- **WhatsApp Integration**: `@whiskeysockets/baileys` for direct WhatsApp Web API interaction.
- **AI & NLP**: `groq-sdk` utilizing `llama-3.3-70b-versatile` for fast, intelligent JSON extraction and natural language generation.
- **Database**: Supabase (PostgreSQL) using `@supabase/supabase-js`.
- **Frontend**: Next.js, React, Tailwind CSS, Tremor (for charting).

## 5. Database Schema
The system uses a PostgreSQL database hosted on Supabase.
### `transactions` table
| Column Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, auto-generated |
| `user_id` | `text` | The WhatsApp number / remote JID of the user |
| `amount` | `numeric` | Transaction amount |
| `type` | `text` | `expense` or `income` |
| `category` | `text` | Transaction category (e.g., Food, Transport) |
| `description` | `text` | Raw or AI-summarized description of the transaction |
| `created_at` | `timestamptz` | Timestamp of the transaction |

## 6. System Architecture & Flow
1. **Input**: User sends a WhatsApp message.
2. **Routing**: `whatsapp.ts` intercepts the message. If it's a reporting keyword, it routes to `supabase.ts` for aggregation, then `groq.ts` for summarization. If it's a transaction, it routes to `groq.ts` for extraction.
3. **State Management**: Extracted transactions wait in `state.ts`.
4. **Correction/Confirmation**: User confirms or corrects.
5. **Storage**: On confirmation, data is inserted into Supabase via `supabase.ts`.
6. **Dashboard**: The Next.js frontend fetches the latest Supabase records to update charts.

## 7. Future Enhancements
- **Receipt OCR Integration**: Reactivate Image/Vision support once a reliable and fast vision model (e.g., Gemini Vision or updated Groq Vision) is available.
- **Multi-User Support/Groups**: Shared expense tracking for households or groups.
- **Budget Alerts**: Proactive WhatsApp notifications when spending nears predefined limits.
