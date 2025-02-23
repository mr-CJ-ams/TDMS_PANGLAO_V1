import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import ProfileSection from "../components/ProfileSection";
import SubmissionInput from "../components/SubmissionInput";
import SubmissionHistory from "../components/SubmissionHistory";
import HelpSupport from "../components/HelpSupport";

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [profilePicture, setProfilePicture] = useState(null);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        setProfilePicture(response.data.profile_picture);
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };

    fetchUserDetails();
  }, []);

  // Logout function
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  // Handle updating the number of rooms
  const handleUpdateRooms = async (newNumberOfRooms) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/auth/update-rooms`,
        { number_of_rooms: newNumberOfRooms },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser({ ...user, number_of_rooms: newNumberOfRooms });
    } catch (err) {
      console.error("Error updating number of rooms:", err);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          handleLogout={handleLogout}
          user={user}
        />

        <div className="col-md-9">
          <div className="p-4">
            <h2>User Dashboard</h2>

            {activeSection === "dashboard" && <div></div>}

            {activeSection === "submission-input" && <SubmissionInput />}

            {activeSection === "submission-history" && <SubmissionHistory user={user} />}

            {activeSection === "profile-management" && (
              <ProfileSection user={user} onUpdateRooms={handleUpdateRooms} />
            )}

            {activeSection === "help-support" && <HelpSupport />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;