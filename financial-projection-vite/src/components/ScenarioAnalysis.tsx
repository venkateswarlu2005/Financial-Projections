import React from "react";
import { FaRupeeSign, FaBalanceScale, FaLongArrowAltUp } from "react-icons/fa";
import { MdGroups } from "react-icons/md";
import { BsInfoCircleFill } from "react-icons/bs";
import "./ScenarioAnalysis.css";

interface ScenarioCardProps {
  title: string;
  badge: string;
  badgeClass: string;
  revenue: string;
  customers: number;
  ratio: string;
  change: string;
  borderClass: string;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({
  title,
  badge,
  badgeClass,
  revenue,
  customers,
  ratio,
  change,
  borderClass
}) => {
  return (
    <div className={`scenario-card ${borderClass}`}>
      {/* Card Header */}
      <div className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0 fw-semibold">{title}</h6>
        <span className={`scenario-badge ${badgeClass}`}><span className="dot"></span>{badge}</span>
      </div>

      {/* Revenue */}
      <div className="metric">
        <div className="metric-label">
          <div className="icon-circle icon-revenue">
            <FaRupeeSign />
          </div>
          <span>Revenue</span>
        </div>
        <div className="metric-value">
          <span>{revenue}</span>
          <span className="change-pill">
            <FaLongArrowAltUp /> {change}
          </span>
        </div>
      </div>

      {/* Customers */}
      <div className="metric">
        <div className="metric-label">
          <div className="icon-circle icon-customer">
            <MdGroups />
          </div>
          <span>Customers</span>
        </div>
        <div className="metric-value">
          <span>{customers}</span>
          <span className="change-pill">
            <FaLongArrowAltUp /> {change}
          </span>
        </div>
      </div>

      {/* LTV/CAC Ratio */}
      <div className="metric">
        <div className="metric-label">
          <div className="icon-circle icon-ratio">
            <FaBalanceScale />
          </div>
          <span>LTV / CAC Ratio</span>
        </div>
        <div className="metric-value">
          <span>{ratio}</span>
          <span className="change-pill">
            <FaLongArrowAltUp /> {change}
          </span>
        </div>
      </div>
    </div>
  );
};


const ScenarioAnalysis: React.FC = () => {
  return (
    <div className="page-background">
      <div className="main-container">
        <h5 className="fw-semibold d-flex align-items-center mb-1">
          Scenario Comparison <BsInfoCircleFill className="info-icon ms-2" />
        </h5>
        <p className="text-muted small mb-4">
          Compare multiple scenarios side-by-side for investment decision making
        </p>

        <div className="row g-3">
          <div className="col-md-4">
            <ScenarioCard
              title="Base Case"
              badge="Base"
              badgeClass="badge-warning text-dark"
              revenue="₹8,50,000"
              customers={597}
              ratio="31.4:1"
              change="0%"
              borderClass="border-warning"
            />
          </div>
          <div className="col-md-4">
            <ScenarioCard
              title="Current Stress Test"
              badge="Active"
              badgeClass="badge-success"
              revenue="₹8,50,000"
              customers={597}
              ratio="31.4:1"
              change="12%"
              borderClass="border-success"
            />
          </div>
          <div className="col-md-4">
            <ScenarioCard
              title="Saved Scenario"
              badge="Saved"
              badgeClass="badge-primary"
              revenue="₹8,50,000"
              customers={597}
              ratio="31.4:1"
              change="12%"
              borderClass="border-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioAnalysis;
