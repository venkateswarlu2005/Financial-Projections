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
  const fetchLatestYearData = async () => {
    try {
      for (let year = 5; year >= 1; year--) {
        const res = await fetch(
          `http://localhost:8000/api/sheet-data/growth-funnel/${year}`
        );
        const apiData: Record<
          string,
          Record<string, { value: number; is_calculated: boolean }>
        > = await res.json();

        // Get the Total Net Users row from API
        const totalNetUsersRow = apiData["Total Net Users"];
        if (!totalNetUsersRow) continue;

        // Sort quarter keys so they're always in order
        const quarters = Object.keys(totalNetUsersRow)
          .filter(k => k.startsWith(`Y${year}`))
          .sort();

        // Get values for each quarter
        const quarterValues = quarters.map(
          q => totalNetUsersRow[q]?.value ?? 0
        );

        if (quarterValues.some(v => v > 0)) {
          setGrowthData(quarterValues);

          // Last quarter's value
          const lastQuarterValue =
            quarterValues[quarterValues.length - 1] || 0;
          setTotalUsers(lastQuarterValue);

          break; // stop after finding the latest year with data
        }
      }
    } catch (err) {
      console.error("Error fetching growth funnel data:", err);
    }
  };

  fetchLatestYearData();
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
          value={`NAN`}
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
          value={`NAN`}
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
