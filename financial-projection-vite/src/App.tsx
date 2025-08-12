// App.tsx
import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import TopNavbar from './components/TopNavbar';
import Sidebar from './components/sidebar';

import Dashboard from './components/DashboardContent';
import Revenue from './components/Revenue';
import UnitEconomics from './components/UnitEconomics';
import Growth from './components/Growth';
import OpEx from './components/OpEx';
import Salaries from './components/Salaries';
import CapEx from './components/CapEx';
import GTM from './components/GTM';
import Valuation from './components/Valuation';
import ScenarioAnalysis from './components/ScenarioAnalysis';
import StressTesting from './components/StressTesting';
import 'bootstrap/dist/css/bootstrap.min.css';
import Financial from './components/Financial';


function App() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <Router>
      <div className="app-layout">
        <Sidebar collapsed={isSidebarCollapsed} setCollapsed={setSidebarCollapsed} />

        <div
          className="main-area"
          style={{
            paddingLeft: isSidebarCollapsed ? '80px' : '240px', // match sidebar width
          }}
        >
          <TopNavbar />
          <div className="page-content">
            <Routes>
              <Route path="/dashboard" element={<Dashboard/>} />
              <Route path="/revenue" element={<Revenue/>} />
              <Route path="/unit-economics" element={<UnitEconomics/>} />
              <Route path="/growth" element={<Growth/>} />
              <Route path="/opex" element={<OpEx/>} />
              <Route path="/salaries" element={<Salaries/>} />
              <Route path="/capex" element={<CapEx/>} />
              <Route path="/M&A" element={<GTM/>} />
              <Route path="/valuation" element={<Valuation/>} />
              <Route path="/stress-testing" element={<StressTesting/>} />
              <Route path="/scenario-analysis" element={<ScenarioAnalysis/>} />
              <Route path="//PnL-Statement" element={<Financial/>} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
