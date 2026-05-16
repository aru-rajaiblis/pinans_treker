# Task 2: Supabase Client Setup & Server-Side Data Fetching

**Context:** We have an existing `transactions` table in Supabase. We need the frontend to securely read from it.

**Objective:** Establish database connection in Next.js and fetch transaction data.

**Requirements:**

*   Install `@supabase/supabase-js` or `@supabase/ssr`.
*   Create a Supabase client utility file utilizing the existing environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`).
*   Write a Server Component function (`app/actions/getTransactions.ts` or similar) to fetch rows from the `transactions` table.
*   For testing purposes, filter the query by a hardcoded `user_id` (use the WhatsApp number from the successful backend logs).

**Definition of Done (DoD):** Raw JSON data from the Supabase `transactions` table can be fetched and logged into the Next.js server console successfully.
