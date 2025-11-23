import { useState, useMemo } from "react";
import nationalities from "./Nationality";
import { Trash2, PlusIcon, X, Edit, Save, X as CancelIcon, Trash, Calendar } from "lucide-react";

interface GuestModalProps {
  day: number;
  room: number;
  onClose: () => void;
  onSave: (day: number, room: number, data: any) => Promise<boolean>;
  onRemoveAllGuests: (day: number, room: number) => Promise<void>;
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
  roomNames = [],
  selectedYear,
  selectedMonth
}: GuestModalProps) => {
  const MAX_LENGTH_OF_STAY = 365;
  const roomName = roomNames[room - 1] || `Room ${room}`;

  const [guests, setGuests] = useState(
    initialData?.guests?.map(g => ({
      ...g,
      lengthOfStay: g.lengthOfStay?.toString() || "",
      isCheckIn: g.isCheckIn !== false,
      _saved: true,
      _isStartDay: g._isStartDay !== false,
      _stayId: g._stayId,
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

  // Add state for check-out day selection
  const [showCheckOutDays, setShowCheckOutDays] = useState<number | null>(null);

  const [globalRemoveModal, setGlobalRemoveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removingAllGuests, setRemovingAllGuests] = useState(false);
  const [confirmOneDayModal, setConfirmOneDayModal] = useState<{
    show: boolean;
    guestIndex: number | null;
  }>({ show: false, guestIndex: null });

  // Function to format date
  const formatDate = (day: number, month: number, year: number) => {
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Function to add days to a date
  const addDays = (startDay: number, startMonth: number, startYear: number, daysToAdd: number) => {
    const date = new Date(startYear, startMonth - 1, startDay);
    date.setDate(date.getDate() + daysToAdd);
    return {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear()
    };
  };

  // Generate check-out days with complete date information up to 183 days
  // Use the guest's actual start day for consistent calculation
  const generateCheckOutDays = useMemo(() => {
    const days = [];
    // Use the current modal's day for new guests, but for saved guests use their actual start day
    const startDate = new Date(selectedYear, selectedMonth - 1, day);
    
    // Generate days for the full 183-day period
    for (let i = 1; i <= MAX_LENGTH_OF_STAY; i++) {
      const checkOutDate = new Date(startDate);
      checkOutDate.setDate(checkOutDate.getDate() + i);
      
      const checkOutDay = checkOutDate.getDate();
      const checkOutMonth = checkOutDate.getMonth() + 1;
      const checkOutYear = checkOutDate.getFullYear();
      
      days.push({
        day: checkOutDay,
        month: checkOutMonth,
        year: checkOutYear,
        stayDuration: i,
        display: formatDate(checkOutDay, checkOutMonth, checkOutYear)
      });
    }
    
    return days;
  }, [day, selectedMonth, selectedYear, MAX_LENGTH_OF_STAY]);

  // Function to handle check-out day selection
  const handleCheckOutDaySelect = (guestIndex: number, stayDuration: number) => {
  console.log('📅 Check-out day selected:', { 
    guestIndex, 
    stayDuration,
    maxStay: MAX_LENGTH_OF_STAY 
  });
  
  if (stayDuration > 0 && stayDuration <= MAX_LENGTH_OF_STAY) {
    handleUpdateGuest(guestIndex, "lengthOfStay", stayDuration.toString());
    setShowCheckOutDays(null);
  } else {
    console.error('❌ Invalid stay duration:', stayDuration);
  }
};

  // Function to toggle check-out days display for a specific guest
  const toggleCheckOutDays = (guestIndex: number) => {
    if (showCheckOutDays === guestIndex) {
      setShowCheckOutDays(null);
    } else {
      setShowCheckOutDays(guestIndex);
    }
  };

  // Calculate check-out date based on length of stay - FIXED: Use guest's actual start day
  const calculateCheckOutDate = (guest: any) => {
    if (!guest.lengthOfStay || isNaN(parseInt(guest.lengthOfStay))) return null;
    
    const stayDuration = parseInt(guest.lengthOfStay);
    
    // For saved guests, use their actual start day; for new guests, use current modal day
    const startDay = guest._saved ? guest._startDay : day;
    const startMonth = guest._saved ? guest._startMonth : selectedMonth;
    const startYear = guest._saved ? guest._startYear : selectedYear;
    
    return addDays(startDay, startMonth, startYear, stayDuration);
  };

  // Get button text for check-out dates - FIXED: Use consistent start day
  const getCheckOutButtonText = (guest: any, guestIndex: number) => {
    if (showCheckOutDays === guestIndex) {
      return 'Hide Set Departure';
    }
    
    if (guest.lengthOfStay && !isNaN(parseInt(guest.lengthOfStay))) {
      const checkOutDate = calculateCheckOutDate(guest);
      if (checkOutDate) {
        return `Check-out: ${formatDate(checkOutDate.day, checkOutDate.month, checkOutDate.year)}`;
      }
    }
    
    return 'Set Departure';
  };

  // Copy guest ID to clipboard
  // const copyGuestId = (guestId: string) => {
  //   navigator.clipboard.writeText(guestId).then(() => {
  //     console.log("Guest ID copied to clipboard:", guestId);
  //   }).catch(err => {
  //     console.error("Failed to copy guest ID:", err);
  //   });
  // };


  // Confirm and execute global removal
  const confirmGlobalRemove = async () => {
    setGlobalRemoveModal(false);
    setRemovingAllGuests(true);

    try {
      if (onChange) {
        onChange(true);
      }

      await onRemoveAllGuests(day, room);
      console.log("✅ Remove All Guests operation completed successfully");
      onClose();

    } catch (error) {
      setError("Failed to remove all guests. Please try again.");
    } finally {
      setRemovingAllGuests(false);
    }
  };

  // Add guest (unsaved by default)
  const handleAddGuest = () => {
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
        // Set start day info for new guests
        _startDay: day,
        _startMonth: selectedMonth,
        _startYear: selectedYear,
      },
    ]);
  };

  // Update guest field - only allowed for start day guests in edit mode
  const handleUpdateGuest = (idx, field, value) => {
    const guest = guests[idx];
    
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
              _originalData: { ...g },
              _originalStayId: g._stayId,
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
    
    if (onChange) {
      if (guest._originalData) {
        onChange(false);
      } else {
        onChange(true);
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
    setShowCheckOutDays(null);
  };

  // Update handleSaveGuest to include original data
  const handleSaveGuest = async (idx: number) => {
    const guest = guests[idx];
    
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

    setError("");
    setSaving(true);

    try {
      if (onChange) {
        onChange(false);
      }

      const savedGuest = {
        ...guest,
        age: parseInt(guest.age),
        lengthOfStay: parseInt(guest.lengthOfStay),
        _saved: true,
        _isStartDay: guest._isStartDay,
        _editing: false, // Set editing to false after save
        _originalData: null,
        // Ensure start day info is preserved
        _startDay: guest._startDay || day,
        _startMonth: guest._startMonth || selectedMonth,
        _startYear: guest._startYear || selectedYear,
      };

      const success = await onSave(day, room, {
        guests: [savedGuest],
        singleGuest: true,
        isEdit: !!guest._originalStayId,
      });

      if (success) {
        setGuests(guests.map((g, i) => (i === idx ? savedGuest : g)));
      } else {
        setError("Failed to save guest. Please try again.");
      }

    } catch (error) {
      setError("Failed to save guest. Please try again.");
    } finally {
      setSaving(false);
      setShowCheckOutDays(null);
    }
  };

  // Modal exit (X button)
  const handleExit = () => onClose();

  // Check if guest is editable
  const isGuestEditable = (guest) => {
    return guest._editing || !guest._saved || (guest._saved && guest._isStartDay);
  };

  // Check if guest can be edited
  const canEditGuest = (guest) => {
    return guest._saved && guest._isStartDay && !guest._editing;
  };

  // Check if guest shows action buttons
  const showActionButtons = (guest) => {
    return !guest._saved || (guest._saved && guest._isStartDay);
  };

  // Check if check-out button should be clickable
  const isCheckOutButtonClickable = (guest) => {
    return guest._editing && isGuestEditable(guest);
  };

  // Format guest ID for display (shortened version)
  // const formatGuestId = (stayId: string) => {
  //   if (!stayId) return "No ID";
  //   if (stayId.length > 16) {
  //     return `${stayId.substring(0, 8)}...${stayId.substring(stayId.length - 8)}`;
  //   }
  //   return stayId;
  // };


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
      if (onChange) {
        onChange(true);
      }

      setGuests((prevGuests) => {
        return prevGuests.filter((_, i) => i !== idx);
      });

      const success = await onSave(day, room, {
        guests: [],
        removeGuest: {
          ...guestToDelete,
          _stayId: guestToDelete._stayId,
        },
        singleGuest: true,
      });

      if (success) {
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

            {/* Show guest fields for each guest */}
            {guests.map((guest, idx) => {
              // const checkOutDate = calculateCheckOutDate(guest);
              const checkOutButtonText = getCheckOutButtonText(guest, idx);
              const isCheckOutClickable = isCheckOutButtonClickable(guest);
              
              return (
                <div key={idx} className="mb-3 border rounded p-2">
                  {/* Guest header showing edit status */}
                  <div className="d-flex justify-between align-items-center mb-2">
                    <h6 className="mb-0">
                      Guest {idx + 1}
                      {guest._saved && (
                        <span className={`badge ${guest._isStartDay ? 'bg-warning' : 'bg-info'} ms-2`}>
                          {guest._isStartDay ? 'Arrival Day' : 'Ongoing Stay'}
                        </span>
                      )}
                      {guest._editing && (
                        <span className="badge bg-success ms-2">Editing</span>
                      )}
                    </h6>
                    {!isGuestEditable(guest) && !guest._editing && (
                      <small className="text-muted">View Mode</small>
                    )}
                  </div>


                  {/* Per-guest check-in toggle - only editable in edit mode */}
                  <div className="form-group mb-2">
                   <label className="form-label fw-bold">Arrival Type:</label>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className={`btn ${guest.isCheckIn ? "btn-warning" : "btn-outline-warning"} flex-fill`}
                      onClick={() => handleUpdateGuest(idx, "isCheckIn", "true")}
                      disabled={disabled || !isGuestEditable(guest)}
                      style={{ color: guest.isCheckIn ? "black" : "black" }}
                    >
                      New Arrival
                    </button>

                    <button
                      type="button"
                      className={`btn ${!guest.isCheckIn ? "btn-primary" : "btn-outline-primary"} flex-fill`}
                      onClick={() => handleUpdateGuest(idx, "isCheckIn", "false")}
                      disabled={disabled || !isGuestEditable(guest)}
                      style={{ color: !guest.isCheckIn ? "white" : "black" }}
                    >
                      Continuing Stay
                    </button>
                  </div>

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
                  
                  {/* Enhanced Length of Stay Section with Check-out Days */}
                  <div className="row mt-2 pt-3">
                    <div className="col">
                      
                      {/* Check-out Days Button - Full width, always visible but only clickable in edit mode */}
                      <div className="mb-2">
                        <button
                          type="button"
                          className={`btn d-flex align-items-center justify-content-center gap-2 w-100 ${
                            isCheckOutClickable 
                              ? showCheckOutDays === idx 
                                ? 'btn-outline-secondary' 
                                : 'btn-outline-primary'
                              : 'btn-outline-secondary'
                          }`}
                          onClick={() => isCheckOutClickable && toggleCheckOutDays(idx)}
                          disabled={disabled || !isCheckOutClickable}
                          title={
                            isCheckOutClickable 
                              ? "Click to show/hide check-out dates" 
                              : "Click Edit button to modify check-out date"
                          }
                        >
                          <Calendar size={16} />
                          {checkOutButtonText}
                        </button>
                        
                        {showCheckOutDays === idx && isCheckOutClickable && (
                          <div className="check-out-days-container mt-2 p-2 border rounded bg-light">
                            <div className="d-flex justify-between align-items-center mb-2">
                              <small className="text-muted fw-bold">
                                Arrival: {formatDate(
                                  guest._saved ? guest._startDay : day,
                                  guest._saved ? guest._startMonth : selectedMonth,
                                  guest._saved ? guest._startYear : selectedYear
                                )}
                              </small>
                              <small className="text-muted">
                                Limit: {MAX_LENGTH_OF_STAY} days (until {formatDate(
                                  generateCheckOutDays[generateCheckOutDays.length - 1].day,
                                  generateCheckOutDays[generateCheckOutDays.length - 1].month,
                                  generateCheckOutDays[generateCheckOutDays.length - 1].year
                                )})
                              </small>
                            </div>
                            
                            {/* Group dates by month for better organization */}
                            <div className="check-out-days-grid" style={{ 
                              maxHeight: '300px', 
                              overflowY: 'auto'
                            }}>
                              {(() => {
                                const groupedByMonth: { [key: string]: any[] } = {};
                                
                                generateCheckOutDays.forEach((checkOutDay) => {
                                  const monthYear = `${checkOutDay.month}-${checkOutDay.year}`;
                                  if (!groupedByMonth[monthYear]) {
                                    groupedByMonth[monthYear] = [];
                                  }
                                  groupedByMonth[monthYear].push(checkOutDay);
                                });
                                
                                return Object.entries(groupedByMonth).map(([monthYear, days]) => {
                                  const [month, year] = monthYear.split('-');
                                  const monthName = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                                  
                                  return (
                                    <div key={monthYear} className="month-group mb-3">
                                      <h6 className="text-primary mb-2 border-bottom pb-1">{monthName}</h6>
                                      <div className="d-flex flex-wrap gap-1">
                                        {days.map((checkOutDay, dayIdx) => (
                                          <button
                                            key={dayIdx}
                                            type="button"
                                            className="btn btn-outline-success btn-sm"
                                            onClick={() => handleCheckOutDaySelect(
                                              idx, 
                                              checkOutDay.stayDuration, // ✅ FIXED: Use stayDuration instead of day
                                            )}
                                            disabled={disabled}
                                            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                                            title={`${checkOutDay.stayDuration} days stay - Check out on ${checkOutDay.display}`}
                                          >
                                            {checkOutDay.day}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                            
                            <small className="text-muted d-block mt-2">
                              Showing all available departure dates within {MAX_LENGTH_OF_STAY} days maximum stay
                            </small>
                          </div>
                        )}
                      </div>
                      
                      {/* <input
                        type="number"
                        className="form-control"
                        placeholder="Length of Stay"
                        value={guest.lengthOfStay}
                        onChange={e => handleUpdateGuest(idx, "lengthOfStay", e.target.value)}
                        min="1"
                        max={MAX_LENGTH_OF_STAY}
                        disabled={disabled || !isGuestEditable(guest)}
                      /> */}
                    </div>
                  </div>
                  
                  {/* Action buttons - Only show for start day guests or unsaved guests */}
                 {showActionButtons(guest) && (
                    <div className="d-flex justify-between align-items-center w-100 mt-2"> {/* Changed to justify-between and added w-100 */}
                      {!guest._saved || guest._editing ? (
                        <div className="d-flex gap-2"> {/* Container for Save and Cancel buttons */}
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
                        </div>
                      ) : (
                        <>
                          {canEditGuest(guest) && (
                            <div className="d-flex justify-between align-items-center w-100">
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
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Message for read-only guests */}
                  {!showActionButtons(guest) && (
                    <div className="text-center mt-2 p-2 bg-light rounded">
                      <small className="text-muted">
                        Edit or delete from their arrival day {formatDate(guest._startDay, guest._startMonth, guest._startYear)}.
                      </small>
                    </div>
                  )}
                </div>
              );
            })}

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
            <div className="flex justify-end items-center w-full">
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