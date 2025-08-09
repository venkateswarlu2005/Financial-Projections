import React, { useState, useRef, useEffect } from "react";
import "./GTM.css";

// --- Types ---
interface QuarterData {
  count: number;
  amount_per_acquisition: number;
}

interface ApiData {
  [acquisitionType: string]: {
    [quarterKey: string]: QuarterData;
  };
}

interface AcquisitionCardProps {
  title: string;
  acquisitionKey: string;
  data: { [quarterKey: string]: QuarterData };
  borderClass: string;
  headerClass: string;
  onUpdate: (
    acquisitionType: string,
    year: number,
    quarter: number,
    count: number,
    amount_per_acquisition: number
  ) => void;
}

// --- Card Component ---
const AcquisitionCard: React.FC<AcquisitionCardProps> = ({
  title,
  acquisitionKey,
  data,
  borderClass,
  headerClass,
  onUpdate,
}) => {
  const quarters = ["Y1Q1", "Y1Q2", "Y1Q3", "Y1Q4"];

  return (
    <div className={`acq-card ${borderClass}`}>
      <h6 className={headerClass}>{title}</h6>
      <div className="acq-content">
        {quarters.map((q, index) => {
          const countVal = data[q]?.count ?? 0;
          const amountVal = data[q]?.amount_per_acquisition ?? 0;

          return (
            <div className="quarter-row" key={q}>
              <label>Q{index + 1} Count:</label>
              <input
                type="number"
                value={countVal}
                onChange={(e) => {
                  const newCount = Number(e.target.value);
                  onUpdate(acquisitionKey, 1, index + 1, newCount, amountVal);
                }}
              />
              <label>Amount (₹):</label>
              <input
                type="number"
                className="amount-input"
                value={amountVal}
                onChange={(e) => {
                  const newAmount = Number(e.target.value);
                  onUpdate(acquisitionKey, 1, index + 1, countVal, newAmount);
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Main Component ---
const GTM: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState("Year 1");
  const [apiData, setApiData] = useState<ApiData>({});
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch data function
  const fetchGtmData = (year: number) => {
    fetch(`http://localhost:8000/api/gtm-data/${year}`)
      .then((res) => res.json())
      .then((data: ApiData) => {
        setApiData(data);
      })
      .catch((err) => console.error("Failed to fetch GTM data:", err));
  };

  // Initial + on year change
  useEffect(() => {
    const yearNum = parseInt(selectedYear.replace("Year ", ""), 10);
    fetchGtmData(yearNum);
  }, [selectedYear]);

  // Update API call + refetch
  const handleUpdate = (
    acquisitionType: string,
    year_num: number,
    quarter_num: number,
    newCount: number,
    newAmount: number
  ) => {
    setApiData((prev) => {
      const updated = { ...prev };
      const quarterKey = `Y${year_num}Q${quarter_num}`;
      if (!updated[acquisitionType]) return prev;
      updated[acquisitionType][quarterKey] = {
        count: newCount,
        amount_per_acquisition: newAmount,
      };
      return updated;
    });

    fetch("http://localhost:8000/api/update-gtm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        acquisition_type: acquisitionType,
        year_num,
        quarter_num,
        count: newCount,
        amount_per_acquisition: newAmount,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update GTM data");
        fetchGtmData(year_num);
      })
      .catch((err) => console.error("Failed to update GTM data:", err));
  };

  return (
    <div className="page-background">
      <div className="main-container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>GTM Acquisitions & Mergers</h5>
        </div>

        {/* Year Selector */}
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
                {["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"].map(
                  (year, idx) => (
                    <div
                      key={idx}
                      className={`dropdown-item-pill ${
                        selectedYear === year ? "selected" : ""
                      }`}
                      onClick={() => {
                        setSelectedYear(year);
                        setShowDropdown(false);
                      }}
                    >
                      <span
                        className={`radio-circle ${
                          selectedYear === year ? "filled" : ""
                        }`}
                      />
                      {year}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Acquisition Cards in a row */}
        <div className="acq-row">
          <div className="acq-card-wrapper">
            <AcquisitionCard
              title="Acquire: Full Broking House"
              acquisitionKey="Full Broking House"
              borderClass="border-revenue"
              headerClass="bg-revenue"
              data={apiData["Full Broking House"] || {}}
              onUpdate={handleUpdate}
            />
          </div>

          <div className="acq-card-wrapper">
            <AcquisitionCard
              title="Acquire: GOP Based Broker Deals (Permanent)"
              acquisitionKey="GOP Based Broker Deals"
              borderClass="border-customer"
              headerClass="bg-customer"
              data={apiData["GOP Based Broker Deals"] || {}}
              onUpdate={handleUpdate}
            />
          </div>

          <div className="acq-card-wrapper">
            <AcquisitionCard
              title="Acquire: Secondary Market Deals"
              acquisitionKey="Secondary Market Acquisitions"
              borderClass="border-ratio"
              headerClass="bg-ratio"
              data={apiData["Secondary Market Acquisitions"] || {}}
              onUpdate={handleUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GTM;
