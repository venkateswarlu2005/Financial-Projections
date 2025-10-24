import React, { useState, useRef, useEffect, useContext } from "react";
import "./Revenue.css"; // Reuse Revenue styles
import { BsInfoCircleFill } from "react-icons/bs";
import { RoleContext } from "../App";
import { downloadCSV } from "../utils/downloadCSV";

const quarters = ["Q1", "Q2", "Q3", "Q4"];
const yearsList = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];

const growthMetrics = [
  { name: "Search Engine & GPT Marketing Spends", label: "Search Engine & GPT Marketing Spends", type: "input" },
  { name: "Average Reach from Search", label: "Average Reach from Search", type: "input", addGapAfter: true },

  { name: "Social Media Marketing Spends (Ads)", label: "Social Media Marketing Spends (Ads)", type: "input" },
  { name: "Average Reach from Social Ads", label: "Average Reach from Social Ads", type: "input", addGapAfter: true },

  { name: "Social Media Campaigns (Strategy & Design Spends)", label: "Social Media Campaigns (Strategy & Design Spends)", type: "input" },
  { name: "Average Reach from Social Campaigns", label: "Average Reach from Social Campaigns", type: "input", addGapAfter: true },

  { name: "ATL Campaigns Spends", label: "ATL Campaigns Spends", type: "input" },
  { name: "Average Reach from ATL", label: "Average Reach from ATL", type: "input", addGapAfter: true },

  { name: "Total Spends on Customer Acquisition", label: "Total Spends on Customer Acquisition", type: "auto", addGapAfter: true },

  { name: "Website Visitors", label: "Website Visitors", type: "auto" },
  { name: "Sign-Ups / Leads", label: "Sign-Ups / Leads", type: "auto" },
  { name: "KYC Verified", label: "KYC Verified", type: "auto" },
  { name: "Activated Accounts", label: "Activated Accounts", type: "auto" },
  { name: "Active Traders", label: "Active Traders", type: "auto" },
  { name: "Paying Subscribers", label: "Paying Subscribers", type: "auto" },
  { name: "AUM Contributors", label: "AUM Contributors", type: "input" },

  { name: "Churn Rate", label: "Churn Rate", type: "input" },
  { name: "Users Lost", label: "Users Lost", type: "auto", addGapAfter: true },

  { name: "Total Net Users", label: "Total Net Users", type: "auto" },
  { name: "Cost of Customer Acquisition", label: "Cost of Customer Acquisition", type: "auto" }
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

  // ✅ Fetch all years at once for Year view
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
      if (res.ok && result.status === "success") await fetchData();
      else console.error("Update failed:", result.message);
    } catch (err) {
      console.error("Update error:", err);
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
                      const yearKey = viewMode === "year" ? `Year ${q.label.replace("Y", "")}` : selectedYear;
                      const metricData =
                        viewMode === "year"
                          ? sheetData?.[yearKey]?.[metric.label]?.[q.key]
                          : sheetData?.[metric.label]?.[q.key];
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

