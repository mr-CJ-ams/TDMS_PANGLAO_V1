import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import MonthYearSelector from "./MonthYearSelector";
import MonthlyGrid from "./MonthlyGrid";
import GuestModal from "./GuestModal";
import MetricsDisplay from "./MetricsDisplay";
import SaveButton from "./SaveButton";
import RoomSearchBar from "./RoomSearchBar";

const SubmissionForm = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [occupiedRooms, setOccupiedRooms] = useState([]); // Data for the current month
  const [monthlyData, setMonthlyData] = useState({}); // Data for all months
  const [isFormSaved, setIsFormSaved] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [averageGuestNights, setAverageGuestNights] = useState("0");
  const [averageRoomOccupancyRate, setAverageRoomOccupancyRate] = useState("0");
  const [averageGuestsPerRoom, setAverageGuestsPerRoom] = useState("0");
  const [user, setUser] = useState(null);
  const [numberOfRooms, setNumberOfRooms] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  const gridRef = useRef(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        setNumberOfRooms(response.data.number_of_rooms);

        // Load cached data from localStorage after user data is fetched
        const cachedData = loadDataFromLocalStorage(response.data.user_id);
        setMonthlyData(cachedData);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUserProfile();
  }, []);

  // Check if the user has already submitted for the selected month and year
  useEffect(() => {
    const checkSubmission = async () => {
      if (user) {
        try {
          const token = sessionStorage.getItem("token");
          const response = await axios.get(`${API_BASE_URL}/api/submissions/check-submission`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { user_id: user.user_id, month: selectedMonth, year: selectedYear },
          });
          setHasSubmitted(response.data.hasSubmitted);
        } catch (err) {
          console.error("Error checking submission:", err);
        }
      }
    };

    checkSubmission();
  }, [user, selectedMonth, selectedYear]);

  // Load data for the selected month/year
  useEffect(() => {
    if (user) {
      const key = `${selectedYear}-${selectedMonth}`;
      const cachedData = monthlyData[key] || [];
      setOccupiedRooms(cachedData); // Set data for the current month

      // Fetch data from the backend if not already cached
      if (!monthlyData[key]) {
        const fetchSubmissionData = async () => {
          try {
            const token = sessionStorage.getItem("token");
            const response = await axios.get(
              `${API_BASE_URL}/api/submissions/${user.user_id}/${selectedMonth}/${selectedYear}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data) {
              setMonthlyData((prev) => ({
                ...prev,
                [key]: response.data.days || [],
              }));
            }
          } catch (err) {
            console.error("Error fetching submission data:", err);
          }
        };
        fetchSubmissionData();
      }
    }
  }, [user, selectedMonth, selectedYear, monthlyData]);

  // Save data to localStorage whenever monthlyData changes
  useEffect(() => {
    if (user) {
      saveDataToLocalStorage(user.user_id, monthlyData);
    }
  }, [monthlyData, user]);

  // Handle search for a specific room
  const handleSearch = (roomNumber) => {
    if (roomNumber > 0 && roomNumber <= numberOfRooms) {
      const roomElement = gridRef.current.querySelector(`th[data-room="${roomNumber}"]`);
      if (roomElement) {
        roomElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      alert("Invalid room number");
    }
  };

  // Handle cell click in the monthly grid
  const handleCellClick = (day, room) => {
    setSelectedDate(day);
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  // Save guest data for a specific day and room
  const handleSaveGuests = (day, room, guestData) => {
    const { guests, lengthOfStay, isCheckIn } = guestData;

    // Mark the first day as a check-in
    const updatedGuests = guests.map((guest) => ({
      ...guest,
      isCheckIn: isCheckIn,
    }));

    // Save the first day's data
    const updatedRooms = [
      ...(occupiedRooms || []).filter((r) => !(r.day === day && r.room === room)), // Remove existing entry
      {
        day,
        room,
        guests: updatedGuests,
        lengthOfStay,
        isCheckIn: isCheckIn,
      },
    ];

    // Mark the remaining days as overnight stays (not check-ins)
    for (let i = 1; i < lengthOfStay; i++) {
      const nextDay = day + i;
      if (nextDay <= daysInMonth) {
        updatedRooms.push({
          day: nextDay,
          room,
          guests: guests.map((guest) => ({
            ...guest,
            isCheckIn: false,
          })),
          lengthOfStay,
          isCheckIn: false,
        });
      }
    }

    // Update occupiedRooms and monthlyData
    setOccupiedRooms(updatedRooms);
    const key = `${selectedYear}-${selectedMonth}`;
    setMonthlyData((prev) => ({
      ...prev,
      [key]: updatedRooms,
    }));
  };

  // Check if a room is occupied on a specific day
  const isRoomOccupied = (day, room) => {
    return occupiedRooms.some((r) => r.day === day && r.room === room);
  };

  // Get the color for a room based on its status
  const getRoomColor = (day, room) => {
    const roomData = occupiedRooms.find((r) => r.day === day && r.room === room);
    if (roomData) {
      return roomData.isCheckIn ? "#FBBF24" : "#34D399";
    }
    return "white";
  };

  // Get guest data for a specific day and room
  const getGuestData = (day, room) => {
    return occupiedRooms.find((r) => r.day === day && r.room === room);
  };

  // Calculate daily totals for check-ins, overnight stays, and occupied rooms
  const calculateDailyTotals = (day) => {
    if (!occupiedRooms || occupiedRooms.length === 0) {
      return { checkIns: 0, overnight: 0, occupied: 0 };
    }

    const dayRooms = occupiedRooms.filter((r) => r.day === day);

    const checkIns = dayRooms
      .filter((r) => r.isCheckIn)
      .reduce((acc, room) => acc + room.guests.length, 0);
    const overnight = dayRooms.reduce(
      (acc, room) => acc + room.guests.length,
      0
    );
    const occupied = new Set(dayRooms.map((r) => r.room)).size;

    return {
      checkIns,
      overnight,
      occupied,
    };
  };

  // Calculate overall metrics
  const calculateOverallTotals = () => {
    const totalCheckIns = occupiedRooms
      .filter((r) => r.isCheckIn && r.guests.length > 0)
      .reduce((acc, room) => acc + room.guests.length, 0);
    const totalOvernight = occupiedRooms
      .filter((r) => r.guests.length > 0)
      .reduce((acc, room) => acc + room.guests.length, 0);
    const totalRoomsOccupied = new Set(
      occupiedRooms.filter((r) => r.guests.length > 0).map((r) => r.room)
    ).size;

    const totalRoomsAvailable = numberOfRooms;

    const averageGuestNights =
      totalCheckIns > 0 ? (totalOvernight / totalCheckIns).toFixed(2) : "0";
    const averageRoomOccupancyRate =
      totalRoomsAvailable > 0
        ? ((totalRoomsOccupied / totalRoomsAvailable) * 100).toFixed(2)
        : "0";
    const averageGuestsPerRoom =
      totalRoomsOccupied > 0
        ? (totalOvernight / totalRoomsOccupied).toFixed(2)
        : "0";

    return {
      averageGuestNights,
      averageRoomOccupancyRate,
      averageGuestsPerRoom,
    };
  };

  // Handle form submission
  const handleSaveForm = async () => {
    const isConfirmed = window.confirm("Are you sure you want to submit the form? This action cannot be undone.");

    if (!isConfirmed) return;

    if (hasSubmitted) {
      alert("You have already submitted for this month and year.");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const user = JSON.parse(sessionStorage.getItem("user"));

      // Transform data for backend
      const submissionData = {
        user_id: user.user_id,
        month: selectedMonth,
        year: selectedYear,
        days: Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => ({
          day,
          checkIns: calculateDailyTotals(day).checkIns,
          overnight: calculateDailyTotals(day).overnight,
          occupied: calculateDailyTotals(day).occupied,
          guests: occupiedRooms
            .filter((r) => r.day === day)
            .flatMap((room) =>
              room.guests.map((guest) => ({
                roomNumber: room.room,
                ...guest,
              }))
            ),
        })),
      };

      // Send to backend
      await axios.post(`${API_BASE_URL}/api/submissions/submit`, submissionData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Calculate and show metrics
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

  // Function to remove all guest data for a specific day and room
  const handleRemoveAllGuests = (day, room) => {
    const updatedRooms = occupiedRooms.filter((r) => !(r.day === day && r.room === room));
    setOccupiedRooms(updatedRooms);
    const key = `${selectedYear}-${selectedMonth}`;
    setMonthlyData((prev) => ({
      ...prev,
      [key]: updatedRooms,
    }));
  };

  // Clear all guest data for the selected month
  const handleClearMonth = () => {
    const isConfirmed = window.confirm("Are you sure you want to clear all guest data for this month? This action cannot be undone.");
    if (!isConfirmed) return;

    const key = `${selectedYear}-${selectedMonth}`;
    setMonthlyData((prev) => ({
      ...prev,
      [key]: [], // Clear data for the selected month
    }));
    setOccupiedRooms([]); // Clear the current month's data
  };

  // Get the number of days in the selected month and year
  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const [daysInMonth, setDaysInMonth] = useState(getDaysInMonth(selectedMonth, selectedYear));

  useEffect(() => {
    setDaysInMonth(getDaysInMonth(selectedMonth, selectedYear));
  }, [selectedMonth, selectedYear]);

  // Save data to localStorage
  const saveDataToLocalStorage = (userId, data) => {
    const key = `submission_${userId}`;
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Load data from localStorage
  const loadDataFromLocalStorage = (userId) => {
    const key = `submission_${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  };

  return (
    <div className="container mt-5">
      <h2>Monthly Recording Format</h2>
      <p>Form: DAE-1A</p>

      <SaveButton onSave={handleSaveForm} isFormSaved={isFormSaved} hasSubmitted={hasSubmitted} />

      <MonthYearSelector
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={(e) => setSelectedMonth(parseInt(e.target.value))}
        onYearChange={(e) => setSelectedYear(parseInt(e.target.value))}
      />
      <RoomSearchBar onSearch={handleSearch} />

      {/* Clear Button */}
      <button
        className="btn btn-danger mt-3"
        onClick={handleClearMonth}
        disabled={hasSubmitted}
      >
        Clear All Data 
      </button>

      <div ref={gridRef}>
      <MonthlyGrid
        daysInMonth={daysInMonth}
        numberOfRooms={numberOfRooms}
        onCellClick={handleCellClick}
        isRoomOccupied={isRoomOccupied}
        getRoomColor={getRoomColor}
        calculateDailyTotals={calculateDailyTotals}
        disabled={hasSubmitted} // Pass hasSubmitted as the disabled prop
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