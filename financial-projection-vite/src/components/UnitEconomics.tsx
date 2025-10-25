import React, { useState, useRef, useEffect, useContext } from "react";
import "./Revenue.css";
import { BsInfoCircleFill } from "react-icons/bs";
import { RoleContext } from "../App";
import { downloadCSV } from "../utils/downloadCSV";

const quarters = ["Q1", "Q2", "Q3", "Q4"];
const yearsList = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];

const metricItems = [
  { name: "CAC (Customer Acquisition Cost)", label: "CAC (Customer Acquisition Cost)", type: "auto", yearlySum: false },
  { name: "ARPU (Average Revenue Per User)", label: "ARPU (Average Revenue Per User)", type: "auto", yearlySum: false },
  { name: "Gross Margin (%)", label: "Gross Margin (%)", type: "auto", yearlySum: false },
  { name: "Churn Rate (%)", label: "Churn Rate (%)", type: "auto", yearlySum: false },
  { name: "Average Customer Lifetime (Months)", label: "Average Customer Lifetime (Months)", type: "auto", addGapAfter: true, yearlySum: false },
  { name: "LTV (Lifetime Value)", label: "LTV (Lifetime Value)", type: "auto", yearlySum: false },
  { name: "LTV/CAC Ratio", label: "LTV/CAC Ratio", type: "auto", yearlySum: false },
  { name: "Payback Period (Months)", label: "Payback Period (Months)", type: "auto", yearlySum: false },
];

interface UnitEconomicsProps {
  stressTestData: any;
}

const UnitEconomics: React.FC<UnitEconomicsProps> = ({ stressTestData }) => {
  const { isManager } = useContext(RoleContext);
  const [viewMode, setViewMode] = useState<"quarter" | "year">("quarter");
  const [selectedYear, setSelectedYear] = useState("Year 1");
  const [showDropdown, setShowDropdown] = useState(false);
  const [stressTestingActive, setStressTestingActive] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sheetType = "unit-economics";
  const [sheetData, setSheetData] = useState<any>({});

  const getQuarterKey = (year: string, quarterIdx: number) =>
    `Y${year.replace("Year ", "")}Q${quarterIdx + 1}`;

  const getDisplayedQuarters = () =>
    viewMode === "quarter"
      ? quarters.map((q, i) => ({ label: q, key: getQuarterKey(selectedYear, i) }))
      : yearsList.map((_y, i) => ({ label: `Y${i + 1}`, key: `Y${i + 1}Q4` }));

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch data including stress testing logic
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (stressTestingActive && stressTestData) {
          const stressData = stressTestData[sheetType];

          if (viewMode === "year") {
            // --- START: MODIFIED LOGIC ---
            // This logic now matches the pattern from Revenue.tsx
            const yearlyData: any = {};
            yearsList.forEach((year, yIdx) => {
              yearlyData[year] = {};
              metricItems.forEach((metric) => {
                const yearKey = `Y${yIdx + 1}Q`; // e.g., "Y1Q"
                const metricData = stressData[metric.name] || {};

                if (metric.yearlySum) {
                  // sum across all 4 quarters
                  let sum = 0;
                  for (let q = 1; q <= 4; q++) {
                    sum += metricData[`${yearKey}${q}`]?.value ?? 0;
                  }
                  yearlyData[year][metric.name] = { [`Y${yIdx + 1}Q4`]: { value: sum, is_calculated: true } };
                } else {
                  // snapshot / average → Q4 only
                  // All metrics in UnitEconomics use this path
                  yearlyData[year][metric.name] = { [`Y${yIdx + 1}Q4`]: { value: metricData[`${yearKey}4`]?.value ?? 0, is_calculated: true } };
                }
              });
            });
            setSheetData(yearlyData);
            // --- END: MODIFIED LOGIC ---
          } else {
            setSheetData(stressData);
          }
          return;
        }

        // Normal fetch
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
        console.error("Error fetching unit economics data:", err);
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
        console.error("Error updating cell:", result.message);
      }
    } catch (err) {
      console.error("Update error:", err);
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
              Unit Economics Metrics <span className="info-icon"><BsInfoCircleFill /></span>
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
                     {yearsList.map((year, idx) => (
                      <div
                        key={idx}
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
                      <div className="mb-1">{metric.label}</div>
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
                          value = Object.values(yearData).reduce(
                            (acc: number, cur: any) => acc + (cur.value ?? 0),
                            0
                          );
                        } else {
                          value = yearData?.[`Y${q.label.replace("Y", "")}Q4`]?.value ?? 0;
                        }
                      } else {
                          value = sheetData?.[metric.name]?.[q.key]?.value ?? 0;
                      }

                      const isCalculated =
                        viewMode === "quarter"
                          ? sheetData?.[metric.name]?.[q.key]?.is_calculated ?? false
                          : true; // In year view, it's always "calculated" or a snapshot

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
                                const newValue = parseFloat(e.target.value) || 0;
                                    setSheetData((prev: any) => ({
                                  ...prev,
                                  [metric.name]: {
                                    ...prev[metric.name],
                                    [q.key]: { value: newValue, is_calculated: false },
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

export default UnitEconomics;