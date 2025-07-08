import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import ProfileSection from "../components/ProfileSection";
import SubmissionInput from "../components/SubmissionInput";
import SubmissionHistory from "../components/SubmissionHistory";
import HelpSupport from "../components/HelpSupport";
import Ordinance from "../components/Ordinance";
import MainDashboard from "../../admin/pages/MainDashboard";
import '../../components/MenuButton.css';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const UserDashboard = () => {
  const [user, setUser] = useState(null),
    [activeSection, setActiveSection] = useState("dashboard"),
    [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const token = sessionStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE_URL}/auth/user`, { headers: { Authorization: `Bearer ${token}` } });
        setUser(data);
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    })();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  const handleUpdateRooms = async newNumberOfRooms => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/auth/update-rooms`, { number_of_rooms: newNumberOfRooms }, { headers: { Authorization: `Bearer ${token}` } });
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
          <div className="col-md-9">
            <div className="p-4">
              {activeSection === "dashboard" && <Ordinance />}
              {activeSection === "submission-input" && <SubmissionInput />}
              {activeSection === "submission-history" && <SubmissionHistory user={user} />}
              {activeSection === "profile-management" && <ProfileSection user={user} onUpdateRooms={handleUpdateRooms} />}
              {activeSection === "admin-dashboard" && <MainDashboard />}
              {activeSection === "help-support" && <HelpSupport />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;