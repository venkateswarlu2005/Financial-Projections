import React, { createContext, useContext, useState, type ReactNode } from "react";

interface ValueDetail {
  value: number;
  is_calculated: boolean;
}

interface PeriodData {
  [period: string]: ValueDetail;
}

interface SectionData {
  [key: string]: PeriodData;
}

interface StressTestData {
  "growth-funnel"?: SectionData;
  revenue?: SectionData;
  "unit-economics"?: SectionData;
  financials?: SectionData;
  "dp-evaluation"?: SectionData;
  salaries?: SectionData;
  "tech-opex"?: SectionData;
  // add other sections if needed
}

interface StressTestInput {
  start_year: number;
  start_quarter: number;
  customer_drop_percentage: number;
  pricing_pressure_percentage: number;
  cac_increase_percentage: number;
  is_technology_failure: boolean;
  interest_rate_shock: number;
  market_entry_underperformance_percentage: number;
  is_economic_recession: boolean;
}

interface StressTestContextType {
  data: StressTestData | null;
  setData: React.Dispatch<React.SetStateAction<StressTestData | null>>;
  input: StressTestInput | null;
  setInput: React.Dispatch<React.SetStateAction<StressTestInput | null>>;
}

const StressTestContext = createContext<StressTestContextType | undefined>(
  undefined
);

export const StressTestProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<StressTestData | null>(null);
  const [input, setInput] = useState<StressTestInput | null>(null);

  return (
    <StressTestContext.Provider value={{ data, setData, input, setInput }}>
      {children}
    </StressTestContext.Provider>
  );
};

export const useStressTest = (): StressTestContextType => {
  const context = useContext(StressTestContext);
  if (!context)
    throw new Error(
      "useStressTest must be used within a StressTestProvider"
    );
  return context;
};
