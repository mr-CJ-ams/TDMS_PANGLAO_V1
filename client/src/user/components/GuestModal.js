import React, { useState } from "react";
import nationalities from "./Nationality";

const GuestModal = ({ day, room, onClose, onSave, onRemoveAllGuests, initialData }) => {
  const [lengthOfStay, setLengthOfStay] = useState(initialData?.lengthOfStay?.toString() || "");
  const [guests, setGuests] = useState(initialData?.guests || []);
  const [isCheckIn, setIsCheckIn] = useState(initialData?.isCheckIn || true);
  const [error, setError] = useState("");
  

  const handleSave = () => {
    if (guests.some((guest) => !guest.age)) {
      setError("Please fill out the Age field for all guests.");
      return;
    }
    setError("");
    onSave(day, room, {
      guests: guests.map((guest) => ({ ...guest, roomNumber: room })),
      lengthOfStay: parseInt(lengthOfStay),
      isCheckIn,
    });
    onClose();
  };

  const handleAddGuest = () => {
    setGuests([
      ...guests,
      { gender: "Male", age: "", status: "Single", nationality: "Philippines" },
    ]);
  };

  const handleRemoveGuest = (index) => {
    setGuests(guests.filter((_, i) => i !== index));
  };

  const handleUpdateGuest = (index, field, value) => {
    const updatedGuests = [...guests];
    updatedGuests[index][field] = value;
    setGuests(updatedGuests);
  };

  const handleRemoveAll = () => {
    onRemoveAllGuests(day, room);
    onClose();
  };

  return (
    <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Day {day} - Room {room}</h5>
            <button type="button" className="close" onClick={onClose}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Check In Prompt */}
            <div className="form-group">
              <label>Guest Checked In Today?</label>
              <div className="d-flex gap-2">
                <button
                  onClick={() => setIsCheckIn(true)}
                  className={`btn ${isCheckIn ? "btn-warning" : "btn-light"}`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setIsCheckIn(false)}
                  className={`btn ${!isCheckIn ? "btn-success" : "btn-light"}`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Length of Stay */}
            <div className="form-group">
              <label>Length of Overnight Stay</label>
              <input
                type="number"
                className="form-control"
                value={lengthOfStay}
                onChange={(e) => setLengthOfStay(e.target.value)}
              />
            </div>

            {/* Guest Information */}
            {guests.map((guest, index) => (
              <div key={index} className="mb-3">
                <div className="row">
                  <div className="col">
                    <select
                      className="form-control"
                      value={guest.gender}
                      onChange={(e) =>
                        handleUpdateGuest(index, "gender", e.target.value)
                      }
                    >
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Age"
                      value={guest.age}
                      onChange={(e) =>
                        handleUpdateGuest(index, "age", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col">
                    <select
                      className="form-control"
                      value={guest.status}
                      onChange={(e) =>
                        handleUpdateGuest(index, "status", e.target.value)
                      }
                    >
                      <option>Single</option>
                      <option>Married</option>
                    </select>
                  </div>
                  <div className="col">
                    <select
                      className="form-control"
                      value={guest.nationality}
                      onChange={(e) =>
                        handleUpdateGuest(index, "nationality", e.target.value)
                      }
                    >
                      {nationalities.map((nationality) => (
                        <option key={nationality} value={nationality}>
                          {nationality}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  className="btn btn-danger btn-sm mt-2"
                  onClick={() => handleRemoveGuest(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button className="btn btn-primary" onClick={handleAddGuest}>
              Add Guest
            </button>
          </div>
          <div className="modal-footer">
            <button className="btn btn-danger" onClick={handleRemoveAll}>
              Remove All Guest Data
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestModal;