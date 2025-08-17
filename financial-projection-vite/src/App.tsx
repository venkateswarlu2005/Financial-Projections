// App.tsx
import { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
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

import "bootstrap/dist/css/bootstrap.min.css";

// ✅ Create context so children can use role info
import { createContext } from "react";
export const RoleContext = createContext<{ isManager: boolean }>({ isManager: false });

function App() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isManager, setIsManager] = useState<boolean | null>(null); // null means not chosen yet

  return (
    <Router>
      {isManager === null ? (
        // show role selection if user hasn’t picked yet
        <RoleSelection setIsManager={setIsManager} />
      ) : (
        <RoleContext.Provider value={{ isManager }}>
          <div className="app-layout">
            <Sidebar collapsed={isSidebarCollapsed} setCollapsed={setSidebarCollapsed} />

            <div
              className="main-area"
              style={{
                paddingLeft: isSidebarCollapsed ? "80px" : "240px",
              }}
            >
              <TopNavbar />
              <div className="page-content">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/revenue" element={<Revenue />} />
                  <Route path="/unit-economics" element={<UnitEconomics />} />
                  <Route path="/growth" element={<Growth />} />
                  <Route path="/opex" element={<OpEx />} />
                  <Route path="/salaries" element={<Salaries />} />
                  <Route path="/capex" element={<CapEx />} />
                  <Route path="/M&A" element={<GTM />} />
                  <Route path="/valuation" element={<Valuation />} />
                  <Route path="/stress-testing" element={<StressTesting />} />
                  <Route path="/scenario-analysis" element={<ScenarioAnalysis />} />
                  <Route path="/PnL-Statement" element={<Financial />} />
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
