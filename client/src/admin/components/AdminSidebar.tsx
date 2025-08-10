import React from "react";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from "react-router-dom";
import TourismLogo from "./img/Tourism_logo_1.png";

interface AdminSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  handleLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  open,
  setOpen,
  activeSection,
  setActiveSection,
  handleLogout
}) => {
  const handleNav = (section: string) => {
    setActiveSection(section);
    setOpen(false); // close drawer on mobile after nav
  };

  // Type for navigation items to avoid repetition
  type NavItem = {
    id: string;
    label: string;
    icon: string;
    ariaLabel: string;
  };

  const navItems: NavItem[] = [
    { id: "dashboard", label: "Main Dashboard", icon: "bi-house", ariaLabel: "Main Dashboard" },
    { id: "user-approval", label: "User Approval", icon: "bi-people", ariaLabel: "User Approval" },
    { id: "submission-overview", label: "Submission Overview", icon: "bi-file-earmark-text", ariaLabel: "Submission Overview" }
  ];

  const renderNavLink = (item: NavItem, isMobile: boolean = false) => (
    <li className="nav-item" key={item.id}>
      <Link
        to="#"
        className={`nav-link d-flex align-items-center ${activeSection === item.id ? "active" : ""}`}
        style={{
          padding: "12px 20px",
          transition: "all 0.3s ease",
          backgroundColor: activeSection === item.id ? "#00BCD4" : "transparent",
          color: activeSection === item.id ? "#FFFFFF" : "#37474F",
          borderRadius: 8,
          margin: "4px 0",
          display: "block",
        }}
        onClick={() => isMobile ? handleNav(item.id) : setActiveSection(item.id)}
        aria-label={item.ariaLabel}
      >
        <i className={`bi ${item.icon} me-2`} style={{ fontSize: 20 }}></i>
        <span className="d-inline">{item.label}</span>
      </Link>
    </li>
  );

  return (
    <>
      {/* Overlay for mobile/tablet drawer */}
      {open && (
        <div 
          className="d-md-none" 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            background: 'rgba(0,0,0,0.2)', 
            zIndex: 1050 
          }} 
          onClick={() => setOpen(false)}
        />
      )}
      
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
          <img 
            src={TourismLogo} 
            alt="Tourism Logo" 
            style={{ width: "100px", height: "auto", padding: "5px" }} 
          />
        </div>
        <h4 className="sidebar-heading mb-4" style={{ 
          color: "#37474F", 
          fontWeight: 600, 
          textAlign: "center", 
          fontSize: "1.1rem", 
          letterSpacing: "0.5px" 
        }}>
          Panglao Tourist Data Management System
        </h4>
        <ul className="nav flex-column">
          {navItems.map(item => renderNavLink(item, true))}
        </ul>
        <div className="mt-4 p-3">
          <button 
            className="btn w-100" 
            style={{
              backgroundColor: "#FF6F00", 
              color: "#FFFFFF", 
              border: "none", 
              padding: 12,
              borderRadius: 8, 
              cursor: "pointer", 
              transition: "all 0.3s ease", 
              fontWeight: 600, 
              fontSize: "1rem", 
              letterSpacing: "0.5px"
            }} 
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Desktop sidebar (always visible) */}
      <div 
        className="d-none d-md-block col-md-3 sidebar" 
        style={{ 
          backgroundColor: "#E0F7FA", 
          minHeight: "50vh", 
          boxShadow: "2px 0 8px rgba(0,0,0,0.1)", 
          padding: "20px 0" 
        }}
      >
        <div className="sidebar-sticky">
        <div className="text-center mb-4" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img 
            src={TourismLogo} 
            alt="Tourism Logo" 
            style={{ width: "100px", height: "auto", padding: "5px" }} 
          />
        </div>
          <h4 className="sidebar-heading mb-4" style={{ 
            color: "#37474F", 
            fontWeight: "600", 
            textAlign: "center", 
            fontSize: "1.25rem", 
            letterSpacing: "0.5px" 
          }}>
            Panglao Tourist Data Management System
          </h4>
          <ul className="nav flex-column">
            {navItems.map(item => renderNavLink(item))}
          </ul>
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
                transition: "all 0.3s ease", 
                fontWeight: "600", 
                fontSize: "1rem", 
                letterSpacing: "0.5px"
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

export default AdminSidebar;