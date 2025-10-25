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

// Reusable Card for summary
function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="summary-card">
      <div className="card-title">{title}</div>
      <div className="card-value">{value}</div>
    </div>
  );
}

// Reusable ChartCard with controlled year and independent fetch
function ChartCard({
  title,
  years,
  fetchData,
  chartType,
}: {
  title: string;
  years: number[];
  fetchData: (year: number) => Promise<{ labels: string[]; data: number[] }>;
  chartType: "line" | "bar" | "doughnut";
}) {
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);

  useEffect(() => {
    fetchData(selectedYear).then(({ labels, data }) => {
      setChartLabels(labels);
      setChartData(data);
    }).catch((err) => console.error(`Error fetching data for ${title}:`, err));
  }, [selectedYear, fetchData, title]);

  // ChartJS data object
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

  return (
    <div className="chart-card">
      <div className="chart-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="chart-title">{title}</div>
        <div className="chart-controls" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Quarter/Year toggle - for now disabled */}
          <div className="pill-toggle">
            <button className="pill-toggle-btn active" disabled>Quarter Wise</button>
            <button className="pill-toggle-btn" disabled>Year Wise</button>
          </div>

          {/* Year Dropdown */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="year-dropdown"
          >
            {years.map((y) => (
              <option key={y} value={y}>Year {y}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="chart-body">
        {chartType === "line" && <Line data={data} options={{ responsive: true, maintainAspectRatio: false }} />}
        {chartType === "bar" && <Bar data={data} options={{ responsive: true, maintainAspectRatio: false }} />}
        {chartType === "doughnut" && <Doughnut data={data} options={{ responsive: true, maintainAspectRatio: false }} />}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { isManager } = useContext(RoleContext);

  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [ltvCacRatio, setLtvCacRatio] = useState<number | null>(null);
  const [closedRound, setClosedRound] = useState<number>(0);
  const [editingClosedRound, setEditingClosedRound] = useState<boolean>(false);
  const [closedRoundInput, setClosedRoundInput] = useState<number>(0);

  // Monthly Churn Rate is constant in your example
  const monthlyChurnRate = "3,75,000";

  // Fetch Total Users for Summary Card from growth funnel latest data
  const fetchTotalUsers = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/sheet-data/growth-funnel/1`);
      const apiData = await res.json();
      const totalNetUsersRow = apiData["Total Net Users"];
      if (totalNetUsersRow) {
        const sortedQuarters = Object.keys(totalNetUsersRow).sort((a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2)));
        const values = sortedQuarters.map((q) => totalNetUsersRow[q]?.value ?? 0);
        setTotalUsers(values[values.length - 1] || 0);
      }
    } catch (err) {
      console.error("Error fetching total users:", err);
    }
  };

  // Fetch LTV/CAC Ratio latest Q1 year 1 as example
  const fetchLtvCac = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/sheet-data/unit-economics/1`);
      const apiData = await res.json();
      const ltvRow = apiData["LTV/CAC Ratio"];
      if (ltvRow) setLtvCacRatio(ltvRow["Y1Q1"]?.value ?? null);
    } catch (err) {
      console.error("Error fetching LTV/CAC ratio:", err);
    }
  };

  // Fetch Closed Round for editable card
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
    fetchTotalUsers();
    fetchLtvCac();
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

  // Data fetch functions passed to ChartCard with structured return format

  const fetchRevenueProjectionData = async (year: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/sheet-data/revenue/${year}`);
      const apiData = await res.json();
      const totalRevenueRow = apiData["Total Revenue"];
      if (!totalRevenueRow) return { labels: [], data: [] };
      const sortedQuarters = Object.keys(totalRevenueRow).sort();
      const values = sortedQuarters.map((q) => totalRevenueRow[q]?.value ?? 0);
      return { labels: sortedQuarters, data: values };
    } catch (err) {
      console.error("Error fetching revenue projections:", err);
      return { labels: [], data: [] };
    }
  };

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
      const totalRevenueRow = apiData["Total Revenue"];
      if (!totalRevenueRow) return { labels: [], data: [] };
      const sortedQuarters = Object.keys(totalRevenueRow).sort();
      const latestQuarter = sortedQuarters[sortedQuarters.length - 1];
      const breakdownValues = revenueKeys.map((key) => apiData[key]?.[latestQuarter]?.value ?? 0);
      return { labels: revenueKeys, data: breakdownValues };
    } catch (err) {
      console.error("Error fetching revenue breakdown:", err);
      return { labels: [], data: [] };
    }
  };

  const fetchGrowthData = async (year: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/sheet-data/growth-funnel/${year}`);
      const apiData = await res.json();
      const totalNetUsersRow = apiData["Total Net Users"];
      if (!totalNetUsersRow) return { labels: [], data: [] };
      const sortedQuarters = Object.keys(totalNetUsersRow).sort((a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2)));
      const values = sortedQuarters.map((q) => totalNetUsersRow[q]?.value ?? 0);
      return { labels: quarters, data: values };
    } catch (err) {
      console.error("Error fetching growth data:", err);
      return { labels: [], data: [] };
    }
  };

  const fetchDPData = async (year: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/sheet-data/dp-evaluation/${year}`);
      const apiData = await res.json();
      const dpValuationRow = apiData["DP Valuation"];
      if (!dpValuationRow) return { labels: [], data: [] };
      const sortedQuarters = Object.keys(dpValuationRow).sort((a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2)));
      const values = sortedQuarters.map((q) => dpValuationRow[q]?.value ?? 0);
      return { labels: quarters, data: values };
    } catch (err) {
      console.error("Error fetching DP evaluation:", err);
      return { labels: [], data: [] };
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
        <Card title="LTV / CAC Ratio (Q1)" value={ltvCacRatio !== null ? ltvCacRatio.toFixed(2) : "N/A"} />
        <Card title="Monthly Churn Rate" value={monthlyChurnRate} />
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

      {/* Charts Grid */}
      <div className="charts-grid">
        <ChartCard
          title="Revenue Projections"
          years={years}
          fetchData={fetchRevenueProjectionData}
          chartType="line"
        />
        <ChartCard
          title="Revenue Breakdown"
          years={years}
          fetchData={fetchRevenueBreakdownData}
          chartType="doughnut"
        />
        <ChartCard
          title="Customer Growth"
          years={years}
          fetchData={fetchGrowthData}
          chartType="bar"
        />
        <ChartCard
          title="DP-Evaluation"
          years={years}
          fetchData={fetchDPData}
          chartType="line"
        />
      </div>
    </div>
  );
}
