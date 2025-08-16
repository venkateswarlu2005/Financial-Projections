import React, { useState, useRef, useEffect } from "react";
import { Slider } from "primereact/slider";
import { BsInfoCircleFill } from "react-icons/bs";
import { HiDownload } from "react-icons/hi";
import "./StressTesting.css";

const years = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];
const quarters = ["Q1", "Q2", "Q3", "Q4"];

const StressTesting = () => {
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showQuarterDropdown, setShowQuarterDropdown] = useState(false);
  const yearRef = useRef<HTMLDivElement>(null);
  const quarterRef = useRef<HTMLDivElement>(null);

  const [startYear, setStartYear] = useState("Year 1");
  const [startQuarter, setStartQuarter] = useState("Q1");

  const [sliders, setSliders] = useState({
    customer_drop_percentage: 25,
    pricing_pressure_percentage: 0,
    cac_increase_percentage: 0,
    market_entry_underperformance_percentage: 0,
    interest_rate_shock: 0, // Start value for -2 to 2 range
  });

  const [switches, setSwitches] = useState({
    is_technology_failure: false,
    is_economic_recession: false,
  });

  const handleSliderChange = (field: string, value: number) => {
    setSliders((prev) => ({ ...prev, [field]: value }));
  };

  const handleSwitchChange = (field: string) => {
    setSwitches((prev) => ({
      ...prev,
      [field as keyof typeof prev]: !prev[field as keyof typeof prev],
    }));
  };

  const handleSend = async () => {
    const payload = {
      start_year: parseInt(startYear.replace("Year ", "")),
      start_quarter: quarters.indexOf(startQuarter) + 1,
      ...sliders,
      ...switches,
    };
    try {
      const res = await fetch("http://localhost:8000/api/stress-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log("Stress Test Response:", data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (yearRef.current && !yearRef.current.contains(event.target as Node))
        setShowYearDropdown(false);
      if (quarterRef.current && !quarterRef.current.contains(event.target as Node))
        setShowQuarterDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="stress-testing">
      <div className="stress-box p-4 rounded">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="upper-text">
            <h6 className="fw-bold mb-1 d-flex align-items-center">
              Investment Stress Testing <BsInfoCircleFill className="ms-1 text-muted" />
            </h6>
            <p className="small text-muted mb-0">
              Modify key assumptions to test business resilience and understand risk factors
            </p>
          </div>
          <button className="pill-btn pill-outline" onClick={handleSend}>
            <HiDownload className="me-1" />
            Run Stress Test
          </button>
        </div>

        {/* Dropdowns */}
        <div className="d-flex flex-row gap-3 mb-4">
          <div className="flex-fill position-relative" ref={yearRef}>
            <label className="form-label small text-muted">Start Year</label>
            <button
              className="form-select pill-select"
              onClick={() => setShowYearDropdown((prev) => !prev)}
            >
              {startYear}
            </button>
            {showYearDropdown && (
              <div className="custom-dropdown">
                {years.map((y) => (
                  <div
                    key={y}
                    className={`dropdown-item-pill ${y === startYear ? "selected" : ""}`}
                    onClick={() => {
                      setStartYear(y);
                      setShowYearDropdown(false);
                    }}
                  >
                    {y}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex-fill position-relative" ref={quarterRef}>
            <label className="form-label small text-muted">Start Quarter</label>
            <button
              className="form-select pill-select"
              onClick={() => setShowQuarterDropdown((prev) => !prev)}
            >
              {startQuarter}
            </button>
            {showQuarterDropdown && (
              <div className="custom-dropdown">
                {quarters.map((q) => (
                  <div
                    key={q}
                    className={`dropdown-item-pill ${q === startQuarter ? "selected" : ""}`}
                    onClick={() => {
                      setStartQuarter(q);
                      setShowQuarterDropdown(false);
                    }}
                  >
                    {q}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Custom Pill Switches */}
        <div className="switches-row d-flex gap-4 mb-4">
          {[
            { label: "Technology Failure", key: "is_technology_failure" },
            { label: "Economic Recession", key: "is_economic_recession" },
          ].map(({ label, key }) => (
            <div className="custom-switch" key={key}>
              <input
                className="custom-switch-input"
                type="checkbox"
                checked={switches[key as keyof typeof switches]}
                onChange={() => handleSwitchChange(key)}
                id={key}
              />
              <label className="custom-switch-label" htmlFor={key}>
                {label}
              </label>
            </div>
          ))}
        </div>

        {/* Sliders */}
        <div className="sliders-grid">
          {[
            { label: "Customer Drop (%)", key: "customer_drop_percentage" },
            { label: "Pricing Pressure (%)", key: "pricing_pressure_percentage" },
            { label: "CAC Increase (%)", key: "cac_increase_percentage" },
            { label: "Market Entry Underperformance (%)", key: "market_entry_underperformance_percentage" },
            { label: "Interest Rate Shock", key: "interest_rate_shock", min: -2, max: 2, step: 0.01 },
          ].map(({ label, key, step, min, max }) => (
            <div className="slider-item" key={key}>
              <label className="form-label d-flex align-items-center small">
                {label} <BsInfoCircleFill className="ms-1 text-muted" />
              </label>
              <div className="position-relative">
                <Slider
                  value={sliders[key as keyof typeof sliders]}
                  onChange={(e) => handleSliderChange(key, e.value as number)}
                  min={min ?? 0}
                  max={max ?? 100}
                  step={step ?? 1}
                  style={{ width: "100%" }}
                />
                <div
                  className="percentage-label"
                  style={{
                    left:
                      ((sliders[key as keyof typeof sliders] - (min ?? 0)) /
                        ((max ?? 100) - (min ?? 0))) *
                        100 +
                      "%",
                    transform: "translateX(-50%)",
                  }}
                >
                  {key === "interest_rate_shock"
                    ? sliders[key as keyof typeof sliders]
                    : sliders[key as keyof typeof sliders] + "%"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StressTesting;
