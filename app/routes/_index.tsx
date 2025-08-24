import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  calculateFinancials,
  formatCurrency,
  formatCurrencyWithDecimals,
  formatPercentage,
  type FinancialParams,
} from "~/utils/financial";

const defaultParams: FinancialParams = {
  eePopulation: 2260000,
  activationRate: 0.75,
  adoptionRate: 0.36,
  utilisationRate: 0.1,
  monthlyRevenuePerUser: 4,
  grossMargin: 0.8,
  monthlyOpex: 100000,
  investmentPeriodLength: 12,
  investmentMonthlyOpex: 100000,
  terminalMultiple: 20,
};

export default function Index() {
  const [params, setParams] = useState<FinancialParams>(defaultParams);

  const results = useMemo(() => calculateFinancials(params), [params]);

  const handleInputChange = (field: keyof FinancialParams, value: string) => {
    const numValue = parseFloat(value) || 0;
    setParams((prev) => ({ ...prev, [field]: numValue }));
  };

  // Prepare data for charts
  const financialChartData = results.years.map((year, index) => ({
    year: year.toFixed(1),
    Revenue: Math.round(results.revenues[index]),
    COGS: Math.round(results.cogs[index]),
    OPEX: Math.round(results.opex[index]),
    EBITDA: Math.round(results.ebitda[index]),
  }));

  const usersChartData = results.years.map((year, index) => ({
    year: year.toFixed(1),
    "Utilising Users": Math.round(results.utilisingUsers[index]),
    "EE Population": Math.round(results.eePopulationList[index]),
  }));

  const cashFlowChartData = results.years.map((year, index) => ({
    year: year.toFixed(1),
    "Cash Flow": Math.round(results.cashFlows[index]),
  }));

  const populationGrowthData = results.years.map((year, index) => ({
    year: year.toFixed(1),
    "EE Population": Math.round(results.eePopulationList[index]),
  }));

  return (
    <div className="container">
      <h1>Financial Simulator</h1>

      <div className="grid grid-2">
        {/* Input Parameters */}
        <div className="card">
          <h2>Input Parameters</h2>

          <div className="form-group">
            <label>EE Population</label>
            <input
              type="number"
              value={params.eePopulation}
              onChange={(e) =>
                handleInputChange("eePopulation", e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Activation Rate</label>
            <input
              type="number"
              step="0.01"
              value={params.activationRate}
              onChange={(e) =>
                handleInputChange("activationRate", e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Adoption Rate</label>
            <input
              type="number"
              step="0.01"
              value={params.adoptionRate}
              onChange={(e) =>
                handleInputChange("adoptionRate", e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Utilisation Rate</label>
            <input
              type="number"
              step="0.01"
              value={params.utilisationRate}
              onChange={(e) =>
                handleInputChange("utilisationRate", e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Monthly Revenue Per User (£)</label>
            <input
              type="number"
              value={params.monthlyRevenuePerUser}
              onChange={(e) =>
                handleInputChange("monthlyRevenuePerUser", e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Gross Margin</label>
            <input
              type="number"
              step="0.01"
              value={params.grossMargin}
              onChange={(e) => handleInputChange("grossMargin", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Monthly OPEX (£)</label>
            <input
              type="number"
              value={params.monthlyOpex}
              onChange={(e) => handleInputChange("monthlyOpex", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Investment Period Length (months)</label>
            <input
              type="number"
              value={params.investmentPeriodLength}
              onChange={(e) =>
                handleInputChange("investmentPeriodLength", e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Investment Monthly OPEX (£)</label>
            <input
              type="number"
              value={params.investmentMonthlyOpex}
              onChange={(e) =>
                handleInputChange("investmentMonthlyOpex", e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Terminal Multiple</label>
            <input
              type="number"
              value={params.terminalMultiple}
              onChange={(e) =>
                handleInputChange("terminalMultiple", e.target.value)
              }
            />
          </div>
        </div>

        {/* Key Outputs */}
        <div className="card">
          <h2>Key Outputs</h2>

          <div className="grid grid-2" style={{ gap: "1rem" }}>
            <div className="metric-card">
              <div className="metric-value">
                {formatPercentage(results.irr)}
              </div>
              <div className="metric-label">IRR</div>
            </div>

            <div className="metric-card">
              <div className="metric-value">
                {formatCurrency(Math.round(results.terminalValue))}
              </div>
              <div className="metric-label">Terminal Value</div>
            </div>

            <div className="metric-card">
              <div className="metric-value">
                {Math.round(
                  params.activationRate *
                    params.adoptionRate *
                    params.utilisationRate *
                    100 *
                    100
                ) / 100}
                %
              </div>
              <div className="metric-label">Conversion Rate</div>
            </div>

            <div className="metric-card">
              <div className="metric-value">
                {formatCurrencyWithDecimals(
                  params.monthlyRevenuePerUser * params.grossMargin
                )}
              </div>
              <div className="metric-label">Monthly Gross Profit/User</div>
            </div>

            <div className="metric-card">
              <div className="metric-value">
                {Math.round(
                  results.utilisingUsers[results.utilisingUsers.length - 1]
                ).toLocaleString()}
              </div>
              <div className="metric-label">Final Utilising Users</div>
            </div>

            <div className="metric-card">
              <div className="metric-value">
                {formatCurrency(
                  Math.round(results.ebitda[results.ebitda.length - 1])
                )}
              </div>
              <div className="metric-label">Final Monthly EBITDA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-2">
        {/* Financial Performance Chart */}
        <div className="card">
          <h2>Financial Performance Over Time</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={financialChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  formatter={(value: number) =>
                    formatCurrency(Math.round(value))
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="COGS"
                  stroke="#f59e0b"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="OPEX"
                  stroke="#ef4444"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="EBITDA"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Users Chart */}
        <div className="card">
          <h2>User Metrics Over Time</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usersChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => value.toLocaleString()} />
                <Tooltip
                  formatter={(value: number) =>
                    Math.round(value).toLocaleString()
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Utilising Users"
                  stroke="#ec4899"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="EE Population"
                  stroke="#06b6d4"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* EE Population Growth */}
        <div className="card">
          <h2>EE Population Growth</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={populationGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => value.toLocaleString()} />
                <Tooltip
                  formatter={(value: number) =>
                    Math.round(value).toLocaleString()
                  }
                />
                <Legend />
                <Bar dataKey="EE Population" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
