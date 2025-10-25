import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import "./Dashboard.css";
import { RoleContext } from "../App";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const quarters = ["Q1", "Q2", "Q3", "Q4"];
const years = [1, 2, 3, 4, 5];
const yearWiseLabels = years.map((y) => `Year ${y}`); // Labels for year-wise charts

export default function Dashboard() {
  const { isManager } = useContext(RoleContext);

  // --- State for Quarterly Data ---
  const [growthData, setGrowthData] = useState<number[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [dpData, setDpData] = useState<number[]>([]);
  const [revenueData, setRevenueData] = useState<number[]>([]);
  const [revenueLabels, setRevenueLabels] = useState<string[]>([]);
  const [ltvCacRatio, setLtvCacRatio] = useState<number | null>(null);
  const [revenueBreakdownData, setRevenueBreakdownData] = useState<number[]>([]);
  const [revenueBreakdownLabels, setRevenueBreakdownLabels] = useState<string[]>(
    []
  );
  
  // --- State for Year-Wise Data ---
  const [growthDataYearly, setGrowthDataYearly] = useState<number[]>([]);
  const [dpDataYearly, setDpDataYearly] = useState<number[]>([]);
  const [revenueDataYearly, setRevenueDataYearly] = useState<number[]>([]);

  // --- State for Closed Round ---
  const [closedRound, setClosedRound] = useState<number>(0);
  const [editingClosedRound, setEditingClosedRound] = useState<boolean>(false);
  const [closedRoundInput, setClosedRoundInput] = useState<number>(0);

  // --- Fetch Growth Funnel (Quarterly) ---
  const fetchGrowthData = useCallback(async (year: number) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/sheet-data/growth-funnel/${year}`
      );
      const apiData = await res.json();
      const totalNetUsersRow = apiData["Total Net Users"];
      if (totalNetUsersRow) {
        const sortedQuarters = Object.keys(totalNetUsersRow).sort(
          (a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2))
        );
        const values = sortedQuarters.map((q) => totalNetUsersRow[q]?.value ?? 0);
        setGrowthData(values);
        setTotalUsers(values[values.length - 1] || 0); // Update total users card
      }
    } catch (err) {
      console.error("Error fetching growth funnel data:", err);
    }
  }, []);

  // --- Fetch Growth Funnel (Yearly) ---
  const fetchGrowthDataYearly = useCallback(async () => {
    try {
      const allYearData = await Promise.all(
        years.map(async (year) => {
          const res = await fetch(
            `http://localhost:8000/api/sheet-data/growth-funnel/${year}`
          );
          const apiData = await res.json();
          const totalNetUsersRow = apiData["Total Net Users"];
          if (totalNetUsersRow) {
            const sortedQuarters = Object.keys(totalNetUsersRow).sort(
              (a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2))
            );
            const values = sortedQuarters.map(
              (q) => totalNetUsersRow[q]?.value ?? 0
            );
            return values[values.length - 1] || 0; // Get last quarter's value
          }
          return 0;
        })
      );
      setGrowthDataYearly(allYearData);
    } catch (err) {
      console.error("Error fetching yearly growth funnel data:", err);
    }
  }, []);

  // --- Fetch DP Evaluation (Quarterly) ---
  const fetchDPData = useCallback(async (year: number) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/sheet-data/dp-evaluation/${year}`
      );
      const apiData = await res.json();
      const dpValuationRow = apiData["DP Valuation"];
      if (dpValuationRow) {
        const sortedQuarters = Object.keys(dpValuationRow).sort(
          (a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2))
        );
        const values = sortedQuarters.map((q) => dpValuationRow[q]?.value ?? 0);
        setDpData(values);
      }
    } catch (err) {
      console.error("Error fetching dp-evaluation data:", err);
    }
  }, []);

  // --- Fetch DP Evaluation (Yearly) ---
  const fetchDPDataYearly = useCallback(async () => {
    try {
      const allYearData = await Promise.all(
        years.map(async (year) => {
          const res = await fetch(
            `http://localhost:8000/api/sheet-data/dp-evaluation/${year}`
          );
          const apiData = await res.json();
          const dpValuationRow = apiData["DP Valuation"];
          if (dpValuationRow) {
            const sortedQuarters = Object.keys(dpValuationRow).sort(
              (a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2))
            );
            const values = sortedQuarters.map(
              (q) => dpValuationRow[q]?.value ?? 0
            );
            return values[values.length - 1] || 0; // Get last quarter's value
          }
          return 0;
        })
      );
      setDpDataYearly(allYearData);
    } catch (err) {
      console.error("Error fetching yearly dp-evaluation data:", err);
    }
  }, []);

  // --- Fetch Revenue Projections (Quarterly) ---
  const fetchRevenueProjections = useCallback(async (year: number) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/sheet-data/revenue/${year}`
      );
      const apiData = await res.json();
      const totalRevenueRow = apiData["Total Revenue"];
      if (!totalRevenueRow) return;
      const sortedQuarters = Object.keys(totalRevenueRow).sort();
      const values = sortedQuarters.map((q) => totalRevenueRow[q]?.value ?? 0);
      setRevenueLabels(sortedQuarters);
      setRevenueData(values);
    } catch (err) {
      console.error("Error fetching revenue projection data:", err);
    }
  }, []);

  // --- Fetch Revenue Projections (Yearly) ---
  const fetchRevenueProjectionsYearly = useCallback(async () => {
    try {
      const allYearData = await Promise.all(
        years.map(async (year) => {
          const res = await fetch(
            `http://localhost:8000/api/sheet-data/revenue/${year}`
          );
          const apiData = await res.json();
          const totalRevenueRow = apiData["Total Revenue"];
          if (totalRevenueRow) {
            const sortedQuarters = Object.keys(totalRevenueRow).sort();
            const values = sortedQuarters.map(
              (q) => totalRevenueRow[q]?.value ?? 0
            );
            return values[values.length - 1] || 0; // Get last quarter's (cumulative) value
          }
          return 0;
        })
      );
      setRevenueDataYearly(allYearData);
    } catch (err) {
      console.error("Error fetching yearly revenue projection data:", err);
    }
  }, []);

  // --- Fetch Revenue Breakdown (Snapshot for a Quarter) ---
  const fetchRevenueBreakdown = useCallback(async (year: number) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/sheet-data/revenue/${year}`
      );
      const apiData = await res.json();

      const totalRevenueRow = apiData["Total Revenue"];
      if (!totalRevenueRow) return;
      const sortedQuarters = Object.keys(totalRevenueRow).sort();
      const latestQuarter = sortedQuarters[sortedQuarters.length - 1];
      if (!latestQuarter) return;

      const revenueKeys = [
        "Total Brokerage Revenue",
        "Total PMS Revenue",
        "Revenue from Subscriptions",
        "Revenue from Broking Interest",
        "Revenue from FPI",
        "Revenue from AUMs",
        "Net Insurance Income",
      ];

      const breakdownValues = revenueKeys.map(
        (key) => apiData[key]?.[latestQuarter]?.value ?? 0
      );
      setRevenueBreakdownData(breakdownValues);
      setRevenueBreakdownLabels(revenueKeys);
    } catch (err) {
      console.error("Error fetching revenue breakdown data:", err);
    }
  }, []);

  // --- Fetch LTV / CAC Ratio ---
  // This seems to be a single-value card, so no quarterly/yearly fetch needed here
  // But we need to fetch it when the dashboard loads.
  // We'll also fetch the *first year's* data for all charts on initial load.
  useEffect(() => {
    const fetchLtvCac = async (year: number) => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/sheet-data/unit-economics/${year}`
        );
        const apiData = await res.json();
        const ltvRow = apiData["LTV/CAC Ratio"];
        // NOTE: This logic seems to only get Q1 of the specified year.
        // You might want to adjust this logic if it needs to be dynamic.
        if (ltvRow) setLtvCacRatio(ltvRow[`Y${year}Q1`]?.value ?? null);
      } catch (err) {
        console.error("Error fetching LTV/CAC ratio:", err);
      }
    };

    // Fetch initial data for Year 1
    fetchLtvCac(1);
    // Note: The ChartCard components will trigger their own initial fetches for Year 1
    // because of their internal useEffect hooks.
  }, []);

  // --- Fetch/Save Closed Round ---
  useEffect(() => {
    const fetchClosedRound = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/closed-round`);
        const data = await res.json();
        setClosedRound(data.value);
        setClosedRoundInput(data.value);
      } catch (err) {
        console.error("Error fetching closed round:", err);
      }
    };
    fetchClosedRound();
  }, []);

  const saveClosedRound = async () => {
    setClosedRound(closedRoundInput);
    setEditingClosedRound(false);
    try {
      const res = await fetch(`http://localhost:8000/api/closed-round`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: closedRoundInput }),
      });
      const data = await res.json();
      if (data.status !== "success")
        console.error("Failed to update closed round");
    } catch (err) {
      console.error("Error updating closed round:", err);
    }
  };

  const formatNumber = (num: number) =>
    num?.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div className="dashboard">
      {/* Summary Cards */}
      <div className="summary-cards">
        <Card title="Book Value per Share" value="NAN" />
        <Card title="Total Users" value={formatNumber(totalUsers)} />
        <Card
          title="LTV / CAC Ratio (Y1Q1)" // Clarified label
          value={ltvCacRatio !== null ? ltvCacRatio.toFixed(2) : "N/A"}
        />
        <Card title="Monthly Churn Rate" value="3,75,000" />
        <Card
          title="Closed Round"
          value={
            isManager ? (
              editingClosedRound ? (
                <input
                  type="number"
                  value={closedRoundInput}
                  autoFocus
                  onBlur={saveClosedRound}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveClosedRound();
                    if (e.key === "Escape") setEditingClosedRound(false);
                  }}
                  onChange={(e) =>
                    setClosedRoundInput(Number(e.target.value))
                  }
                />
              ) : (
                <span
                  onClick={() => setEditingClosedRound(true)}
                  style={{ cursor: "pointer" }}
                >
                  {formatNumber(closedRound)}
                </span>
              )
            ) : (
              formatNumber(closedRound)
            )
          }
        />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <ChartCard
          title="Revenue Projections"
          years={years}
          fetchData={fetchRevenueProjections}
          chartData={revenueData}
          chartLabels={revenueLabels}
          chartType="line"
          fetchYearWiseData={fetchRevenueProjectionsYearly} // Pass yearly func
          yearWiseData={revenueDataYearly} // Pass yearly data
          yearWiseLabels={yearWiseLabels} // Pass yearly labels
        />
        <ChartCard
          title="Revenue Breakdown"
          years={years}
          fetchData={fetchRevenueBreakdown}
          chartData={revenueBreakdownData}
          chartLabels={revenueBreakdownLabels}
          chartType="doughnut"
          // No year-wise props, toggle will be hidden
        />
        <ChartCard
          title="Customer Growth"
          years={years}
          fetchData={fetchGrowthData}
          chartData={growthData}
          chartLabels={quarters}
          chartType="bar"
          fetchYearWiseData={fetchGrowthDataYearly} // Pass yearly func
          yearWiseData={growthDataYearly} // Pass yearly data
          yearWiseLabels={yearWiseLabels} // Pass yearly labels
        />
        <ChartCard
          title="DP-Evaluation"
          years={years}
          fetchData={fetchDPData}
          chartData={dpData}
          chartLabels={quarters}
          chartType="line"
          fetchYearWiseData={fetchDPDataYearly} // Pass yearly func
          yearWiseData={dpDataYearly} // Pass yearly data
          yearWiseLabels={yearWiseLabels} // Pass yearly labels
        />
      </div>
    </div>
  );
}

// ===== Reusable Components =====
function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="summary-card">
      <div className="card-title">{title}</div>
      <div className="card-value">{value}</div>
    </div>
  );
}

function ChartCard({
  title,
  years,
  fetchData,
  chartData,
  chartLabels,
  chartType,
  fetchYearWiseData, // New prop
  yearWiseData, // New prop
  yearWiseLabels, // New prop
}: any) {
  // Local state per chart
  const [viewMode, setViewMode] = useState<"quarter" | "year">("quarter");
  const [selectedYear, setSelectedYear] = useState<number>(1);

  // Fetch QUARTERLY data whenever year or viewMode (back to quarter) changes
  useEffect(() => {
    if (viewMode === "quarter") {
      fetchData(selectedYear);
    }
  }, [selectedYear, viewMode, fetchData]);

  // Fetch YEARLY data whenever viewMode changes to 'year'
  useEffect(() => {
    // Only fetch if in year mode AND the function was provided
    if (viewMode === "year" && fetchYearWiseData) {
      fetchYearWiseData();
    }
  }, [viewMode, fetchYearWiseData]);

  // Determine chart component
  const renderChart = () => {
    // Check if we should use yearly data
    const isYearly = viewMode === "year" && chartType !== "doughnut";

    const data = {
      labels: isYearly ? yearWiseLabels : chartLabels, // <-- DYNAMIC LABELS
      datasets:
        chartType === "doughnut"
          ? [
              {
                data: chartData, // Doughnut always uses the "quarterly" data (which is a snapshot)
                backgroundColor: [
                  "#f97316",
                  "#2563eb",
                  "#22c55e",
                  "#facc15",
                  "#8b5cf6",
                  "#ec4899",
                  "#14b8a6",
                ],
              },
            ]
          : [
              {
                label: title,
                data: isYearly ? yearWiseData : chartData, // <-- DYNAMIC DATA
                borderColor: "#22c55e",
                backgroundColor: "rgba(34,197,94,0.3)",
                fill: true,
                tension: 0.3,
              },
            ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          // Show legend for doughnut, hide for others (optional, but cleaner)
          display: chartType === "doughnut",
        },
      },
    };

    if (chartType === "line") return <Line data={data} options={options} />;
    if (chartType === "bar") return <Bar data={data} options={options} />;
    if (chartType === "doughnut")
      return <Doughnut data={data} options={options} />;
  };

  return (
    <div className="chart-card">
      <div
        className="chart-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="chart-title">{title}</div>
        <div
          className="chart-controls"
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          {/* Quarter/Year toggle - HIDE FOR DOUGHNUT */}
          
            <div className="pill-toggle">
              <button
                className={`pill-toggle-btn ${
                  viewMode === "quarter" ? "active" : ""
                }`}
                onClick={() => setViewMode("quarter")}
              >
                Quarter Wise
              </button>
              <button
                className={`pill-toggle-btn ${
                  viewMode === "year" ? "active" : ""
                }`}
                onClick={() => setViewMode("year")}
              >
                Year Wise
              </button>
            </div>
          

          {/* Year Dropdown - HIDE FOR YEAR WISE MODE */}
          {viewMode === "quarter" && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="year-dropdown"
            >
              {years.map((y: number) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="chart-body">{renderChart()}</div>
    </div>
  );
}