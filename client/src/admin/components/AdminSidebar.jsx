import 'bootstrap-icons/font/bootstrap-icons.css';
import TourismLogo from "../components/img/1738398998646-Tourism_logo.png";
import { Link } from "react-router-dom";

const AdminSidebar = ({ open, setOpen, activeSection, setActiveSection, handleLogout }) => {
  const handleNav = (section) => {
    setActiveSection(section);
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
          width: '70vw',
          maxWidth: 300,
          height: '100vh',
          zIndex: 1052,
          transition: 'left 0.3s',
        }}
      >
        {/* Logo and heading (smaller on mobile) */}
        <div className="text-center mb-4" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img src={TourismLogo} alt="Tourism Logo" style={{ width: 80, height: 'auto', padding: 5 }} />
        </div>
        <h4 className="sidebar-heading mb-4" style={{ color: "#37474F", fontWeight: 600, textAlign: "center", fontSize: "1.1rem", letterSpacing: "0.5px" }}>
          Panglao Tourist Data Management System
        </h4>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link
              to="#"
              className={`nav-link d-flex align-items-center ${activeSection === "dashboard" ? "active" : ""}`}
              style={{
                padding: "12px 20px",
                transition: "all 0.3s ease",
                backgroundColor: activeSection === "dashboard" ? "#00BCD4" : "transparent",
                color: activeSection === "dashboard" ? "#FFFFFF" : "#37474F",
                borderRadius: 8,
                margin: "4px 0",
                display: "block",
              }}
              onClick={() => handleNav("dashboard")}
              aria-label="Main Dashboard"
            >
              <i className="bi bi-house me-2" style={{ fontSize: 20 }}></i>
              <span className="d-inline">Main Dashboard</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="#"
              className={`nav-link d-flex align-items-center ${activeSection === "user-approval" ? "active" : ""}`}
              style={{
                padding: "12px 20px",
                transition: "all 0.3s ease",
                backgroundColor: activeSection === "user-approval" ? "#00BCD4" : "transparent",
                color: activeSection === "user-approval" ? "#FFFFFF" : "#37474F",
                borderRadius: 8,
                margin: "4px 0",
                display: "block",
              }}
              onClick={() => handleNav("user-approval")}
              aria-label="User Approval"
            >
              <i className="bi bi-people me-2" style={{ fontSize: 20 }}></i>
              <span className="d-inline">User Approval</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="#"
              className={`nav-link d-flex align-items-center ${activeSection === "submission-overview" ? "active" : ""}`}
              style={{
                padding: "12px 20px",
                transition: "all 0.3s ease",
                backgroundColor: activeSection === "submission-overview" ? "#00BCD4" : "transparent",
                color: activeSection === "submission-overview" ? "#FFFFFF" : "#37474F",
                borderRadius: 8,
                margin: "4px 0",
                display: "block",
              }}
              onClick={() => handleNav("submission-overview")}
              aria-label="Submission Overview"
            >
              <i className="bi bi-file-earmark-text me-2" style={{ fontSize: 20 }}></i>
              <span className="d-inline">Submission Overview</span>
            </Link>
          </li>
        </ul>
        <div className="mt-4 p-3">
          <button className="btn w-100" style={{
            backgroundColor: "#FF6F00", color: "#FFFFFF", border: "none", padding: 12,
            borderRadius: 8, cursor: "pointer", transition: "all 0.3s ease", fontWeight: 600, fontSize: "1rem", letterSpacing: "0.5px"
          }} onClick={handleLogout}>Logout</button>
        </div>
      </div>
      {/* Desktop sidebar (always visible) */}
      <div className="d-none d-md-block col-md-3 sidebar" style={{ backgroundColor: "#E0F7FA", minHeight: "50vh", boxShadow: "2px 0 8px rgba(0,0,0,0.1)", padding: "20px 0" }}>
        <div className="sidebar-sticky">
          <div className="text-center mb-4" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <img src={TourismLogo} alt="Tourism Logo" style={{ width: "100px", height: "auto", padding: "5px" }} />
          </div>
          <h4 className="sidebar-heading mb-4" style={{ color: "#37474F", fontWeight: "600", textAlign: "center", fontSize: "1.25rem", letterSpacing: "0.5px" }}>
            Panglao Tourist Data Management System
          </h4>
          <ul className="nav flex-column">
            <li className="nav-item">
              <Link
                to="#"
                className={`nav-link ${activeSection === "dashboard" ? "active" : ""}`}
                style={{
                  padding: "12px 20px",
                  transition: "all 0.3s ease",
                  backgroundColor: activeSection === "dashboard" ? "#00BCD4" : "transparent",
                  color: activeSection === "dashboard" ? "#FFFFFF" : "#37474F",
                  borderRadius: "8px",
                  margin: "4px 0",
                  display: "block",
                }}
                onClick={() => setActiveSection("dashboard")}
              >
                <i className="bi bi-house me-2" style={{ fontSize: 20 }}></i>
                Main Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="#"
                className={`nav-link ${activeSection === "user-approval" ? "active" : ""}`}
                style={{
                  padding: "12px 20px",
                  transition: "all 0.3s ease",
                  backgroundColor: activeSection === "user-approval" ? "#00BCD4" : "transparent",
                  color: activeSection === "user-approval" ? "#FFFFFF" : "#37474F",
                  borderRadius: "8px",
                  margin: "4px 0",
                  display: "block",
                }}
                onClick={() => setActiveSection("user-approval")}
              >
                <i className="bi bi-people me-2" style={{ fontSize: 20 }}></i>
                User Approval
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="#"
                className={`nav-link ${activeSection === "submission-overview" ? "active" : ""}`}
                style={{
                  padding: "12px 20px",
                  transition: "all 0.3s ease",
                  backgroundColor: activeSection === "submission-overview" ? "#00BCD4" : "transparent",
                  color: activeSection === "submission-overview" ? "#FFFFFF" : "#37474F",
                  borderRadius: "8px",
                  margin: "4px 0",
                  display: "block",
                }}
                onClick={() => setActiveSection("submission-overview")}
              >
                <i className="bi bi-file-earmark-text me-2" style={{ fontSize: 20 }}></i>
                Submission Overview
              </Link>
            </li>
          </ul>
          <div className="mt-4 p-3">
            <button className="btn w-100" style={{
              backgroundColor: "#FF6F00", color: "#FFFFFF", border: "none", padding: "12px",
              borderRadius: "8px", cursor: "pointer", transition: "all 0.3s ease", fontWeight: "600", fontSize: "1rem", letterSpacing: "0.5px"
            }} onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar; 