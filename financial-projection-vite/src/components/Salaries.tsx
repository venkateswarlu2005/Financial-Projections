import React, { useState, useRef, useEffect, useContext } from "react";
import { BsInfoCircleFill } from "react-icons/bs";
import "./Revenue.css";
import { RoleContext } from "../App";

const quarters = ["Q1", "Q2", "Q3", "Q4"];
const years = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];

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

interface SalariesProps {
  stressTestData: any;
}

const Salaries: React.FC<SalariesProps> = ({ stressTestData }) => {
  const { isManager } = useContext(RoleContext);
  const [viewMode, setViewMode] = useState<"quarter" | "year">("quarter");
  const [selectedYear, setSelectedYear] = useState("Year 1");
  const [showDropdown, setShowDropdown] = useState(false);
  const [stressTestingActive, setStressTestingActive] = useState(false);
  const [sheetData, setSheetData] = useState<any>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sheetType = "salaries";

  const getQuarterKey = (year: string, quarterIdx: number) =>
    `Y${year.replace("Year ", "")}Q${quarterIdx + 1}`;

  const getDisplayedPeriods = () => {
    if (viewMode === "quarter") {
      return quarters.map((q, i) => ({ label: q, key: getQuarterKey(selectedYear, i) }));
    } else {
      return years.map((_year, i) => ({ label: `Y${i + 1}`, key: `Y${i + 1}Q4` }));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (stressTestingActive && stressTestData) {
        setSheetData(stressTestData[sheetType]);
      } else {
        try {
          const yearNum = selectedYear.replace("Year ", "");
          const response = await fetch(`http://localhost:8000/api/sheet-data/${sheetType}/${yearNum}`);
          const data = await response.json();
          setSheetData(data);
        } catch (error) {
          console.error("Error fetching salaries data:", error);
        }
      }
    };
    fetchData();
  }, [selectedYear, stressTestingActive, stressTestData]);

  const updateCellAPI = async (fieldName: string, periodIdx: number, value: number) => {
    if (stressTestingActive || !isManager) return;
    const yearNum = parseInt(selectedYear.replace("Year ", ""));
    try {
      const response = await fetch("http://localhost:8000/api/update-cell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: 1,
          sheet_type: sheetType,
          field_name: fieldName,
          year_num: yearNum,
          quarter_num: periodIdx + 1,
          value,
        }),
      });
      const result = await response.json();

      if (response.ok && result.status === "success") {
        const updated = await fetch(`http://localhost:8000/api/sheet-data/${sheetType}/${yearNum}`);
        const updatedData = await updated.json();
        setSheetData(updatedData);
      } else {
        console.error("Error updating cell:", result.message);
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <div className="revenue">
      <div className="table-wrapper">
        <div className="container mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>
              Salary Metrics <span className="info-icon"><BsInfoCircleFill /></span>
            </h5>

            <div className="d-flex gap-2 btn-group-pill-toggle">
              {!isManager && (
                <button
                  className={`pill-toggle-btn ${stressTestingActive ? "active" : ""}`}
                  onClick={() => setStressTestingActive(prev => !prev)}
                >
                  <span className="circle-indicator" />
                  <span className="pill-label">Stress Testing</span>
                </button>
              )}

              <div className="position-relative" ref={dropdownRef}>
                <button
                  className={`pill-toggle-btn ${viewMode === "quarter" ? "active" : ""}`}
                  onClick={() => {
                    setViewMode("quarter");
                    setShowDropdown(prev => !prev);
                  }}
                >
                  <span className="circle-indicator" />
                  <span className="pill-label">Quarter Wise</span>
                </button>

                {showDropdown && (
                  <div className="custom-dropdown">
                    {years.map(year => (
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
                onClick={() => setViewMode("year")}
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
                {getDisplayedPeriods().map((p, i) => (
                  <th key={i} className="quarter-header">{p.label}</th>
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
                    {getDisplayedPeriods().map((p, pIdx) => {
                      const metricData = sheetData?.[metric.name]?.[p.key];
                      const value = metricData?.value ?? 0;
                      const isCalculated = metricData?.is_calculated ?? false;

                      return (
                        <td key={pIdx}>
                          {metric.type === "input" && !isCalculated && viewMode === "quarter" ? (
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={value}
                              readOnly={stressTestingActive || !isManager}
                              style={stressTestingActive || !isManager ? { backgroundColor: "#f5f5f5", cursor: "not-allowed" } : {}}
                              onChange={(e) => {
                                if (stressTestingActive || !isManager) return;
                                const newValue = parseFloat(e.target.value) || 0;
                                setSheetData((prev: any) => ({
                                  ...prev,
                                  [metric.name]: {
                                    ...prev[metric.name],
                                    [p.key]: {
                                      ...prev[metric.name]?.[p.key],
                                      value: newValue,
                                      is_calculated: false,
                                    }
                                  }
                                }));
                              }}
                              onBlur={(e) => {
                                if (!stressTestingActive && isManager) {
                                  updateCellAPI(metric.name, pIdx, parseFloat(e.target.value) || 0);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (!stressTestingActive && isManager && e.key === "Enter") {
                                  e.currentTarget.blur();
                                }
                              }}
                            />
                          ) : (
                            <span>{value.toLocaleString("en-IN")}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  {metric.addGapAfter && (
                    <tr className="gap-row">
                      <td colSpan={quarters.length + 1}></td>
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
