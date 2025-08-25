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
  formatDate,
  type FinancialParams,
} from "~/utils/financial";

type LineConfig = {
  dataKey: string;
  stroke: string;
};

type LineChartCardProps = {
  title: string;
  data: any[];
  lines: LineConfig[];
  yAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number) => string;
};

function LineChartCard({
  title,
  data,
  lines,
  yAxisFormatter = (value) => value.toString(),
  tooltipFormatter = (value) => value.toString(),
}: LineChartCardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 0, right: 20, left: 35, bottom: 15 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(timestamp) => formatDate(new Date(timestamp))}
              label={{
                value: "Date",
                position: "insideBottom",
                offset: -5,
              }}
            />
            <YAxis tickFormatter={yAxisFormatter} />
            <Tooltip
              formatter={tooltipFormatter}
              labelFormatter={(timestamp) => {
                const date = new Date(timestamp);
                return date.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                });
              }}
            />
            <Legend verticalAlign="top" height={36} />
            {lines.map((line) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.stroke}
                dot={false}
                strokeWidth={1}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const defaultParams: FinancialParams = {
  startDate: "2022-01-01", // Today's date in YYYY-MM-DD format
  eePopulation: 2260000,
  eePopulationCAGR: 0.1,
  activationRate: 0.75,
  adoptionRate: 0.36,
  utilisationRate: 0.05,
  monthlyRevenuePerUser: 40,
  grossMargin: 0.2,
  monthlyOpex: 300000,
  investmentPeriodLength: 24,
  investmentMonthlyOpex: 200000,
  rampUpPeriodLength: 24,
  steadyStateSimulationLength: 60,
  terminalMultiple: 20,
};

export default function Index() {
  const [params, setParams] = useState<FinancialParams>(defaultParams);

  const results = useMemo(() => calculateFinancials(params), [params]);

  const handleInputChange = (field: keyof FinancialParams, value: string) => {
    if (field === "startDate") {
      setParams((prev) => ({ ...prev, [field]: value }));
    } else {
      const numValue = parseFloat(value) || null;
      setParams((prev) => ({ ...prev, [field]: numValue }));
    }
  };

  // Prepare data for charts
  const financialChartData = results.dates.map((date, index) => ({
    date: date.getTime(), // Use timestamp for proper date handling in recharts
    dateFormatted: formatDate(date),
    Revenue: Math.round(results.revenues[index]),
    COGS: Math.round(results.cogs[index]),
    OPEX: Math.round(results.opex[index]),
    EBITDA: Math.round(results.ebitda[index]),
  }));

  const usersChartData = results.dates.map((date, index) => ({
    date: date.getTime(),
    dateFormatted: formatDate(date),
    "Utilising Users": Math.round(results.utilisingUsers[index]),
    "EE Population": Math.round(results.eePopulationList[index]),
  }));

  const cashFlowChartData = results.dates.map((date, index) => ({
    date: date.getTime(),
    dateFormatted: formatDate(date),
    "Cash Flow": Math.round(results.cashFlows[index]),
  }));

  const populationGrowthData = results.dates.map((date, index) => ({
    date: date.getTime(),
    dateFormatted: formatDate(date),
    "EE Population": Math.round(results.eePopulationList[index]),
  }));

  return (
    <div className="container">
      <h1>Financial Simulator</h1>

      <div className="grid grid-3">
        {/* Input Parameters */}
        <div className="card">
          <h2>Parameters</h2>

          <div className="input-section">
            <h3 className="section-header">Step 1. Initial Conditions</h3>

            <div className="form-group">
              <label>Simulation Start Date</label>
              <input
                type="date"
                value={params.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
              />
            </div>

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
              <label>EE Population CAGR</label>
              <input
                type="number"
                step="0.01"
                value={params.eePopulationCAGR}
                onChange={(e) =>
                  handleInputChange("eePopulationCAGR", e.target.value)
                }
              />
            </div>
          </div>

          <div className="input-section">
            <h3 className="section-header">Step 2. Product conversion rates</h3>
            <div className="form-group">
              <label>
                Activation Rate (proportion of clients that activate product)
              </label>
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
              <label>
                Adoption Rate (proportion of EEs at activated clients that
                enrol)
              </label>
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
              <label>
                Utilisation Rate (proportion of enrolled employees that use the
                product)
              </label>
              <input
                type="number"
                step="0.01"
                value={params.utilisationRate}
                onChange={(e) =>
                  handleInputChange("utilisationRate", e.target.value)
                }
              />
            </div>
          </div>

          <div className="input-section">
            <h3 className="section-header">
              Step 3. Upfront Investment Required
            </h3>

            <div className="form-group">
              <label>Investment OPEX (£)</label>
              <input
                type="number"
                value={params.investmentMonthlyOpex}
                onChange={(e) =>
                  handleInputChange("investmentMonthlyOpex", e.target.value)
                }
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
          </div>

          <div className="input-section">
            <h3 className="section-header">
              Step 4. Product operating economics
            </h3>
            <div className="form-group">
              <label>Monthly Revenue/User (£)</label>
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
                onChange={(e) =>
                  handleInputChange("grossMargin", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Monthly OPEX (£)</label>
              <input
                type="number"
                value={params.monthlyOpex}
                onChange={(e) =>
                  handleInputChange("monthlyOpex", e.target.value)
                }
              />
            </div>
          </div>

          <div className="input-section">
            <h3 className="section-header">Step 5. Simulation periods</h3>
            <div className="form-group">
              <label>Ramp-up Period Length (months)</label>
              <input
                type="number"
                value={params.rampUpPeriodLength}
                onChange={(e) =>
                  handleInputChange("rampUpPeriodLength", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>Steady State Simulation Length (months)</label>
              <input
                type="number"
                value={params.steadyStateSimulationLength}
                onChange={(e) =>
                  handleInputChange(
                    "steadyStateSimulationLength",
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="input-section">
            <h3 className="section-header">Step 6. Terminal valuation</h3>
            <div className="form-group">
              <label>Terminal EBITDA Multiple</label>
              <input
                type="number"
                value={params.terminalMultiple}
                onChange={(e) =>
                  handleInputChange("terminalMultiple", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* Key Outputs */}
        <div className="card">
          <h2>Key Outputs</h2>

          <div className="grid grid-2" style={{ gap: "0.75rem" }}>
            <div className="metric-card">
              <div className="metric-value">
                {results.months.length / 12} years
              </div>
              <div className="metric-label">Simulation Length</div>
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
              <div className="metric-label">Overall Conversion Rate</div>
            </div>

            <div className="metric-card">
              <div className="metric-value">
                {formatCurrencyWithDecimals(
                  params.monthlyRevenuePerUser * params.grossMargin
                )}
              </div>
              <div className="metric-label">Monthly GP/User</div>
            </div>

            <div className="metric-card">
              <div className="metric-value">
                {Math.round(
                  results.utilisingUsers[results.utilisingUsers.length - 1]
                ).toLocaleString()}
              </div>
              <div className="metric-label">Final Users</div>
            </div>

            <div className="metric-card">
              <div className="metric-value">
                {formatCurrency(
                  Math.round(results.revenues[results.revenues.length - 1])
                )}
              </div>
              <div className="metric-label">Final MRR</div>
            </div>

            <div className="metric-card">
              <div className="metric-value">
                {formatCurrency(
                  Math.round(results.ebitda[results.ebitda.length - 1])
                )}
              </div>
              <div className="metric-label">Final Monthly EBITDA</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">
                {formatCurrency(Math.round(results.terminalValue))}
              </div>
              <div className="metric-label">Terminal Value</div>
            </div>

            <div className="metric-card">
              <div className="metric-value">
                {formatPercentage(results.irr)}
              </div>
              <div className="metric-label">IRR</div>
            </div>
          </div>
        </div>

        {/* Charts Column */}
        <div className="charts-column">
          {/* Financial Performance Chart */}
          <LineChartCard
            title="Financial Performance"
            data={financialChartData}
            lines={[
              { dataKey: "Revenue", stroke: "#10b981" },
              { dataKey: "COGS", stroke: "#f59e0b" },
              { dataKey: "OPEX", stroke: "#ef4444" },
              { dataKey: "EBITDA", stroke: "#8b5cf6" },
            ]}
            yAxisFormatter={(value) => formatCurrency(value)}
            tooltipFormatter={(value: number) =>
              formatCurrency(Math.round(value))
            }
          />

          {/* Users Chart */}
          <LineChartCard
            title="User Metrics"
            data={usersChartData}
            lines={[{ dataKey: "Utilising Users", stroke: "#ec4899" }]}
            yAxisFormatter={(value) => value.toLocaleString()}
            tooltipFormatter={(value: number) =>
              Math.round(value).toLocaleString()
            }
          />

          {/* EE Population Growth */}
          <LineChartCard
            title="Population Growth"
            data={populationGrowthData}
            lines={[{ dataKey: "EE Population", stroke: "#3b82f6" }]}
            yAxisFormatter={(value) => value.toLocaleString()}
            tooltipFormatter={(value: number) =>
              Math.round(value).toLocaleString()
            }
          />
        </div>
      </div>
    </div>
  );
}
