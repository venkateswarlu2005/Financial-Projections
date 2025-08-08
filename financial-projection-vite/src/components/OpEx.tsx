import React, { useState, useRef, useEffect } from "react";
import "./Revenue.css";
import { BsInfoCircleFill } from "react-icons/bs";

const periodsQuarter = ["Q1", "Q2", "Q3", "Q4"];
const periodsYear = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];

const techOpex = [
  { name: "Cloud Hosting", type: "input" },
  { name: "CDN Services", type: "input" },
  { name: "Database Hosting", type: "input" },
  { name: "DevOps Tools", type: "input" },
  { name: "Version Control (GitHub/GitLab)", type: "input" },
  { name: "Monitoring & Logging Tools", type: "input" },
  { name: "AI/ML Model Hosting", type: "input", afterGap: true },

  { name: "Cybersecurity Software", type: "input" },
  { name: "Data Backup & Recovery", type: "input" },
  { name: "Disaster Recovery Services", type: "input", afterGap: true },

  { name: "Inflation Adjustment (%)", type: "calculated" },
  { name: "Surprise Costs", type: "calculated" },
  { name: "Total", type: "calculated" },
];

const OpEx: React.FC = () => {
  const [viewMode, setViewMode] = useState<"quarter" | "year">("quarter");
  const [selectedYear, setSelectedYear] = useState("Year 1");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const periods = viewMode === "quarter" ? periodsQuarter : periodsYear;

  // Initialize values
  const [values, setValues] = useState<Record<string, number[]>>(() => {
    const obj: Record<string, number[]> = {};
    techOpex.forEach((m) => {
      obj[m.name] = new Array(periodsQuarter.length).fill(0);
    });
    return obj;
  });

  const handleChange = (metric: string, index: number, value: string) => {
    setValues((prev) => {
      const updated = { ...prev };
      updated[metric][index] = parseFloat(value) || 0;
      return updated;
    });
  };

  // Totals
  const calcTotals = () => {
    const totals = new Array(periodsQuarter.length).fill(0);
    techOpex.forEach((m) => {
      if (m.type === "input") {
        values[m.name].forEach((val, idx) => {
          totals[idx] += val;
        });
      }
    });
    return totals;
  };

  const totals = calcTotals();
  const inflation = totals.map((t) => t * 0.05);
  const surprises = totals.map((t) => t * 0.02);
  const grandTotal = totals.map((t, idx) => t + inflation[idx] + surprises[idx]);

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
            Tech OpEx Growth Trend <span className="info-icon"><BsInfoCircleFill /></span>
          </h6>
          <div className="chart-placeholder">[ Line Chart Placeholder ]</div>
        </div>

        <div className="chart-card flex-fill">
          <h6 className="chart-title d-flex justify-content-between">
            Avg Tech Spend per Period <span className="info-icon"><BsInfoCircleFill /></span>
          </h6>
          <div className="chart-placeholder">[ Bar + Line Chart Placeholder ]</div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <div className="container mt-4">
          {/* Header controls */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>
              Tech OpEx Metrics <span className="info-icon"><BsInfoCircleFill /></span>
            </h5>

            <div className="d-flex gap-2 btn-group-pill-toggle">
              {/* Quarter toggle */}
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
                </button>

                {showDropdown && (
                  <div className="custom-dropdown">
                    {periodsYear.map((year) => (
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

              {/* Year toggle */}
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

              {/* Download */}
              <button className="pill-toggle-btn no-dot">
                <span className="pill-label">Download</span>
              </button>
            </div>
          </div>

          {/* Data table */}
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
              {techOpex.map((metric, idx) => {
                let rowValues = values[metric.name];
                if (metric.name === "Inflation Adjustment (%)") rowValues = inflation;
                if (metric.name === "Surprise Costs") rowValues = surprises;
                if (metric.name === "Total") rowValues = grandTotal;

                return (
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
                            <input
                              type="number"
                              value={rowValues?.[pIdx] ?? 0}
                              onChange={(e) => handleChange(metric.name, pIdx, e.target.value)}
                              className="form-control form-control-sm"
                            />
                          ) : (
                            <span>{(rowValues?.[pIdx] ?? 0).toFixed(2)}</span>
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OpEx;
