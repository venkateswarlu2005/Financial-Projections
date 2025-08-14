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

export default function Dashboard() {
  const [growthData, setGrowthData] = useState<number[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [dpData, setDpData] = useState<number[]>([]); // <-- NEW state

  // --- Fetch Growth Funnel ---
  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/sheet-data/growth-funnel/1`);
        const apiData: Record<string, Record<string, { value: number; is_calculated: boolean }>> = await res.json();

        const totalNetUsersRow = apiData["Total Net Users"];
        if (totalNetUsersRow) {
          const quarters = Object.keys(totalNetUsersRow).sort();
          const values = quarters.map(q => totalNetUsersRow[q]?.value ?? 0);

          setGrowthData(values);
          setTotalUsers(values[values.length - 4] || 0);
        }
      } catch (err) {
        console.error("Error fetching growth funnel data:", err);
      }
    };

    fetchGrowthData();
  }, []);

  // --- Fetch DP Evaluation ---
  useEffect(() => {
    const fetchDPData = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/sheet-data/dp-evaluation/1`);
        const apiData: Record<string, Record<string, { value: number; is_calculated: boolean }>> = await res.json();

        const dpValuationRow = apiData["DP Valuation"];
        if (dpValuationRow) {
          const quarters = Object.keys(dpValuationRow).sort();
          const values = quarters.map(q => dpValuationRow[q]?.value ?? 0);

          setDpData(values); // <-- store for chart
        }
      } catch (err) {
        console.error("Error fetching dp-evaluation data:", err);
      }
    };

    fetchDPData();
  }, []);

  const formatNumber = (num: number) =>
    num?.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  // Chart Data
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

  const dpChartData = {
    labels: dpData.map((_, idx) => `Q${idx + 1}`),
    datasets: [
      {
        label: "DP Valuation",
        data: dpData,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.3)",
        fill: true
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

      {/* Charts */}
      <div className="charts-grid">
        <ChartCard title="Revenue Projections" value={`NAN`} subText="">
          <Line data={dummyChartData} />
        </ChartCard>

        <ChartCard title="Revenue Diversification" value="" subText="">
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

        <ChartCard title="DP-Evaluation" value={`NAN`} subText="">
          <Line
            data={dpChartData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
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
