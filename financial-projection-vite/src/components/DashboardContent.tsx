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

  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"quarter" | "year">("quarter");

  const [growthData, setGrowthData] = useState<number[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [dpData, setDpData] = useState<number[]>([]);
  const [revenueData, setRevenueData] = useState<number[]>([]);
  const [revenueLabels, setRevenueLabels] = useState<string[]>([]);
  const [ltvCacRatio, setLtvCacRatio] = useState<number | null>(null);
  const [revenueBreakdownData, setRevenueBreakdownData] = useState<number[]>([]);
  const [revenueBreakdownLabels, setRevenueBreakdownLabels] = useState<string[]>([]);
  const [closedRound, setClosedRound] = useState<number>(0);
  const [editingClosedRound, setEditingClosedRound] = useState<boolean>(false);
  const [closedRoundInput, setClosedRoundInput] = useState<number>(0);

  // --- Fetch Growth Funnel ---
  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/sheet-data/growth-funnel/${selectedYear}`);
        const apiData = await res.json();
        const totalNetUsersRow = apiData["Total Net Users"];
        if (totalNetUsersRow) {
          const quarters = Object.keys(totalNetUsersRow).sort((a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2)));
          const values = quarters.map((q) => totalNetUsersRow[q]?.value ?? 0);
          setGrowthData(values);
          setTotalUsers(values[values.length - 1] || 0);
        }
      } catch (err) {
        console.error("Error fetching growth funnel data:", err);
      }
    };
    fetchGrowthData();
  }, [selectedYear]);

  // --- Fetch DP Evaluation ---
  useEffect(() => {
    const fetchDPData = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/sheet-data/dp-evaluation/${selectedYear}`);
        const apiData = await res.json();
        const dpValuationRow = apiData["DP Valuation"];
        if (dpValuationRow) {
          const quarters = Object.keys(dpValuationRow).sort((a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2)));
          const values = quarters.map((q) => dpValuationRow[q]?.value ?? 0);
          setDpData(values);
        }
      } catch (err) {
        console.error("Error fetching dp-evaluation data:", err);
      }
    };
    fetchDPData();
  }, [selectedYear]);

  // --- Fetch Revenue ---
  const fetchRevenueForYear = async (year: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/sheet-data/revenue/${year}`);
      const apiData = await res.json();
      const totalRevenueRow = apiData["Total Revenue"];
      if (!totalRevenueRow) return;
      const quarters = Object.keys(totalRevenueRow).sort();
      const values = quarters.map((q) => totalRevenueRow[q]?.value ?? 0);
      setRevenueLabels(quarters);
      setRevenueData(values);

      const revenueKeys = [
        "Total Brokerage Revenue",
        "Total PMS Revenue",
        "Revenue from Subscriptions",
        "Revenue from Broking Interest",
        "Revenue from FPI",
        "Revenue from AUMs",
        "Net Insurance Income",
      ];
      const latestQuarter = quarters[quarters.length - 1];
      const breakdownValues = revenueKeys.map((key) => apiData[key]?.[latestQuarter]?.value ?? 0);
      setRevenueBreakdownData(breakdownValues);
      setRevenueBreakdownLabels(revenueKeys);
    } catch (err) {
      console.error("Error fetching revenue data:", err);
    }
  };

  useEffect(() => {
    fetchRevenueForYear(selectedYear);
  }, [selectedYear]);

  // --- Fetch LTV / CAC Ratio ---
  useEffect(() => {
    const fetchLtvCac = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/sheet-data/unit-economics/${selectedYear}`);
        const apiData = await res.json();
        const ltvRow = apiData["LTV/CAC Ratio"];
        if (ltvRow) setLtvCacRatio(ltvRow[`Y${selectedYear}Q1`]?.value ?? null);
      } catch (err) {
        console.error("Error fetching LTV/CAC ratio:", err);
      }
    };
    fetchLtvCac();
  }, [selectedYear]);

  // --- Closed Round ---
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
      if (data.status !== "success") console.error("Failed to update closed round");
    } catch (err) {
      console.error("Error updating closed round:", err);
    }
  };

  // --- Chart Data ---
  const revenuePieChartData = {
    labels: revenueBreakdownLabels,
    datasets: [
      {
        data: revenueBreakdownData,
        backgroundColor: ["#f97316", "#2563eb", "#22c55e", "#facc15", "#8b5cf6", "#ec4899", "#14b8a6"],
      },
    ],
  };

  const growthChartData = {
    labels: growthData.map((_, i) => `Q${i + 1}`),
    datasets: [{ label: "Total Customers", data: growthData, backgroundColor: "#f97316" }],
  };

  const dpChartData = {
    labels: dpData.map((_, i) => `Q${i + 1}`),
    datasets: [
      { label: "DP Valuation", data: dpData, borderColor: "#2563eb", backgroundColor: "rgba(37,99,235,0.3)", fill: true },
    ],
  };

  const revenueChartData = {
    labels: revenueLabels,
    datasets: [
      { label: "Total Revenue", data: revenueData, borderColor: "#22c55e", backgroundColor: "rgba(34,197,94,0.3)", fill: true, tension: 0.3 },
    ],
  };

  const formatNumber = (num: number) => num?.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div className="dashboard">
      {/* Summary Cards */}
      <div className="summary-cards">
        <Card title="Book Value per Share" value="NAN" />
        <Card title="Total Users" value={formatNumber(totalUsers)} />
        <Card title="LTV / CAC Ratio (Q1)" value={ltvCacRatio !== null ? ltvCacRatio.toFixed(2) : "N/A"} />
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
                <span onClick={() => setEditingClosedRound(true)} style={{ cursor: "pointer" }}>
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
          quarters={quarters}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        >
          <Line data={revenueChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </ChartCard>

        <ChartCard
          title="Revenue Breakdown"
          years={years}
          quarters={quarters}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        >
          <Doughnut data={revenuePieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </ChartCard>

        <ChartCard
          title="Customer Growth"
          years={years}
          quarters={quarters}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        >
          <Bar data={growthChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </ChartCard>

        <ChartCard
          title="DP-Evaluation"
          years={years}
          quarters={quarters}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        >
          <Line data={dpChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </ChartCard>
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
  children,
  selectedYear,
  years,
  viewMode,
  onYearChange,
  onViewModeChange,
}: any) {
  return (
    <div className="chart-card">
      <div className="chart-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="chart-title">{title}</div>

        <div className="chart-controls" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Quarter/Year toggle */}
          <div className="pill-toggle">
            <button className={`pill-toggle-btn ${viewMode === "quarter" ? "active" : ""}`} onClick={() => onViewModeChange("quarter")}>
              Quarter Wise
            </button>
            <button className={`pill-toggle-btn ${viewMode === "year" ? "active" : ""}`} onClick={() => onViewModeChange("year")}>
              Year Wise
            </button>
          </div>

          {/* Year Dropdown */}
          {viewMode === "quarter" && (
            <select value={selectedYear} onChange={(e) => onYearChange(Number(e.target.value))} className="year-dropdown">
              {years.map((y: number) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="chart-body">{children}</div>
    </div>
  );
}
