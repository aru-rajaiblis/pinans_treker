# Full System Design: Dual-Interface Finance Tracker

## 1. Introduction
This document outlines the comprehensive system and UI/UX design for the Finance Tracker, a dual-interface application comprising an AI-powered WhatsApp chatbot and a modern web-based analytics dashboard. This design prioritizes a frictionless user experience (UX) and a premium, responsive user interface (UI) to effectively manage and visualize personal finances.

## 2. Design Principles & Aesthetics
*   **Frictionless Entry:** Logging transactions should be as simple as sending a text message to a friend.
*   **Premium Visuals:** The web dashboard will utilize a modern aesthetic featuring clean lines, ample whitespace, and dynamic data visualization to evoke trust and clarity.
*   **Mobile-First Web:** Ensure the dashboard is highly responsive and behaves like a native app on mobile devices.
*   **Conversational Intelligence:** The bot must understand context, handle errors gracefully, and provide concise, human-like responses.

## 3. UI/UX Design System (Web Dashboard)

### 3.1. Color Palette (Dark Mode Optimized)
The dashboard will use a modern, sleek color scheme to reduce eye strain and highlight critical financial data.
*   **Background:** `#0B0F19` (Deep Navy/Black)
*   **Card/Surface:** `#111827` (Dark Slate)
*   **Primary Accent:** `#3B82F6` (Vibrant Blue - for primary actions and neutral charts)
*   **Success (Income):** `#10B981` (Emerald Green)
*   **Danger (Expense):** `#EF4444` (Rose Red)
*   **Text (Primary):** `#F9FAFB` (Off-white)
*   **Text (Secondary):** `#9CA3AF` (Cool Gray)

### 3.2. Typography
*   **Primary Font:** `Inter` or `Geist` (Modern sans-serif for clean data readability)
*   **Headers:** Bold, clear hierarchy (H1: 32px, H2: 24px, H3: 18px).
*   **Numbers/Metrics:** Use tabular lining for financial figures to ensure alignment in tables and widgets.

### 3.3. Component Architecture
The dashboard is built using **Next.js**, styled with **Tailwind CSS**, and utilizes **Tremor** for high-quality data visualizations.

*   **Layout Wrapper:** Sidebar navigation (desktop) / Bottom tab navigation (mobile) with a main scrollable content area.
*   **Hero KPI Cards (Tremor `Card`):** 
    *   Total Balance, Monthly Income, Monthly Expenses.
    *   Include micro-trend indicators (e.g., "+5% from last month" in green).
*   **Main Visualizations:**
    *   **Area Chart (Tremor):** Income vs. Expense trend over the last 30 days.
    *   **Donut Chart (Tremor):** Expense breakdown by category (Food, Transport, Utilities, etc.).
*   **Recent Transactions Table:** A paginated list showing Date, Description, Category, and Amount (color-coded).

## 4. Chatbot Conversational Experience (WhatsApp)

### 4.1. Bot Persona
*   **Tone:** Helpful, concise, financial-savvy, but approachable.
*   **Language:** Supports natural language (including colloquialisms and mixed languages based on user input).

### 4.2. Core Conversational Flows

*   **Flow 1: Expense Logging**
    *   `User:` "Spent $15 on lunch at McDonald's"
    *   `Bot:` "Got it! Expense: $15.00 for Food (McDonald's). Type 'ya' to confirm or reply with corrections."
    *   `User:` "ya"
    *   `Bot:` "✅ Saved successfully."

*   **Flow 2: AI Correction**
    *   `User:` "Actually it was $25" (Replying to the confirmation prompt)
    *   `Bot:` "Updated. Expense: $25.00 for Food (McDonald's). Type 'ya' to confirm."

*   **Flow 3: Financial Reporting**
    *   `User:` "cek rekap bulan ini" (Check this month's summary)
    *   `Bot (Groq AI Generated):` "Here is your summary for May: You've spent $450 mostly on Food and Utilities. You have an income of $2000. You are well within your usual budget. Great job!"

## 5. System Architecture & Technical Design

### 5.1. High-Level Architecture
The system follows a decoupled architecture:
1.  **WhatsApp Node Service (Backend):** Uses `@whiskeysockets/baileys` to maintain a persistent connection to WhatsApp Web. Intercepts messages, routes them to Groq AI for intent extraction, and manages conversational state in-memory before persisting.
2.  **AI Layer:** `groq-sdk` (`llama-3.3-70b-versatile`) handles Natural Language Processing, data structuring (JSON extraction), and generative responses.
3.  **Database Layer:** Supabase (PostgreSQL) acts as the central source of truth for both interfaces.
4.  **Web Dashboard (Frontend):** A Next.js application that fetches data directly from Supabase via `getServerSideProps` or client-side SWR/React Query for real-time updates.

### 5.2. Database Schema (Supabase)
**Table: `transactions`**
*   `id` (UUID, Primary Key)
*   `user_id` (String/Text, WhatsApp Number JID)
*   `type` (Enum: 'income', 'expense')
*   `amount` (Numeric/Decimal)
*   `category` (String)
*   `description` (String)
*   `created_at` (Timestamp with Timezone)

## 6. API & Integration Design
*   **Supabase Client:** Both the Node.js backend and Next.js frontend initialize a Supabase client using Service Role keys (backend) and Anon keys (frontend/with RLS).
*   **Groq AI Integration:** 
    *   *System Prompt:* "You are a financial data extractor. Output ONLY valid JSON..."
    *   *User Prompt:* Contextualized with the user's latest message and previous pending state.

## 7. Security & Privacy
*   **Row Level Security (RLS):** Supabase policies ensure that the web dashboard only fetches transactions belonging to the authenticated user's ID.
*   **Session Management:** WhatsApp authentication state is saved locally on the Node server to prevent QR code regeneration. Web dashboard uses Supabase Auth.
*   **Data Minimization:** The AI only processes the text of the message; no personal identifiable information (PII) beyond the WhatsApp number is stored unnecessarily.
