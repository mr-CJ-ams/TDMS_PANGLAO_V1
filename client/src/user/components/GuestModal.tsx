import { useState } from "react";
import nationalities from "./Nationality";
import { Trash2, PlusIcon, X, Edit, Save, X as CancelIcon, Copy, Clock, Trash } from "lucide-react"; // Add Clock icon

interface GuestModalProps {
  day: number;
  room: number;
  onClose: () => void;
  onSave: (day: number, room: number, data: any) => Promise<boolean>;
  onRemoveAllGuests: (day: number, room: number) => Promise<void>; // Make it return Promise<void>
  initialData?: any;
  disabled: boolean;
  hasRoomConflict: (day: number, room: number, lengthOfStay: number, occupiedRooms: any[]) => boolean;
  occupiedRooms: any[];
  selectedYear: number;
  selectedMonth: number;
  onChange?: (hasChanges: boolean) => void;
  roomNames?: string[];
}

const GuestModal = ({
  day,
  room,
  onClose,
  onSave,
  onRemoveAllGuests,
  initialData,
  disabled,
  onChange,
  roomNames = []
}: GuestModalProps) => {
  const MAX_LENGTH_OF_STAY = 183;
   const roomName = roomNames[room - 1] || `Room ${room}`;

  const [guests, setGuests] = useState(
    initialData?.guests?.map(g => ({
      ...g,
      lengthOfStay: g.lengthOfStay?.toString() || "",
      isCheckIn: g.isCheckIn !== false,
      _saved: true,
      _isStartDay: g._isStartDay !== false, // <-- use saved value
      _stayId: g._stayId,                   // <-- use saved value
      _startDay: g._startDay,
      _startMonth: g._startMonth,
      _startYear: g._startYear,
      _editing: false,
      _originalData: null,
    })) || []
  );
  const [error, setError] = useState("");
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    message: string;
    onConfirm: () => void;
  }>({ show: false, message: "", onConfirm: () => {} });

  // Add state for global remove confirmation
  const [globalRemoveModal, setGlobalRemoveModal] = useState(false);
  const [savingGuestIndex, setSavingGuestIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [removingAllGuests, setRemovingAllGuests] = useState(false);
  // New state for confirming removal of a guest and setting length of stay to 1 day
  const [confirmOneDayModal, setConfirmOneDayModal] = useState<{
    show: boolean;
    guestIndex: number | null;
  }>({ show: false, guestIndex: null });

  // Copy guest ID to clipboard
  const copyGuestId = (guestId: string) => {
    navigator.clipboard.writeText(guestId).then(() => {
      console.log("Guest ID copied to clipboard:", guestId);
    }).catch(err => {
      console.error("Failed to copy guest ID:", err);
    });
  };

  // Global Remove All Guests in this room
  const handleGlobalRemove = () => {
    setGlobalRemoveModal(true);
  };

  // Confirm and execute global removal
const confirmGlobalRemove = async () => {
  setGlobalRemoveModal(false);
  setRemovingAllGuests(true);

  try {
    // Notify parent that changes are being made
    if (onChange) {
      onChange(true);
    }

    // Call the remove all guests function
    await onRemoveAllGuests(day, room);
    
    // Success - data will be automatically refreshed by onRemoveAllGuests
    console.log("✅ Remove All Guests operation completed successfully");
    
    // Close the modal after successful operation
    onClose();

  } catch (error) {
    setError("Failed to remove all guests. Please try again.");
  } finally {
    setRemovingAllGuests(false);
  }
};

  // Add guest (unsaved by default)
 const handleAddGuest = () => {
  // Notify parent that changes are being made
  if (onChange) {
    onChange(true);
  }
  
  setGuests([
    ...guests,
    {
      gender: "Male",
      age: "",
      status: "Single",
      nationality: "Philippines",
      lengthOfStay: "",
      isCheckIn: true,
      _saved: false,
      _isStartDay: true,
      _editing: true,
      _originalData: null,
    },
  ]);
};
  // In GuestModal.tsx - Update the handleRemoveGuest function
  const handleRemoveGuest = idx => {
    const guestToRemove = guests[idx];

     if (onChange) {
    onChange(true);
  }
    
    // Only allow removal for start day guests
    if (guestToRemove._saved && !guestToRemove._isStartDay) {
      setConfirmModal({
        show: true,
        message: "Cannot remove guest from following days. Please remove the guest from their start day to delete the entire stay.",
        onConfirm: () => {
          setConfirmModal({ ...confirmModal, show: false });
        }
      });
      return;
  }

    // If removing a saved guest that's on start day, show confirmation
    if (guestToRemove._saved && guestToRemove._isStartDay) {
      setConfirmModal({
        show: true,
        message: "This will remove the guest from ALL days of their stay. This action cannot be undone. Continue?",
        onConfirm: () => {
          setGuests(guests.filter((_, i) => i !== idx));
          // Call onSave with the guest to be removed - PASS THE STAY ID
          onSave(day, room, {
            guests: [],
            removeGuest: {
              ...guestToRemove,
              _stayId: guestToRemove._stayId // Ensure stay ID is passed
            },
            singleGuest: true
          });
          setConfirmModal({ ...confirmModal, show: false });
        }
      });
    } else {
      // For unsaved guests, just remove from local state
      setGuests(guests.filter((_, i) => i !== idx));
    }
  };

  // Update guest field - only allowed for start day guests in edit mode
  const handleUpdateGuest = (idx, field, value) => {
    const guest = guests[idx];
    
    // Only allow updates for guests in edit mode and start day guests
    if (!guest._editing || (guest._saved && !guest._isStartDay)) {
      return;
    }

   if (onChange) {
    onChange(true);
  }

    setGuests(
      guests.map((g, i) =>
        i === idx
          ? {
              ...g,
              [field]:
                field === "age" && !/^\d*$/.test(value)
                  ? g.age
                  : field === "lengthOfStay" && !/^\d*$/.test(value)
                  ? g.lengthOfStay
                  : field === "isCheckIn"
                  ? value === "true"
                  : value,
            }
          : g
      )
    );
  };

  // Enable edit mode for a saved guest
  const handleEditGuest = idx => {

    if (onChange) {
    onChange(true);
  }

    setGuests(
      guests.map((g, i) =>
        i === idx
          ? {
              ...g,
              _editing: true,
              _originalData: { ...g }, // Store original data for cancel
              _originalStayId: g._stayId, // Store original stay ID
              _originalGender: g.gender,
              _originalAge: g.age,
              _originalStatus: g.status,
              _originalNationality: g.nationality,
            }
          : g
      )
    );
  };

  // Cancel edit mode and restore original data
 const handleCancelEdit = (idx: number) => {
  const guest = guests[idx];
  
  // Notify parent that changes are being made (or cleared)
  if (onChange) {
    if (guest._originalData) {
      onChange(false); // Changes were cancelled
    } else {
      onChange(true); // Still have changes (removing unsaved guest)
    }
  }
  
  if (guest._originalData) {
    setGuests(
      guests.map((g, i) =>
        i === idx ? { ...guest._originalData, _editing: false, _originalData: null } : g
      )
    );
  } else {
    setGuests(guests.filter((_, i) => i !== idx));
  }
};

  // Update handleSaveGuest to include original data
const handleSaveGuest = async (idx: number) => {
  const guest = guests[idx];
  
  // Validate guest
  if (!guest.age || isNaN(guest.age) || parseInt(guest.age) <= 0) {
    setError("Please enter a valid age for this guest.");
    return;
  }
  if (!guest.lengthOfStay || isNaN(guest.lengthOfStay) || parseInt(guest.lengthOfStay) <= 0) {
    setError("Please enter a valid length of stay for this guest.");
    return;
  }
  if (parseInt(guest.lengthOfStay) > MAX_LENGTH_OF_STAY) {
    setError(`Maximum allowed length of stay is ${MAX_LENGTH_OF_STAY} days for each guest.`);
    return;
  }

  // Clear error if validation passes
  setError("");
  setSaving(true);

  try {
    // Notify parent that changes are being saved
    if (onChange) {
      onChange(false);
    }

    // Prepare the guest data for saving
    const savedGuest = {
      ...guest,
      age: parseInt(guest.age),
      lengthOfStay: parseInt(guest.lengthOfStay),
      _saved: true,
      _isStartDay: guest._isStartDay,
      _editing: false,
      _originalData: null,
    };

    // Call the parent save function and wait for it to complete
    const success = await onSave(day, room, {
      guests: [savedGuest],
      singleGuest: true,
      isEdit: !!guest._originalStayId,
    });

    if (success) {
      // Update local state only after successful save
      setGuests(guests.map((g, i) => (i === idx ? savedGuest : g)));
    } else {
      setError("Failed to save guest. Please try again.");
    }

  } catch (error) {
    setError("Failed to save guest. Please try again.");
  } finally {
    setSaving(false);
  }
};

  // Modal exit (X button)
  const handleExit = () => onClose();

 // Check if guest is editable - FIXED: Only editable on actual start day
  // Check if guest is editable - FIXED: Only editable on actual start day
const isGuestEditable = (guest) => {
  // Allow editing if:
  // - Guest is unsaved (new)
  // - Guest is in edit mode
  // - Guest is on their actual start day (regardless of other guests)
  return guest._editing || !guest._saved || (guest._saved && guest._isStartDay);
};

  // Check if guest can be deleted - FIXED: Only deletable on actual start day
  const canDeleteGuest = (guest) => {
    return guest._saved && guest._isStartDay && !guest._editing;
  };

  // Check if guest can be edited - FIXED: Only editable on actual start day
const canEditGuest = (guest) => {
  // Only allow editing from the start day for saved guests
  return guest._saved && guest._isStartDay && !guest._editing;
};

  // Check if guest shows action buttons - FIXED: Only show on actual start day
const showActionButtons = (guest) => {
  // Show buttons for unsaved guests or guests on their start day
  return !guest._saved || (guest._saved && guest._isStartDay);
};

  // Format guest ID for display (shortened version)
  const formatGuestId = (stayId: string) => {
    if (!stayId) return "No ID";
    if (stayId.length > 16) {
      return `${stayId.substring(0, 8)}...${stayId.substring(stayId.length - 8)}`;
    }
    return stayId;
  };

  // Check if there are any guests to remove
  const hasGuests = guests.length > 0;

const [processingOneDay, setProcessingOneDay] = useState<number | null>(null);

const handleSetLengthOfStayToOneAndDelete = async (idx: number) => {
  setConfirmOneDayModal({ show: true, guestIndex: idx });
};

// Update the confirmation function to handle the refresh
const confirmSetLengthOfStayToOneAndDelete = async () => {
  if (confirmOneDayModal.guestIndex === null) return;

  const idx = confirmOneDayModal.guestIndex;
  const guestToDelete = guests[idx];
  
  setProcessingOneDay(idx);
  setConfirmOneDayModal({ show: false, guestIndex: null });

  try {
    // Notify parent that changes are being made
    if (onChange) {
      onChange(true);
    }

    // Update the guest's length of stay to 1 day and remove the guest
    setGuests((prevGuests) => {
      return prevGuests.filter((_, i) => i !== idx); // Remove the guest from the list
    });

    // Automatically save the updated guest with refresh
    const success = await onSave(day, room, {
      guests: [],
      removeGuest: {
        ...guestToDelete,
        _stayId: guestToDelete._stayId, // Ensure stay ID is passed for deletion
      },
      singleGuest: true,
    });

    if (success) {
      // Success - data will be automatically refreshed by onSave
      console.log("✅ 1 Day operation completed successfully");
    } else {
      setError("Failed to update guest. Please try again.");
    }

  } catch (error) {
    setError("Failed to update guest. Please try again.");
  } finally {
    setProcessingOneDay(null);
  }
};

  return (
    <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header d-flex justify-between align-items-center">
            <h5 className="modal-title">
              Day {day} - {roomName}
            </h5>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-light btn-sm"
                onClick={handleExit}
                style={{ border: "none", background: "transparent" }}
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Global Remove Warning Message */}
            {hasGuests && (
              <div className="alert alert-warning mb-3">
                <div className="d-flex align-items-center">
                  <Trash2 size={16} className="me-2" />
                  <small>
                    <strong>Day-Specific Removal:</strong> The "Remove All" button will delete ALL guests from <strong>Room {room} on Day {day} ONLY</strong>. 
                    Guests will remain on other days of their stay. This action cannot be undone.
                  </small>
                </div>
              </div>
            )}

            {/* Show guest fields for each guest */}
            {guests.map((guest, idx) => (
              <div key={idx} className="mb-3 border rounded p-2">
                {/* Guest header showing edit status */}
                <div className="d-flex justify-between align-items-center mb-2">
                  <h6 className="mb-0">
                    Guest {idx + 1}
                    {guest._saved && (
                      <span className={`badge ${guest._isStartDay ? 'bg-warning' : 'bg-info'} ms-2`}>
                        {guest._isStartDay ? 'Start Day' : 'Following Day'}
                      </span>
                    )}
                    {guest._editing && (
                      <span className="badge bg-success ms-2">Editing</span>
                    )}
                  </h6>
                  {!isGuestEditable(guest) && !guest._editing && (
                    <small className="text-muted">Read-only (not start day)</small>
                  )}
                </div>

                {/* Guest ID Display - Show for saved guests */}
                {guest._saved && guest._stayId && (
                  <div className="mb-3 p-2 bg-light rounded">
                    <div className="d-flex justify-between align-items-center">
                      <div>
                        <small className="text-muted d-block">Guest ID:</small>
                        <code className="text-primary" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                          {formatGuestId(guest._stayId)}
                        </code>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => copyGuestId(guest._stayId)}
                        title="Copy Guest ID"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    <small className="text-muted">
                      {guest._isStartDay 
                        ? "You can edit or delete this guest from their start day."
                        : "This guest is read-only. Edit or delete from their start day (" + guest._startMonth + "/"+ guest._startDay +"/"+ guest._startYear +")."
                      }
                    </small>
                  </div>
                )}

                {/* Per-guest check-in toggle - only editable in edit mode */}
                <div className="form-group mb-2">
                 <label className="form-label fw-bold">Is the Guest checking in today?</label>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className={`btn ${guest.isCheckIn ? "btn-warning" : "btn-outline-warning"} flex-fill`}
                    onClick={() => handleUpdateGuest(idx, "isCheckIn", "true")}
                    disabled={disabled || !isGuestEditable(guest)}
                    style={{ color: guest.isCheckIn ? "black" : "black" }}
                  >
                    Yes, checking in today
                  </button>

                  <button
                    type="button"
                    className={`btn ${!guest.isCheckIn ? "btn-primary" : "btn-outline-primary"} flex-fill`}
                    onClick={() => handleUpdateGuest(idx, "isCheckIn", "false")}
                    disabled={disabled || !isGuestEditable(guest)}
                    style={{ color: !guest.isCheckIn ? "white" : "black" }} // white when active, black otherwise
                  >
                    No, staying from a previous day
                  </button>
                </div>

                <small className="form-text text-muted">
                  {guest.isCheckIn
                    ? "✅ This will count as a check-in and the start day cell will be yellow"
                    : "ℹ️ This will NOT count as a check-in and the start day cell will be blue"}
                </small>

                </div>
                
                <div className="row">
                  <div className="col">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-control"
                      value={guest.gender}
                      onChange={e => handleUpdateGuest(idx, "gender", e.target.value)}
                      disabled={disabled || !isGuestEditable(guest)}
                    >
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                  <div className="col">
                    <label className="form-label">Age</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Age"
                      value={guest.age}
                      onChange={e => handleUpdateGuest(idx, "age", e.target.value)}
                      min="1"
                      disabled={disabled || !isGuestEditable(guest)}
                    />
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col">
                    <label className="form-label">Status</label>
                    <select
                      className="form-control"
                      value={guest.status}
                      onChange={e => handleUpdateGuest(idx, "status", e.target.value)}
                      disabled={disabled || !isGuestEditable(guest)}
                    >
                      <option>Single</option>
                      <option>Married</option>
                      <option>N/A</option>
                      <option>Divorced</option>
                      <option>Widowed</option>
                    </select>
                  </div>
                  <div className="col">
                    <label className="form-label">Nationality</label>
                    <select
                      className="form-control"
                      value={guest.nationality}
                      onChange={e => handleUpdateGuest(idx, "nationality", e.target.value)}
                      disabled={disabled || !isGuestEditable(guest)}
                    >
                      {nationalities.map(n => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Per-guest Length of Stay - only editable in edit mode */}
                <div className="row mt-2">
                  <div className="col">
                    <label className="form-label">Length of Stay</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Length of Stay"
                      value={guest.lengthOfStay}
                      onChange={e => handleUpdateGuest(idx, "lengthOfStay", e.target.value)}
                      min="1"
                      max={MAX_LENGTH_OF_STAY}
                      disabled={disabled || !isGuestEditable(guest)}
                    />
                    <small className="form-text text-muted">
                      Maximum allowed length of stay is {MAX_LENGTH_OF_STAY} days (6 months).
                    </small>
                  </div>
                </div>
                
                {/* Action buttons - Only show for start day guests or unsaved guests */}
                {showActionButtons(guest) && (
                  <div className="d-flex justify-end gap-2 mt-2">
                    {!guest._saved || guest._editing ? (
                      <>
                        <button
                          className="btn btn-success btn-sm d-flex align-items-center gap-1"
                          onClick={() => handleSaveGuest(idx)}
                          disabled={disabled || saving}
                          title="Save guest data"
                        >
                          {saving ? (
                            <>
                              <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save size={14} />
                              Save
                            </>
                          )}
                        </button>
                        <button
                          className="btn btn-secondary btn-sm d-flex align-items-center gap-1"
                          onClick={() => handleCancelEdit(idx)}
                          disabled={disabled}
                        >
                          <CancelIcon size={14} />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        {/* // Replace the current 1 Day button with this enhanced version: */}
                        {canEditGuest(guest) && (
                          <>
                            <button
                              className="btn btn-warning btn-sm d-flex align-items-center gap-1"
                              onClick={() => handleEditGuest(idx)}
                              disabled={disabled}
                            >
                              <Edit size={14} />
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
                              onClick={() => handleSetLengthOfStayToOneAndDelete(idx)}
                              disabled={disabled || processingOneDay === idx}
                              title="Remove Guest Entire Stay"
                            >
                              {processingOneDay === idx ? (
                                <>
                                  <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                  </div>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Trash2 size={14} />
                                  Delete
                                </>
                              )}
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
                
                {/* Message for read-only guests */}
                {!showActionButtons(guest) && (
                  <div className="text-center mt-2 p-2 bg-light rounded">
                    <small className="text-muted">
                      This guest is read-only. Edit or delete from their start day ({guest._startMonth}/{guest._startDay}/{guest._startYear}).
                    </small>
                  </div>
                )}
              </div>
            ))}

            {/* Add Guest button - Always show at bottom */}
            <div className="flex justify-center mt-3 w-full">
            <button
              className="btn btn-success d-flex align-items-center justify-center gap-2 w-full"
              onClick={handleAddGuest}
              disabled={disabled}
            >
              <PlusIcon size={16} /> Add Guest
            </button>
          </div>
          </div>
          <div className="modal-footer">
            <div className="flex justify-between items-center w-full">
              {/* Global Remove Button in Footer (alternative placement) */}
              {hasGuests && (
                <button
                  className="btn btn-outline-danger d-flex align-items-center gap-2"
                  onClick={handleGlobalRemove}
                  disabled={disabled || removingAllGuests}
                  title="Remove all guests from this room and day, then refresh data"
                >
                  {removingAllGuests ? (
                    <>
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                      </svg>
                      Remove All Guests
                    </>
                  )}
                </button>
              )}
              <button
                className="btn btn-secondary"
                onClick={handleExit}
                disabled={disabled}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Global Remove Confirmation Modal */}
      {globalRemoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-red-700">Remove All Guests</h3>
            </div>
            <p className="mb-4 text-gray-700">
              <strong>Warning: This action cannot be undone!</strong>
            </p>
            <p className="mb-6 text-gray-700">
              You are about to remove <strong>all {guests.length} guest(s)</strong> from <strong>Room {room} on Day {day}</strong>. 
              This will delete all guest data for this room and day. The data will be automatically refreshed after this operation.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setGlobalRemoveModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
                disabled={removingAllGuests}
              >
                Cancel
              </button>
              <button
                onClick={confirmGlobalRemove}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center gap-2"
                disabled={removingAllGuests}
              >
                {removingAllGuests ? (
                  <>
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Remove All Guests
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Guest Removal Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-semibold text-sky-900 mb-4">
              {confirmModal.message.includes("Cannot remove") ? "Cannot Remove Guest" : "Confirm Removal"}
            </h3>
            <p className="mb-6 text-gray-700">{confirmModal.message}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                className={`px-4 py-2 ${
                  confirmModal.message.includes("Cannot remove") 
                    ? "bg-sky-500 text-white hover:bg-sky-600" 
                    : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                } rounded transition-colors`}
              >
                {confirmModal.message.includes("Cannot remove") ? "OK" : "Cancel"}
              </button>
              {!confirmModal.message.includes("Cannot remove") && (
                <button
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal({ ...confirmModal, show: false });
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Set Length of Stay to 1 Day and Delete Guest Modal */}
      {confirmOneDayModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <Trash size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-700">Delete entire stay?</h3>
            </div>
            <p className="mb-6 text-gray-700">
              This will remove all guest data for the entire duration of the stay. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmOneDayModal({ show: false, guestIndex: null })}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSetLengthOfStayToOneAndDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestModal;