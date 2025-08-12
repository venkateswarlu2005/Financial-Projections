import React, { useState, useRef, useEffect } from "react";
import "./Revenue.css";
import { BsInfoCircleFill } from "react-icons/bs";

const quarters = ["Q1", "Q2", "Q3", "Q4"];
const years = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];

const techOpex = [
  // Technology Costs
  { name: "Cyber Security", type: "input" },
  { name: "Servers", type: "input" },
  { name: "Data Processing Equipment - NSE", type: "input" },
  { name: "GPUs", type: "input" },
  { name: "Lease Line", type: "input" },
  { name: "Third Party APIs", type: "input" },
  { name: "Third Party SAAS", type: "input" },
  { name: "Google Workspace", type: "input", afterGap: true },

  // Regulatory & Compliance
  { name: "AMCs", type: "input" },
  { name: "SEBI Compliance", type: "input" },
  { name: "NSE", type: "input" },
  { name: "BSE", type: "input" },
  { name: "DP", type: "input" },
  { name: "AMFI", type: "input" },
  { name: "RBI", type: "input" },
  { name: "ROC", type: "input" },
  { name: "IT", type: "input", afterGap: true },

  // Other OpEx
  { name: "Office Rent", type: "input" },
  { name: "Utilities & Internet", type: "input" },
  { name: "Office Supplies", type: "input" },
  { name: "Travel", type: "input", afterGap: true },

  // Auto-calculated
  { name: "Inflation Adjustment (%)", type: "calculated" },
  { name: "Surprise Costs", type: "calculated" },
  { name: "Total", type: "calculated" }
];


const OpEx: React.FC = () => {
  const [viewMode, setViewMode] = useState<"quarter" | "year">("quarter");
  const [selectedYear, setSelectedYear] = useState("Year 1");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [sheetData, setSheetData] = useState<
    Record<string, Record<string, { value: number; is_calculated: boolean }>>
  >({});

  const sheetType = "tech-opex";

  const getQuarterKey = (year: string, quarterIdx: number) =>
    `Y${year.replace("Year ", "")}Q${quarterIdx + 1}`;

  const getDisplayedPeriods = () => {
    if (viewMode === "quarter") {
      return quarters.map((q, i) => ({
        label: q,
        key: getQuarterKey(selectedYear, i),
      }));
    } else {
      return years.map((_year, i) => ({
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

  const handleInputChange = async (
    fieldName: string,
    periodIdx: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = parseFloat(event.target.value) || 0;
    const yearNum = parseInt(selectedYear.replace("Year ", ""));
    const quarterKey = getQuarterKey(selectedYear, periodIdx);

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
          quarter_num: periodIdx + 1,
          value: newValue,
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
              Tech OpEx Metrics{" "}
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
                    {years.map((year) => (
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
                {getDisplayedPeriods().map((p) => (
                  <th key={p.label} className="quarter-header">{p.label}</th>
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
                      const metricData = sheetData?.[metric.name]?.[p.key];
                      const value = metricData?.value ?? 0;
                      const isCalculated = metricData?.is_calculated ?? false;

                      return (
                        <td key={pIdx}>
                          {metric.type === "input" && !isCalculated && viewMode === "quarter" ? (
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={value}
                              onChange={(e) => handleInputChange(metric.name, pIdx, e)}
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
