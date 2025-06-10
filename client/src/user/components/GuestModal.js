import { useState } from "react";
import nationalities from "./Nationality";

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
}) => {
  const [lengthOfStay, setLengthOfStay] = useState(initialData?.lengthOfStay?.toString() || "");
  const [guests, setGuests] = useState(initialData?.guests || []);
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!guests.length) return setError("Please add at least one guest before saving.");
    if (guests.some(g => !g.age || isNaN(g.age) || parseInt(g.age) <= 0))
      return setError("Please enter a valid age for all guests.");
    if (!lengthOfStay || isNaN(lengthOfStay) || parseInt(lengthOfStay) <= 0)
      return setError("Please enter a valid length of stay.");

    const startDate = new Date(selectedYear, selectedMonth - 1, day);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + parseInt(lengthOfStay) - 1);

    if (endDate.getFullYear() !== startDate.getFullYear()) {
      if (!window.confirm(`This stay crosses into the next year (ending ${endDate.toLocaleDateString()}). Continue?`)) return;
    } else if (endDate.getMonth() !== startDate.getMonth()) {
      if (!window.confirm(`This stay crosses into ${endDate.toLocaleString('default', { month: 'long' })}. Continue?`)) return;
    }

    setError("");
    onSave(day, room, {
      guests: guests.map(g => ({ ...g, roomNumber: room })),
      lengthOfStay: parseInt(lengthOfStay),
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
  const showConflict = lengthOfStay && hasRoomConflict && hasRoomConflict(day, room, parseInt(lengthOfStay), occupiedRooms);

  return (
    <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Day {day} - Room {room}</h5>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
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
              !isEditingExisting && <div className="alert alert-info mt-2">✅ These dates are available for booking</div>
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
                <button className="btn btn-danger btn-sm mt-2" onClick={() => handleRemoveGuest(idx)} disabled={disabled}>Remove</button>
              </div>
            ))}
            <button className="btn btn-primary" onClick={handleAddGuest} disabled={disabled}>Add Guest</button>
          </div>
          <div className="modal-footer">
            <button className="btn btn-danger" onClick={handleRemoveAll} disabled={disabled}>Remove All Guest Data</button>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={disabled || !guests.length}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestModal;