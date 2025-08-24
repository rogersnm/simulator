# Financial Simulator - Remix SPA

A modern web application that replicates the financial simulation from `code.py` with an interactive interface.

## Features

- **Interactive Input Form**: Adjust all key parameters in real-time
- **Key Metrics Dashboard**: View IRR, terminal value, conversion rates, and more
- **4 Interactive Charts**:
  1. Financial Performance (Revenue, COGS, OPEX, EBITDA over time)
  2. User Metrics (Utilising Users vs EE Population)
  3. EE Population Growth (bar chart showing growth with 10% CAGR)
  4. Monthly Cash Flow (positive/negative cash flows)

## Getting Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start the development server**:

   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

## Default Parameters

The application starts with the same default values as the Python code:

- EE Population: 2,260,000
- Activation Rate: 0.75
- Adoption Rate: 0.36
- Utilisation Rate: 0.1
- Monthly Revenue Per User: £4
- Gross Margin: 0.8
- Monthly OPEX: £100,000
- Investment Period Length: 12 months
- Investment Monthly OPEX: £100,000
- Terminal Multiple: 20

## Key Calculations

The application implements the same financial model as `code.py`:

1. **Investment Period**: 12 months of investment with no revenue
2. **Ramp-up Period**: 12 months of linear revenue growth
3. **Steady State**: 48 months of full revenue with 10% CAGR population growth
4. **Terminal Value**: Calculated at year 6 using terminal multiple
5. **IRR**: Internal Rate of Return including terminal value

## Technology Stack

- **Remix**: Full-stack React framework
- **TypeScript**: Type-safe development
- **Recharts**: Interactive charts and visualizations
- **Modern CSS**: Responsive design with gradients and animations

## File Structure

```
app/
├── routes/
│   └── _index.tsx          # Main application route
├── utils/
│   └── financial.ts        # Financial calculation logic
├── entry.client.tsx        # Client-side entry point
├── entry.server.tsx        # Server-side entry point
└── root.tsx                # Root layout with styling
```

## Validation

The financial calculations have been carefully ported from the Python code to ensure accuracy. The IRR calculation uses the Newton-Raphson method for precise results.
