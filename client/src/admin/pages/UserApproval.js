import React from "react";
import { Modal, Button } from "react-bootstrap";

const UserApproval = ({
  users,
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
              <td>{user.accommodation_type}</td>
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
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteClick(user.user_id)}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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