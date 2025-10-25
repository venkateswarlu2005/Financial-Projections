import React, { useState, useRef, useEffect, useContext } from "react";
import "./Revenue.css";
import { BsInfoCircleFill } from "react-icons/bs";
import { RoleContext } from "../App";
import { downloadCSV } from "../utils/downloadCSV";

const quarters = ["Q1", "Q2", "Q3", "Q4"];
const years = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];

const techOpex = [
  // yearlySum: true → sum of Q1-Q4, false → Q4 snapshot
  { name: "Cyber Security", type: "input", yearlySum: true },
  { name: "Servers", type: "input", yearlySum: true },
  { name: "Data Processing Equipment - NSE", type: "input", yearlySum: true },
  { name: "GPUs", type: "input", yearlySum: true },
  { name: "Lease Line", type: "input", yearlySum: true },
  { name: "Third Party APIs", type: "input", yearlySum: true },
  { name: "Third Party SAAS", type: "input", yearlySum: true },
  { name: "Google Workspace", type: "input", yearlySum: true, afterGap: true },

  { name: "AMCs", type: "input", yearlySum: true },
  { name: "SEBI Compliance", type: "input", yearlySum: true },
  { name: "NSE", type: "input", yearlySum: true },
  { name: "BSE", type: "input", yearlySum: true },
  { name: "DP", type: "input", yearlySum: true },
  { name: "AMFI", type: "input", yearlySum: true },
  { name: "RBI", type: "input", yearlySum: true },
  { name: "ROC", type: "input", yearlySum: true },
  { name: "IT", type: "input", yearlySum: true, afterGap: true },

  { name: "Office Rent", type: "input", yearlySum: true },
  { name: "Utilities & Internet", type: "input", yearlySum: true },
  { name: "Office Supplies", type: "input", yearlySum: true },
  { name: "Travel", type: "input", yearlySum: true, afterGap: true },

  { name: "Inflation Adjustment (%)", type: "auto", yearlySum: false },
  { name: "Surprise Costs", type: "auto", yearlySum: true },
  { name: "Total", type: "auto", yearlySum: true }
];

interface OpExProps {
  stressTestData: any;
}

const OpEx: React.FC<OpExProps> = ({ stressTestData }) => {
  const { isManager } = useContext(RoleContext);
  const [viewMode, setViewMode] = useState<"quarter" | "year">("quarter");
  const [selectedYear, setSelectedYear] = useState("Year 1");
  const [showDropdown, setShowDropdown] = useState(false);
  const [stressTestingActive, setStressTestingActive] = useState(false);
  const [sheetData, setSheetData] = useState<any>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sheetType = "tech-opex";

  const getQuarterKey = (year: string, quarterIdx: number) =>
    `Y${year.replace("Year ", "")}Q${quarterIdx + 1}`;

  const getDisplayedPeriods = () =>
    viewMode === "quarter"
      ? quarters.map((q, i) => ({ label: q, key: getQuarterKey(selectedYear, i) }))
      : years.map((_y, i) => ({ label: `Y${i + 1}`, key: `Y${i + 1}Q4` }));

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
    try {
      if (stressTestingActive && stressTestData) {
        const stressData = stressTestData[sheetType];

        if (viewMode === "year") {
          const yearlyData: any = {};
          years.forEach((year, yIdx) => {
            yearlyData[year] = {};
            techOpex.forEach((metric) => {
              const metricData = stressData[metric.name] || {};
              const yearKey = `Y${yIdx + 1}Q`;

              if (metric.yearlySum) {
                // Sum all quarters for the year
                const sum = Object.keys(metricData)
                  .filter(k => k.startsWith(yearKey))
                  .reduce((acc, k) => acc + (metricData[k]?.value ?? 0), 0);

                yearlyData[year][metric.name] = {
                  [`Y${yIdx + 1}Q4`]: { value: sum, is_calculated: true },
                };
              } else {
                // Q4 snapshot
                yearlyData[year][metric.name] = {
                  [`Y${yIdx + 1}Q4`]: { value: metricData[`${yearKey}4`]?.value ?? 0, is_calculated: true },
                };
              }
            });
          });
          setSheetData(yearlyData);
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
      console.error("Error fetching tech Opex data:", err);
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
      metrics: techOpex,
      sheetData,
      displayedQuarters: getDisplayedPeriods(),
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
              Tech OpEx Metrics <span className="info-icon"><BsInfoCircleFill /></span>
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

              <button className="pill-toggle-btn no-dot" onClick={handleDownloadCSV}>
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
              {techOpex.map((metric, idx) => (
                <React.Fragment key={idx}>
                  <tr className="align-middle">
                    <td>
                      <div className="mb-1">{metric.name}</div>
                      <div className="text-muted" style={{ fontSize: "12px" }}>
                        {metric.type === "input" ? "Input" : "Auto"}
                      </div>
                    </td>

                    {getDisplayedPeriods().map((p, pIdx) => {
                      const yearKey = viewMode === "year" ? `Year ${p.label.replace("Y", "")}` : selectedYear;
                      let value = 0;

                      if (viewMode === "year") {
                        const yearData = sheetData?.[yearKey]?.[metric.name] || {};
                        if (metric.yearlySum) {
                          value = Object.values(yearData).reduce(
                            (acc: number, cur: any) => acc + (cur?.value ?? 0),
                            0
                          );
                        } else {
                          value = yearData?.[`Y${p.label.replace("Y", "")}Q4`]?.value ?? 0;
                        }
                      } else {
                        value = sheetData?.[metric.name]?.[p.key]?.value ?? 0;
                      }

                      const isCalculated = sheetData?.[metric.name]?.[p.key]?.is_calculated ?? false;

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
                                    },
                                  },
                                }));
                              }}
                              onBlur={(e) => {
                                if (!stressTestingActive && isManager)
                                  updateCellAPI(metric.name, pIdx, parseFloat(e.target.value) || 0);
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

                  {metric.afterGap && (
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

export default OpEx;
