import React, { useState, useMemo } from "react";
import { X, Search, ChevronUp, ChevronDown } from "lucide-react";

const UserApproval = ({
  users,
  selectedUserId,
  declineMessage,
  approveUser,
  setSelectedUserId,
  declineUser,
  setDeclineMessage,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // "all", "pending", or "approved"
  const [sortDirection, setSortDirection] = useState("asc"); // "asc" or "desc"
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  // Filter and sort all users
  const filteredAndSortedUsers = useMemo(() => {
    return users
      .filter((user) => {
        const companyName = user.company_name || "";
        const matchesSearch = companyName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        
        const matchesFilter =
          activeFilter === "all" ||
          (activeFilter === "pending" && !user.is_approved) ||
          (activeFilter === "approved" && user.is_approved);
        
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        const companyNameA = a.company_name || "";
        const companyNameB = b.company_name || "";
        const comparison = companyNameA.localeCompare(companyNameB);
        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [users, searchTerm, activeFilter, sortDirection]);

  // Separate into active and deactivated for display
  const activeUsers = filteredAndSortedUsers.filter(user => user.is_active);
  const deactivatedUsers = filteredAndSortedUsers.filter(user => !user.is_active);

  const handleDeactivateClick = (userId) => {
    setUserToDeactivate(userId); // Set the user to deactivate
    setShowDeactivateModal(true); // Show the deactivation modal
  };

  // Utility function to format date as "Day-Month-Year"
const formatDate = (dateString) => {
  if (!dateString) return "N/A"; // Handle null or undefined dates

  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0"); // Ensure two digits
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

  const deactivateUser = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/deactivate/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Response:", data); // Log the response

      if (response.ok) {
        alert("User deactivated successfully");
        setShowDeactivateModal(false); // Close the modal

        // Update the users state locally
        const updatedUsers = users.map((user) =>
          user.user_id === userId ? { ...user, is_active: false } : user
        );
        // Assuming `users` is passed as a prop and can be updated
        // If not, you need to pass a function from the parent to update the users list
      } else {
        alert(`Failed to deactivate user: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deactivating user:", error);
      alert("An error occurred while deactivating the user");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white p-8">
      <h2 className="text-3xl font-semibold text-sky-900 mb-8">User Approval</h2>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by company name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === "all"
                ? "bg-sky-500 text-white"
                : "bg-white text-gray-600 hover:bg-sky-50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter("pending")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === "pending"
                ? "bg-amber-500 text-white"
                : "bg-white text-gray-600 hover:bg-amber-50"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveFilter("approved")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeFilter === "approved"
                ? "bg-emerald-500 text-white"
                : "bg-white text-gray-600 hover:bg-emerald-50"
            }`}
          >
            Approved
          </button>
        </div>
      </div>

      {/* Display the number of active users */}
      <div className="mb-4 text-sky-900 font-medium">
        Showing {activeUsers.length} active {activeUsers.length === 1 ? "user" : "users"} 
        {deactivatedUsers.length > 0 && (
          <span className="text-gray-500 ml-2">
            ({deactivatedUsers.length} deactivated)
          </span>
        )}
      </div>

      {/* Active Users Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg bg-white mb-8">
        <table className="w-full">
          <thead>
            <tr className="bg-sky-100 text-sky-900">
              <th
                className="p-4 text-left font-medium cursor-pointer"
                onClick={() =>
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                }
              >
                <div className="flex items-center gap-2">
                  Company Name
                  {sortDirection === "asc" ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </div>
              </th>
              <th className="p-4 text-left font-medium">Username</th>
              <th className="p-4 text-left font-medium">Email</th>
              <th className="p-4 text-left font-medium">Phone Number</th>
              <th className="p-4 text-left font-medium">Registered Owner</th>
              <th className="p-4 text-left font-medium">TIN</th>
              <th className="p-4 text-left font-medium">Region</th> {/* Add this line */}
              <th className="p-4 text-left font-medium">Province</th> {/* Add this line */}
              <th className="p-4 text-left font-medium">Municipality</th> {/* Add this line */}
              <th className="p-4 text-left font-medium">Barangay</th> 
              <th className="p-4 text-left font-medium">Date Established</th>
              <th className="p-4 text-left font-medium">Accommodation Type</th>
              <th className="p-4 text-left font-medium">Accommodation Code</th>
              <th className="p-4 text-left font-medium">Number of Rooms</th>
              <th className="p-4 text-left font-medium">Status</th>
              <th className="p-4 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-100">
            {activeUsers.length === 0 ? (
              <tr>
                <td colSpan={12} className="p-4 text-center text-gray-500">
                  No active users found matching your criteria
                </td>
              </tr>
            ) : (
              activeUsers.map((user) => (
                <tr
                  key={user.user_id}
                  className="hover:bg-sky-50 transition-colors"
                >
                  <td className="p-4 font-medium">{user.company_name || "N/A"}</td>
                  <td className="p-4">{user.username}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.phone_number}</td>
                  <td className="p-4">{user.registered_owner}</td>
                  <td className="p-4">{user.tin}</td>
                  {/* <td className="p-4">{user.company_address}</td> */}
                  <td className="p-4">{user.region || "N/A"}</td> {/* Add this line */}
                  <td className="p-4">{user.province || "N/A"}</td> {/* Add this line */}
                  <td className="p-4">{user.municipality || "N/A"}</td> {/* Add this line */}
                  <td className="p-4">{user.barangay || "N/A"}</td> {/* Add this line */}
                  <td className="p-4">{formatDate(user.date_established)}</td>
                  <td className="p-4">{user.accommodation_type}</td>
                  <td className="p-4">{user.accommodation_code}</td>
                  <td className="p-4">{user.number_of_rooms}</td>
                  
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        user.is_approved
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {user.is_approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="p-4">
                    {!user.is_approved ? (
                      <div className="space-x-2">
                        <button
                          onClick={() => approveUser(user.user_id)}
                          className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setSelectedUserId(user.user_id)}
                          className="px-4 py-2 bg-rose-500 text-white rounded hover:bg-rose-600 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDeactivateClick(user.user_id)}
                        className="px-4 py-2 bg-rose-500 text-white rounded hover:bg-rose-600 transition-colors"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Deactivated Users Section */}
      <h3 className="text-2xl font-semibold text-sky-900 mb-4">Deactivated Accounts</h3>
      <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
        <table className="w-full">
          <thead>
            <tr className="bg-sky-100 text-sky-900">
              <th className="p-4 text-left font-medium">Company Name</th>
              <th className="p-4 text-left font-medium">Username</th>
              <th className="p-4 text-left font-medium">Email</th>
              <th className="p-4 text-left font-medium">Phone Number</th>
              <th className="p-4 text-left font-medium">Registered Owner</th>
              <th className="p-4 text-left font-medium">TIN</th>
              <th className="p-4 text-left font-medium">Region</th> {/* Add this line */}
              <th className="p-4 text-left font-medium">Province</th> {/* Add this line */}
              <th className="p-4 text-left font-medium">Municipality</th> {/* Add this line */}
              <th className="p-4 text-left font-medium">Barangay</th> 
              <th className="p-4 text-left font-medium">Date Established</th>
              <th className="p-4 text-left font-medium">Accommodation Type</th>
              <th className="p-4 text-left font-medium">Accommodation Code</th>
              <th className="p-4 text-left font-medium">Number of Rooms</th>
              <th className="p-4 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-100">
            {deactivatedUsers.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-4 text-center text-gray-500">
                  No deactivated users found
                </td>
              </tr>
            ) : (
              deactivatedUsers.map((user) => (
                <tr
                  key={user.user_id}
                  className="hover:bg-sky-50 transition-colors"
                >
                  <td className="p-4 font-medium">{user.company_name || "N/A"}</td>
                  <td className="p-4">{user.username}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.phone_number}</td>
                  <td className="p-4">{user.registered_owner}</td>
                  <td className="p-4">{user.tin}</td>
                  {/* <td className="p-4">{user.company_address}</td> */}
                  <td className="p-4">{user.region || "N/A"}</td> {/* Add this line */}
                  <td className="p-4">{user.province || "N/A"}</td> {/* Add this line */}
                  <td className="p-4">{user.municipality || "N/A"}</td> {/* Add this line */}
                  <td className="p-4">{user.barangay || "N/A"}</td> {/* Add this line */}
                  <td className="p-4">{formatDate(user.date_established)}</td>
                  <td className="p-4">{user.accommodation_type}</td>
                  <td className="p-4">{user.accommodation_code}</td>
                  <td className="p-4">{user.number_of_rooms}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                      Deactivated
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Decline User Modal */}
      {selectedUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-sky-900">
                  Decline User
                </h3>
                <button
                  onClick={() => setSelectedUserId(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <textarea
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition-all"
                placeholder="Enter reason for declining..."
                value={declineMessage}
                onChange={(e) => setDeclineMessage(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setSelectedUserId(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    declineUser(selectedUserId); // Call the declineUser function
                    setSelectedUserId(null); // Close the modal
                  }}
                  className="px-4 py-2 bg-rose-500 text-white rounded hover:bg-rose-600 transition-colors"
                >
                  Confirm Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate User Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-sky-900">
                  Deactivate User
                </h3>
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to deactivate this user?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deactivateUser(userToDeactivate)}
                  className="px-4 py-2 bg-rose-500 text-white rounded hover:bg-rose-600 transition-colors"
                >
                  Confirm Deactivate
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