import React, { useState, useRef, useEffect, useContext } from "react";
import "./Revenue.css";
import { BsInfoCircleFill } from "react-icons/bs";
import { RoleContext } from "../App";
import { downloadCSV } from "../utils/downloadCSV";

const quarters = ["Q1", "Q2", "Q3", "Q4"];

const capexMetrics = [
  { name: "Total Revenue", label: "Total Revenue", type: "auto" },
  { name: "Total Salary Cost", label: "Total Salary Cost", type: "auto" },
  { name: "Total Tech & OpEx", label: "Total Tech & OpEx", type: "auto" },
  { name: "Total Customer Acquisition Spends", label: "Total Customer Acquisition Spends", type: "auto" },
  { name: "M&A Costs", label: "M&A Costs", type: "auto" },
  { name: "Total Operating Costs", label: "Total Operating Costs", type: "auto", addGapAfter: true },
  { name: "EBITDA", label: "EBITDA", type: "auto" },
  { name: "EBITDA Margin (%)", label: "EBITDA Margin (%)", type: "auto" }
];

interface FinancialProps {
  stressTestData: any;
}

const Financial: React.FC<FinancialProps> = ({ stressTestData }) => {
  const { isManager } = useContext(RoleContext);
  const [viewMode, setViewMode] = useState<"quarter" | "year">("quarter");
  const [selectedYear, setSelectedYear] = useState("Year 1");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [stressTestingActive, setStressTestingActive] = useState(false);

  const sheetType = "financials";
  const [sheetData, setSheetData] = useState<any>({});

  const getQuarterKey = (year: string, quarterIdx: number) =>
    `Y${year.replace("Year ", "")}Q${quarterIdx + 1}`;

  const getDisplayedQuarters = () =>
    viewMode === "quarter"
      ? quarters.map((q, i) => ({ label: q, key: getQuarterKey(selectedYear, i) }))
      : ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"].map((_y, i) => ({
          label: `Y${i + 1}`,
          key: `Y${i + 1}Q4`
        }));

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

  // Helper: compute yearly data
  const computeYearlyData = (yearData: any, yearNum: number) => {
    const yearly: any = {};

    capexMetrics.forEach(metric => {
      if (["Total Revenue", "Total Salary Cost", "Total Tech & OpEx", "Total Customer Acquisition Spends", "M&A Costs", "Total Operating Costs", "EBITDA"].includes(metric.label)) {
        // Sum all quarters
        let sum = 0;
        quarters.forEach((_, qIdx) => {
          const val = yearData?.[metric.label]?.[`Y${yearNum}Q${qIdx + 1}`]?.value ?? 0;
          sum += val;
        });
        yearly[metric.label] = { value: sum, is_calculated: true };
      } else if (metric.label === "EBITDA Margin (%)") {
        // will calculate after summing EBITDA and Revenue
        yearly[metric.label] = { value: 0, is_calculated: true };
      } else {
        // Use last quarter (Q4) for other metrics
        const lastQ = yearData?.[metric.label]?.[`Y${yearNum}Q4`]?.value ?? 0;
        yearly[metric.label] = { value: lastQ, is_calculated: true };
      }
    });

    // Calculate EBITDA Margin (%)
    const totalEBITDA = yearly["EBITDA"]?.value ?? 0;
    const totalRevenue = yearly["Total Revenue"]?.value ?? 0;
    yearly["EBITDA Margin (%)"] = {
      value: totalRevenue !== 0 ? (totalEBITDA / totalRevenue) * 100 : 0,
      is_calculated: true
    };

    return yearly;
  };

  // Fetch sheet data
useEffect(() => {
  const fetchData = async () => {
    try {
      if (stressTestingActive && stressTestData) {
        const stressData = stressTestData[sheetType];

        if (viewMode === "year") {
          const yearlyData: any = {};

          ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"].forEach((year, yIdx) => {
            const yearNum = yIdx + 1;
            const yearly: any = {};

            capexMetrics.forEach(metric => {
              const metricData = stressData[metric.label] || {};
              const quarterKeys = ["Q1", "Q2", "Q3", "Q4"].map((q, i) => `Y${yearNum}Q${i + 1}`);

              if (metric.type === "auto") {
                if (metric.label === "EBITDA Margin (%)") {
                  yearly[metric.label] = { value: 0, is_calculated: true }; // calculate later
                } else {
                  // Sum all quarters
                  const sum = quarterKeys.reduce((acc, qKey) => acc + (metricData[qKey]?.value ?? 0), 0);
                  yearly[metric.label] = { value: sum, is_calculated: true };
                }
              } else {
                // For inputs, take Q4 snapshot
                yearly[metric.label] = { value: metricData[`Y${yearNum}Q4`]?.value ?? 0, is_calculated: true };
              }
            });

            // Compute EBITDA Margin (%) = EBITDA / Total Revenue * 100
            const totalEBITDA = yearly["EBITDA"]?.value ?? 0;
            const totalRevenue = yearly["Total Revenue"]?.value ?? 0;
            yearly["EBITDA Margin (%)"] = {
              value: totalRevenue !== 0 ? (totalEBITDA / totalRevenue) * 100 : 0,
              is_calculated: true
            };

            yearlyData[year] = yearly;
          });

          setSheetData(yearlyData);
        } else {
          // Quarter view: just use stress data directly
          setSheetData(stressData);
        }

        return;
      }

      // Normal API fetch
      if (viewMode === "year") {
        const allData: any = {};
        for (let year = 1; year <= 5; year++) {
          const res = await fetch(`http://localhost:8000/api/sheet-data/${sheetType}/${year}`);
          const data = await res.json();
          allData[`Year ${year}`] = computeYearlyData(data, year);
        }
        setSheetData(allData);
      } else {
        const yearNum = selectedYear.replace("Year ", "");
        const res = await fetch(`http://localhost:8000/api/sheet-data/${sheetType}/${yearNum}`);
        const data = await res.json();
        setSheetData(data);
      }
    } catch (error) {
      console.error("Error fetching sheet data:", error);
    }
  };

  fetchData();
}, [selectedYear, viewMode, stressTestingActive, stressTestData]);


  const updateCellAPI = async (fieldName: string, quarterIdx: number, value: number) => {
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
          quarter_num: quarterIdx + 1,
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

  const handleDownloadCSV = () => {
    downloadCSV({
      metrics: capexMetrics,
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
              Profit and Loss Statements <span className="info-icon"><BsInfoCircleFill /></span>
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
                    {["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"].map((year, idx) => (
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
              {capexMetrics.map((metric, idx) => (
                <React.Fragment key={idx}>
                  <tr className="align-middle">
                    <td>
                      <div className="mb-1">{metric.label}</div>
                      <div className="text-muted" style={{ fontSize: "12px" }}>
                        {metric.type === "input" ? "Input" : "Auto"}
                      </div>
                    </td>

                    {getDisplayedQuarters().map((q, qIdx) => {
                      let metricData;
                      if (viewMode === "year") {
                        const yearKey = `Year ${q.label.replace("Y", "")}`;
                        metricData = sheetData?.[yearKey]?.[metric.label];
                      } else {
                        metricData = sheetData?.[metric.label]?.[q.key];
                      }

                      const value = metricData?.value ?? 0;
                      const isCalculated = metricData?.is_calculated ?? false;

                      return (
                        <td key={qIdx}>
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
                                  [metric.label]: {
                                    ...prev[metric.label],
                                    [q.key]: {
                                      ...prev[metric.label]?.[q.key],
                                      value: newValue,
                                      is_calculated: false,
                                    },
                                  },
                                }));
                              }}
                              onBlur={(e) => {
                                if (!stressTestingActive && isManager)
                                  updateCellAPI(metric.label, qIdx, parseFloat(e.target.value) || 0);
                              }}
                              onKeyDown={(e) => {
                                if (!stressTestingActive && isManager && e.key === "Enter") e.currentTarget.blur();
                              }}
                            />
                          ) : (
                            <span>
                              {metric.label === "EBITDA Margin (%)"
                                ? value.toFixed(2) + " %"
                                : value.toLocaleString("en-IN")}
                            </span>
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

export default Financial;
