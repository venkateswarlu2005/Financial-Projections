import React, { useState, createContext } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import TopNavbar from "./components/TopNavbar";
import Sidebar from "./components/sidebar";
import RoleSelection from "./components/RoleSelection";

import Dashboard from "./components/DashboardContent";
import Revenue from "./components/Revenue";
import UnitEconomics from "./components/UnitEconomics";
import Growth from "./components/Growth";
import OpEx from "./components/OpEx";
import Salaries from "./components/Salaries";
import CapEx from "./components/CapEx";
import GTM from "./components/GTM";
import Valuation from "./components/Valuation";
import ScenarioAnalysis from "./components/ScenarioAnalysis";
import StressTesting from "./components/StressTesting";
import Financial from "./components/Financial";

// ✅ Role context
export const RoleContext = createContext<{ isManager: boolean }>({ isManager: false });

function App() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isManager, setIsManager] = useState<boolean | null>(null); // null = not chosen yet

  // ✅ Lifted stress testing data
  const [stressTestData, setStressTestData] = useState<any>(null);

  return (
    <Router>
      {isManager === null ? (
        <RoleSelection setIsManager={setIsManager} />
      ) : (
        <RoleContext.Provider value={{ isManager }}>
          <div className="app-layout">
            <Sidebar collapsed={isSidebarCollapsed} setCollapsed={setSidebarCollapsed} />
            <div className="main-area" style={{ paddingLeft: isSidebarCollapsed ? "80px" : "240px" }}>
              <TopNavbar />
              <div className="page-content">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/revenue" element={<Revenue stressTestData={stressTestData} />} />
                  <Route path="/unit-economics" element={<UnitEconomics stressTestData={stressTestData} />} />
                  <Route path="/growth" element={<Growth stressTestData={stressTestData}/>} />
                  <Route path="/opex" element={<OpEx stressTestData={stressTestData} />} />
                  <Route path="/salaries" element={<Salaries stressTestData={stressTestData} />} />
                  <Route path="/capex" element={<CapEx stressTestData={stressTestData}/>} />
                  <Route path="/M&A" element={<GTM />} />
                  <Route path="/valuation" element={<Valuation stressTestData={stressTestData}/>} />
                  <Route path="/stress-testing" element={<StressTesting setStressTestData={setStressTestData} />} />
                  <Route path="/scenario-analysis" element={<ScenarioAnalysis />} />
                  <Route path="/PnL-Statement" element={<Financial stressTestData={stressTestData} />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </div>
            </div>
          </div>
        </RoleContext.Provider>
      )}
    </Router>
  );
}

export default App;
