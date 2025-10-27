/**
 * UserDashboard.jsx
 * 
 * Panglao Tourist Data Management System - User Dashboard Page (Frontend)
 * 
 * =========================
 * Overview:
 * =========================
 * This React component serves as the main dashboard for regular users in the Panglao TDMS frontend.
 * It provides navigation and access to all major user features, including statistics, submissions, profile management, and help/support.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Fetches and manages the authenticated user's data from the backend.
 * - Handles sidebar navigation and active section state.
 * - Renders the appropriate page/component based on the selected sidebar section.
 * - Supports user logout and session management.
 * - Allows users to update their accommodation details (e.g., number of rooms).
 * 
 * =========================
 * Key Features:
 * =========================
 * - Responsive sidebar navigation for switching between dashboard sections.
 * - Integrates with backend authentication via JWT stored in sessionStorage.
 * - Modular rendering of user features: homepage, submissions, statistics, profile, and help.
 * - Includes access to the Panglao Statistics section (via MainDashboard) for authenticated users.
 * - Uses axios for API communication and React Router for navigation.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Accessed by authenticated users after login.
 * - Provides the main interface for users to interact with the TDMS system.
 * - Allows users to view statistics, submit monthly data, review submission history, and manage their profile.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - Add new dashboard sections by updating the sidebar and main content render logic.
 * - Ensure backend endpoints are protected and return the necessary user data.
 * - For admin-only features, restrict access or hide sections as needed.
 * - Update the sidebar and activeSection logic to support new features.
 * 
 * =========================
 * Related Files:
 * =========================
 * - src/user/components/Sidebar.jsx         (sidebar navigation)
 * - src/user/components/ProfileSection.jsx  (profile management)
 * - src/user/components/SubmissionForm.jsx  (submission input)
 * - src/user/components/SubmissionHistory.jsx (submission history)
 * - src/user/components/UserStatistics.jsx  (user statistics)
 * - src/admin/pages/MainDashboard.tsx       (Panglao Statistics section)
 * - server/controllers/authController.js    (backend user data logic)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import ProfileSection from "./ProfileSection";
import SubmissionForm from "./SubmissionForm";
import SubmissionHistory from "./SubmissionHistory";
import UserStatistics from "./UserStatistics";
import HelpSupport from "../components/HelpSupport";
import Homepage from "../components/Homepage";
import MainDashboard from "../../admin/pages/MainDashboard";
import '../../components/MenuButton.css';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const UserDashboard = () => {
  const [user, setUser] = useState(null),
    [activeSection, setActiveSection] = useState("home"),
    [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Add this line to define token
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/auth/user`, { headers: { Authorization: `Bearer ${token}` } });
        setUser(data);
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    })();
  }, [token]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  const handleUpdateRooms = async newNumberOfRooms => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/api/auth/update-rooms`, { number_of_rooms: newNumberOfRooms }, { headers: { Authorization: `Bearer ${token}` } });
      setUser(u => ({ ...u, number_of_rooms: newNumberOfRooms }));
    } catch (err) {
      console.error("Error updating number of rooms:", err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 0' }}>
        <button
          className="menu-toggle-btn d-md-none"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <i className={`bi ${sidebarOpen ? 'bi-x-lg' : 'bi-list'}`} style={{ fontSize: 32, color: '#00BCD4' }}></i>
        </button>
      </div>
      <div className="container-fluid">
        <div className="row">
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} activeSection={activeSection} setActiveSection={setActiveSection} handleLogout={handleLogout} user={user} />
          <div
            className="main-content"
            style={{
              marginLeft: 0,
              transition: "margin-left 0.3s",
              ...(window.innerWidth >= 768 && { marginLeft: "25vw", maxWidth: "75vw" }), // 25vw matches your sidebar width
            }}
          >
            <div className="p-4">
              {activeSection === "home" && <Homepage />}
              {activeSection === "submission-input" && <SubmissionForm />}
              {activeSection === "submission-history" && <SubmissionHistory user={user} />}
              {activeSection === "user-statistics" && <UserStatistics user={user} />}
              {activeSection === "profile-management" && <ProfileSection user={user} onUpdateRooms={handleUpdateRooms} token={token}/>}
              {activeSection === "admin-dashboard" && <MainDashboard user={user} />}
              {activeSection === "help-support" && <HelpSupport />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
