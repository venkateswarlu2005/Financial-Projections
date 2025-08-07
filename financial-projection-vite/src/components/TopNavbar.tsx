
import { FaBell, FaWandMagicSparkles } from 'react-icons/fa6';
import { FiSearch } from 'react-icons/fi';
import { FaChevronDown } from 'react-icons/fa';
import './TopNavbar.css'; // import the CSS

const TopNavbar = () => {
  return (
    <div className="top-navbar-container">
      {/* Search Box */}
      <div className="search-box">
        <FiSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search"
        />
      </div>

      {/* AI Assistant Button */}
      <button className="ai-button">
        <span className="ai-label">AI Assistant</span>
        <FaWandMagicSparkles className="ai-icon" />
      </button>

      {/* Notification Bell */}
      <FaBell className="notification-icon" />

      {/* Profile Info */}
      <div className="profile-info">
        <img
          src="https://i.pravatar.cc/40"
          alt="avatar"
          className="profile-avatar"
        />
        <div className="profile-text">
          <span className="profile-name">Ryan Holding</span>
          <span className="profile-email">rh@abc.com</span>
        </div>
        <FaChevronDown size={12} className="chevron-down" />
      </div>
    </div>
  );
};

export default TopNavbar;
