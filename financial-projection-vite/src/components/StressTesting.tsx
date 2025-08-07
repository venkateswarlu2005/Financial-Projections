import { useState } from "react";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { BsInfoCircleFill } from "react-icons/bs";
import { HiDownload } from "react-icons/hi";
import { Slider } from "primereact/slider";
import "./StressTesting.css";

const StressTesting = () => {
  const [marketSize, setMarketSize] = useState("Base Case");
  const [competitionImpact, setCompetitionImpact] = useState("Moderate Competition");

  const [sliders, setSliders] = useState({
    cac: 25,
    conversion: 25,
    churn: 25,
    revenue: 25,
  });

  const handleSliderChange = (field: string, value: number) => {
    setSliders((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="stress-testing">
      <div className="stress-box p-4 rounded">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="upper-text">
            <h6 className="fw-bold mb-1 d-flex align-items-center">
              Investment Stress Testing <BsInfoCircleFill className="ms-1 text-muted" />
            </h6>
            <p className="small text-muted mb-0">
              Modify key assumptions to test business resilience and understand risk factors
            </p>
          </div>

          <DropdownButton
            variant="light"
            title={
              <span className="pill-download-btn">
                <HiDownload />
                Download
              </span>
            }
            className="pill-dropdown"
          >
            <Dropdown.Item>PDF</Dropdown.Item>
            <Dropdown.Item>CSV</Dropdown.Item>
          </DropdownButton>
        </div>

        {/* Dropdown row with side-by-side layout */}
        <div className="d-flex flex-row gap-3 mb-4">
          <div className="flex-fill">
            <label className="form-label small text-muted">Market Size Scenario</label>
            <select
              className="form-select pill-select"
              value={marketSize}
              onChange={(e) => setMarketSize(e.target.value)}
            >
              <option>Base Case</option>
              <option>Best Case</option>
              <option>Worst Case</option>
            </select>
          </div>

          <div className="flex-fill">
            <label className="form-label small text-muted">Competition Impact</label>
            <select
              className="form-select pill-select"
              value={competitionImpact}
              onChange={(e) => setCompetitionImpact(e.target.value)}
            >
              <option>Low Competition</option>
              <option>Moderate Competition</option>
              <option>High Competition</option>
            </select>
          </div>
        </div>

        <div className="row gy-4">
          {[
            { label: "Customer Acquisition Cost", key: "cac" },
            { label: "Conversion Rate Impact", key: "conversion" },
            { label: "Churn Rate Stress", key: "churn" },
            { label: "Revenue Per User", key: "revenue" },
          ].map(({ label, key }) => (
            <div className="col-md-6" key={key}>
              <label className="form-label d-flex align-items-center small">
                {label}
                <BsInfoCircleFill className="ms-1 text-muted" />
              </label>
              <div className="position-relative">
                <Slider
                  value={sliders[key as keyof typeof sliders]}
                  onChange={(e) => handleSliderChange(key, e.value as number)}
                  min={0}
                  max={100}
                  style={{ width: "100%" }}
                />
                <div
                  className="percentage-label"
                  style={{
                    left: `${sliders[key as keyof typeof sliders]}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  {sliders[key as keyof typeof sliders]}%
                </div>
              </div>
              <div className="d-flex justify-content-between small mb-0">
                <span className="base-label">1.0x (Base)</span>
                <span>&nbsp;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
     <div className="button-row mt-4">
       <button className="pill-btn pill-run" disabled>
        <i className="bi bi-clipboard-check me-2" />
         Run Stress Test
       </button>
       <button className="pill-btn pill-outline">
        <i className="bi bi-arrow-clockwise me-2" />
         Reset to Base
       </button>
       <button className="pill-btn pill-outline">
        <i className="bi bi-save me-2" />
         Save Scenario
        </button>
     </div>

    </div>
  );
};

export default StressTesting;
