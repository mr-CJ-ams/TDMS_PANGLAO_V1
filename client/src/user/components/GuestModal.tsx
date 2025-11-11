import { useState } from "react";
import nationalities from "./Nationality";
import { Trash2, PlusIcon, X } from "lucide-react";

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
      _saved: true, // Mark as already saved if loaded from initialData
      _isStartDay: g._isStartDay !== false, // Track if this guest is on their start day
    })) || []
  );
  const [error, setError] = useState("");
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    message: string;
    onConfirm: () => void;
  }>({ show: false, message: "", onConfirm: () => {} });

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
        _isStartDay: true, // New guests are always on start day
      },
    ]);

  // Remove guest (Cancel for unsaved, Trash for saved)
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
          // Call onSave with empty guests array to trigger removal from all days
          onSave(day, room, {
            guests: [],
            removeGuest: guestToRemove, // Pass the guest to be removed
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

  // Update guest field - only allowed for start day guests
  const handleUpdateGuest = (idx, field, value) => {
    const guest = guests[idx];
    
    // Only allow updates for unsaved guests or saved guests on their start day
    if (guest._saved && !guest._isStartDay) {
      return; // Read-only for non-start day guests
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

  // Save a single guest (propagate immediately)
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
      _isStartDay: true // When saved, mark as start day guest
    };
    
    setGuests(
      guests.map((g, i) => (i === idx ? savedGuest : g))
    );
    
    // Send only this guest to be saved/propagated
    onSave(day, room, {
      guests: [savedGuest],
      singleGuest: true // Flag to indicate single guest save
    });
  };

  // Cancel unsaved guest
  const handleCancelGuest = idx => {
    handleRemoveGuest(idx);
  };

  // Remove all guests
  const handleRemoveAll = () => { 
    onRemoveAllGuests(day, room); 
    onClose(); 
  };

  // Modal exit (X button)
  const handleExit = () => onClose();

  // Check if guest is editable
  const isGuestEditable = (guest) => {
    return !guest._saved || (guest._saved && guest._isStartDay);
  };

  // Check if guest can be deleted
  const canDeleteGuest = (guest) => {
    return guest._saved && guest._isStartDay;
  };

  return (
    <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header d-flex justify-between align-items-center">
            <h5 className="modal-title">
              Day {day} - Room {room}
            </h5>
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
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Show guest fields for each guest */}
            {guests.map((guest, idx) => (
              <div key={idx} className="mb-3 border rounded p-2">
                {/* Guest header showing edit status */}
                <div className="d-flex justify-between align-items-center mb-2">
                  <h6 className="mb-0">
                    Guest {idx + 1}
                    {guest._saved && (
                      <span className={`badge ${guest._isStartDay ? 'bg-warning' : 'bg-info'} ms-2`}>
                        {guest._isStartDay ? 'Start Day' : `Day ${guest._startDay} →`}
                      </span>
                    )}
                  </h6>
                  {!isGuestEditable(guest) && (
                    <small className="text-muted">
                      Read-only (started on day {guest._startDay})
                    </small>
                  )}
                </div>

                {/* Per-guest check-in toggle - only editable on start day */}
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
                {/* Per-guest Length of Stay - only editable on start day */}
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
                
                {/* Action buttons */}
                <div className="d-flex justify-end gap-2 mt-2">
                  {!guest._saved ? (
                    <>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleSaveGuest(idx)}
                        disabled={disabled}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleCancelGuest(idx)}
                        disabled={disabled}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveGuest(idx)}
                      disabled={disabled || !canDeleteGuest(guest)}
                      title={canDeleteGuest(guest) ? "Remove guest from all days" : "Cannot remove from following days"}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
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
              <button
                className="btn btn-danger d-flex align-items-center justify-center gap-2"
                onClick={handleRemoveAll}
                disabled={disabled || guests.length === 0}
              >
                <Trash2 size={16} />
                Remove All Guests
              </button>
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
      
      {/* Confirmation Modal */}
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