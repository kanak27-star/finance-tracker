# Finance Dashboard UI

This is a React + Vite dashboard built with Tailwind CSS and static mock data. It demonstrates frontend UI design, responsive layout, state handling, and simulated role-based UI behavior.

## What is included

- Summary cards for Current Balance, Income, and Expenses
- Time-based balance trend visualization
- Categorical spending breakdown
- Transactions table with Date, Amount, Category, and Type
- Search, sort, and filter controls
- Viewer/Admin role toggle with admin-only action UI
- Insights section for highest spend category, expense ratio, and monthly comparison
- Responsive layout and empty-state handling

## Assignment alignment

- Dashboard overview: summary cards + charts
- Transactions section: data table with search, sort, and filter
- Role-based UI: Viewer mode is read-only, Admin mode shows extra action controls
- Insights: quick finance observations based on transaction data
- State management: React `useState` and `useMemo` for transactions, filters, sorting, and role
- UI/UX: clean, readable, mobile-friendly interface

## Setup

From `finance_tracker`:

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Notes

This is a frontend-only implementation using mock data. No backend or deployment is required to satisfy the assignment.
