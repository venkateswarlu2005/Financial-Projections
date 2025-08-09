import React, { useState, useRef, useEffect } from "react";
import "./GTM.css";

interface QuarterData {
  count: number;
  amount_per_acquisition: number;
}

interface ApiData {
  [key: string]: {
    [quarter: string]: QuarterData;
  };
}

interface AcquisitionCardProps {
  title: string;
  quarters: { count: number; amount: number }[];
  borderClass: string;
  headerClass: string;
  onChange: (quarterIndex: number, field: "count" | "amount", value: number) => void;
}

const AcquisitionCard: React.FC<AcquisitionCardProps> = ({
  title,
  quarters,
  borderClass,
  headerClass,
  onChange
}) => {
  return (
    <div className={`acq-card ${borderClass}`}>
      <h6 className={headerClass}>{title}</h6>
      <div className="acq-content">
        {quarters.map((q, index) => (
          <div className="quarter-row" key={index}>
            <label>Q{index + 1} Count:</label>
            <input
              type="number"
              value={q.count}
              onChange={(e) => onChange(index, "count", Number(e.target.value))}
            />
            <label>Amount (₹Cr):</label>
            <input
              type="number"
              className="amount-input"
              value={q.amount}
              onChange={(e) => onChange(index, "amount", Number(e.target.value))}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const GTM: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState("Year 1");
  const [showDropdown, setShowDropdown] = useState(false);
  const [data, setData] = useState<ApiData>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  const yearNum = Number(selectedYear.replace("Year ", ""));

  // Fetch API data
  const fetchData = async (year: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/gtm-data/${year}`);
      const json: ApiData = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    fetchData(`Y${yearNum}`);
  }, [selectedYear]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update API
  const handleUpdate = async (
    acquisitionType: string,
    quarterIndex: number,
    field: "count" | "amount",
    value: number
  ) => {
    const quarterNum = quarterIndex + 1;
    const updatedPayload = {
      acquisition_type: acquisitionType,
      year_num: yearNum,
      quarter_num: quarterNum,
      count:
        field === "count"
          ? value
          : data[acquisitionType][`Y${yearNum}Q${quarterNum}`].count,
      amount_per_acquisition:
        field === "amount"
          ? value * 10000000 // if amount entered is in ₹Cr, convert to raw value
          : data[acquisitionType][`Y${yearNum}Q${quarterNum}`]
              .amount_per_acquisition
    };

    try {
      await fetch("http://localhost:8000/api/update-gtm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPayload)
      });
      // Refresh data after update
      fetchData(`Y${yearNum}`);
    } catch (err) {
      console.error("Failed to update", err);
    }
  };

  return (
    <div className="page-background">
      <div className="main-container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>GTM Acquisitions & Mergers</h5>
        </div>

        {/* Styled Select Year */}
        <div className="mb-3 d-flex align-items-center">
          <label className="me-2">Select Year:</label>
          <div className="position-relative" ref={dropdownRef}>
            <button
              className="pill-toggle-btn active"
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              <span className="circle-indicator" />
              <span className="pill-label">{selectedYear}</span>
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
        </div>

        {/* Acquisition Cards */}
        <div className="row g-3">
          <div className="col-md-4">
            <AcquisitionCard
              title="Acquire: Full Broking House"
              borderClass="border-revenue"
              headerClass="bg-revenue"
              quarters={
                data["Full Broking House"]
                  ? Object.values(data["Full Broking House"]).map((q) => ({
                      count: q.count,
                      amount: q.amount_per_acquisition / 10000000 // show in ₹Cr
                    }))
                  : []
              }
              onChange={(qi, field, value) =>
                handleUpdate("Full Broking House", qi, field, value)
              }
            />
          </div>

          <div className="col-md-4">
            <AcquisitionCard
              title="Acquire: GOP Based Broker Deals (Permanent)"
              borderClass="border-customer"
              headerClass="bg-customer"
              quarters={
                data["GOP Based Broker Deals"]
                  ? Object.values(data["GOP Based Broker Deals"]).map((q) => ({
                      count: q.count,
                      amount: q.amount_per_acquisition / 10000000
                    }))
                  : []
              }
              onChange={(qi, field, value) =>
                handleUpdate("GOP Based Broker Deals", qi, field, value)
              }
            />
          </div>

          <div className="col-md-4">
            <AcquisitionCard
              title="Acquire: Secondary Market Deals"
              borderClass="border-ratio"
              headerClass="bg-ratio"
              quarters={
                data["Secondary Market Acquisitions"]
                  ? Object.values(data["Secondary Market Acquisitions"]).map((q) => ({
                      count: q.count,
                      amount: q.amount_per_acquisition / 10000000
                    }))
                  : []
              }
              onChange={(qi, field, value) =>
                handleUpdate("Secondary Market Acquisitions", qi, field, value)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GTM;
