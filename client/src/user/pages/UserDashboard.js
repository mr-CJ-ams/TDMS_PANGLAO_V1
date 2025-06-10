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

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const UserDashboard = () => {
  const [user, setUser] = useState(null),
    [activeSection, setActiveSection] = useState("dashboard");
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
    <div className="container-fluid">
      <div className="row">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} handleLogout={handleLogout} user={user} />
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
  );
};

export default UserDashboard;