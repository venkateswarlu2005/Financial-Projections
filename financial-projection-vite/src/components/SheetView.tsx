import React, { useState, useRef, useEffect } from "react";
import "./Revenue.css";
import { BsInfoCircleFill } from "react-icons/bs";

interface Metric {
  name: string;
  type: "input" | "calculated";
  afterGap?: boolean;
}

interface Props {
  title: string;
  sheetType: string;
  metrics: Metric[];
}

const periods = ["Q1", "Q2", "Q3", "Q4"];

const SheetView: React.FC<Props> = ({ title, sheetType, metrics }) => {
  const [viewMode, setViewMode] = useState<"quarter" | "year">("quarter");
  const [selectedYear, setSelectedYear] = useState("Year 1");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="revenue">
      {/* Charts */}
      <div className="chart-section mb-4 d-flex gap-3 flex-wrap">
        <div className="chart-card flex-fill">
          <h6 className="chart-title d-flex justify-content-between">
            Growth Trend
            <span className="info-icon"><BsInfoCircleFill /></span>
          </h6>
          <div className="chart-placeholder">[ Line Chart Placeholder for {sheetType} ]</div>
        </div>

        <div className="chart-card flex-fill">
          <h6 className="chart-title d-flex justify-content-between">
            Avg Reach per Campaign
            <span className="info-icon"><BsInfoCircleFill /></span>
          </h6>
          <div className="chart-placeholder">[ Bar + Line Chart Placeholder for {sheetType} ]</div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <div className="container mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>
              {title}{" "}
              <span className="info-icon"><BsInfoCircleFill /></span>
            </h5>

            {/* View toggle */}
            <div className="d-flex gap-2 btn-group-pill-toggle">
              <div className="position-relative" ref={dropdownRef}>
                <button
                  className={`pill-toggle-btn ${viewMode === "quarter" ? "active" : ""}`}
                  onClick={() => {
                    setViewMode("quarter");
                    setShowDropdown((prev) => !prev);
                  }}
                >
                  <span className="circle-indicator" />
                  <span className="pill-label">Quarter Wise</span>
                  <span className="dropdown-arrow">▾</span>
                </button>

                {showDropdown && (
                  <div className="custom-dropdown">
                    {["Year 1", "Year 2", "Year 3"].map((year) => (
                      <div
                        key={year}
                        className={`dropdown-item-pill ${selectedYear === year ? "selected" : ""}`}
                        onClick={() => {
                          setSelectedYear(year);
                          setShowDropdown(false);
                        }}
                      >
                        <span className={`radio-circle ${selectedYear === year ? "filled" : ""}`} />
                        {year}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                className={`pill-toggle-btn ${viewMode === "year" ? "active" : ""}`}
                onClick={() => {
                  setViewMode("year");
                  setShowDropdown(false);
                }}
              >
                <span className="circle-indicator" />
                <span className="pill-label">Year Wise</span>
              </button>

              <button className="pill-toggle-btn no-dot">
                <span className="pill-label">Download</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <table className="table table-borderless table-hover revenue-table">
            <thead>
              <tr>
                <th className="metrics-header">Metrics</th>
                {periods.map((p) => (
                  <th key={p} className="quarter-header">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric, idx) => (
                <React.Fragment key={idx}>
                  <tr className="align-middle">
                    <td>
                      <div className="mb-1">{metric.name}</div>
                      <div className="text-muted" style={{ fontSize: "12px" }}>
                        {metric.type === "input" ? "Input" : "Auto"}
                      </div>
                    </td>
                    {periods.map((_, pIdx) => (
                      <td key={pIdx}>
                        {metric.type === "input" ? (
                          <input type="text" defaultValue="0" className="form-control form-control-sm" />
                        ) : (
                          <span>0</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  {metric.afterGap && (
                    <tr className="gap-row">
                      <td colSpan={periods.length + 1}></td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SheetView;
