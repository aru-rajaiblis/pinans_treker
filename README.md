# Finance Tracker — AI-Powered WhatsApp Bot & Dashboard

![Finance Tracker Dashboard](dashboard_verification_1778910291529.png) <!-- Update with actual screenshot path if needed -->

A full-stack personal finance tracker that allows users to seamlessly log expenses and income via a natural language WhatsApp bot, and visualize their financial health on a stunning, premium dark-mode web dashboard.

## 🚀 Features

*   **Conversational AI Input:** Log transactions simply by chatting with a WhatsApp bot. "I just spent 50k on lunch" or "Got my salary 5M today".
*   **Intelligent Parsing:** Powered by Groq AI, the bot understands natural language, categorizes the transaction, and determines if it's an income or expense.
*   **Real-time Database:** All transactions are securely stored and synced instantly using Supabase (PostgreSQL).
*   **Premium Web Dashboard:** A responsive, dark-mode-first Next.js web application built with modern aesthetics.
*   **Interactive Visualizations:** View trend lines (AreaChart) and category breakdowns (DonutChart) rendered dynamically with Recharts.
*   **Audit Trail:** A clean, sortable table component to view all recent transactions with colored badges for quick scanning.

## 💻 Tech Stack

### Backend (WhatsApp Bot)
*   **Node.js & TypeScript:** Core runtime and language.
*   **Baileys:** WhatsApp Web API library for receiving and sending messages.
*   **Groq SDK:** High-speed LLM inference for parsing user intents.
*   **Supabase Client:** For database operations.

### Frontend (Web Dashboard)
*   **Next.js 16 (App Router):** React framework for server-rendered UI and Server Actions.
*   **Tailwind CSS v4:** Utility-first CSS framework tailored for a dark fintech theme.
*   **Shadcn UI:** Reusable, accessible components (Table, Badge, Sidebar layout).
*   **Recharts:** Composable charting library for React.

### Database
*   **Supabase (PostgreSQL):** Relational database storing the `transactions` table.

## 🛠️ Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   A Supabase project
*   A Groq API key

### 1. Clone the Repository
```bash
git clone https://github.com/aru-rajaiblis/pinans_treker.git
cd pinans_treker
```

### 2. Backend Setup
1. Install dependencies in the root folder:
   ```bash
   npm install
   ```
2. Create a `.env` file in the root directory (see [Environment Variables](#environment-variables)).
3. Start the backend server to initialize the WhatsApp bot:
   ```bash
   npm run dev
   ```
4. Scan the QR code generated in your terminal with your WhatsApp app to link the bot.

### 3. Frontend Dashboard Setup
1. Navigate to the `dashboard` directory:
   ```bash
   cd dashboard
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the `dashboard` directory.
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Environment Variables

You need to set up the following environment variables. 

**Root `.env` (Backend):**
```env
# Supabase
SUPABASE_URL="your-supabase-project-url"
SUPABASE_KEY="your-supabase-service-role-key"

# Groq
GROQ_API_KEY="your-groq-api-key"

# WhatsApp Auth Storage
AUTH_DIR=./auth_sessions
PORT=3000
```

**`dashboard/.env.local` (Frontend):**
```env
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

## 🧪 Populating Showcase Data

If you want to test the dashboard with realistic dummy data without chatting to the bot 35 times, you can run the provided seed script from the root directory:

```bash
npx ts-node seed.ts
```
*This will generate 35 randomized income and expense transactions spread across the last 14 days.*

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
