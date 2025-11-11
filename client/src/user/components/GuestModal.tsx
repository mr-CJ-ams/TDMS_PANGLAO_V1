/**
 * GuestModal.tsx
 * 
 * Panglao Tourist Data Management System - Guest Modal Component (Frontend)
 * 
 * =========================
 * Overview:
 * =========================
 * This React component provides a modal dialog for entering, editing, and managing guest check-in data for a specific day and room in a monthly accommodation submission.
 * It is used by users to input guest details, length of stay, and check-in status, supporting both new entries and editing existing stays.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Allows users to add, edit, and remove individual guest records for a given day and room.
 * - Validates guest data (age, gender, status, nationality) and length of overnight stay.
 * - Handles check-in status toggle, affecting how the stay is counted in statistics.
 * - Detects and warns about room conflicts (overlapping stays) using provided logic.
 * - Supports removal of all guests for a day/room and confirmation for stays crossing months/years.
 * - Communicates changes to parent components via onSave and onRemoveAllGuests callbacks.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Modal UI with responsive layout and clear feedback for validation errors and conflicts.
 * - Dynamic guest list management with add/remove/edit functionality.
 * - Confirmation modal for stays crossing into a new month or year.
 * - Integrates with parent state for occupied rooms and conflict detection.
 * - Uses Lucide icons for visual cues and improved UX.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Accessed from the monthly grid or submission form when a user clicks to add or edit guests for a specific day/room.
 * - Used during monthly accommodation submission to ensure accurate guest and stay data.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - The parent component must provide occupiedRooms and hasRoomConflict logic for conflict detection.
 * - Extend this component to support additional guest attributes or validation rules as needed.
 * - Ensure onSave and onRemoveAllGuests are implemented in the parent for proper data handling.
 * 
 * =========================
 * Related Files:
 * =========================
 * - src/user/components/MonthlyGrid.tsx         (invokes GuestModal for guest entry)
 * - src/user/pages/SubmissionDetails.jsx        (displays and manages submission details)
 * - server/controllers/submissionsController.js (handles backend guest and stay logic)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

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
  const MAX_LENGTH_OF_STAY = 183;

  const [guests, setGuests] = useState(
    initialData?.guests?.map(g => ({
      ...g,
      lengthOfStay: g.lengthOfStay?.toString() || "",
      isCheckIn: g.isCheckIn !== false, // default true
    })) || []
  );
  const [error, setError] = useState("");
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    message: string;
    onConfirm: () => void;
  }>({ show: false, message: "", onConfirm: () => {} });

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
      },
    ]);
  const handleRemoveGuest = idx => setGuests(guests.filter((_, i) => i !== idx));
  const handleUpdateGuest = (idx, field, value) => {
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

  const handleSave = () => {
    if (!guests.length)
      return setError("Please add at least one guest before saving.");
    if (
      guests.some(
        g => !g.age || isNaN(g.age) || parseInt(g.age) <= 0
      )
    )
      return setError("Please enter a valid age for all guests.");
    if (
      guests.some(
        g =>
          !g.lengthOfStay ||
          isNaN(g.lengthOfStay) ||
          parseInt(g.lengthOfStay) <= 0
      )
    )
      return setError("Please enter a valid length of stay for all guests.");
    if (
      guests.some(g => parseInt(g.lengthOfStay) > MAX_LENGTH_OF_STAY)
    )
      return setError(
        `Maximum allowed length of stay is ${MAX_LENGTH_OF_STAY} days for each guest.`
      );

    // Check for stays crossing months/years for each guest
    const startDate = new Date(selectedYear, selectedMonth - 1, day);
    for (const g of guests) {
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + parseInt(g.lengthOfStay) - 1);
      if (endDate.getFullYear() !== startDate.getFullYear()) {
        setConfirmModal({
          show: true,
          message: `Guest "${g.gender}, Age ${g.age}" stay crosses into the next year (ending ${endDate.toLocaleDateString()}). Continue?`,
          onConfirm: () => {
            setConfirmModal({ ...confirmModal, show: false });
            proceedSave();
          },
        });
        return;
      } else if (endDate.getMonth() !== startDate.getMonth()) {
        setConfirmModal({
          show: true,
          message: `Guest "${g.gender}, Age ${g.age}" stay crosses into ${endDate.toLocaleString(
            "default",
            { month: "long" }
          )}. Continue?`,
          onConfirm: () => {
            setConfirmModal({ ...confirmModal, show: false });
            proceedSave();
          },
        });
        return;
      }
    }

    proceedSave();
  };

  const proceedSave = () => {
    setError("");
    onSave(day, room, {
      guests: guests.map(g => ({
        ...g,
        roomNumber: room,
        lengthOfStay: parseInt(g.lengthOfStay),
        isCheckIn: !!g.isCheckIn,
      })),
    });
    onClose();
  };

  const handleRemoveAll = () => { onRemoveAllGuests(day, room); onClose(); };

  const isEditingExisting = initialData && initialData.day === day && initialData.room === room;
  const isStartDay = initialData?.isStartDay;
  const showConflict = guests.some((guest, idx) => {
    const lengthOfStay = guest.lengthOfStay;
    return lengthOfStay && hasRoomConflict && hasRoomConflict(day, room, parseInt(lengthOfStay), occupiedRooms);
  });

  return (
    <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Day {day} - Room {room}
            </h5>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Only show Add Guest button if no guests yet */}
            {guests.length === 0 && (
              <div className="flex justify-end">
                <button
                  className="btn btn-success w-20 d-flex align-items-center justify-center gap-2"
                  onClick={handleAddGuest}
                  disabled={disabled}
                >
                  <PlusIcon size={16} /> Add Guest
                </button>
              </div>
            )}

            {/* Show guest fields for each guest */}
            {guests.map((guest, idx) => (
              <div key={idx} className="mb-3 border rounded p-2">
                {/* Per-guest check-in toggle */}
                <div className="form-group mb-2">
                  <label className="form-label fw-bold">Guest check-in today?</label>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className={`btn ${guest.isCheckIn ? "btn-warning" : "btn-outline-warning"} flex-fill`}
                      onClick={() => handleUpdateGuest(idx, "isCheckIn", "true")}
                      disabled={disabled}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`btn ${!guest.isCheckIn ? "btn-primary" : "btn-outline-primary"} flex-fill`}
                      onClick={() => handleUpdateGuest(idx, "isCheckIn", "false")}
                      disabled={disabled}
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
                    <select
                      className="form-control"
                      value={guest.gender}
                      onChange={e => handleUpdateGuest(idx, "gender", e.target.value)}
                      disabled={disabled}
                    >
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
                    <select
                      className="form-control"
                      value={guest.status}
                      onChange={e => handleUpdateGuest(idx, "status", e.target.value)}
                      disabled={disabled}
                    >
                      <option>Single</option>
                      <option>Married</option>
                      <option>N/A</option>
                      <option>Divorced</option>
                      <option>Widowed</option>
                    </select>
                  </div>
                  <div className="col">
                    <select
                      className="form-control"
                      value={guest.nationality}
                      onChange={e => handleUpdateGuest(idx, "nationality", e.target.value)}
                      disabled={disabled}
                    >
                      {nationalities.map(n => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Per-guest Length of Stay */}
                <div className="row mt-2">
                  <div className="col">
                    <label>Length of Stay</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Length of Stay"
                      value={guest.lengthOfStay}
                      onChange={e => handleUpdateGuest(idx, "lengthOfStay", e.target.value)}
                      min="1"
                      max={MAX_LENGTH_OF_STAY}
                      disabled={disabled}
                    />
                    <small className="form-text text-muted">
                      Maximum allowed length of stay is {MAX_LENGTH_OF_STAY} days (6 months).
                    </small>
                  </div>
                </div>
                <button
                  className="btn btn-danger btn-sm mt-2"
                  onClick={() => handleRemoveGuest(idx)}
                  disabled={disabled}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {/* Add Guest button always available */}
            {guests.length > 0 && (
              <div className="flex justify-end">
                <button
                  className="btn btn-success w-20 d-flex align-items-center justify-center gap-2"
                  onClick={handleAddGuest}
                  disabled={disabled}
                >
                  <PlusIcon size={16} /> Add Guest
                </button>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <div className="flex justify-between items-center w-full mt-4">
              <button
                className="btn btn-danger w-35 d-flex align-items-center justify-center gap-2"
                onClick={handleRemoveAll}
                disabled={disabled}
              >
                <Trash2 size={16} />
                Remove All
              </button>
              <div className="flex gap-3">
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
