import { useState } from "react";
import nationalities from "./Nationality";
import { Trash2, PlusIcon, X, Edit, Save, X as CancelIcon, Copy } from "lucide-react";

interface GuestModalProps {
  day: number;
  room: number;
  onClose: () => void;
  onSave: (day: number, room: number, data: any) => void;
  onRemoveAllGuests: (day: number, room: number) => void;
  initialData?: any;
  disabled: boolean;
  hasRoomConflict: (day: number, room: number, lengthOfStay: number, occupiedRooms: any[]) => boolean;
  occupiedRooms: any[];
  selectedYear: number;
  selectedMonth: number;
}

const GuestModal = ({
  day,
  room,
  onClose,
  onSave,
  onRemoveAllGuests,
  initialData,
  disabled,
  hasRoomConflict,
  occupiedRooms,
  selectedYear,
  selectedMonth
}: GuestModalProps) => {
  const MAX_LENGTH_OF_STAY = 183;

  const [guests, setGuests] = useState(
    initialData?.guests?.map(g => ({
      ...g,
      lengthOfStay: g.lengthOfStay?.toString() || "",
      isCheckIn: g.isCheckIn !== false,
      _saved: true,
      _isStartDay: g._isStartDay !== false,
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
  const confirmGlobalRemove = () => {
    onRemoveAllGuests(day, room);
    setGlobalRemoveModal(false);
    onClose(); // Close the modal after removal
  };

  // Add guest (unsaved by default)
  const handleAddGuest = () =>
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

  // In GuestModal.tsx - Update the handleRemoveGuest function
  const handleRemoveGuest = idx => {
    const guestToRemove = guests[idx];
    
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
    const guest = guests[idx];
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
  const handleCancelEdit = idx => {
    const guest = guests[idx];
    if (guest._originalData) {
      // Restore original data for saved guests
      setGuests(
        guests.map((g, i) =>
          i === idx ? { ...guest._originalData, _editing: false, _originalData: null } : g
        )
      );
    } else {
      // For unsaved guests, just remove them
      setGuests(guests.filter((_, i) => i !== idx));
    }
  };

  // Update handleSaveGuest to include original data
  const handleSaveGuest = idx => {
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

    // Save guest and propagate
    const savedGuest = {
      ...guest,
      age: parseInt(guest.age),
      lengthOfStay: parseInt(guest.lengthOfStay),
      _saved: true,
      _isStartDay: guest._isStartDay, // Preserve the actual start day status
      _editing: false,
      _originalData: null,
      // Preserve original data for future edits
      _originalStayId: guest._originalStayId || guest._stayId,
      _originalGender: guest._originalGender || guest.gender,
      _originalAge: guest._originalAge || guest.age,
      _originalStatus: guest._originalStatus || guest.status,
      _originalNationality: guest._originalNationality || guest.nationality,
    };
    
    setGuests(
      guests.map((g, i) => (i === idx ? savedGuest : g))
    );
    
    // Send only this guest to be saved/propagated
    onSave(day, room, {
      guests: [savedGuest],
      singleGuest: true,
      isEdit: !!guest._originalStayId,
    });
  };

  // Modal exit (X button)
  const handleExit = () => onClose();

 // Check if guest is editable - FIXED: Only editable on actual start day
  // Check if guest is editable - FIXED: Only editable on actual start day
  const isGuestEditable = (guest) => {
    return guest._editing || !guest._saved || (guest._saved && guest._isStartDay && !guest._editing);
  };

  // Check if guest can be deleted - FIXED: Only deletable on actual start day
  const canDeleteGuest = (guest) => {
    return guest._saved && guest._isStartDay && !guest._editing;
  };

  // Check if guest can be edited - FIXED: Only editable on actual start day
  const canEditGuest = (guest) => {
    return guest._saved && guest._isStartDay && !guest._editing;
  };

  // Check if guest shows action buttons - FIXED: Only show on actual start day
  const showActionButtons = (guest) => {
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

  return (
    <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header d-flex justify-between align-items-center">
            <h5 className="modal-title">
              Day {day} - Room {room}
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
                    <strong>Warning:</strong> The "Remove All" button will delete ALL guests from Room {room} on Day {day}. 
                    This action cannot be undone.
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
                        {guest._startDay && (
                          <small className="text-muted d-block mt-1">
                            Start: Day {guest._startDay} • Length: {guest.lengthOfStay} days • 
                            <span className={guest._isStartDay ? "text-success fw-bold" : "text-muted"}>
                              {guest._isStartDay ? " Currently on Start Day" : " Following Day"}
                            </span>
                          </small>
                        )}
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
                        : "This guest is read-only. Edit or delete from their start day (Day " + guest._startDay + ")."
                      }
                    </small>
                  </div>
                )}

                {/* Per-guest check-in toggle - only editable in edit mode */}
                <div className="form-group mb-2">
                  <label className="form-label fw-bold">Guest check-in today?</label>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className={`btn ${guest.isCheckIn ? "btn-warning" : "btn-outline-warning"} flex-fill`}
                      onClick={() => handleUpdateGuest(idx, "isCheckIn", "true")}
                      disabled={disabled || !isGuestEditable(guest)}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`btn ${!guest.isCheckIn ? "btn-primary" : "btn-outline-primary"} flex-fill`}
                      onClick={() => handleUpdateGuest(idx, "isCheckIn", "false")}
                      disabled={disabled || !isGuestEditable(guest)}
                    >
                      No
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
                          disabled={disabled}
                        >
                          <Save size={14} />
                          Save
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
                        {canEditGuest(guest) && (
                          <button
                            className="btn btn-warning btn-sm d-flex align-items-center gap-1"
                            onClick={() => handleEditGuest(idx)}
                            disabled={disabled}
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                        )}
                        <button
                          className="btn btn-danger btn-sm d-flex align-items-center gap-1"
                          onClick={() => handleRemoveGuest(idx)}
                          disabled={disabled || !canDeleteGuest(guest)}
                          title={canDeleteGuest(guest) ? "Remove guest from all days" : "Cannot remove from following days"}
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                )}
                
                {/* Message for read-only guests */}
                {!showActionButtons(guest) && (
                  <div className="text-center mt-2 p-2 bg-light rounded">
                    <small className="text-muted">
                      This guest is read-only. Edit or delete from their start day (Day {guest._startDay}).
                    </small>
                  </div>
                )}
              </div>
            ))}

            {/* Add Guest button - Always show at bottom */}
            <div className="flex justify-end mt-3">
              <button
                className="btn btn-success d-flex align-items-center justify-center gap-2"
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
                  disabled={disabled}
                >
                  <Trash2 size={16} />
                  Remove All Guests
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
              This will delete all guest data for this room and day.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setGlobalRemoveModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmGlobalRemove}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Remove All Guests
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
    </div>
  );
};

export default GuestModal;