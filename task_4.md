# Task 4: Visualizations & Analytics Charts

**Context:** Financial data is best understood visually. We need to implement the Area and Donut charts.

**Objective:** Render Tremor charts driven by real database records.

**Requirements:**

*   **Trend Chart (AreaChart):** Aggregate transaction amounts by date (`created_at`) to display daily spending/income trends for the current month.
*   **Category Breakdown (DonutChart):** Group expenses by the `category` column (e.g., food, transport, bills) and display their relative proportions.
*   Ensure both charts have responsive containers, smooth tooltips, and a color palette that matches a premium dark fintech theme (e.g., teal, emerald, slate).

**Definition of Done (DoD):** Both the AreaChart and DonutChart render correctly on the page, dynamically reflecting the data stored in Supabase.
