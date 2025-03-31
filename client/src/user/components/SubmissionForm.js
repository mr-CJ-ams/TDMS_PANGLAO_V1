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
  const [isLoading, setIsLoading] = useState(true);
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
 // Load data for the selected month/year
useEffect(() => {
  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const key = `${selectedYear}-${selectedMonth}`;
    
    try {
      // Try to load from server first
      const token = sessionStorage.getItem("token");
      const [serverResponse, localStorageData] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/submissions/draft/${user.user_id}/${selectedMonth}/${selectedYear}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        loadDataFromLocalStorage(user.user_id)
      ]);

      // Ensure we always have arrays
      const serverData = Array.isArray(serverResponse.data?.days) 
        ? serverResponse.data.days 
        : [];
      const localData = Array.isArray(localStorageData[key]) 
        ? localStorageData[key] 
        : [];

      // Create a function to uniquely identify room entries
      const getRoomKey = (room) => `${room.day}-${room.room}`;

      // Create a map to store unique rooms (server data takes precedence)
      const uniqueRooms = new Map();

      // First add local data
      localData.forEach(room => {
        uniqueRooms.set(getRoomKey(room), room);
      });

      // Then add server data (will overwrite any local duplicates)
      serverData.forEach(room => {
        uniqueRooms.set(getRoomKey(room), room);
      });

      // Convert back to array
      const mergedRooms = Array.from(uniqueRooms.values());

      const mergedData = {
        ...localStorageData,
        [key]: mergedRooms
      };

      setMonthlyData(mergedData);
      setOccupiedRooms(mergedRooms);
      
      // If no data loaded, check for submitted data
      if (mergedRooms.length === 0) {
        const submittedResponse = await axios.get(
          `${API_BASE_URL}/api/submissions/${user.user_id}/${selectedMonth}/${selectedYear}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (submittedResponse.data) {
          const submittedData = Array.isArray(submittedResponse.data.days)
            ? submittedResponse.data.days
            : [];
            
          const updatedData = {
            ...mergedData,
            [key]: submittedData
          };
          setMonthlyData(updatedData);
          setOccupiedRooms(submittedData);
          saveDataToLocalStorage(user.user_id, updatedData);
        }
      }
    } catch (err) {
      console.error("Error loading data:", err);
      // Fallback to localStorage only
      const cachedData = loadDataFromLocalStorage(user.user_id);
      const fallbackData = Array.isArray(cachedData[key]) 
        ? cachedData[key] 
        : [];
      setMonthlyData({...cachedData, [key]: fallbackData});
      setOccupiedRooms(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  loadData();
}, [user, selectedMonth, selectedYear]);

  // Save data to localStorage whenever monthlyData changes
useEffect(() => {
  if (!user || isLoading) return;

  const saveData = async () => {
    try {
      saveDataToLocalStorage(user.user_id, monthlyData);
      
      const key = `${selectedYear}-${selectedMonth}`;
      const currentMonthData = monthlyData[key] || [];
      
      // Ensure data is properly serialized
      const cleanData = currentMonthData.map(item => ({
        ...item,
        guests: item.guests.map(guest => ({
          ...guest,
          // Ensure all guest fields are properly typed
          age: Number(guest.age) || 0,
          isCheckIn: Boolean(guest.isCheckIn)
        }))
      }));

      const token = sessionStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/api/submissions/draft`, {
        userId: user.user_id,
        month: selectedMonth,
        year: selectedYear,
        data: cleanData
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error("Background save failed:", err);
    }
  };

  const debounceTimer = setTimeout(() => {
    saveData();
  }, 500);

  return () => clearTimeout(debounceTimer);
}, [monthlyData, user, selectedMonth, selectedYear, isLoading]);

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
  
    // Ensure we're working with an array
    const currentRooms = Array.isArray(occupiedRooms) ? occupiedRooms : [];
  
    const updatedGuests = Array.isArray(guests)
      ? guests.map((guest) => ({
          ...guest,
          isCheckIn: isCheckIn,
        }))
      : [];
  
    // Remove any existing entries for this day/room
    const filteredRooms = currentRooms.filter((r) => 
      !(r.day === day && r.room === room) && // Current entry
      !(r.day >= day && r.day < day + lengthOfStay && r.room === room) // Future days in stay
    );
  
    // Create new entries
    const updatedRooms = [...filteredRooms];
    
    // Add the check-in day
    updatedRooms.push({
      day,
      room,
      guests: updatedGuests,
      lengthOfStay,
      isCheckIn: true
    });
  
    // Add the subsequent days
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
          isCheckIn: false
        });
      }
    }
  
    setOccupiedRooms(updatedRooms);
    const key = `${selectedYear}-${selectedMonth}`;
    setMonthlyData((prev) => ({
      ...prev,
      [key]: updatedRooms,
    }));
  };

  

  // Check if a room is occupied on a specific day
// Update isRoomOccupied
const isRoomOccupied = (day, room) => {
  return Array.isArray(occupiedRooms) 
    ? occupiedRooms.some((r) => r.day === day && r.room === room)
    : false;
};

// Update getRoomColor
const getRoomColor = (day, room) => {
  if (!Array.isArray(occupiedRooms)) return "white";
  
  const roomData = occupiedRooms.find((r) => r.day === day && r.room === room);
  if (roomData) {
    return roomData.isCheckIn ? "#FBBF24" : "#34D399";
  }
  return "white";
};

// Update getGuestData
const getGuestData = (day, room) => {
  return Array.isArray(occupiedRooms)
    ? occupiedRooms.find((r) => r.day === day && r.room === room)
    : null;
};

  // Calculate daily totals for check-ins, overnight stays, and occupied rooms
  const calculateDailyTotals = (day) => {
    // Ensure occupiedRooms is always treated as an array
    const rooms = Array.isArray(occupiedRooms) ? occupiedRooms : [];
    
    if (rooms.length === 0) {
      return { checkIns: 0, overnight: 0, occupied: 0 };
    }
  
    // Filter for the specific day
    const dayRooms = rooms.filter((r) => r.day === day);
  
    // Calculate check-ins (only rooms marked as check-in)
    const checkIns = dayRooms
      .filter((r) => r.isCheckIn)
      .reduce((acc, room) => acc + (room.guests?.length || 0), 0);
      
    // Calculate overnight stays (all guests for the day)
    const overnight = dayRooms.reduce(
      (acc, room) => acc + (room.guests?.length || 0),
      0
    );
    
    // Calculate unique occupied rooms
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
  // Modified handleSaveForm to clear draft after submission
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

      await axios.post(`${API_BASE_URL}/api/submissions/submit`, submissionData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Clear draft after successful submission
      await axios.delete(
        `${API_BASE_URL}/api/submissions/draft/${user.user_id}/${selectedMonth}/${selectedYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

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
    try {
      const key = `submission_${userId}`;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.error("Error saving to localStorage:", err);
    }
  };

  // Load data from localStorage
  const loadDataFromLocalStorage = (userId) => {
    try {
      const key = `submission_${userId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : {};
    } catch (err) {
      console.error("Error loading from localStorage:", err);
      return {};
    }
  };

  // Helper function to check if the selected month is the current month
const isCurrentMonth = (selectedMonth, selectedYear) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-based month

  return selectedYear === currentYear && selectedMonth === currentMonth;
};

// Helper function to check if the selected month is a past month
const isPastMonth = (selectedMonth, selectedYear) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-based month

  return (
    selectedYear < currentYear ||
    (selectedYear === currentYear && selectedMonth < currentMonth)
  );
};


  const isFutureMonth = (selectedMonth, selectedYear) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-based month

  return (
    selectedYear > currentYear ||
    (selectedYear === currentYear && selectedMonth > currentMonth)
  );
};

const isFutureMonthValue = isFutureMonth(selectedMonth, selectedYear);
const isCurrentMonthValue = isCurrentMonth(selectedMonth, selectedYear);

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
        disabled={hasSubmitted || isFutureMonthValue} // Pass hasSubmitted or isFutureMonth as disabled
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