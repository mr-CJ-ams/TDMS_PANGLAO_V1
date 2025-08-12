import { useState } from "react";
import nationalities from "./Nationality";
import { Trash2, PlusIcon } from "lucide-react";

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
  const [lengthOfStay, setLengthOfStay] = useState(initialData?.lengthOfStay?.toString() || "");
  const [guests, setGuests] = useState(initialData?.guests || []);
  const [isCheckIn, setIsCheckIn] = useState(initialData?.isCheckIn !== false); // Default to true, but can be false
  const [error, setError] = useState("");
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    message: string;
    onConfirm: () => void;
  }>({ show: false, message: "", onConfirm: () => {} });

  const handleSave = () => {
    if (!guests.length) return setError("Please add at least one guest before saving.");
    if (guests.some(g => !g.age || isNaN(g.age) || parseInt(g.age) <= 0))
      return setError("Please enter a valid age for all guests.");
    if (!lengthOfStay || isNaN(lengthOfStay) || parseInt(lengthOfStay) <= 0)
      return setError("Please enter a valid length of stay.");

    const startDate = new Date(selectedYear, selectedMonth - 1, day);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + parseInt(lengthOfStay) - 1);

    // Replace window.confirm with modal
    if (endDate.getFullYear() !== startDate.getFullYear()) {
      setConfirmModal({
        show: true,
        message: `This stay crosses into the next year (ending ${endDate.toLocaleDateString()}). Continue?`,
        onConfirm: () => {
          setConfirmModal({ ...confirmModal, show: false });
          proceedSave();
        }
      });
      return;
    } else if (endDate.getMonth() !== startDate.getMonth()) {
      setConfirmModal({
        show: true,
        message: `This stay crosses into ${endDate.toLocaleString('default', { month: 'long' })}. Continue?`,
        onConfirm: () => {
          setConfirmModal({ ...confirmModal, show: false });
          proceedSave();
        }
      });
      return;
    }

    proceedSave();
  };

  const proceedSave = () => {
    setError("");
    onSave(day, room, {
      guests: guests.map(g => ({ ...g, roomNumber: room })),
      lengthOfStay: parseInt(lengthOfStay),
      isCheckIn,
    });
    onClose();
  };

  const handleAddGuest = () =>
    setGuests([...guests, { gender: "Male", age: "", status: "Single", nationality: "Philippines" }]);
  const handleRemoveGuest = idx => setGuests(guests.filter((_, i) => i !== idx));
  const handleUpdateGuest = (idx, field, value) => {
    setGuests(guests.map((g, i) => i === idx ? { ...g, [field]: field === "age" && !/^\d*$/.test(value) ? g.age : value } : g));
  };
  const handleLengthOfStayChange = e => /^\d*$/.test(e.target.value) && setLengthOfStay(e.target.value);
  const handleRemoveAll = () => { onRemoveAllGuests(day, room); onClose(); };

  const isEditingExisting = initialData && initialData.day === day && initialData.room === room;
  const isStartDay = initialData?.isStartDay;
  const showConflict = lengthOfStay && hasRoomConflict && hasRoomConflict(day, room, parseInt(lengthOfStay), occupiedRooms);

  return (
    <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Day {day} - Room {room}
              {isStartDay && <span className="badge bg-warning ms-2">Start Day (Editable)</span>}
              {!isStartDay && isEditingExisting && <span className="badge bg-success ms-2">Following Day (Non-editable)</span>}
            </h5>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            
            {/* Check-in toggle button */}
            <div className="form-group mb-3">
              <label className="form-label fw-bold">Guest check-in today?</label>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className={`btn ${isCheckIn ? 'btn-warning' : 'btn-outline-warning'} flex-fill`}
                  onClick={() => setIsCheckIn(true)}
                  disabled={disabled}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`btn ${!isCheckIn ? 'btn-primary' : 'btn-outline-primary'} flex-fill`}
                  onClick={() => setIsCheckIn(false)}
                  disabled={disabled}
                >
                  No
                </button>
              </div>
              <small className="form-text text-muted">
                {isCheckIn 
                  ? "✅ This will count as a check-in and the start day cell will be yellow" 
                  : "ℹ️ This will NOT count as a check-in and the start day cell will be blue"}
              </small>
            </div>

            <div className="form-group">
              <label>Length of Overnight Stay</label>
              <input
                type="number"
                className="form-control"
                value={lengthOfStay}
                onChange={handleLengthOfStayChange}
                min="1"
                disabled={disabled}
              />
            </div>
            {lengthOfStay && hasRoomConflict && showConflict ? (
              <div className="alert alert-warning mt-2">
                {isEditingExisting ? "⚠️ Occupied" : "⚠️ This Length of Overnight Stay overlaps with existing occupied rooms"}
              </div>
            ) : (
              !isEditingExisting && <div className="alert alert-info mt-2">✅ These dates are available</div>
            )}
            {!isStartDay && isEditingExisting && (
              <div className="alert alert-info mt-2">
                ℹ️ This is a following day. Changes will be applied to the entire stay starting from the start day.
              </div>
            )}
            {guests.map((guest, idx) => (
              <div key={idx} className="mb-3">
                <div className="row">
                  <div className="col">
                    <select className="form-control" value={guest.gender} onChange={e => handleUpdateGuest(idx, "gender", e.target.value)} disabled={disabled}>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                  <div className="col">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Age"
                      value={guest.age}
                      onChange={e => handleUpdateGuest(idx, "age", e.target.value)}
                      min="1"
                      disabled={disabled}
                    />
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col">
                    <select className="form-control" value={guest.status} onChange={e => handleUpdateGuest(idx, "status", e.target.value)} disabled={disabled}>
                      <option>Single</option>
                      <option>Married</option>
                    </select>
                  </div>
                  <div className="col">
                    <select className="form-control" value={guest.nationality} onChange={e => handleUpdateGuest(idx, "nationality", e.target.value)} disabled={disabled}>
                      {nationalities.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <button className="btn btn-danger btn-sm mt-2" onClick={() => handleRemoveGuest(idx)} disabled={disabled}><Trash2 size={16}/></button>
              </div>
            ))}
            <div className="flex justify-end">
              <button className="btn btn-success w-20 d-flex align-items-center justify-center gap-2" 
                onClick={handleAddGuest} 
                disabled={disabled}>
                <PlusIcon size={16} /> Add
              </button>
            </div>

          </div>
          <div className="modal-footer">
            <div className="flex justify-between items-center w-full mt-4">
          {/* Left side */}
          <button
          //btn w-100 d-flex align-items-center justify-content-center gap-2 px-2 py-1 border-0
            className="btn btn-danger w-35 d-flex align-items-center justify-center gap-2"
            onClick={handleRemoveAll}
            disabled={disabled}
          >
            <Trash2 size={16} />
            Remove All
          </button>


          {/* Right side */}
          <div className="flex gap-3"> {/* gap between Cancel and Save */}
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-success"
              onClick={handleSave}
              disabled={disabled || !guests.length}
            >
              Save
            </button>
          </div>
        </div>

          </div>
        </div>
      </div>
      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-semibold text-sky-900 mb-4">Confirm</h3>
            <p className="mb-6 text-gray-700">{confirmModal.message}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                }}
                className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestModal;