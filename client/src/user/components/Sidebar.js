import React from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ activeSection, setActiveSection, handleLogout, user }) => {
  return (
    <div className="col-md-3 bg-light sidebar">
      <div className="sidebar-sticky">
        <div className="text-center mt-3">
          {user?.profile_picture ? (
            <img
              src={user.profile_picture}
              alt="Profile"
              className="rounded-circle"
              style={{ width: "100px", height: "100px", objectFit: "cover" }}
            />
          ) : (
            <div
              className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
              style={{ width: "100px", height: "100px" }}
            >
              <span className="text-white">No Image</span>
            </div>
          )}
          <h4 className="mt-3">{user?.company_name}</h4>
        </div>

        <ul className="nav flex-column mt-4">
          <li className="nav-item">
            <Link
              to="#"
              className={`nav-link ${activeSection === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveSection("dashboard")}
            >
              Main Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="#"
              className={`nav-link ${activeSection === "submission-input" ? "active" : ""}`}
              onClick={() => setActiveSection("submission-input")}
            >
              Submission Input
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="#"
              className={`nav-link ${activeSection === "submission-history" ? "active" : ""}`}
              onClick={() => setActiveSection("submission-history")}
            >
              Submission History
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="#"
              className={`nav-link ${activeSection === "profile-management" ? "active" : ""}`}
              onClick={() => setActiveSection("profile-management")}
            >
              Profile Management
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="#"
              className={`nav-link ${activeSection === "help-support" ? "active" : ""}`}
              onClick={() => setActiveSection("help-support")}
            >
              Help and Support
            </Link>
          </li>
        </ul>

        <div className="mt-4 p-3">
          <button className="btn btn-danger w-100" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;