import React, { useState } from "react";
import { Edit2, Save, X } from "lucide-react";
const ProfileSection = ({ user, onUpdateRooms }) => {
  const [editingRooms, setEditingRooms] = useState(false);
  const [newNumberOfRooms, setNewNumberOfRooms] = useState(
    user?.number_of_rooms || "",
  );
  const handleUpdateRooms = async (e) => {
    e.preventDefault();
    await onUpdateRooms(newNumberOfRooms);
    setEditingRooms(false);
  };
  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-500 to-teal-500 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Profile Management</h1>
        </div>
        {user ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-cyan-100">
            {/* Profile Information */}
            <div className="divide-y divide-cyan-100">
              {/* Basic Info Section */}
              <div className="p-6 bg-gradient-to-r from-cyan-50/30 to-teal-50/30">
                <h2 className="text-lg font-semibold text-cyan-900 mb-4">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-cyan-600">
                      Username
                    </label>
                    <p className="mt-1 text-gray-900">{user.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-cyan-600">
                      Email
                    </label>
                    <p className="mt-1 text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-cyan-600">
                      Phone Number
                    </label>
                    <p className="mt-1 text-gray-900">{user.phone_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-cyan-600">
                      Registered Owner
                    </label>
                    <p className="mt-1 text-gray-900">
                      {user.registered_owner}
                    </p>
                  </div>
                </div>
              </div>
              {/* Company Info Section */}
              <div className="p-6 bg-gradient-to-r from-teal-50/30 to-cyan-50/30">
                <h2 className="text-lg font-semibold text-teal-900 mb-4">
                  Company Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-teal-600">
                      Company Name
                    </label>
                    <p className="mt-1 text-gray-900">{user.company_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-teal-600">
                      TIN
                    </label>
                    <p className="mt-1 text-gray-900">{user.tin}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-teal-600">
                      Company Address
                    </label>
                    <p className="mt-1 text-gray-900">{user.company_address}</p>
                  </div>
                </div>
              </div>
              {/* Accommodation Info Section */}
              <div className="p-6 bg-gradient-to-r from-cyan-50/30 to-teal-50/30">
                <h2 className="text-lg font-semibold text-cyan-900 mb-4">
                  Accommodation Details
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-cyan-600">
                      Accommodation Type
                    </label>
                    <p className="mt-1 text-gray-900">
                      {user.accommodation_type}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-cyan-600">
                          Number of Rooms
                        </label>
                        <p className="mt-1 text-gray-900">
                          {user.number_of_rooms}
                        </p>
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
                    {/* Edit Rooms Form */}
                    {editingRooms && (
                      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-100">
                        <h3 className="text-lg font-semibold text-cyan-900 mb-4">
                          Edit Number of Rooms
                        </h3>
                        <form
                          onSubmit={handleUpdateRooms}
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-sm font-medium text-cyan-700 mb-1">
                              Number of Rooms
                            </label>
                            <input
                              type="number"
                              value={newNumberOfRooms}
                              onChange={(e) =>
                                setNewNumberOfRooms(e.target.value)
                              }
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
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="space-y-3 mt-4">
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ProfileSection;
