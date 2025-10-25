import React, { useState, useRef, useEffect, useContext } from "react";
import "./Revenue.css";
import { BsInfoCircleFill } from "react-icons/bs";
import { RoleContext } from "../App";
import { downloadCSV } from "../utils/downloadCSV";

const quarters = ["Q1", "Q2", "Q3", "Q4"];
const years = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];

const growthMetrics = [
  { name: "Fixed Deposits", type: "cumulative" },
  { name: "Properties", type: "cumulative" },
  { name: "Equipments", type: "cumulative" },
  { name: "Vehicles", type: "cumulative" },
  { name: "NSE Data Processing Units", type: "cumulative", addGapAfter: true },
  { name: "Total Assets Value", type: "calculated" },
];

interface CapExProps {
  stressTestData: any;
}

const CapEx: React.FC<CapExProps> = ({ stressTestData }) => {
  const { isManager } = useContext(RoleContext);
  const [viewMode, setViewMode] = useState<"quarter" | "year">("quarter");
  const [selectedYear, setSelectedYear] = useState("Year 1");
  const [showDropdown, setShowDropdown] = useState(false);
  const [stressTestingActive, setStressTestingActive] = useState(false);
  const [sheetData, setSheetData] = useState<any>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sheetType = "capex";

  const getQuarterKey = (year: string, quarterIdx: number) =>
    `Y${year.replace("Year ", "")}Q${quarterIdx + 1}`;

  const getDisplayedPeriods = () =>
    viewMode === "quarter"
      ? quarters.map((q, i) => ({ label: q, key: getQuarterKey(selectedYear, i) }))
      : years.map((_y, i) => ({ label: `Y${i + 1}`, key: `Y${i + 1}Q4` }));

  const handleDownloadCSV = () => {
    downloadCSV({
      metrics: growthMetrics,
      sheetData,
      displayedQuarters: getDisplayedPeriods(),
      sheetType,
      viewMode,
      selectedYear,
    });
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
    if (stressTestingActive && stressTestData) {
      const stressData = stressTestData[sheetType];

      if (viewMode === "year") {
        const yearlyData: any = {};
        years.forEach((year, yIdx) => {
          yearlyData[year] = {};
          growthMetrics.forEach((metric) => {
            const metricData = stressData[metric.name] || {};
            const yearKey = `Y${yIdx + 1}Q`;

            if (metric.type === "cumulative") {
              // Take Q4 value as yearly snapshot
              yearlyData[year][metric.name] = {
                [`Y${yIdx + 1}Q4`]: { value: metricData[`${yearKey}4`]?.value ?? 0, is_calculated: true },
              };
            } else {
              // calculated / auto fields → could sum if needed
              yearlyData[year][metric.name] = {
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

    // Normal fetching
    try {
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
              CapEx Metrics <span className="info-icon"><BsInfoCircleFill /></span>
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
              {growthMetrics.map((metric, idx) => (
                <React.Fragment key={idx}>
                  <tr className="align-middle">
                    <td>
                      <div className="mb-1">{metric.name}</div>
                      <div className="text-muted" style={{ fontSize: "12px" }}>
                        {metric.type === "cumulative" ? "Input" : "Auto"}
                      </div>
                    </td>

                    {getDisplayedPeriods().map((p, pIdx) => {
                      const yearKey = viewMode === "year" ? `Year ${p.label.replace("Y", "")}` : selectedYear;
                      let value = 0;

                      if (viewMode === "year") {
                        // Only take Q4 value for cumulative metrics
                        const yearData = sheetData?.[yearKey]?.[metric.name] || {};
                        value = yearData?.[`Y${p.label.replace("Y", "")}Q4`]?.value ?? 0;
                      } else {
                        value = sheetData?.[metric.name]?.[p.key]?.value ?? 0;
                      }

                      const isCalculated = sheetData?.[metric.name]?.[p.key]?.is_calculated ?? false;

                      return (
                        <td key={pIdx}>
                          {metric.type === "cumulative" && !isCalculated && viewMode === "quarter" ? (
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
                                const newValue = parseFloat(e.target.value) || 0;
                                setSheetData((prev: any) => ({
                                  ...prev,
                                  [metric.name]: {
                                    ...prev[metric.name],
                                    [p.key]: { value: newValue, is_calculated: false },
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

export default CapEx;
