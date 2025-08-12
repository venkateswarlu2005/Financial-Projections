import React, { useState, useRef, useEffect } from "react";
import "./Revenue.css";
import { BsInfoCircleFill } from "react-icons/bs";

const quarters = ["Q1", "Q2", "Q3", "Q4"];

const metricItems = [
  { label: "Average Brokerage Per User Per Trade", type: "input" },
  { label: "Average No of Trades Per Day Per User", type: "input" },
  { label: "Active Trading Users", type: "auto" },
  { label: "Brokerage Revenue", type: "auto", addGapAfter: true },
  { label: "Average AUM per Active User (₹)", type: "input" },
  { label: "Average Active PMS Users", type: "auto" },
  { label: "Management Fee from PMS", type: "input" },
  { label: "PMS Revenue", type: "auto", addGapAfter: true },
  { label: "AI Subscription Revenue Per User (₹)", type: "input" },
  { label: "Average Active Subscription Users", type: "auto" },
  { label: "Revenue from Subscriptions", type: "auto", addGapAfter: true },
  { label: "Average Monthly AUM MF", type: "input" },
  { label: "Average Monthly Revenue", type: "auto", addGapAfter: true },
  { label: "Average Ideal Broking Funds", type: "auto" },
  { label: "Revenue from Broking Interest", type: "auto", addGapAfter: true },
  { label: "Average Market Investment", type: "input" },
  { label: "Average Revenue from Investments", type: "auto" },
  { label: "Average no of user per month FPI", type: "input" },
  { label: "Average Brokerage Per User", type: "input", addGapAfter: true },
  { label: "Average Trade Per User", type: "input" },
  { label: "Average AUM per User (₹)", type: "input" },
  { label: "Revenue from FPI", type: "auto", addGapAfter: true },
  { label: "Relationship Management Variable Pay Average", type: "input" },
  { label: "Average AUM from RMs", type: "auto" },
  { label: "Revenue from AUMs", type: "auto", addGapAfter: true },
  { label: "Embedded Financial Service", type: "input" },
  { label: "Digi Banking - CASA Interest", type: "auto" },
  { label: "Digi Banking - Cards Income", type: "auto", addGapAfter: true },
  { label: "Digi Insurance - Premium Average", type: "input" },
  { label: "Insurance Premium Margin", type: "input" },
  { label: "Net Insurance Income", type: "auto", addGapAfter: true },
  { label: "Cross Border Payments and Investment Average Amount", type: "input" },
  { label: "Average Payment Gateway Transactions", type: "input" },
  { label: "Fee Per Transaction", type: "input", addGapAfter: true },
  { label: "Total Revenue", type: "auto" },
  { label: "Average Revenue Per User", type: "auto" },
];

const Revenue: React.FC = () => {
  const [viewMode, setViewMode] = useState<"quarter" | "year">("quarter");
  const [selectedYear, setSelectedYear] = useState("Year 1");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [sheetData, setSheetData] = useState<
    Record<string, Record<string, { value: number; is_calculated: boolean }>>
  >({});

  const sheetType = "revenue";

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

  useEffect(() => {
    const fetchData = async () => {
      const yearNum = selectedYear.replace("Year ", "");
      try {
        const response = await fetch(`http://localhost:8000/api/sheet-data/${sheetType}/${yearNum}`);
        const data = await response.json();
        setSheetData(data);
      } catch (error) {
        console.error("Error fetching sheet data:", error);
      }
    };
    fetchData();
  }, [selectedYear]);

  // API call separated
  const updateCellAPI = async (fieldName: string, quarterIdx: number, value: number) => {
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
          value: value,
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
              Revenue Streams & Income{" "}
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
                              onChange={(e) => {
                                const newValue = parseFloat(e.target.value) || 0;
                                setSheetData((prev) => ({
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
                                const newValue = parseFloat(e.target.value) || 0;
                                updateCellAPI(metric.label, qIdx, newValue);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.currentTarget.blur(); // triggers onBlur → API call
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

export default Revenue;
