import React, { useEffect, useState, useContext } from "react";
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

export default function Dashboard() {
  const { isManager } = useContext(RoleContext);

  const [growthData, setGrowthData] = useState<number[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [dpData, setDpData] = useState<number[]>([]);
  const [ltvCacRatio, setLtvCacRatio] = useState<number | null>(null);
  const [closedRound, setClosedRound] = useState<number>(0);
  const [editingClosedRound, setEditingClosedRound] = useState<boolean>(false);
  const [closedRoundInput, setClosedRoundInput] = useState<number>(0);

  // Separate states for Revenue Projections chart
  const [revenueProjectionData, setRevenueProjectionData] = useState<number[]>([]);
  const [revenueProjectionLabels, setRevenueProjectionLabels] = useState<string[]>([]);
  const [revenueProjectionYear, setRevenueProjectionYear] = useState<number>(1);

  // Separate states for Revenue Breakdown chart
  const [revenueBreakdownData, setRevenueBreakdownData] = useState<number[]>([]);
  const [revenueBreakdownLabels, setRevenueBreakdownLabels] = useState<string[]>([]);
  const [revenueBreakdownYear, setRevenueBreakdownYear] = useState<number>(1);

  // --- Fetch Growth Funnel ---
  const fetchGrowthData = async (year: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/sheet-data/growth-funnel/${year}`);
      const apiData = await res.json();
      const totalNetUsersRow = apiData["Total Net Users"];
      if (totalNetUsersRow) {
        const sortedQuarters = Object.keys(totalNetUsersRow).sort(
          (a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2))
        );
        const values = sortedQuarters.map((q) => totalNetUsersRow[q]?.value ?? 0);
        setGrowthData(values);
        setTotalUsers(values[values.length - 1] || 0);
      }
    } catch (err) {
      console.error("Error fetching growth funnel data:", err);
    }
  };

  // --- Fetch DP Evaluation ---
  const fetchDPData = async (year: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/sheet-data/dp-evaluation/${year}`);
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
  };

  // --- Fetch Revenue Projections ---
  const fetchRevenueProjectionData = async (year: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/sheet-data/revenue/${year}`);
      const apiData = await res.json();
      const totalRevenueRow = apiData["Total Revenue"];
      if (!totalRevenueRow) return;
      const sortedQuarters = Object.keys(totalRevenueRow).sort();
      const values = sortedQuarters.map((q) => totalRevenueRow[q]?.value ?? 0);
      setRevenueProjectionLabels(sortedQuarters);
      setRevenueProjectionData(values);
    } catch (err) {
      console.error("Error fetching revenue projection data:", err);
    }
  };

  // --- Fetch Revenue Breakdown ---
  const fetchRevenueBreakdownData = async (year: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/sheet-data/revenue/${year}`);
      const apiData = await res.json();

      const revenueKeys = [
        "Total Brokerage Revenue",
        "Total PMS Revenue",
        "Revenue from Subscriptions",
        "Revenue from Broking Interest",
        "Revenue from FPI",
        "Revenue from AUMs",
        "Net Insurance Income",
      ];

      // Use the latest quarter available in the data for the breakdown
      const totalRevenueRow = apiData["Total Revenue"];
      if (!totalRevenueRow) return;
      const sortedQuarters = Object.keys(totalRevenueRow).sort();
      const latestQuarter = sortedQuarters[sortedQuarters.length - 1];

      const breakdownValues = revenueKeys.map((key) => apiData[key]?.[latestQuarter]?.value ?? 0);
      setRevenueBreakdownData(breakdownValues);
      setRevenueBreakdownLabels(revenueKeys);
    } catch (err) {
      console.error("Error fetching revenue breakdown data:", err);
    }
  };

  // --- Fetch LTV / CAC Ratio ---
  const fetchLtvCac = async (year: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/sheet-data/unit-economics/${year}`);
      const apiData = await res.json();
      const ltvRow = apiData["LTV/CAC Ratio"];
      if (ltvRow) setLtvCacRatio(ltvRow[`Y${year}Q1`]?.value ?? null);
    } catch (err) {
      console.error("Error fetching LTV/CAC ratio:", err);
    }
  };

  // --- Fetch Closed Round ---
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

  // Fetch initial data on mount
  useEffect(() => {
    fetchGrowthData(1);
    fetchDPData(1);
    fetchLtvCac(1);

    fetchRevenueProjectionData(revenueProjectionYear);
    fetchRevenueBreakdownData(revenueBreakdownYear);
  }, []);

  // Refetch when years change
  useEffect(() => {
    fetchRevenueProjectionData(revenueProjectionYear);
  }, [revenueProjectionYear]);

  useEffect(() => {
    fetchRevenueBreakdownData(revenueBreakdownYear);
  }, [revenueBreakdownYear]);

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
      if (data.status !== "success") console.error("Failed to update closed round");
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
          title="LTV / CAC Ratio (Q1)"
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
                  onChange={(e) => setClosedRoundInput(Number(e.target.value))}
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
          fetchData={() => {}} // no fetching needed here, handled externally
          chartData={revenueProjectionData}
          chartLabels={revenueProjectionLabels}
          chartType="line"
          selectedYear={revenueProjectionYear}
          onYearChange={setRevenueProjectionYear}
        />
        <ChartCard
          title="Revenue Breakdown"
          years={years}
          fetchData={() => {}} // no fetching needed here, handled externally
          chartData={revenueBreakdownData}
          chartLabels={revenueBreakdownLabels}
          chartType="doughnut"
          selectedYear={revenueBreakdownYear}
          onYearChange={setRevenueBreakdownYear}
        />
        <ChartCard
          title="Customer Growth"
          years={years}
          fetchData={fetchGrowthData}
          chartData={growthData}
          chartLabels={quarters}
          chartType="bar"
        />
        <ChartCard
          title="DP-Evaluation"
          years={years}
          fetchData={fetchDPData}
          chartData={dpData}
          chartLabels={quarters}
          chartType="line"
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
  selectedYear,
  onYearChange,
}: any) {
  // We use controlled selectedYear state from parent now, not local

  // When year changes, call onYearChange is triggered from dropdown

  // Determine chart component
  const renderChart = () => {
    const data = {
      labels: chartLabels,
      datasets:
        chartType === "doughnut"
          ? [
              {
                data: chartData,
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
                data: chartData,
                borderColor: "#22c55e",
                backgroundColor: "rgba(34,197,94,0.3)",
                fill: true,
                tension: 0.3,
              },
            ],
    };

    if (chartType === "line")
      return <Line data={data} options={{ responsive: true, maintainAspectRatio: false }} />;
    if (chartType === "bar")
      return <Bar data={data} options={{ responsive: true, maintainAspectRatio: false }} />;
    if (chartType === "doughnut")
      return <Doughnut data={data} options={{ responsive: true, maintainAspectRatio: false }} />;
  };

  return (
    <div className="chart-card">
      <div
        className="chart-header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <div className="chart-title">{title}</div>
        <div className="chart-controls" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Quarter/Year toggle */}
          <div className="pill-toggle">
            <button
              className={`pill-toggle-btn ${"quarter" === "quarter" ? "active" : ""}`}
              // Toggle button is retained but inactive for simplicity
              disabled
            >
              Quarter Wise
            </button>
            <button className="pill-toggle-btn" disabled>
              Year Wise
            </button>
          </div>

          {/* Year Dropdown */}
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="year-dropdown"
          >
            {years.map((y: number) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="chart-body">{renderChart()}</div>
    </div>
  );
}
