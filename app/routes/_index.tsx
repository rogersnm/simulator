import { useState, useMemo, useEffect, memo, useCallback } from "react";
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
  type SavedParameterSet,
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

const LineChartCard = memo(function LineChartCard({
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
});

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
  const [savedParameterSets, setSavedParameterSets] = useState<
    SavedParameterSet[]
  >([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load saved parameter sets from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("financialSimulatorSavedSets");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Convert createdAt strings back to Date objects
          const withDates = parsed.map((set: any) => ({
            ...set,
            createdAt: new Date(set.createdAt),
          }));
          setSavedParameterSets(withDates);
        } catch (error) {
          console.error("Failed to load saved parameter sets:", error);
        }
      }
      setIsInitialLoad(false);
    }
  }, []);

  // Save parameter sets to localStorage whenever they change (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad && typeof window !== "undefined") {
      localStorage.setItem(
        "financialSimulatorSavedSets",
        JSON.stringify(savedParameterSets)
      );
    }
  }, [savedParameterSets, isInitialLoad]);

  const results = useMemo(() => calculateFinancials(params), [params]);

  const handleInputChange = (field: keyof FinancialParams, value: string) => {
    if (field === "startDate") {
      setParams((prev) => ({ ...prev, [field]: value }));
    } else {
      const numValue = parseFloat(value) || null;
      setParams((prev) => ({ ...prev, [field]: numValue }));
    }
  };

  const handleSaveParameterSet = () => {
    const name = window.prompt("Enter a name for this parameter set:");
    if (!name || !name.trim()) return;

    const newSet: SavedParameterSet = {
      id: Date.now().toString(),
      name: name.trim(),
      params: { ...params },
      createdAt: new Date(),
    };

    setSavedParameterSets((prev) => [...prev, newSet]);
  };

  const handleLoadParameterSet = (savedSet: SavedParameterSet) => {
    setParams(savedSet.params);
  };

  const handleDeleteParameterSet = (id: string) => {
    setSavedParameterSets((prev) => prev.filter((set) => set.id !== id));
  };

  // Prepare data for charts - memoized to prevent unnecessary recalculations
  const financialChartData = useMemo(() => {
    return results.dates.map((date, index) => ({
      date: date.getTime(), // Use timestamp for proper date handling in recharts
      dateFormatted: formatDate(date),
      Revenue: Math.round(results.revenues[index]),
      COGS: Math.round(results.cogs[index]),
      OPEX: Math.round(results.opex[index]),
      EBITDA: Math.round(results.ebitda[index]),
    }));
  }, [results]);

  const usersChartData = useMemo(
    () =>
      results.dates.map((date, index) => ({
        date: date.getTime(),
        dateFormatted: formatDate(date),
        "Utilising Users": Math.round(results.utilisingUsers[index]),
        "EE Population": Math.round(results.eePopulationList[index]),
      })),
    [results]
  );

  const cashFlowChartData = useMemo(
    () =>
      results.dates.map((date, index) => ({
        date: date.getTime(),
        dateFormatted: formatDate(date),
        "Cash Flow": Math.round(results.cashFlows[index]),
      })),
    [results]
  );

  const populationGrowthData = useMemo(
    () =>
      results.dates.map((date, index) => ({
        date: date.getTime(),
        dateFormatted: formatDate(date),
        "EE Population": Math.round(results.eePopulationList[index]),
      })),
    [results]
  );

  // Memoized formatters to prevent unnecessary re-renders
  const currencyFormatter = useCallback(
    (value: number) => formatCurrency(value),
    []
  );
  const currencyTooltipFormatter = useCallback(
    (value: number) => formatCurrency(Math.round(value)),
    []
  );
  const numberFormatter = useCallback(
    (value: number) => value.toLocaleString(),
    []
  );
  const numberTooltipFormatter = useCallback(
    (value: number) => Math.round(value).toLocaleString(),
    []
  );

  // Memoized line configurations
  const financialLines = useMemo(
    () => [
      { dataKey: "Revenue", stroke: "#10b981" },
      { dataKey: "COGS", stroke: "#f59e0b" },
      { dataKey: "OPEX", stroke: "#ef4444" },
      { dataKey: "EBITDA", stroke: "#8b5cf6" },
    ],
    []
  );

  const userLines = useMemo(
    () => [{ dataKey: "Utilising Users", stroke: "#ec4899" }],
    []
  );

  const populationLines = useMemo(
    () => [{ dataKey: "EE Population", stroke: "#3b82f6" }],
    []
  );

  return (
    <div className="container">
      <h1>Product Financial Simulator</h1>

      <div className="grid grid-3">
        {/* Input Parameters */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2>Parameters</h2>
            <button
              onClick={handleSaveParameterSet}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Save Input Parameters
            </button>
          </div>

          {/* Saved Parameter Sets */}
          {savedParameterSets.length > 0 && (
            <div style={{ marginBottom: "1rem" }}>
              <h3
                style={{
                  margin: "0 0 0.5rem 0",
                  fontSize: "1rem",
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: "0.25rem",
                }}
              >
                Saved Versions
              </h3>
              <div>
                {savedParameterSets.map((savedSet) => (
                  <div
                    key={savedSet.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.5rem",
                      marginBottom: "0.25rem",
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                    }}
                    onClick={() => handleLoadParameterSet(savedSet)}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "500", fontSize: "0.875rem" }}>
                        {savedSet.name}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                        {savedSet.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteParameterSet(savedSet.id);
                      }}
                      style={{
                        padding: "0.25rem 0.5rem",
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "0.25rem",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
            lines={financialLines}
            yAxisFormatter={currencyFormatter}
            tooltipFormatter={currencyTooltipFormatter}
          />

          {/* Users Chart */}
          <LineChartCard
            title="User Metrics"
            data={usersChartData}
            lines={userLines}
            yAxisFormatter={numberFormatter}
            tooltipFormatter={numberTooltipFormatter}
          />

          {/* EE Population Growth */}
          <LineChartCard
            title="Population Growth"
            data={populationGrowthData}
            lines={populationLines}
            yAxisFormatter={numberFormatter}
            tooltipFormatter={numberTooltipFormatter}
          />
        </div>
      </div>
    </div>
  );
}
