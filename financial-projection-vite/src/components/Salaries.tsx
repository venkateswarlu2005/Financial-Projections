import React, { useState, useEffect, useRef, useContext } from "react";
import { BsInfoCircleFill } from "react-icons/bs";
import "./Revenue.css";
import { RoleContext } from "../App";
import { downloadCSV } from "../utils/downloadCSV";

const quarters = ["Q1", "Q2", "Q3", "Q4"];
const yearsList = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];

// Define all salary metrics with yearlySum flag
const metricItems = [
  { name: "Core Management Count", type: "input", yearlySum: false },
  { name: "Core Management Average Salary", type: "input", yearlySum: false },
  { name: "Domain Specific Head Count", type: "input", yearlySum: false },
  { name: "Domain Specific Head Average Salary", type: "input", yearlySum: false },
  { name: "Cluster Heads Count", type: "input", yearlySum: false },
  { name: "Cluster Heads Average Salary", type: "input", yearlySum: false },

  // Calculated Costs → sum of quarters
  { name: "Management & Domain Expert Cost", type: "calculated", yearlySum: true, addGapAfter: true },

  { name: "Economists Count", type: "input", yearlySum: false },
  { name: "Economists Average Salary", type: "input", yearlySum: false },
  { name: "Technical Analysts Count", type: "input", yearlySum: false },
  { name: "Technical Analysts Average Salary", type: "input", yearlySum: false },
  { name: "Fundamental Analysts Count", type: "input", yearlySum: false },
  { name: "Fundamental Analysts Average Salary", type: "input", yearlySum: false },
  { name: "Business Analysts Count", type: "input", yearlySum: false },
  { name: "Business Analysts Average Salary", type: "input", yearlySum: false },
  { name: "Quant Analysts Count", type: "input", yearlySum: false },
  { name: "Quant Analysts Average Salary", type: "input", yearlySum: false },
  { name: "Data Scientists Count", type: "input", yearlySum: false },
  { name: "Data Scientists Average Salary", type: "input", yearlySum: false },

  { name: "Subject Level Expert Cost", type: "calculated", yearlySum: true },

  { name: "Independent Directors Count", type: "input", yearlySum: false },
  { name: "Independent Directors Average Salary", type: "input", yearlySum: false },

  { name: "Board of Directors Cost", type: "calculated", yearlySum: true, addGapAfter: true },

  { name: "Marketing Head Count", type: "input", yearlySum: false },
  { name: "Marketing Head Average Salary", type: "input", yearlySum: false },
  { name: "BD Head Count", type: "input", yearlySum: false },
  { name: "BD Head Average Salary", type: "input", yearlySum: false },
  { name: "Accounts Head Count", type: "input", yearlySum: false },
  { name: "Accounts Head Average Salary", type: "input", yearlySum: false },
  { name: "HR Head Count", type: "input", yearlySum: false },
  { name: "HR Head Average Salary", type: "input", yearlySum: false },
  { name: "IT Head Count", type: "input", yearlySum: false },
  { name: "IT Head Average Salary", type: "input", yearlySum: false },
  { name: "Cyber Security Head Count", type: "input", yearlySum: false },
  { name: "Cyber Security Head Average Salary", type: "input", yearlySum: false },
  { name: "Compliance Head Count", type: "input", yearlySum: false },
  { name: "Compliance Head Average Salary", type: "input", yearlySum: false },
  { name: "Investment Head Count", type: "input", yearlySum: false },
  { name: "Investment Head Average Salary", type: "input", yearlySum: false },
  { name: "Commercial Head Count", type: "input", yearlySum: false },
  { name: "Commercial Head Average Salary", type: "input", yearlySum: false },
  { name: "Technology Head Count", type: "input", yearlySum: false },
  { name: "Technology Head Average Salary", type: "input", yearlySum: false },

  { name: "Functional Heads Cost", type: "calculated", yearlySum: true, addGapAfter: true },

  { name: "Senior Developers Count", type: "input", yearlySum: false },
  { name: "Senior Developers Average Salary", type: "input", yearlySum: false },
  { name: "Junior Developers Count", type: "input", yearlySum: false },
  { name: "Junior Developers Average Salary", type: "input", yearlySum: false },
  { name: "Testers Count", type: "input", yearlySum: false },
  { name: "Testers Average Salary", type: "input", yearlySum: false },
  { name: "Designers Count", type: "input", yearlySum: false },
  { name: "Designers Average Salary", type: "input", yearlySum: false },

  { name: "Engineering Team Cost", type: "calculated", yearlySum: true, addGapAfter: true },

  { name: "Marketing Managers Count", type: "input", yearlySum: false },
  { name: "Marketing Managers Average Salary", type: "input", yearlySum: false },
  { name: "Marketing Executives Count", type: "input", yearlySum: false },
  { name: "Marketing Executives Average Salary", type: "input", yearlySum: false },
  { name: "RMs Count", type: "input", yearlySum: false },
  { name: "RMs Average Salary", type: "input", yearlySum: false },

  { name: "Marketing Team Cost", type: "calculated", yearlySum: true, addGapAfter: true },

  { name: "Compliance Officers Count", type: "input", yearlySum: false },
  { name: "Compliance Officers Average Salary", type: "input", yearlySum: false },
  { name: "Grievance Officer Count", type: "input", yearlySum: false },
  { name: "Grievance Officer Average Salary", type: "input", yearlySum: false },

  { name: "Compliance Team Cost", type: "calculated", yearlySum: true, addGapAfter: true },

  { name: "Research Engineers Count", type: "input", yearlySum: false },
  { name: "Research Engineers Average Salary", type: "input", yearlySum: false },

  { name: "R&D Team Cost", type: "calculated", yearlySum: true, addGapAfter: true },

  { name: "Support Executives Count", type: "input", yearlySum: false },
  { name: "Support Executives Average Salary", type: "input", yearlySum: false },

  { name: "Support Staff Cost", type: "calculated", yearlySum: true, addGapAfter: true },

  { name: "Total Salary Cost", type: "calculated", yearlySum: true }
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

  const getDisplayedQuarters = () =>
    viewMode === "quarter"
      ? quarters.map((q, i) => ({ label: q, key: getQuarterKey(selectedYear, i) }))
      : yearsList.map((_y, i) => ({ label: `Y${i + 1}`, key: `Y${i + 1}` }));

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch sheet data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (stressTestingActive && stressTestData) {
          setSheetData(stressTestData[sheetType]);
          return;
        }
        if (viewMode === "year") {
          const allData: any = {};
          for (let year = 1; year <= 5; year++) {
            const res = await fetch(`http://localhost:8000/api/sheet-data/${sheetType}/${year}`);
            const data = await res.json();
            allData[`Year ${year}`] = data;
          }
          setSheetData(allData);
        } else {
          const yearNum = selectedYear.replace("Year ", "");
          const res = await fetch(`http://localhost:8000/api/sheet-data/${sheetType}/${yearNum}`);
          const data = await res.json();
          setSheetData(data);
        }
      } catch (err) {
        console.error("Error fetching salaries data:", err);
      }
    };
    fetchData();
  }, [viewMode, selectedYear, stressTestingActive, stressTestData]);

  const updateCellAPI = async (fieldName: string, quarterIdx: number, value: number) => {
    if (stressTestingActive || !isManager) return;
    const yearNum = parseInt(selectedYear.replace("Year ", ""));
    try {
      const res = await fetch("http://localhost:8000/api/update-cell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: 1,
          sheet_type: sheetType,
          field_name: fieldName,
          year_num: yearNum,
          quarter_num: quarterIdx + 1,
          value,
        }),
      });
      const result = await res.json();
      if (res.ok && result.status === "success") {
        const updatedRes = await fetch(`http://localhost:8000/api/sheet-data/${sheetType}/${yearNum}`);
        const updatedData = await updatedRes.json();
        setSheetData(updatedData);
      } else {
        console.error(result.message);
      }
    } catch (err) {
      console.error("Error updating cell:", err);
    }
  };

  const handleDownloadCSV = () => {
    downloadCSV({
      metrics: metricItems,
      sheetData,
      displayedQuarters: getDisplayedQuarters(),
      sheetType,
      viewMode,
      selectedYear,
    });
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
                    {yearsList.map((year) => (
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

              <button className="pill-toggle-btn no-dot" onClick={handleDownloadCSV}>
                <span className="pill-label">Download</span>
              </button>
            </div>
          </div>

          <table className="table table-borderless table-hover revenue-table">
            <thead>
              <tr>
                <th className="metrics-header">Metrics</th>
                {getDisplayedQuarters().map((q, i) => (
                  <th key={i} className="quarter-header">{q.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metricItems.map((metric, idx) => (
                <React.Fragment key={idx}>
                  <tr className="align-middle">
                    <td>
                      <div className="mb-1">{metric.name}</div>
                      <div className="text-muted" style={{ fontSize: "12px" }}>
                        {metric.type === "input" ? "Input" : "Auto"}
                      </div>
                    </td>
                    {getDisplayedQuarters().map((q, qIdx) => {
                      let value = 0;
                      const yearKey = viewMode === "year" ? `Year ${q.label.replace("Y", "")}` : selectedYear;

                      if (viewMode === "year") {
                        const yearData = sheetData?.[yearKey]?.[metric.name] || {};
                        if (metric.yearlySum) {
                          // Sum all quarters for calculated metrics
                          value = Object.values(yearData).reduce(
                            (acc: number, cur: any) => acc + (cur.value ?? 0),
                            0
                          );
                        } else {
                          // Q4 snapshot for counts/averages
                          value = yearData?.[`Y${q.label.replace("Y", "")}Q4`]?.value ?? 0;
                        }
                      } else {
                        value = sheetData?.[metric.name]?.[q.key]?.value ?? 0;
                      }

                      const isCalculated = sheetData?.[metric.name]?.[q.key]?.is_calculated ?? false;

                      return (
                        <td key={qIdx}>
                          {metric.type === "input" && !isCalculated && viewMode === "quarter" ? (
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={value}
                              readOnly={stressTestingActive || !isManager}
                              style={
                                stressTestingActive || !isManager
                                  ? { backgroundColor: "#f5f5f5", cursor: "not-allowed" }
                                  : {}
                              }
                              onChange={(e) => {
                                if (stressTestingActive || !isManager) return;
                                const newVal = parseFloat(e.target.value) || 0;
                                setSheetData((prev: any) => ({
                                  ...prev,
                                  [metric.name]: {
                                    ...prev[metric.name],
                                    [q.key]: {
                                      ...prev[metric.name]?.[q.key],
                                      value: newVal,
                                      is_calculated: false,
                                    },
                                  },
                                }));
                              }}
                              onBlur={(e) => {
                                if (!stressTestingActive && isManager)
                                  updateCellAPI(metric.name, qIdx, parseFloat(e.target.value) || 0);
                              }}
                              onKeyDown={(e) => {
                                if (!stressTestingActive && isManager && e.key === "Enter")
                                  e.currentTarget.blur();
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
