import React from 'react';
import './Sidebar.css';
import { Link, useLocation } from 'react-router-dom';
import { MdOutlineDashboardCustomize } from 'react-icons/md';
import { IoIosArrowDropright } from 'react-icons/io';
import { IoMdTrendingUp } from 'react-icons/io';
import { LuCircleDollarSign, LuCalculator, LuWallet } from 'react-icons/lu';
import { FiCpu } from 'react-icons/fi';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { AiOutlineBank, AiOutlineMergeCells } from 'react-icons/ai';
import { RiBugLine } from 'react-icons/ri';
import { PiGraphLight } from 'react-icons/pi';
import { GrMoney } from 'react-icons/gr';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const menu = [
  {
    section: '',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: <MdOutlineDashboardCustomize /> },
    ],
  },
  {
    section: 'Revenue & Growth',
    items: [
      { label: 'Growth Funnel', path: '/growth', icon: <IoMdTrendingUp /> },
      { label: 'Revenue', path: '/revenue', icon: <LuCircleDollarSign /> },
      { label: 'Unit Economics', path: '/unit-economics', icon: <LuCalculator /> },
    ],
  },
  {
    section: 'Financials',
    items: [
      { label: 'OpEx', path: '/opex', icon: <FiCpu /> },
      { label: 'Salaries', path: '/salaries', icon: <HiOutlineUserGroup /> },
      { label: 'CapEx', path: '/capex', icon: <AiOutlineBank /> },
    ],
  },
  {
    section: 'Strategy',
    items: [
      { label: 'GTM Mergers', path: '/gtm-mergers', icon: <AiOutlineMergeCells /> },
      { label: 'Financials', path: '/financial', icon: <GrMoney /> },
      { label: 'Valuation', path: '/valuation', icon: <LuWallet /> },
      { label: 'Stress Testing', path: '/stress-testing', icon: <RiBugLine /> },
      { label: 'Scenario Analysis', path: '/scenario-analysis', icon: <PiGraphLight /> },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo Section */}
      <div className="logo-section">
        <img
          src={collapsed ? "/image2.png" : "/image.png"}
          alt="Capovex Logo"
          className="logo"
        />
        <button onClick={() => setCollapsed(!collapsed)} className="toggle-btn">
          <IoIosArrowDropright
            className={`arrow-icon ${collapsed ? '' : 'rotated'}`}
          />
        </button>
      </div>

      {/* Scrollable Menu */}
      <div className="menu-container">
        {menu.map((section) => (
          <div key={section.section} className="menu-section">
            {!collapsed && <div className="section-title">{section.section}</div>}
            {section.items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="icon">{item.icon}</span>
                {!collapsed && <span className="label">{item.label}</span>}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
