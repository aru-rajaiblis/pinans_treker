# Task 5: Recent Transactions Table Component

**Context:** Users need to see a detailed audit log of what the WhatsApp bot has captured.

**Objective:** Build a clean data table for recent activities.

**Requirements:**

*   Use Shadcn Table components to build a "Recent Transactions" log at the bottom of the dashboard.
*   Display columns: Date, Description, Category, Type (with a visual badge: Green for Income, Red for Expense), and Amount.
*   Sort the table out-of-the-box to display the newest transactions first (`order('created_at', { ascending: false })`).

**Definition of Done (DoD):** A clean, responsive list of recent transactions is visible, accurately displaying rows that sync with what you input from WhatsApp.
