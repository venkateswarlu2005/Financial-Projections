import React, { useState, useRef, useEffect, useContext } from "react";
import "./Revenue.css";
import { BsInfoCircleFill } from "react-icons/bs";
import { RoleContext } from "../App";
import { downloadCSV } from "../utils/downloadCSV";

const quarters = ["Q1", "Q2", "Q3", "Q4"];
const years = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];

const techOpex = [
  { name: "Cyber Security", type: "input" },
  { name: "Servers", type: "input" },
  { name: "Data Processing Equipment - NSE", type: "input" },
  { name: "GPUs", type: "input" },
  { name: "Lease Line", type: "input" },
  { name: "Third Party APIs", type: "input" },
  { name: "Third Party SAAS", type: "input" },
  { name: "Google Workspace", type: "input", afterGap: true },

  { name: "AMCs", type: "input" },
  { name: "SEBI Compliance", type: "input" },
  { name: "NSE", type: "input" },
  { name: "BSE", type: "input" },
  { name: "DP", type: "input" },
  { name: "AMFI", type: "input" },
  { name: "RBI", type: "input" },
  { name: "ROC", type: "input" },
  { name: "IT", type: "input", afterGap: true },

  { name: "Office Rent", type: "input" },
  { name: "Utilities & Internet", type: "input" },
  { name: "Office Supplies", type: "input" },
  { name: "Travel", type: "input", afterGap: true },

  { name: "Inflation Adjustment (%)", type: "auto" },
  { name: "Surprise Costs", type: "auto" },
  { name: "Total", type: "auto" }
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sheetType = "tech-opex";
  const [sheetData, setSheetData] = useState<any>({});

  const getQuarterKey = (year: string, quarterIdx: number) =>
    `Y${year.replace("Year ", "")}Q${quarterIdx + 1}`;

  const getDisplayedPeriods = () =>
    viewMode === "quarter"
      ? quarters.map((q, i) => ({ label: q, key: getQuarterKey(selectedYear, i) }))
      : years.map((_y, i) => ({ label: `Y${i + 1}`, key: `Y${i + 1}Q4` }));

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch data for quarter or year view
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
                      const metricData =
                        viewMode === "year"
                          ? sheetData?.[yearKey]?.[metric.name]?.[p.key]
                          : sheetData?.[metric.name]?.[p.key];
                      const value = metricData?.value ?? 0;
                      const isCalculated = metricData?.is_calculated ?? false;

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
