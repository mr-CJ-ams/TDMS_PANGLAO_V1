import React from "react";
import { Link } from "react-router-dom";

const navItems = [
  { key: "dashboard", label: "Main Dashboard" },
  { key: "submission-input", label: "Submission Input" },
  { key: "submission-history", label: "Submission History" },
  { key: "profile-management", label: "Profile Management" },
  { key: "admin-dashboard", label: "Panglao Statistics" },
  { key: "help-support", label: "Help and Support" },
];

const Sidebar = ({ activeSection, setActiveSection, handleLogout, user }) => (
  <div
    className="col-md-3 sidebar"
    style={{
      backgroundColor: "#E0F7FA", // Light cyan background
      minHeight: "50vh", // Full height
      boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)", // Subtle shadow
      padding: "20px 0", // Add padding for spacing
    }}
  >
    <div className="sidebar-sticky">
      {/* User Profile Section */}
      <div className="text-center mb-4">
        <h4
          className="mt-3"
          style={{
            color: "#37474F", // Dark gray text
            fontWeight: "600", // Semi-bold
            fontSize: "1.25rem", // Slightly larger font
            letterSpacing: "0.5px", // Subtle letter spacing
          }}
        >
          {user?.company_name}
        </h4>
      </div>

      {/* Navigation Links */}
      <ul className="nav flex-column mt-4">
        {navItems.map(({ key, label }) => (
          <li className="nav-item" key={key}>
            <Link
              to="#"
              className={`nav-link${
                activeSection === key ? " active" : ""
              }`}
              style={{
                color: activeSection === key ? "#FFFFFF" : "#37474F", // Active state
                backgroundColor:
                  activeSection === key ? "#00BCD4" : "transparent", // Active state
                padding: "12px 20px", // Increased padding
                borderRadius: "8px", // Rounded corners
                margin: "4px 0", // Spacing between links
                display: "block", // Ensure full width
                fontWeight: "500", // Medium font weight
                transition: "all 0.3s ease", // Smooth transition
              }}
              onClick={() => setActiveSection(key)}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Logout Button */}
      <div className="mt-4 p-3">
        <button
          className="btn w-100"
          style={{
            backgroundColor: "#FF6F00", // Amber color for logout
            color: "#FFFFFF",
            border: "none",
            padding: "12px", // Increased padding
            borderRadius: "8px", // Rounded corners
            cursor: "pointer",
            fontWeight: "600", // Semi-bold
            fontSize: "1rem", // Slightly larger font
            letterSpacing: "0.5px", // Subtle letter spacing
            transition: "all 0.3s ease", // Smooth transition
          }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  </div>
);

export default Sidebar;