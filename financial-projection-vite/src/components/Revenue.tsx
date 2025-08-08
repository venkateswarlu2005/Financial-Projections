import React, { useState, useRef, useEffect } from "react";
import "./Revenue.css";
import { BsInfoCircleFill } from "react-icons/bs";

const quarters = ["Q1", "Q2", "Q3", "Q4"];
const metricItems = [
  { label: "Average Brokerage Per User Per Trade", type: "input" },
  { label: "Average No of Trades Per Day Per User", type: "input" },
  { label: "Active Trading Users", type: "auto", addGapAfter: true },
  { label: "Brokerage Revenue", type: "auto" },
  { label: "Average AUM per Active User (₹)", type: "input" },
  { label: "Average Active PMS Users", type: "auto" },
  { label: "Management Fee from PMS", type: "input", addGapAfter: true },
  { label: "PMS Revenue", type: "auto" },
  { label: "AI Subscription Revenue Per User (₹)", type: "input", addGapAfter: true },
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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

  const handleInputChange = async (
  fieldName: string,
  quarterIdx: number,
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const newValue = parseFloat(event.target.value) || 0;
  const yearNum = parseInt(selectedYear.replace("Year ", ""));
  const quarterKey = getQuarterKey(selectedYear, quarterIdx);

  // Optimistically update the UI
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
      // Refresh the sheet data to get any recalculated fields
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
      <div className="chart-section mb-4 d-flex gap-3 flex-wrap">
        <div className="chart-card flex-fill">
          <h6 className="chart-title d-flex justify-content-between">
            Revenue Trend <span className="info-icon"><BsInfoCircleFill /></span>
          </h6>
          <div className="chart-placeholder">[ Line Chart Placeholder ]</div>
        </div>

        <div className="chart-card flex-fill">
          <h6 className="chart-title d-flex justify-content-between">
            Avg Revenue per customer <span className="info-icon"><BsInfoCircleFill /></span>
          </h6>
          <div className="chart-placeholder">[ Bar + Line Chart Placeholder ]</div>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="container mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>
              Revenue Streams & Income{" "}
              <span className="info-icon">
                <BsInfoCircleFill />
              </span>
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
                  <span className="dropdown-arrow">▾</span>
                </button>

                {showDropdown && (
                  <div className="custom-dropdown">
                    {["Year 1", "Year 2", "Year 3"].map((year, idx) => (
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
                {quarters.map((q, i) => (
                  <th key={i} className="quarter-header">
                    {q}
                  </th>
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
                    {quarters.map((_, qIdx) => {
                      const quarterKey = getQuarterKey(selectedYear, qIdx);
                      const metricData = sheetData?.[metric.label]?.[quarterKey];
                      const value = metricData?.value ?? 0;
                      const isCalculated = metricData?.is_calculated ?? false;

                      return (
                        <td key={qIdx}>
                          {!isCalculated ? (
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

export default Revenue;
