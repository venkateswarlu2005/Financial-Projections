import React, { useState, useRef, useEffect } from "react";
import "./Revenue.css"; // Reuse Revenue styles
import { BsInfoCircleFill } from "react-icons/bs";

const quarters = ["Q1", "Q2", "Q3", "Q4"];

const growthMetrics = [
  { label: "Search Engine & GPT Marketing Spends", type: "input" },
  { label: "Average Reach from Search", type: "input", addGapAfter: true },

  { label: "Social Media Marketing Spends (Ads)", type: "input" },
  { label: "Average Reach from Social Ads", type: "input", addGapAfter: true },

  { label: "Social Media Campaigns (Strategy & Design Spends)", type: "input" },
  { label: "Average Reach from Social Campaigns", type: "input", addGapAfter: true },

  { label: "ATL Campaigns Spends", type: "input" },
  { label: "Average Reach from ATL", type: "input", addGapAfter: true },

  { label: "Total Spends on Customer Acquisition", type: "auto", addGapAfter: true },

  { label: "Website Visitors", type: "auto" },
  { label: "Sign-Ups / Leads", type: "auto" },
  { label: "KYC Verified", type: "auto" },
  { label: "Activated Accounts", type: "auto" },
  { label: "Active Traders", type: "auto" },
  { label: "Paying Subscribers", type: "auto" },
  { label: "AUM Contributors", type: "input" },

  { label: "Churn Rate", type: "input" },
  { label: "Users Lost", type: "auto", addGapAfter: true },

  { label: "Total Net Users", type: "auto" },
  { label: "Cost of Customer Acquisition", type: "auto" }
];

const Growth: React.FC = () => {
  const [viewMode, setViewMode] = useState<"quarter" | "year">("quarter");
  const [selectedYear, setSelectedYear] = useState("Year 1");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [sheetData, setSheetData] = useState<
    Record<string, Record<string, { value: number; is_calculated: boolean }>>
  >({});

  const [loadingAI, setLoadingAI] = useState(false);

  const sheetType = "growth-funnel";

  const getQuarterKey = (year: string, quarterIdx: number) =>
    `Y${year.replace("Year ", "")}Q${quarterIdx + 1}`;

  const getDisplayedQuarters = () => {
    if (viewMode === "quarter") {
      return quarters.map((q, i) => ({
        label: q,
        key: getQuarterKey(selectedYear, i),
      }));
    } else {
      return ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"].map((_year, i) => ({
        label: `Y${i + 1}`,
        key: `Y${i + 1}Q4`,
      }));
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

  const fetchSheetData = async () => {
    const yearNum = selectedYear.replace("Year ", "");
    try {
      const response = await fetch(`http://localhost:8000/api/sheet-data/${sheetType}/${yearNum}`);
      const data = await response.json();
      setSheetData(data);
    } catch (error) {
      console.error("Error fetching sheet data:", error);
    }
  };

  useEffect(() => {
    fetchSheetData();
  }, [selectedYear]);

  const handleInputChange = async (
    fieldName: string,
    quarterIdx: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = parseFloat(event.target.value) || 0;
    const yearNum = parseInt(selectedYear.replace("Year ", ""));
    const quarterKey = getQuarterKey(selectedYear, quarterIdx);

    setSheetData((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        [quarterKey]: {
          ...prev[fieldName]?.[quarterKey],
          value: newValue,
          is_calculated: false,
        },
      },
    }));

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
          value: newValue,
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        await fetchSheetData();
      } else {
        console.error("Error updating cell:", result.message);
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const getAIReachSuggestions = async () => {
    const yearNum = selectedYear.replace("Year ", "");
    setLoadingAI(true);
    try {
      const response = await fetch("http://localhost:8000/api/auto-populate-reach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: 1,
          year: yearNum,
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        console.log("AI suggestions applied successfully");
        await fetchSheetData();
      } else {
        console.error("AI suggestion failed:", data.message);
      }
    } catch (error) {
      console.error("Error getting AI reach suggestions:", error);
    } finally {
      setLoadingAI(false);
    }
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
                onClick={() => {
                  setViewMode("year");
                  setShowDropdown(false);
                }}
              >
                <span className="circle-indicator" />
                <span className="pill-label">Year Wise</span>
              </button>

              {/* AI Suggestions Button */}
              <button
                className="pill-toggle-btn no-dot"
                onClick={getAIReachSuggestions}
                disabled={loadingAI}
              >
                <span className="pill-label">
                  {loadingAI ? "Applying AI..." : "AI Suggestions"}
                </span>
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
                      const metricData = sheetData?.[metric.label]?.[q.key];
                      const value = metricData?.value ?? 0;
                      const isCalculated = metricData?.is_calculated ?? false;

                      return (
                        <td key={qIdx}>
                          {metric.type === "input" && !isCalculated && viewMode === "quarter" ? (
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={value}
                              onChange={(e) => handleInputChange(metric.label, qIdx, e)}
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
