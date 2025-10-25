import React, { useState, useRef, useEffect, useContext } from "react";
import "./Revenue.css";
import { BsInfoCircleFill } from "react-icons/bs";
import { RoleContext } from "../App";
import { downloadCSV } from "../utils/downloadCSV";

const quarters = ["Q1", "Q2", "Q3", "Q4"];
const yearsList = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];

const growthMetrics = [
  { name: "Search Engine & GPT Marketing Spends", label: "Search Engine & GPT Marketing Spends", type: "input", yearlySum: true },
  { name: "Average Reach from Search", label: "Average Reach from Search", type: "input", addGapAfter: true, yearlySum: true },
  { name: "Social Media Marketing Spends (Ads)", label: "Social Media Marketing Spends (Ads)", type: "input", yearlySum: true },
  { name: "Average Reach from Social Ads", label: "Average Reach from Social Ads", type: "input", addGapAfter: true, yearlySum: true },
  { name: "Social Media Campaigns (Strategy & Design Spends)", label: "Social Media Campaigns (Strategy & Design Spends)", type: "input", yearlySum: true },
  { name: "Average Reach from Social Campaigns", label: "Average Reach from Social Campaigns", type: "input", addGapAfter: true, yearlySum: true },
  { name: "ATL Campaigns Spends", label: "ATL Campaigns Spends", type: "input", yearlySum: true },
  { name: "Average Reach from ATL", label: "Average Reach from ATL", type: "input", addGapAfter: true, yearlySum: true },
  { name: "Total Spends on Customer Acquisition", label: "Total Spends on Customer Acquisition", type: "auto", addGapAfter: true, yearlySum: true },
  { name: "Website Visitors", label: "Website Visitors", type: "auto", yearlySum: true },
  { name: "Sign-Ups / Leads", label: "Sign-Ups / Leads", type: "auto", yearlySum: true },
  { name: "KYC Verified", label: "KYC Verified", type: "auto", yearlySum: true },
  { name: "Activated Accounts", label: "Activated Accounts", type: "auto", yearlySum: false },
  { name: "Active Traders", label: "Active Traders", type: "auto", yearlySum: false },
  { name: "Paying Subscribers", label: "Paying Subscribers", type: "auto", yearlySum: false },
  { name: "AUM Contributors", label: "AUM Contributors", type: "input", yearlySum: false },
  { name: "Churn Rate", label: "Churn Rate", type: "input", yearlySum: false },
  { name: "Users Lost", label: "Users Lost", type: "auto", addGapAfter: true, yearlySum: true },
  { name: "Total Net Users", label: "Total Net Users", type: "auto", yearlySum: false },
  { name: "Cost of Customer Acquisition", label: "Cost of Customer Acquisition", type: "auto", yearlySum: false }
];

interface GrowthProps {
  stressTestData: any;
}

const Growth: React.FC<GrowthProps> = ({ stressTestData }) => {
  const { isManager } = useContext(RoleContext);
  const [viewMode, setViewMode] = useState<"quarter" | "year">("quarter");
  const [selectedYear, setSelectedYear] = useState("Year 1");
  const [showDropdown, setShowDropdown] = useState(false);
  const [stressTestingActive, setStressTestingActive] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sheetType = "growth-funnel";
  const [sheetData, setSheetData] = useState<any>({});
  const [loadingAI, setLoadingAI] = useState(false);

  const getQuarterKey = (year: string, quarterIdx: number) => `Y${year.replace("Year ", "")}Q${quarterIdx + 1}`;

  const getDisplayedQuarters = () =>
    viewMode === "quarter"
      ? quarters.map((q, i) => ({ label: q, key: getQuarterKey(selectedYear, i) }))
      : yearsList.map((_y, i) => ({ label: `Y${i + 1}`, key: `Y${i + 1}Q4` }));

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
          yearsList.forEach((year, yIdx) => {
            yearlyData[year] = {};
            growthMetrics.forEach((metric) => {
              const yearKey = `Y${yIdx + 1}Q`;
              const metricData = stressData[metric.label] || {};

              if (metric.yearlySum) {
                // sum all 4 quarters
                let sum = 0;
                for (let q = 1; q <= 4; q++) {
                  sum += metricData[`${yearKey}${q}`]?.value ?? 0;
                }
                yearlyData[year][metric.label] = { [`Y${yIdx + 1}Q4`]: { value: sum, is_calculated: true } };
              } else {
                // snapshot / average → Q4 only
                yearlyData[year][metric.label] = {
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

      // Normal fetching mode
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
      console.error("Error fetching growth data:", err);
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

  const getAIReachSuggestions = async () => {
    if (!stressTestingActive) {
      setLoadingAI(true);
      try {
        const yearNum = selectedYear.replace("Year ", "");
        const response = await fetch("http://localhost:8000/api/auto-populate-reach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company_id: 1, year: yearNum }),
        });
        const data = await response.json();
        if (response.ok && data.status === "success") await fetchData();
      } catch (err) {
        console.error("AI suggestion failed:", err);
      } finally {
        setLoadingAI(false);
      }
    }
  };

  const handleDownloadCSV = () => {
    downloadCSV({
      metrics: growthMetrics,
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
              Growth Metrics <span className="info-icon"><BsInfoCircleFill /></span>
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

              <button
                className="pill-toggle-btn no-dot"
                onClick={getAIReachSuggestions}
                disabled={loadingAI}
              >
                <span className="pill-label">
                  {loadingAI ? "Applying AI..." : "AI Suggestions"}
                </span>
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
              {growthMetrics.map((metric, idx) => (
                <React.Fragment key={idx}>
                  <tr className="align-middle">
                    <td>
                      <div className="mb-1">{metric.label}</div>
                      <div className="text-muted" style={{ fontSize: "12px" }}>
                        {metric.type === "input" ? "Input" : "Auto"}
                      </div>
                    </td>

                    {getDisplayedQuarters().map((q, qIdx) => {
                      let value: number = 0;

                      if (viewMode === "year") {
                        const yearKey = `Year ${q.label.replace("Y", "")}`;
                        const yearData = sheetData?.[yearKey]?.[metric.label] || {};

                        value = metric.yearlySum
                          ? Object.values(yearData).reduce((acc: number, cur: any) => acc + (cur.value ?? 0), 0)
                          : yearData?.[`Y${q.label.replace("Y", "")}Q4`]?.value ?? 0;
                      } else {
                        value = sheetData?.[metric.label]?.[q.key]?.value ?? 0;
                      }

                      return (
                        <td key={qIdx}>
                          {metric.type === "input" && viewMode === "quarter" && !sheetData?.[metric.label]?.[q.key]?.is_calculated ? (
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

export default Growth;
function fetchData() {
  throw new Error("Function not implemented.");
}

