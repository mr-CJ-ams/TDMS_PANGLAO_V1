import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import MonthYearSelector from "./MonthYearSelector";
import MonthlyGrid from "./MonthlyGrid";
import GuestModal from "./GuestModal";
import MetricsDisplay from "./MetricsDisplay";
import SaveButton from "./SaveButton";
import RoomSearchBar from "./RoomSearchBar";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const SubmissionForm = () => {
  const [selectedDate, setSelectedDate] = useState(null),
    [selectedRoom, setSelectedRoom] = useState(null),
    [isModalOpen, setIsModalOpen] = useState(false),
    [occupiedRooms, setOccupiedRooms] = useState([]),
    [monthlyData, setMonthlyData] = useState({}),
    [isFormSaved, setIsFormSaved] = useState(false),
    [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1),
    [selectedYear, setSelectedYear] = useState(new Date().getFullYear()),
    [averageGuestNights, setAverageGuestNights] = useState("0"),
    [averageRoomOccupancyRate, setAverageRoomOccupancyRate] = useState("0"),
    [averageGuestsPerRoom, setAverageGuestsPerRoom] = useState("0"),
    [user, setUser] = useState(null),
    [numberOfRooms, setNumberOfRooms] = useState(0),
    [hasSubmitted, setHasSubmitted] = useState(false),
    [isLoading, setIsLoading] = useState(true);
  const gridRef = useRef(null);

  // Fetch user profile
  useEffect(() => {
    (async () => {
      try {
        const token = sessionStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE_URL}/auth/user`, { headers: { Authorization: `Bearer ${token}` } });
        setUser(data);
        setNumberOfRooms(data.number_of_rooms);
      } catch (err) { console.error("Error fetching user profile:", err); }
    })();
  }, []);

  // Check if already submitted for month/year
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const token = sessionStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE_URL}/api/submissions/check-submission`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { user_id: user.user_id, month: selectedMonth, year: selectedYear }
        });
        setHasSubmitted(data.hasSubmitted);
      } catch (err) { console.error("Error checking submission:", err); }
    })();
  }, [user, selectedMonth, selectedYear]);

  // Load data for selected month/year
  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    const key = `${selectedYear}-${selectedMonth}`;
    (async () => {
      try {
        const token = sessionStorage.getItem("token");
        const [serverRes, localData] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/submissions/draft/${user.user_id}/${selectedMonth}/${selectedYear}`, { headers: { Authorization: `Bearer ${token}` } }),
          loadDataFromLocalStorage(user.user_id)
        ]);
        const serverData = Array.isArray(serverRes.data?.days) ? serverRes.data.days : [];
        const localMonthData = Array.isArray(localData[key]) ? localData[key] : [];
        const getRoomKey = r => `${r.day}-${r.room}`;
        const uniqueRooms = new Map();
        localMonthData.forEach(r => uniqueRooms.set(getRoomKey(r), r));
        serverData.forEach(r => uniqueRooms.set(getRoomKey(r), r));
        let mergedRooms = Array.from(uniqueRooms.values());

        // Load previous month's continuing stays
        const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1, prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
        try {
          const prevRes = await axios.get(`${API_BASE_URL}/api/submissions/draft/${user.user_id}/${prevMonth}/${prevYear}`, { headers: { Authorization: `Bearer ${token}` } });
          const prevData = Array.isArray(prevRes.data?.days) ? prevRes.data.days : [];
          const prevMonthDays = getDaysInMonth(prevMonth, prevYear);
          const continuing = prevData.filter(r => r.startDay && r.lengthOfStay && (r.startDay + r.lengthOfStay - 1 > prevMonthDays));
          if (continuing.length)
            mergedRooms = [...mergedRooms, ...continuing.map(stay => ({ ...stay, day: 1, isCheckIn: false }))];
        } catch { }

        const mergedData = { ...localData, [key]: mergedRooms };
        setMonthlyData(mergedData);
        setOccupiedRooms(mergedRooms);

        // If no draft, check for submitted data
        if (mergedRooms.length === 0) {
          try {
            const subRes = await axios.get(`${API_BASE_URL}/api/submissions/${user.user_id}/${selectedMonth}/${selectedYear}`, { headers: { Authorization: `Bearer ${token}` } });
            if (subRes.data) {
              const submittedData = Array.isArray(subRes.data.days) ? subRes.data.days : [];
              const updatedData = { ...mergedData, [key]: submittedData };
              setMonthlyData(updatedData);
              setOccupiedRooms(submittedData);
              saveDataToLocalStorage(user.user_id, updatedData);
            }
          } catch { }
        }
      } catch (err) {
        console.error("Error loading data:", err);
        const cachedData = loadDataFromLocalStorage(user.user_id);
        const fallbackData = Array.isArray(cachedData[key]) ? cachedData[key] : [];
        setMonthlyData({ ...cachedData, [key]: fallbackData });
        setOccupiedRooms(fallbackData);
      } finally { setIsLoading(false); }
    })();
  }, [user, selectedMonth, selectedYear]);

  // Save to localStorage and server on monthlyData change
  useEffect(() => {
    if (!user || isLoading) return;
    const saveData = async () => {
      try {
        saveDataToLocalStorage(user.user_id, monthlyData);
        const key = `${selectedYear}-${selectedMonth}`;
        const cleanData = (monthlyData[key] || []).map(item => ({
          ...item,
          guests: item.guests.map(g => ({ ...g, age: Number(g.age) || 0, isCheckIn: Boolean(g.isCheckIn) }))
        }));
        const token = sessionStorage.getItem("token");
        await axios.post(`${API_BASE_URL}/api/submissions/draft`, {
          userId: user.user_id, month: selectedMonth, year: selectedYear, data: cleanData
        }, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      } catch (err) { console.error("Background save failed:", err); }
    };
    const debounceTimer = setTimeout(saveData, 500);
    return () => clearTimeout(debounceTimer);
  }, [monthlyData, user, selectedMonth, selectedYear, isLoading]);

  // Room search
  const handleSearch = roomNumber => {
    if (roomNumber > 0 && roomNumber <= numberOfRooms) {
      const el = gridRef.current.querySelector(`th[data-room="${roomNumber}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else alert("Invalid room number");
  };

  // Cell click
  const handleCellClick = (day, room) => { setSelectedDate(day); setSelectedRoom(room); setIsModalOpen(true); };

  // Save guest data for a day/room
  const handleSaveGuests = (day, room, guestData) => {
    const { guests, lengthOfStay, isCheckIn } = guestData;
    if (!guests?.length) return alert("Please add at least one guest");
    const stayLength = parseInt(lengthOfStay);
    if (isNaN(stayLength) || stayLength <= 0) return alert("Please enter a valid length of stay");
    const currentStayId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const conflictDetails = findRoomConflictAcrossMonths(day, room, stayLength, occupiedRooms, monthlyData);
    if (conflictDetails.hasConflict) {
      const availableRoom = findAvailableRoomAcrossMonths(day, stayLength, occupiedRooms, monthlyData, room);
      if (!availableRoom) return alert(`⚠️ This Length of Overnight Stay overlaps with existing occupied rooms. Conflict found in ${conflictDetails.month}/${conflictDetails.year}`);
      room = availableRoom;
      alert(`Room ${room} is not available for the entire stay. Automatically assigned to Room ${availableRoom}`);
    }
    const updatedGuests = guests.map(g => ({ ...g, isCheckIn }));
    const updatedMonthlyData = removeExistingStay(currentStayId, monthlyData);
    const newMonthlyData = addStayToMonthlyData(
      updatedMonthlyData, day, room, stayLength, updatedGuests, isCheckIn, currentStayId, selectedMonth, selectedYear
    );
    const currentMonthKey = `${selectedYear}-${selectedMonth}`;
    setMonthlyData(newMonthlyData);
    setOccupiedRooms(newMonthlyData[currentMonthKey] || []);
  };

  // Room occupied check
  const isRoomOccupied = (day, room) => Array.isArray(occupiedRooms) && occupiedRooms.some(r => r.day === day && r.room === room);

  // Room color
  const getRoomColor = (day, room) => {
    if (!Array.isArray(occupiedRooms)) return "white";
    const roomData = occupiedRooms.find(r => r.day === day && r.room === room);
    return roomData ? (roomData.isCheckIn ? "#FBBF24" : "#34D399") : "white";
  };

  // Guest data for modal
  const getGuestData = (day, room) => Array.isArray(occupiedRooms) ? occupiedRooms.find(r => r.day === day && r.room === room) : null;

  // Daily totals
  const calculateDailyTotals = day => {
    const rooms = Array.isArray(occupiedRooms) ? occupiedRooms : [];
    if (!rooms.length) return { checkIns: 0, overnight: 0, occupied: 0 };
    const dayRooms = rooms.filter(r => r.day === day);
    const checkIns = dayRooms.filter(r => r.isCheckIn).reduce((a, r) => a + (r.guests?.length || 0), 0);
    const overnight = dayRooms.reduce((a, r) => a + (r.guests?.length || 0), 0);
    const occupied = new Set(dayRooms.map(r => r.room)).size;
    return { checkIns, overnight, occupied };
  };

  // Overall metrics
  const calculateOverallTotals = () => {
    const totalCheckIns = occupiedRooms.filter(r => r.isCheckIn && r.guests.length > 0).reduce((a, r) => a + r.guests.length, 0);
    const totalOvernight = occupiedRooms.filter(r => r.guests.length > 0).reduce((a, r) => a + r.guests.length, 0);
    const totalRoomsOccupied = new Set(occupiedRooms.filter(r => r.guests.length > 0).map(r => r.room)).size;
    const totalRoomsAvailable = numberOfRooms;
    return {
      averageGuestNights: totalCheckIns > 0 ? (totalOvernight / totalCheckIns).toFixed(2) : "0",
      averageRoomOccupancyRate: totalRoomsAvailable > 0 ? ((totalRoomsOccupied / totalRoomsAvailable) * 100).toFixed(2) : "0",
      averageGuestsPerRoom: totalRoomsOccupied > 0 ? (totalOvernight / totalRoomsOccupied).toFixed(2) : "0"
    };
  };

  // Submit form
  const handleSaveForm = async () => {
    if (!window.confirm("Are you sure you want to submit the form? This action cannot be undone.")) return;
    if (hasSubmitted) return alert("You have already submitted for this month and year.");
    try {
      const token = sessionStorage.getItem("token");
      const user = JSON.parse(sessionStorage.getItem("user"));
      const submissionData = {
        user_id: user.user_id,
        month: selectedMonth,
        year: selectedYear,
        days: Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => ({
          day,
          checkIns: calculateDailyTotals(day).checkIns,
          overnight: calculateDailyTotals(day).overnight,
          occupied: calculateDailyTotals(day).occupied,
          guests: occupiedRooms.filter(r => r.day === day).flatMap(room =>
            room.guests.map(guest => ({ roomNumber: room.room, ...guest }))
          ),
        })),
      };
      await axios.post(`${API_BASE_URL}/api/submissions/submit`, submissionData, { headers: { Authorization: `Bearer ${token}` } });
      await axios.delete(`${API_BASE_URL}/api/submissions/draft/${user.user_id}/${selectedMonth}/${selectedYear}`, { headers: { Authorization: `Bearer ${token}` } });
      const metrics = calculateOverallTotals();
      setAverageGuestNights(metrics.averageGuestNights);
      setAverageRoomOccupancyRate(metrics.averageRoomOccupancyRate);
      setAverageGuestsPerRoom(metrics.averageGuestsPerRoom);
      setIsFormSaved(true);
      setHasSubmitted(true);
      alert("Submission saved successfully!");
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Failed to save submission. Please try again.");
    }
  };

  // Remove all guests for a day/room
  const handleRemoveAllGuests = (day, room) => {
    const updatedRooms = occupiedRooms.filter(r => !(r.day === day && r.room === room));
    const key = `${selectedYear}-${selectedMonth}`;
    setOccupiedRooms(updatedRooms);
    setMonthlyData(prev => ({ ...prev, [key]: updatedRooms }));
  };

  // Clear all guest data for month
  const handleClearMonth = () => {
    if (!window.confirm("Are you sure you want to clear all guest data for this month? This action cannot be undone.")) return;
    const key = `${selectedYear}-${selectedMonth}`;
    setMonthlyData(prev => ({ ...prev, [key]: [] }));
    setOccupiedRooms([]);
  };

  // Days in month
  const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();
  const [daysInMonth, setDaysInMonth] = useState(getDaysInMonth(selectedMonth, selectedYear));
  useEffect(() => { setDaysInMonth(getDaysInMonth(selectedMonth, selectedYear)); }, [selectedMonth, selectedYear]);

  // LocalStorage helpers
  const saveDataToLocalStorage = (userId, data) => {
    try { localStorage.setItem(`submission_${userId}`, JSON.stringify(data)); } catch (err) { console.error("Error saving to localStorage:", err); }
  };
  const loadDataFromLocalStorage = userId => {
    try { const d = localStorage.getItem(`submission_${userId}`); return d ? JSON.parse(d) : {}; } catch { return {}; }
  };

  // Month helpers
  const isCurrentMonth = (m, y) => {
    const d = new Date(), cy = d.getFullYear(), cm = d.getMonth() + 1;
    return y === cy && m === cm;
  };
  const isFutureMonth = (m, y) => {
    const d = new Date(), cy = d.getFullYear(), cm = d.getMonth() + 1;
    return y > cy || (y === cy && m > cm);
  };
  const isFutureMonthValue = isFutureMonth(selectedMonth, selectedYear);
  const isCurrentMonthValue = isCurrentMonth(selectedMonth, selectedYear);

  // Room conflict helpers
  const hasRoomConflict = (startDay, room, lengthOfStay, currentOccupancies) =>
    findRoomConflictAcrossMonths(startDay, room, lengthOfStay, currentOccupancies, monthlyData).hasConflict;

  function findRoomConflictAcrossMonths(startDay, room, lengthOfStay, currentOccupancies, allMonthlyData, currentStayId) {
    let remainingDays = lengthOfStay, currentDay = startDay, currentMonth = selectedMonth, currentYear = selectedYear, daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);
    while (remainingDays > 0) {
      const daysToCheck = Math.min(remainingDays, daysInCurrentMonth - currentDay + 1);
      const monthKey = `${currentYear}-${currentMonth}`;
      const monthData = currentMonth === selectedMonth && currentYear === selectedYear ? currentOccupancies : allMonthlyData[monthKey] || [];
      const hasConflict = monthData.some(occ =>
        occ.room === room && occ.day >= currentDay && occ.day <= currentDay + daysToCheck - 1 && (!currentStayId || occ.stayId !== currentStayId)
      );
      if (hasConflict) return { hasConflict: true, month: currentMonth, year: currentYear, day: currentDay };
      remainingDays -= daysToCheck; currentDay = 1;
      if (++currentMonth > 12) { currentMonth = 1; currentYear++; }
      daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);
    }
    return { hasConflict: false };
  }

  function findAvailableRoomAcrossMonths(startDay, lengthOfStay, currentOccupancies, allMonthlyData, excludedRoom = null) {
    for (let room = 1; room <= numberOfRooms; room++) {
      if (room === excludedRoom) continue;
      if (!findRoomConflictAcrossMonths(startDay, room, lengthOfStay, currentOccupancies, allMonthlyData).hasConflict) return room;
    }
    return null;
  }

  function removeExistingStay(stayId, monthlyData) {
    const updated = { ...monthlyData };
    for (const k in updated) if (Array.isArray(updated[k])) updated[k] = updated[k].filter(r => r.stayId !== stayId);
    return updated;
  }

  function addStayToMonthlyData(monthlyData, startDay, room, lengthOfStay, guests, isCheckIn, stayId, startMonth, startYear) {
    const updated = { ...monthlyData };
    let remainingDays = lengthOfStay, currentDay = startDay, currentMonth = startMonth, currentYear = startYear, isFirstDay = true;
    while (remainingDays > 0) {
      const daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear), daysToAdd = Math.min(remainingDays, daysInCurrentMonth - currentDay + 1);
      const monthKey = `${currentYear}-${currentMonth}`, monthData = updated[monthKey] || [];
      for (let day = currentDay; day < currentDay + daysToAdd; day++) {
        monthData.push({
          day,
          room,
          guests: guests.map(g => ({ ...g, isCheckIn: isFirstDay && isCheckIn })),
          lengthOfStay,
          isCheckIn: isFirstDay && isCheckIn,
          stayId,
          startDay,
          startMonth,
          startYear
        });
        isFirstDay = false;
      }
      updated[monthKey] = monthData;
      remainingDays -= daysToAdd; currentDay = 1;
      if (++currentMonth > 12) { currentMonth = 1; currentYear++; }
    }
    return updated;
  }

  return (
    <div className="container mt-5">
      <h2>Monthly Recording Format</h2>
      <p>Form: DAE-1A</p>
      <SaveButton
        onSave={handleSaveForm}
        isFormSaved={isFormSaved}
        hasSubmitted={hasSubmitted}
        isFutureMonth={isFutureMonthValue}
        isCurrentMonth={isCurrentMonthValue}
      />
      <MonthYearSelector
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={e => setSelectedMonth(parseInt(e.target.value))}
        onYearChange={e => setSelectedYear(parseInt(e.target.value))}
      />
      <RoomSearchBar onSearch={handleSearch} />
      <button className="btn btn-danger mt-3" onClick={handleClearMonth} disabled={hasSubmitted}>Clear All Data</button>
      <div ref={gridRef}>
        <MonthlyGrid
          daysInMonth={daysInMonth}
          numberOfRooms={numberOfRooms}
          onCellClick={handleCellClick}
          isRoomOccupied={isRoomOccupied}
          getRoomColor={getRoomColor}
          calculateDailyTotals={calculateDailyTotals}
          disabled={hasSubmitted || isFutureMonthValue}
        />
      </div>
      {isModalOpen && (
        <GuestModal
          day={selectedDate}
          room={selectedRoom}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveGuests}
          onRemoveAllGuests={handleRemoveAllGuests}
          initialData={getGuestData(selectedDate, selectedRoom)}
          disabled={hasSubmitted}
          isCurrentMonth={isCurrentMonthValue}
          hasRoomConflict={hasRoomConflict}
          occupiedRooms={occupiedRooms}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
        />
      )}
      {isFormSaved && (
        <MetricsDisplay
          averageGuestNights={averageGuestNights}
          averageRoomOccupancyRate={averageRoomOccupancyRate}
          averageGuestsPerRoom={averageGuestsPerRoom}
        />
      )}
    </div>
  );
};

export default SubmissionForm;