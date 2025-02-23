import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";

// Define accommodationCodes object
const accommodationCodes = {
  Hotel: "HTL",
  Condotel: "CON",
  "Serviced Residence": "SER",
  Resort: "RES",
  Apartelle: "APA",
  Motel: "MOT",
  "Pension House": "PEN",
  "Home Stay Site": "HSS",
  "Tourist Inn": "TIN",
  Other: "OTH",
};

const UserApproval = ({
  users,
  setUsers,
  selectedUserId,
  declineMessage,
  showDeleteModal,
  userToDelete,
  approveUser,
  setSelectedUserId,
  declineUser,
  setDeclineMessage,
  handleDeleteClick,
  deleteUser,
  setShowDeleteModal,
}) => {
  const [editingAccommodation, setEditingAccommodation] = useState(null); // Track user being edited
  const [newAccommodationType, setNewAccommodationType] = useState(""); // Track new accommodation type

  // Handle accommodation type update
  const handleUpdateAccommodation = async (userId) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/admin/update-accommodation/${userId}`,
        { accommodation_type: newAccommodationType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the users list
      const updatedUsers = users.map((user) =>
        user.user_id === userId
          ? {
              ...user,
              accommodation_type: newAccommodationType,
              accommodation_code: accommodationCodes[newAccommodationType] || "OTH", // Use accommodationCodes
            }
          : user
      );
      setUsers(updatedUsers);

      // Reset editing state
      setEditingAccommodation(null);
      setNewAccommodationType("");
    } catch (err) {
      console.error("Error updating accommodation type:", err);
    }
  };

  // Accommodation type options
  const accommodationTypes = [
    "Hotel",
    "Condotel",
    "Serviced Residence",
    "Resort",
    "Apartelle",
    "Motel",
    "Pension House",
    "Home Stay Site",
    "Tourist Inn",
    "Other",
  ];

  return (
    <div>
      <h2>User Approval</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Company Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Registered Owner</th>
            <th>TIN</th>
            <th>Company Address</th>
            <th>Accommodation Type</th>
            <th>Accommodation Code</th>
            <th>Number of Rooms</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id}>
              <td>{user.username}</td>
              <td>{user.company_name}</td>
              <td>{user.email}</td>
              <td>{user.phone_number}</td>
              <td>{user.registered_owner}</td>
              <td>{user.tin}</td>
              <td>{user.company_address}</td>
              <td>
                {editingAccommodation === user.user_id ? (
                  <select
                    className="form-control"
                    value={newAccommodationType}
                    onChange={(e) => setNewAccommodationType(e.target.value)}
                  >
                    {accommodationTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                ) : (
                  user.accommodation_type
                )}
              </td>
              <td>{user.accommodation_code}</td>
              <td>{user.number_of_rooms}</td>
              <td>{user.is_approved ? "Approved" : "Pending"}</td>
              <td>
                {!user.is_approved ? (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => approveUser(user.user_id)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => setSelectedUserId(user.user_id)}
                    >
                      Decline
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setEditingAccommodation(user.user_id);
                        setNewAccommodationType(user.accommodation_type);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteClick(user.user_id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Save Button for Editing Accommodation Type */}
      {editingAccommodation && (
        <div className="mt-3">
          <button
            className="btn btn-success"
            onClick={() => handleUpdateAccommodation(editingAccommodation)}
          >
            Save Changes
          </button>
          <button
            className="btn btn-secondary ms-2"
            onClick={() => setEditingAccommodation(null)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Modal for Decline Message */}
      {selectedUserId && (
        <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Decline User</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setSelectedUserId(null)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <textarea
                  className="form-control"
                  placeholder="Enter reason for declining..."
                  value={declineMessage}
                  onChange={(e) => setDeclineMessage(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedUserId(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => declineUser(selectedUserId)}
                >
                  Confirm Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Delete Confirmation */}
      {showDeleteModal && (
        <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete User</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowDeleteModal(false)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this user?</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => deleteUser(userToDelete)}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserApproval;