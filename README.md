# Finance Dashboard

A premium, interactive finance dashboard built with React, Vite, and designed with a modern glassmorphism aesthetic.

## Features

- **Dashboard Overview**: Summary cards showing Total Balance, Income, and Expenses.
- **Visualizations**: 
  - A line chart tracking your balance trend over time.
  - A pie chart showing your spending breakdown by category.
- **Transactions Section**: A robust list of transactions with searching, filtering (Income/Expense), and real-time updates.
- **Insights Area**: AI-like insights dynamically generated from your data such as your highest spending category and savings rate.
- **Role-Based UI**:
  - `Admin`: Can add new transactions and view data.
  - `Viewer`: Can only view data and export. Add functionality is hidden.
  - Toggle between roles using the dropdown at the top right.
- **State Management**: Simple but effective usage of React hooks (`useState`, `useMemo`, `useEffect`) without the bulk of external state libraries, cleanly isolating derived state for performance. Data is persisted to `localStorage`.
- **Export Data**: Download your transaction data as JSON.
- **Premium Aesthetics**: Glassmorphic elements, modern gradients, sophisticated dark theme, and micro-animations upon load.

## Tech Stack

- **Framework**: React 18 + Vite (TypeScript)
- **Styling**: Vanilla CSS with CSS Variables for theme management, achieving a dynamic glass UI.
- **Charts**: Recharts for responsive and interactive SVGs.
- **Icons**: Lucide React for consistent and crisp iconography.

## Setup Instructions

1. Ensure you have Node.js installed.
2. Clone into the repository.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Assumptions & Explanations

- **Data Parsing Engine:** I designed a simple hook structure where everything is driven by an underlying log of `transactions` along with derived memoized states (`useMemo`) to keep everything up to date with zero boilerplate.
- **Roles:** For this demonstration, you can swap between 'viewer' and 'admin'. State switches instantly reflect interface limitations (disabled buttons, absent actions).
- **Design Philosophy:** I purposefully avoided heavy UI framework libraries (like MUI or Tailwind) to demonstrate strong competency with structural CSS layout (Grid/Flexbox) and crafting custom, smooth, non-standard behaviors like glass backdrops.
