import 'bootstrap-icons/font/bootstrap-icons.css';
import React from "react";
import { Link } from "react-router-dom";

const navItems = [
  { key: "dashboard", label: "Main Dashboard", icon: "bi-house" },
  { key: "submission-input", label: "Submission Input", icon: "bi-pencil-square" },
  { key: "submission-history", label: "Submission History", icon: "bi-clock-history" },
  { key: "profile-management", label: "Profile Management", icon: "bi-person" },
  { key: "admin-dashboard", label: "Panglao Statistics", icon: "bi-bar-chart" },
  { key: "help-support", label: "Help and Support", icon: "bi-question-circle" },
];

const Sidebar = ({ open, setOpen, activeSection, setActiveSection, handleLogout, user }) => {
  const handleNav = (key) => {
    setActiveSection(key);
    setOpen(false); // close drawer on mobile after nav
  };
  return (
    <>
      {/* Overlay for mobile/tablet drawer */}
      {open && <div className="d-md-none" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1050 }} onClick={() => setOpen(false)}></div>}
      {/* Off-canvas sidebar for mobile/tablet */}
      <div
        className={`d-md-none sidebar d-flex flex-column${open ? ' open' : ''}`}
        style={{
          backgroundColor: "#E0F7FA",
          minHeight: "50vh",
          boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
          padding: "20px 0",
          position: 'fixed',
          left: open ? 0 : '-80vw',
          top: 0,
          width: '40vw',
          maxWidth: 300,
          height: '100vh',
          zIndex: 1052,
          transition: 'left 0.3s',
        }}
      >
        <div className="sidebar-sticky">
          {/* User Profile Section */}
          <div className="text-center mb-4">
            <h4
              className="mt-3"
              style={{
                color: "#37474F",
                fontWeight: "600",
                fontSize: "1.25rem",
                letterSpacing: "0.5px",
              }}
            >
              {user?.company_name}
            </h4>
          </div>
          {/* Navigation Links */}
          <ul className="nav flex-column mt-4">
            {navItems.map(({ key, label, icon }) => (
              <li className="nav-item" key={key}>
                <Link
                  to="#"
                  className={`nav-link d-flex align-items-center${activeSection === key ? " active" : ""}`}
                  style={{
                    color: activeSection === key ? "#FFFFFF" : "#37474F",
                    backgroundColor: activeSection === key ? "#00BCD4" : "transparent",
                    padding: "12px 20px",
                    borderRadius: "8px",
                    margin: "4px 0",
                    display: "block",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => handleNav(key)}
                  aria-label={label}
                >
                  <i className={`bi ${icon} me-2`} style={{ fontSize: 20 }}></i>
                  <span className="d-inline">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
          {/* Logout Button */}
          <div className="mt-4 p-3">
            <button
              className="btn w-100"
              style={{
                backgroundColor: "#FF6F00",
                color: "#FFFFFF",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "1rem",
                letterSpacing: "0.5px",
                transition: "all 0.3s ease",
              }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      {/* Desktop sidebar (always visible) */}
      <div className="d-none d-md-block col-md-3 sidebar" style={{ backgroundColor: "#E0F7FA", minHeight: "50vh", boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)", padding: "20px 0" }}>
        <div className="sidebar-sticky">
          {/* User Profile Section */}
          <div className="text-center mb-4">
            <h4
              className="mt-3"
              style={{
                color: "#37474F",
                fontWeight: "600",
                fontSize: "1.25rem",
                letterSpacing: "0.5px",
              }}
            >
              {user?.company_name}
            </h4>
          </div>
          {/* Navigation Links */}
          <ul className="nav flex-column mt-4">
            {navItems.map(({ key, label, icon }) => (
              <li className="nav-item" key={key}>
                <Link
                  to="#"
                  className={`nav-link d-flex align-items-center${activeSection === key ? " active" : ""}`}
                  style={{
                    color: activeSection === key ? "#FFFFFF" : "#37474F",
                    backgroundColor: activeSection === key ? "#00BCD4" : "transparent",
                    padding: "12px 20px",
                    borderRadius: "8px",
                    margin: "4px 0",
                    display: "block",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => setActiveSection(key)}
                  aria-label={label}
                >
                  <i className={`bi ${icon} me-2`} style={{ fontSize: 20 }}></i>
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
                backgroundColor: "#FF6F00",
                color: "#FFFFFF",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "1rem",
                letterSpacing: "0.5px",
                transition: "all 0.3s ease",
              }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;