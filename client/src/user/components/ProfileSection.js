import React, { useState } from "react";

const ProfileSection = ({ user, onUpdateRooms }) => {
  const [editingRooms, setEditingRooms] = useState(false);
  const [newNumberOfRooms, setNewNumberOfRooms] = useState(user?.number_of_rooms || "");

  const handleUpdateRooms = async (e) => {
    e.preventDefault();
    await onUpdateRooms(newNumberOfRooms);
    setEditingRooms(false);
  };

  return (
    <div>
      <h3>Profile Management</h3>
      {user ? (
        <div>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone Number:</strong> {user.phone_number}</p>
          <p><strong>Registered Owner:</strong> {user.registered_owner}</p>
          <p><strong>TIN:</strong> {user.tin}</p>
          <p><strong>Company Name:</strong> {user.company_name}</p>
          <p><strong>Company Address:</strong> {user.company_address}</p>
          <p><strong>Accommodation Type:</strong> {user.accommodation_type}</p>
          <p>
            <strong>Number of Rooms:</strong> {user.number_of_rooms}{" "}
            <button
              className="btn btn-sm btn-primary"
              onClick={() => setEditingRooms(true)}
            >
              Edit
            </button>
          </p>

          {editingRooms && (
            <div className="mt-3">
              <h4>Edit Number of Rooms</h4>
              <form onSubmit={handleUpdateRooms}>
                <div className="mb-3">
                  <label className="form-label">Number of Rooms</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newNumberOfRooms}
                    onChange={(e) => setNewNumberOfRooms(e.target.value)}
                    min="1"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={() => setEditingRooms(false)}
                >
                  Cancel
                </button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <p>Loading user details...</p>
      )}
    </div>
  );
};

export default ProfileSection;