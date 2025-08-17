import React, { useContext } from 'react';
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
import { GrMoney } from 'react-icons/gr';

// ✅ import RoleContext
import { RoleContext } from '../App';

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
    section: 'Financials',
    items: [
      { label: 'Cashflow statement', path: '/growth', icon: <GrMoney /> },
      { label: 'Profit and Loss statement', path: '/PnL-Statement', icon: <LuCircleDollarSign /> },
      { label: 'Valuation', path: '/valuation', icon: <LuWallet/> },
      { label: 'Unit Economics', path: '/unit-economics', icon: <LuCalculator /> },
    ],
  },
  {
    section: 'Stratergy',
    items: [
      { label: 'Stress Testing', path: '/stress-testing', icon: <RiBugLine /> },
    ],
  },
  {
    section: 'Revenue & Expenses',
    items: [
      { label: 'Revenue', path: '/revenue', icon: <LuCircleDollarSign /> },
      { label: 'Growth Funnel', path: '/growth', icon:<IoMdTrendingUp />  },
      { label: 'OpEx', path: '/opex', icon: <FiCpu /> },
      { label: 'Salaries', path: '/salaries', icon: <HiOutlineUserGroup /> },
      { label: 'CapEx', path: '/capex', icon: <AiOutlineBank /> },
      { label: 'M&A', path: '/M&A', icon: <AiOutlineMergeCells /> },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const { isManager } = useContext(RoleContext); // ✅ access role

  // ✅ Hide "Financials" sections if Manager
  const filteredMenu = isManager
    ? menu.filter((section) => section.section !== 'Stratergy')
    : menu;

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
        {filteredMenu.map((section) => (
          <div key={section.section} className="menu-section">
            {!collapsed && section.section && (
              <div className="section-title">{section.section}</div>
            )}
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
