import React from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ activeSection, setActiveSection, handleLogout, user }) => {
  return (
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
          {/* {user?.profile_picture ? (
            <img
              src={user.profile_picture}
              alt="Profile"
              className="rounded-circle"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
                border: "3px solid #0288D1", // Accent border
                padding: "5px", // Add padding for a polished look
              }}
            />
          ) : (
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "100px",
                height: "100px",
                backgroundColor: "#0288D1", // Deep sky blue background
                border: "3px solid #0288D1", // Accent border
              }}
            >
              <span className="text-white" style={{ fontWeight: "600" }}>
                No Image
              </span>
            </div>
          )} */}
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
          <li className="nav-item">
            <Link
              to="#"
              className={`nav-link ${
                activeSection === "dashboard" ? "active" : ""
              }`}
              style={{
                color: "#37474F", // Dark gray text
                padding: "12px 20px", // Increased padding
                transition: "all 0.3s ease", // Smooth transition
                backgroundColor: activeSection === "dashboard" ? "#00BCD4" : "transparent", // Active state
                color: activeSection === "dashboard" ? "#FFFFFF" : "#37474F", // Active state
                borderRadius: "8px", // Rounded corners
                margin: "4px 0", // Spacing between links
                display: "block", // Ensure full width
              }}
              onClick={() => setActiveSection("dashboard")}
            >
              Main Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="#"
              className={`nav-link ${
                activeSection === "submission-input" ? "active" : ""
              }`}
              style={{
                color: "#37474F", // Dark gray text
                padding: "12px 20px", // Increased padding
                transition: "all 0.3s ease", // Smooth transition
                backgroundColor: activeSection === "submission-input" ? "#00BCD4" : "transparent", // Active state
                color: activeSection === "submission-input" ? "#FFFFFF" : "#37474F", // Active state
                borderRadius: "8px", // Rounded corners
                margin: "4px 0", // Spacing between links
                display: "block", // Ensure full width
              }}
              onClick={() => setActiveSection("submission-input")}
            >
              Submission Input
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="#"
              className={`nav-link ${
                activeSection === "submission-history" ? "active" : ""
              }`}
              style={{
                color: "#37474F", // Dark gray text
                padding: "12px 20px", // Increased padding
                transition: "all 0.3s ease", // Smooth transition
                backgroundColor: activeSection === "submission-history" ? "#00BCD4" : "transparent", // Active state
                color: activeSection === "submission-history" ? "#FFFFFF" : "#37474F", // Active state
                borderRadius: "8px", // Rounded corners
                margin: "4px 0", // Spacing between links
                display: "block", // Ensure full width
              }}
              onClick={() => setActiveSection("submission-history")}
            >
              Submission History
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="#"
              className={`nav-link ${
                activeSection === "profile-management" ? "active" : ""
              }`}
              style={{
                color: "#37474F", // Dark gray text
                padding: "12px 20px", // Increased padding
                transition: "all 0.3s ease", // Smooth transition
                backgroundColor: activeSection === "profile-management" ? "#00BCD4" : "transparent", // Active state
                color: activeSection === "profile-management" ? "#FFFFFF" : "#37474F", // Active state
                borderRadius: "8px", // Rounded corners
                margin: "4px 0", // Spacing between links
                display: "block", // Ensure full width
              }}
              onClick={() => setActiveSection("profile-management")}
            >
              Profile Management
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="#"
              className={`nav-link ${
                activeSection === "admin-dashboard" ? "active" : ""
              }`}
              style={{
                color: "#37474F", // Dark gray text
                padding: "12px 20px", // Increased padding
                transition: "all 0.3s ease", // Smooth transition
                backgroundColor: activeSection === "admin-dashboard" ? "#00BCD4" : "transparent", // Active state
                color: activeSection === "admin-dashboard" ? "#FFFFFF" : "#37474F", // Active state
                borderRadius: "8px", // Rounded corners
                margin: "4px 0", // Spacing between links
                display: "block", // Ensure full width
              }}
              onClick={() => setActiveSection("admin-dashboard")}
            >
              Panglao Statistics
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="#"
              className={`nav-link ${
                activeSection === "help-support" ? "active" : ""
              }`}
              style={{
                color: "#37474F", // Dark gray text
                padding: "12px 20px", // Increased padding
                transition: "all 0.3s ease", // Smooth transition
                backgroundColor: activeSection === "help-support" ? "#00BCD4" : "transparent", // Active state
                color: activeSection === "help-support" ? "#FFFFFF" : "#37474F", // Active state
                borderRadius: "8px", // Rounded corners
                margin: "4px 0", // Spacing between links
                display: "block", // Ensure full width
              }}
              onClick={() => setActiveSection("help-support")}
            >
              Help and Support
            </Link>
          </li>
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
              transition: "all 0.3s ease", // Smooth transition
              fontWeight: "600", // Semi-bold
              fontSize: "1rem", // Slightly larger font
              letterSpacing: "0.5px", // Subtle letter spacing
            }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;