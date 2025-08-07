import React, { useEffect, useRef, useState } from "react";
import { BsDownload, BsInfoCircleFill } from "react-icons/bs";
import "./Revenue.css"; // Reuse the existing CSS
import { Dropdown } from "react-bootstrap";

const periods = ["Jan", "Feb", "Mar", "Apr"]; // Adjust for quarterly if needed

const Metrics = [
  { name: "Core Management Count", type: "input" },
  { name: "Core Management Average Salary", type: "input" },
  { name: "Domain Specific Head Count", type: "input" },
  { name: "Domain Specific Head Average Salary", type: "input" },
  { name: "Cluster Heads Count", type: "input" },
  { name: "Cluster Heads Average Salary", type: "input" },
  { name: "Management & Domain Expert Cost", type: "calculated", addGapAfter: true },

  { name: "Economists Count", type: "input" },
  { name: "Economists Average Salary", type: "input" },
  { name: "Technical Analysts Count", type: "input" },
  { name: "Technical Analysts Average Salary", type: "input" },
  { name: "Fundamental Analysts Count", type: "input" },
  { name: "Fundamental Analysts Average Salary", type: "input" },
  { name: "Business Analysts Count", type: "input" },
  { name: "Business Analysts Average Salary", type: "input" },
  { name: "Quant Analysts Count", type: "input" },
  { name: "Quant Analysts Average Salary", type: "input" },
  { name: "Data Scientists Count", type: "input" },
  { name: "Data Scientists Average Salary", type: "input" },
  { name: "Subject Level Expert Cost", type: "calculated" },

  { name: "Independent Directors Count", type: "input" },
  { name: "Independent Directors Average Salary", type: "input" },
  { name: "Board of Directors Cost", type: "calculated", addGapAfter: true },

  { name: "Marketing Head Count", type: "input" },
  { name: "Marketing Head Average Salary", type: "input" },
  { name: "BD Head Count", type: "input" },
  { name: "BD Head Average Salary", type: "input" },
  { name: "Accounts Head Count", type: "input" },
  { name: "Accounts Head Average Salary", type: "input" },
  { name: "HR Head Count", type: "input" },
  { name: "HR Head Average Salary", type: "input" },
  { name: "IT Head Count", type: "input" },
  { name: "IT Head Average Salary", type: "input" },
  { name: "Cyber Security Head Count", type: "input" },
  { name: "Cyber Security Head Average Salary", type: "input" },
  { name: "Compliance Head Count", type: "input" },
  { name: "Compliance Head Average Salary", type: "input" },
  { name: "Investment Head Count", type: "input" },
  { name: "Investment Head Average Salary", type: "input" },
  { name: "Commercial Head Count", type: "input" },
  { name: "Commercial Head Average Salary", type: "input" },
  { name: "Technology Head Count", type: "input" },
  { name: "Technology Head Average Salary", type: "input" },
  { name: "Functional Heads Cost", type: "calculated", addGapAfter: true },

  { name: "Senior Developers Count", type: "input" },
  { name: "Senior Developers Average Salary", type: "input" },
  { name: "Junior Developers Count", type: "input" },
  { name: "Junior Developers Average Salary", type: "input" },
  { name: "Testers Count", type: "input" },
  { name: "Testers Average Salary", type: "input" },
  { name: "Designers Count", type: "input" },
  { name: "Designers Average Salary", type: "input" },
  { name: "Engineering Team Cost", type: "calculated", addGapAfter: true },

  { name: "Marketing Managers Count", type: "input" },
  { name: "Marketing Managers Average Salary", type: "input" },
  { name: "Marketing Executives Count", type: "input" },
  { name: "Marketing Executives Average Salary", type: "input" },
  { name: "RMs Count", type: "input" },
  { name: "RMs Average Salary", type: "input" },
  { name: "Marketing Team Cost", type: "calculated", addGapAfter: true },

  { name: "Compliance Officers Count", type: "input" },
  { name: "Compliance Officers Average Salary", type: "input" },
  { name: "Grievance Officer Count", type: "input" },
  { name: "Grievance Officer Average Salary", type: "input" },
  { name: "Compliance Team Cost", type: "calculated", addGapAfter: true },

  { name: "Research Engineers Count", type: "input" },
  { name: "Research Engineers Average Salary", type: "input" },
  { name: "R&D Team Cost", type: "calculated", addGapAfter: true },

  { name: "Support Executives Count", type: "input" },
  { name: "Support Executives Average Salary", type: "input" },
  { name: "Support Staff Cost", type: "calculated", addGapAfter: true },

  { name: "Total Salary Cost", type: "calculated" }
];

const Salaries: React.FC = () => {
 const [viewMode, setViewMode] = useState<"quarter" | "year">("quarter");
  const [selectedYear, setSelectedYear] = useState("Year 1");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="revenue">
      <div className="chart-section mb-4 d-flex gap-3 flex-wrap">
        <div className="chart-card flex-fill">
          <h6 className="chart-title d-flex justify-content-between">
            Growth Trend{" "}
            <span className="info-icon">
              <BsInfoCircleFill />
            </span>
          </h6>
          <div className="chart-placeholder">[ Line Chart Placeholder ]</div>
        </div>

        <div className="chart-card flex-fill">
          <h6 className="chart-title d-flex justify-content-between">
            Avg Reach per Campaign{" "}
            <span className="info-icon">
              <BsInfoCircleFill />
            </span>
          </h6>
          <div className="chart-placeholder">[ Bar + Line Chart Placeholder ]</div>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="container mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>
              Salaries{" "}
              <span className="info-icon">
                <BsInfoCircleFill />
              </span>
            </h5>

            <div className="d-flex gap-2 btn-group-pill-toggle">
              <div className="position-relative" ref={dropdownRef}>
                <button
                  className={`pill-toggle-btn ${
                    viewMode === "quarter" ? "active" : ""
                  }`}
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
                    {["Year 1", "Year 2", "Year 3"].map((year, idx) => (
                      <div
                        key={idx}
                        className={`dropdown-item-pill ${
                          selectedYear === year ? "selected" : ""
                        }`}
                        onClick={() => {
                          setSelectedYear(year);
                          setShowDropdown(false);
                        }}
                      >
                        <span
                          className={`radio-circle ${
                            selectedYear === year ? "filled" : ""
                          }`}
                        />
                        {year}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                className={`pill-toggle-btn ${
                  viewMode === "year" ? "active" : ""
                }`}
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

          <table className="table table-borderless table-hover revenue-table">
            <thead>
              <tr>
                <th className="metrics-header">Metrics</th>
                {periods.map((p, i) => (
                  <th key={i} className="quarter-header">
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Metrics.map((metric, idx) => (
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
                            type="text"
                            defaultValue="0"
                            className="form-control form-control-sm"
                          />
                        ) : (
                          <span>0</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {metric.addGapAfter && (
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


export default Salaries;
