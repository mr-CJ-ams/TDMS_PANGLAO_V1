/**
 * ProfileSection.jsx
 * 
 * Panglao Tourist Data Management System - User Profile Section Component (Frontend)
 * 
 * =========================
 * Overview:
 * =========================
 * This React component displays and manages the authenticated user's profile information in the user dashboard.
 * It organizes user data into clear sections: basic info, company details, location, and accommodation details.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Renders user profile fields such as email, phone, owner, company, TIN, region, province, municipality, barangay, and date established.
 * - Allows users to view and edit the number of rooms in their accommodation.
 * - Handles form submission for updating the number of rooms, calling the provided onUpdateRooms callback.
 * - Provides loading skeleton UI when user data is not yet available.
 * - Formats dates for display in a user-friendly format.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Modular section layout for improved readability and maintainability.
 * - Inline editing of the number of rooms with validation and cancel/save controls.
 * - Responsive design using Tailwind CSS utility classes.
 * - Uses Lucide icons for edit, save, and cancel actions.
 * - Helper components (Section, Grid2, Field) for DRY and consistent UI.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Used in the UserDashboard.jsx as the main profile display and edit section.
 * - Allows users to keep their accommodation details up to date.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - Extend this component to support additional editable fields or profile features.
 * - Ensure the onUpdateRooms callback updates the backend and user state correctly.
 * - Update styling or layout as needed for new requirements or branding.
 * 
 * =========================
 * Related Files:
 * =========================
 * - src/user/pages/UserDashboard.jsx         (renders ProfileSection)
 * - server/controllers/authController.js     (handles backend profile update logic)
 * - server/routes/auth.js                    (defines backend profile update route)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

import React, { useState } from "react";
import { Edit2, Save, X } from "lucide-react";
import { authAPI } from "../../services/api";

const ProfileSection = ({ user, onUpdateRooms, token }) => {
  const [editingRooms, setEditingRooms] = useState(false);
  const [newNumberOfRooms, setNewNumberOfRooms] = useState(
    user?.number_of_rooms || "",
  );

  const handleUpdateRooms = async (e) => {
    e.preventDefault();
    try {
      await authAPI.updateRooms(parseInt(newNumberOfRooms));
      await onUpdateRooms(newNumberOfRooms);
      setEditingRooms(false);
    } catch (error) {
      console.error("Error updating rooms:", error);
      // You might want to show an error message to the user here
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
  };

  if (!user)
    return (
      <div className="min-h-screen bg-gradient-to-r from-cyan-500 to-teal-500 p-6 flex items-center">
        <div className="max-w-4xl mx-auto w-full bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="space-y-3 mt-4">
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-500 to-teal-500 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-cyan-100">
          <div className="divide-y divide-cyan-100">
            {/* Basic Info */}
            <Section title="Basic Information">
              <Grid2>
                <Field label="Email" value={user.email} />
                <Field label="Phone Number" value={user.phone_number} />
                <Field label="Registered Owner" value={user.registered_owner} />
              </Grid2>
            </Section>
            {/* Company Info */}
            <Section title="Establishment Details" color="teal">
              <Grid2>
                <Field
                  label="Establishment Name"
                  value={user.company_name}
                  color="teal"
                />
                <Field label="TIN" value={user.tin} color="teal" />
                {/* <Field label="Company Address" value={user.company_address} color="teal" /> */}
              </Grid2>
            </Section>
            {/* Location Info */}
            <Section title="Location Details">
              <Grid2>
                <Field label="Region" value={user.region} />
                <Field label="Province" value={user.province} />
                <Field label="Municipality" value={user.municipality} />
                <Field label="Barangay" value={user.barangay} />
                <Field
                  label="Date Established"
                  value={formatDate(user.date_established)}
                />
              </Grid2>
            </Section>
            {/* Accommodation Info */}
            <Section title="Accommodation Details">
              <div className="space-y-6">
                <Field label="Accommodation Type" value={user.accommodation_type} />
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-cyan-600">
                        Number of Rooms
                      </label>
                      <p className="mt-1 text-gray-900">{user.number_of_rooms}</p>
                    </div>
                    {!editingRooms && (
                      <button
                        onClick={() => setEditingRooms(true)}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-teal-600 hover:bg-teal-50 transition-colors border border-teal-200"
                      >
                        <Edit2 className="w-4 h-4 mr-1.5" />
                        Edit Rooms
                      </button>
                    )}
                  </div>
                  {editingRooms && (
                    <form
                      onSubmit={handleUpdateRooms}
                      className="mt-4 p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-100 space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-cyan-700 mb-1">
                          Number of Rooms
                        </label>
                        <input
                          type="number"
                          value={newNumberOfRooms}
                          onChange={(e) => setNewNumberOfRooms(e.target.value)}
                          min="1"
                          required
                          className="w-full px-4 py-2 rounded-lg border border-cyan-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                        />
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 transition-all"
                        >
                          <Save className="w-4 h-4 mr-1.5" />
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingRooms(false)}
                          className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all"
                        >
                          <X className="w-4 h-4 mr-1.5" />
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper components for brevity and DRYness
const Section = ({ title, children, color }) => (
  <div
    className={`p-6 bg-gradient-to-r from-${
      color || "cyan"
    }-50/30 to-${color === "teal" ? "cyan" : "teal"}-50/30`}
  >
    <h2 className={`text-lg font-semibold text-${color || "cyan"}-900 mb-4`}>
      {title}
    </h2>
    {children}
  </div>
);

const Grid2 = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
);

const Field = ({ label, value, color }) => (
  <div>
    <label className={`text-sm font-medium text-${color || "cyan"}-600`}>
      {label}
    </label>
    <p className="mt-1 text-gray-900">{value}</p>
  </div>
);

export default ProfileSection;
