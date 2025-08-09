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
interface Summary {
  current_revenue: number;
  total_customers: number;
  ltv_cac_ratio: number;
  burn_rate: number;
  total_gtm_investment: number;
}

interface RevenueData {
  quarter: string;
  value: number;
}

interface CustomerData {
  quarter: string;
  value: number;
}

interface UnitEconomics {
  [key: string]: number;
}

interface GTMImpact {
  type: string;
  customers: number;
  investment: number;
}

interface DashboardAPIResponse {
  summary: Summary;
  revenue: RevenueData[];
  customers: CustomerData[];
  unit_economics: UnitEconomics;
  gtm_impact: GTMImpact[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardAPIResponse | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/dashboard-data")
      .then((res) => res.json())
      .then((apiData: DashboardAPIResponse) => setData(apiData))
      .catch((err) => console.error("Error loading manager dashboard:", err));
  }, []);

  const formatNumber = (num: number) =>
    num?.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  if (!data) return <div className="loading">Loading...</div>;

  // ===== Chart Data =====
  const revenueChartData = {
    labels: data.revenue.map((d) => d.quarter), // ["Y1Q1", "Y1Q2", ...]
    datasets: [
      {
        label: "Revenue (₹)",
        data: data.revenue.map((d) => d.value),
        borderColor: "#ff5e62",
        backgroundColor: "rgba(255, 94, 98, 0.2)",
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: "#ff5e62"
      }
    ]
  };

  const growthChartData = {
    labels: data.customers.map((d) => d.quarter),
    datasets: [
      {
        label: "Total Customers",
        data: data.customers.map((d) => d.value),
        backgroundColor: "#f97316"
      }
    ]
  };

  const unitEconomicsChartData = {
    labels: Object.keys(data.unit_economics),
    datasets: [
      {
        data: Object.values(data.unit_economics),
        backgroundColor: ["#facc15", "#6366f1", "#34d399", "#ef4444"]
      }
    ]
  };

  const gtmChartData = {
    labels: data.gtm_impact.map((d) => d.type),
    datasets: [
      {
        label: "Customers Added",
        data: data.gtm_impact.map((d) => d.customers),
        backgroundColor: "#ed7d22"
      },
      {
        label: "Investment (₹Cr)",
        data: data.gtm_impact.map((d) => d.investment / 10000000),
        backgroundColor: "#3b82f6"
      }
    ]
  };

  return (
    <div className="dashboard">
      {/* Summary Cards */}
      <div className="summary-cards">
        <Card
          title="Current Quarter Revenue"
          value={`₹${formatNumber(data.summary.current_revenue)}`}
        />
        <Card
          title="Total Customers"
          value={formatNumber(data.summary.total_customers)}
        />
        <Card
          title="LTV / CAC Ratio"
          value={`${data.summary.ltv_cac_ratio.toFixed(1)}:1`}
        />
        <Card
          title="Monthly Burn (Adjusted)"
          value={`₹${formatNumber(data.summary.burn_rate)}`}
        />
        <Card
          title="Total GTM Investment"
          value={`₹${formatNumber(data.summary.total_gtm_investment)}`}
        />
      </div>

      {/* Charts in 2×2 grid */}
      <div className="charts-grid">
        <ChartCard
          title="Revenue Trend"
          value={`₹${formatNumber(data.summary.current_revenue)}`}
          subText="+12% vs last year"
        >
          <Line
            data={revenueChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  ticks: {
                    callback: function (value) {
                      return `₹${Number(value).toLocaleString("en-IN")}`;
                    }
                  }
                }
              }
            }}
          />
        </ChartCard>

        <ChartCard
          title="Unit Economics"
          value=""
          subText="+12% from last month"
        >
          <Doughnut
            data={unitEconomicsChartData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </ChartCard>

        <ChartCard
          title="Customer Growth"
          value={formatNumber(
            data.customers[data.customers.length - 1]?.value || 0
          )}
          subText="+12% vs last year"
        >
          <Bar
            data={growthChartData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </ChartCard>

        <ChartCard
          title="GTM Impact"
          value={`₹${formatNumber(data.summary.total_gtm_investment)}`}
          subText="Latest GTM data"
        >
          <Bar
            data={gtmChartData}
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
