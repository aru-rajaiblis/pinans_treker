# Task 3: Layout & Metric Summary Cards Implementation

**Context:** Based on the fintech design layout, we need the core structure and top metrics.

**Objective:** Build the modern dark-mode dashboard layout and financial summary cards.

**Requirements:**

*   Create a responsive dashboard layout with a minimalist sidebar navigation (Dashboard, Transactions, Settings) using Shadcn components.
*   Build 3 Top Metric Cards using Tremor (Card, Metric, Text components):
    *   **Total Income:** Sum of all transactions where `type = 'income'`.
    *   **Total Expense:** Sum of all transactions where `type = 'expense'`.
    *   **Net Balance:** Income minus Expense.
*   Implement automatic currency formatting to Indonesian Rupiah (IDR).

**Definition of Done (DoD):** The dashboard page displays a dark-mode layout with 3 dynamic metric cards calculated directly from the Supabase data.
