import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import "./Dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

// ===== Types =====
interface GrowthFunnelData {
  row_name: string;
  [quarter: string]: string | number; // quarter keys like "Y1Q1"
}

export default function Dashboard() {
  const [growthData, setGrowthData] = useState<number[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  useEffect(() => {
    const year = 2025; // can be dynamic
    fetch(`http://localhost:8000/api/sheet-data/growth-funnel/${year}`)
      .then(res => res.json())
      .then((apiData: { data: GrowthFunnelData[] }) => {
        const totalNetUsersRow = apiData.data.find(
          row => row.row_name.toLowerCase() === "total net users"
        );

        if (totalNetUsersRow) {
          const quarters = Object.entries(totalNetUsersRow)
            .filter(([key]) => key.startsWith("Y"))
            .map(([_, val]) => Number(val) || 0);

          setGrowthData(quarters);

          const lastNonZero = [...quarters].reverse().find(v => v > 0) || 0;
          setTotalUsers(lastNonZero);
        }
      })
      .catch(err => console.error("Error fetching growth funnel data:", err));
  }, []);

  const formatNumber = (num: number) =>
    num?.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  // ===== Chart Data =====
  const growthChartData = {
    labels: growthData.map((_, idx) => `Q${idx + 1}`),
    datasets: [
      {
        label: "Total Customers",
        data: growthData,
        backgroundColor: "#f97316"
      }
    ]
  };

  const dummyChartData = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: []
      }
    ]
  };

  return (
    <div className="dashboard">
      {/* Summary Cards */}
      <div className="summary-cards">
        <Card title="Book Value per Share" value={`NAN`} />
        <Card title="Total Users" value={formatNumber(totalUsers)} />
        <Card title="LTV / CAC Ratio" value={`NAN`} />
        <Card title="Monthly churn Rate" value={`NAN`} />
        <Card title="Closed Round" value={`NAN`} />
      </div>

      {/* Charts in 2×2 grid */}
      <div className="charts-grid">
        <ChartCard
          title="Revenue Projections"
          value={``}
          subText=""
        >
          <Line data={dummyChartData} />
        </ChartCard>

        <ChartCard
          title="Revenue Diversification"
          value=""
          subText=""
        >
          <Doughnut data={dummyChartData} />
        </ChartCard>

        <ChartCard
          title="Customer Growth"
          value={formatNumber(totalUsers)}
          subText=""
        >
          <Bar
            data={growthChartData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </ChartCard>

        <ChartCard
          title="DP-Evaluation"
          value={``}
          subText=""
        >
          <Bar data={dummyChartData} />
        </ChartCard>
      </div>
    </div>
  );
}

// ===== Reusable Components =====
interface CardProps {
  title: string;
  value: string | number;
}

function Card({ title, value }: CardProps) {
  return (
    <div className="summary-card">
      <div className="card-title">{title}</div>
      <div className="card-value">{value}</div>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  value: string | number;
  subText: string;
  children: React.ReactNode;
}

function ChartCard({ title, value, subText, children }: ChartCardProps) {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title">{title}</div>
        <div className="chart-value">{value}</div>
        <div className="chart-subtext">{subText}</div>
      </div>
      <div className="chart-body">{children}</div>
    </div>
  );
}
