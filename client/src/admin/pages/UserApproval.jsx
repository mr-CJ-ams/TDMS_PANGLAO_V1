import { useState, useMemo } from "react";
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
  const [searchTerm, setSearchTerm] = useState(""),
    [activeFilter, setActiveFilter] = useState("all"),
    [sortDirection, setSortDirection] = useState("asc"),
    [showDeactivateModal, setShowDeactivateModal] = useState(false),
    [userToDeactivate, setUserToDeactivate] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const filteredAndSortedUsers = useMemo(() =>
    users
      .filter(u => (u.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()) &&
        (activeFilter === "all" ||
          (activeFilter === "pending" && !u.is_approved) ||
          (activeFilter === "approved" && u.is_approved)))
      .sort((a, b) => {
        const cmp = (a.company_name || "").localeCompare(b.company_name || "");
        return sortDirection === "asc" ? cmp : -cmp;
      }), [users, searchTerm, activeFilter, sortDirection]);

  const activeUsers = filteredAndSortedUsers.filter(u => u.is_active),
    deactivatedUsers = filteredAndSortedUsers.filter(u => !u.is_active);

  const handleDeactivateClick = userId => { setUserToDeactivate(userId); setShowDeactivateModal(true); };

  const formatDate = dateString => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  };

  const deactivateUser = async userId => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/deactivate/${userId}`, { method: "PUT", headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      if (res.ok) {
        alert("User deactivated successfully");
        setShowDeactivateModal(false);
        // To update users in parent, pass a setUsers prop and call it here if needed
      } else alert(`Failed to deactivate user: ${data.message || "Unknown error"}`);
    } catch (error) {
      console.error("Error deactivating user:", error);
      alert("An error occurred while deactivating the user");
    }
  };

  const userTable = (userList, isActive) => (
    <table className="w-full">
      <thead>
        <tr className="bg-sky-100 text-sky-900">
          <th className="p-4 text-left font-medium cursor-pointer" onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}>
            <div className="flex items-center gap-2">
              Company Name {sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </th>
          {["Username", "Email", "Phone Number", "Registered Owner", "TIN", "Region", "Province", "Municipality", "Barangay", "Date Established", "Accommodation Type", "Accommodation Code", "Number of Rooms", "Status"]
            .map(h => <th key={h} className="p-4 text-left font-medium">{h}</th>)}
          {isActive && <th className="p-4 text-left font-medium">Actions</th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-sky-100">
        {userList.length === 0 ? (
          <tr>
            <td colSpan={isActive ? 16 : 15} className="p-4 text-center text-gray-500">
              {isActive ? "No active users found matching your criteria" : "No deactivated users found"}
            </td>
          </tr>
        ) : userList.map(user => (
          <tr key={user.user_id} className="hover:bg-sky-50 transition-colors">
            <td className="p-4 font-medium">{user.company_name || "N/A"}</td>
            <td className="p-4">{user.username}</td>
            <td className="p-4">{user.email}</td>
            <td className="p-4">{user.phone_number}</td>
            <td className="p-4">{user.registered_owner}</td>
            <td className="p-4">{user.tin}</td>
            <td className="p-4">{user.region || "N/A"}</td>
            <td className="p-4">{user.province || "N/A"}</td>
            <td className="p-4">{user.municipality || "N/A"}</td>
            <td className="p-4">{user.barangay || "N/A"}</td>
            <td className="p-4">{formatDate(user.date_established)}</td>
            <td className="p-4">{user.accommodation_type}</td>
            <td className="p-4">{user.accommodation_code}</td>
            <td className="p-4">{user.number_of_rooms}</td>
            <td className="p-4">
              <span className={`px-3 py-1 rounded-full text-sm ${
                isActive
                  ? user.is_approved
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-700"
              }`}>
                {isActive ? (user.is_approved ? "Approved" : "Pending") : "Deactivated"}
              </span>
            </td>
            {isActive && (
              <td className="p-4">
                {!user.is_approved ? (
                  <div className="space-x-2">
                    <button onClick={() => approveUser(user.user_id)} className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors">Approve</button>
                    <button onClick={() => setSelectedUserId(user.user_id)} className="px-4 py-2 bg-rose-500 text-white rounded hover:bg-rose-600 transition-colors">Decline</button>
                  </div>
                ) : (
                  <button onClick={() => handleDeactivateClick(user.user_id)} className="px-4 py-2 bg-rose-500 text-white rounded hover:bg-rose-600 transition-colors">Deactivate</button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white p-8">
      <h2 className="text-3xl font-semibold text-sky-900 mb-8">User Approval</h2>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search by company name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition-all" />
        </div>
        <div className="flex gap-2">
          {["all", "pending", "approved"].map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeFilter === f
                  ? f === "all"
                    ? "bg-sky-500 text-white"
                    : f === "pending"
                    ? "bg-amber-500 text-white"
                    : "bg-emerald-500 text-white"
                  : f === "all"
                  ? "bg-white text-gray-600 hover:bg-sky-50"
                  : f === "pending"
                  ? "bg-white text-gray-600 hover:bg-amber-50"
                  : "bg-white text-gray-600 hover:bg-emerald-50"
              }`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4 text-sky-900 font-medium">
        Showing {activeUsers.length} active {activeUsers.length === 1 ? "user" : "users"}
        {deactivatedUsers.length > 0 && (
          <span className="text-gray-500 ml-2">({deactivatedUsers.length} deactivated)</span>
        )}
      </div>
      <div className="overflow-x-auto rounded-lg shadow-lg bg-white mb-8">{userTable(activeUsers, true)}</div>
      <h3 className="text-2xl font-semibold text-sky-900 mb-4">Deactivated Accounts</h3>
      <div className="overflow-x-auto rounded-lg shadow-lg bg-white">{userTable(deactivatedUsers, false)}</div>
      {/* Decline User Modal */}
      {selectedUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-sky-900">Decline User</h3>
                <button onClick={() => setSelectedUserId(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>
              <textarea className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-500 transition-all"
                placeholder="Enter reason for declining..." value={declineMessage} onChange={e => setDeclineMessage(e.target.value)} rows={4} />
              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setSelectedUserId(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={() => { declineUser(selectedUserId); setSelectedUserId(null); }}
                  className="px-4 py-2 bg-rose-500 text-white rounded hover:bg-rose-600 transition-colors">Confirm Decline</button>
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
                <h3 className="text-xl font-semibold text-sky-900">Deactivate User</h3>
                <button onClick={() => setShowDeactivateModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>
              <p className="text-gray-600 mb-6">Are you sure you want to deactivate this user?</p>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowDeactivateModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={() => deactivateUser(userToDeactivate)} className="px-4 py-2 bg-rose-500 text-white rounded hover:bg-rose-600 transition-colors">Confirm Deactivate</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserApproval;