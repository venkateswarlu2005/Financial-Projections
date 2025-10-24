import React, { useState, useEffect, useRef, useContext } from "react";
import "./Revenue.css";
import { BsInfoCircleFill } from "react-icons/bs";
import { RoleContext } from "../App";
import { downloadCSV } from "../utils/downloadCSV"; // ✅ Central reusable utility

const quarters = ["Q1", "Q2", "Q3", "Q4"];
const yearsList = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];

const metricItems = [
  { name: "Average Brokerage Per User Per Trade", label: "Average Brokerage Per User Per Trade", type: "input" },
  { name: "Average No of Trades Per Day Per User", label: "Average No of Trades Per Day Per User", type: "input" },
  { name: "Active Trading Users", label: "Active Trading Users", type: "auto" },
  { name: "Brokerage Revenue", label: "Brokerage Revenue", type: "auto", addGapAfter: true },
  { name: "Average AUM per Active User (₹)", label: "Average AUM per Active User (₹)", type: "input" },
  { name: "Average Active PMS Users", label: "Average Active PMS Users", type: "auto" },
  { name: "Management Fee from PMS", label: "Management Fee from PMS", type: "input" },
  { name: "PMS Revenue", label: "PMS Revenue", type: "auto", addGapAfter: true },
  { name: "AI Subscription Revenue Per User (₹)", label: "AI Subscription Revenue Per User (₹)", type: "input" },
  { name: "Average Active Subscription Users", label: "Average Active Subscription Users", type: "auto" },
  { name: "Revenue from Subscriptions", label: "Revenue from Subscriptions", type: "auto", addGapAfter: true },
  { name: "Average Monthly AUM MF", label: "Average Monthly AUM MF", type: "input" },
  { name: "Average Monthly Revenue", label: "Average Monthly Revenue", type: "auto", addGapAfter: true },
  { name: "Average Ideal Broking Funds", label: "Average Ideal Broking Funds", type: "input" },
  { name: "Revenue from Broking Interest", label: "Revenue from Broking Interest", type: "auto", addGapAfter: true },
  { name: "Average Market Investment", label: "Average Market Investment", type: "input" },
  { name: "Average Revenue from Investments", label: "Average Revenue from Investments", type: "auto" },
  { name: "Average no of user per month FPI", label: "Average no of user per month FPI", type: "input" },
  { name: "Average Brokerage Per User", label: "Average Brokerage Per User", type: "input", addGapAfter: true },
  { name: "Average Trade Per User", label: "Average Trade Per User", type: "input" },
  { name: "Average AUM per User (₹)", label: "Average AUM per User (₹)", type: "input" },
  { name: "Revenue from FPI", label: "Revenue from FPI", type: "auto", addGapAfter: true },
  { name: "Relationship Management Variable Pay Average", label: "Relationship Management Variable Pay Average", type: "input" },
  { name: "Average AUM from RMs", label: "Average AUM from RMs", type: "auto" },
  { name: "Revenue from AUMs", label: "Revenue from AUMs", type: "auto", addGapAfter: true },
  { name: "Embedded Financial Service", label: "Embedded Financial Service", type: "input" },
  { name: "Digi Banking - CASA Interest", label: "Digi Banking - CASA Interest", type: "auto" },
  { name: "Digi Banking - Cards Income", label: "Digi Banking - Cards Income", type: "auto", addGapAfter: true },
  { name: "Digi Insurance - Premium Average", label: "Digi Insurance - Premium Average", type: "input" },
  { name: "Insurance Premium Margin", label: "Insurance Premium Margin", type: "input" },
  { name: "Net Insurance Income", label: "Net Insurance Income", type: "auto", addGapAfter: true },
  { name: "Cross Border Payments and Investment Average Amount", label: "Cross Border Payments and Investment Average Amount", type: "input" },
  { name: "Average Payment Gateway Transactions", label: "Average Payment Gateway Transactions", type: "input" },
  { name: "Fee Per Transaction", label: "Fee Per Transaction", type: "input", addGapAfter: true },
  { name: "Total Revenue", label: "Total Revenue", type: "auto" },
  { name: "Average Revenue Per User", label: "Average Revenue Per User", type: "auto" },
];

interface RevenueProps {
  stressTestData: any;
}

const Revenue: React.FC<RevenueProps> = ({ stressTestData }) => {
  const { isManager } = useContext(RoleContext);
  const [viewMode, setViewMode] = useState<"quarter" | "year">("quarter");
  const [selectedYear, setSelectedYear] = useState("Year 1");
  const [showDropdown, setShowDropdown] = useState(false);
  const [stressTestingActive, setStressTestingActive] = useState(false);
  const [sheetData, setSheetData] = useState<any>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sheetType = "revenue";

  const getQuarterKey = (year: string, quarterIdx: number) =>
    `Y${year.replace("Year ", "")}Q${quarterIdx + 1}`;

  const getDisplayedQuarters = () =>
    viewMode === "quarter"
      ? quarters.map((q, i) => ({ label: q, key: getQuarterKey(selectedYear, i) }))
      : yearsList.map((_y, i) => ({ label: `Y${i + 1}`, key: `Y${i + 1}Q4` }));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (stressTestingActive && stressTestData) {
        setSheetData(stressTestData[sheetType]);
      } else {
        try {
          const yearNum = selectedYear.replace("Year ", "");
          const response = await fetch(`http://localhost:8000/api/sheet-data/${sheetType}/${yearNum}`);
          const data = await response.json();
          setSheetData(data);
        } catch (err) {
          console.error("Error fetching revenue data:", err);
        }
      }
    };
    fetchData();
  }, [selectedYear, stressTestingActive, stressTestData]);

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
        const updated = await fetch(`http://localhost:8000/api/sheet-data/${sheetType}/${yearNum}`);
        const updatedData = await updated.json();
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
              Revenue Streams & Income{" "}
              <span className="info-icon">
                <BsInfoCircleFill />
              </span>
            </h5>

            <div className="d-flex gap-2 btn-group-pill-toggle">
              {!isManager && (
                <button
                  className={`pill-toggle-btn ${stressTestingActive ? "active" : ""}`}
                  onClick={() => setStressTestingActive((prev) => !prev)}
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
                    setShowDropdown((prev) => !prev);
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
                  <th key={i} className="quarter-header">
                    {q.label}
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
                              readOnly={stressTestingActive || !isManager}
                              style={
                                stressTestingActive || !isManager
                                  ? { backgroundColor: "#f5f5f5", cursor: "not-allowed" }
                                  : {}
                              }
                              onChange={(e) => {
                                if (stressTestingActive || !isManager) return;
                                const newVal = parseFloat(e.target.value) || 0;
                                setSheetData((prev: any) => ({
                                  ...prev,
                                  [metric.label]: {
                                    ...prev[metric.label],
                                    [q.key]: {
                                      ...prev[metric.label]?.[q.key],
                                      value: newVal,
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

export default Revenue;
