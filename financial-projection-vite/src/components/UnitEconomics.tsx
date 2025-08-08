import React, { useState, useRef, useEffect } from "react";
import "./Revenue.css"; // Reuse styles
import { BsInfoCircleFill } from "react-icons/bs";

const quarters = ["Q1", "Q2", "Q3", "Q4"];

const metricItems = [
  { label: "CAC (Customer Acquisition Cost)", type: "auto" },
  { label: "ARPU (Average Revenue Per User)", type: "auto" },
  { label: "Gross Margin (%)", type: "auto" },
  { label: "Churn Rate (%)", type: "auto" },
  { label: "Average Customer Lifetime (Months)", type: "auto", addGapAfter: true },
  { label: "LTV (Lifetime Value)", type: "auto" },
  { label: "LTV/CAC Ratio", type: "auto" },
  { label: "Payback Period (Months)", type: "auto" }
];

const UnitEconomics: React.FC = () => {
  const [viewMode, setViewMode] = useState<"quarter" | "year">("quarter");
  const [selectedYear, setSelectedYear] = useState("Year 1");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Now this will store all years' data at once
  const [sheetData, setSheetData] = useState<
    Record<string, Record<string, { value: number; is_calculated: boolean }>>
  >({});

  const sheetType = "unit-economics";

  const getQuarterKey = (year: string, quarterIdx: number) =>
    `Y${year.replace("Year ", "")}Q${quarterIdx + 1}`;

  const getDisplayedQuarters = () => {
    if (viewMode === "quarter") {
      return quarters.map((q, i) => ({
        label: q,
        key: getQuarterKey(selectedYear, i),
      }));
    } else {
      return ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"].map((year, i) => ({
        label: `Y${i + 1}`,
        key: `Y${i + 1}Q4`, // Use Q4 as yearly total
      }));
    }
  };

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

  // Fetch ALL years on mount
  useEffect(() => {
    const fetchAllYears = async () => {
      let combined: Record<string, any> = {};
      try {
        for (let y = 1; y <= 5; y++) {
          const res = await fetch(`http://localhost:8000/api/sheet-data/${sheetType}/${y}`);
          const data = await res.json();
          for (const metric in data) {
            combined[metric] = { ...(combined[metric] || {}), ...data[metric] };
          }
        }
        setSheetData(combined);
      } catch (error) {
        console.error("Error fetching sheet data:", error);
      }
    };
    fetchAllYears();
  }, []);

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
        // Re-fetch this year's data & merge into state
        const updatedRes = await fetch(`http://localhost:8000/api/sheet-data/${sheetType}/${yearNum}`);
        const updatedData = await updatedRes.json();
        
        setSheetData((prev) => {
          const newData = { ...prev };
          for (const metric in updatedData) {
            newData[metric] = { ...(newData[metric] || {}), ...updatedData[metric] };
          }
          return newData;
        });
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
              Unit Economics Metrics{" "}
              <span className="info-icon"><BsInfoCircleFill /></span>
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

export default UnitEconomics;
