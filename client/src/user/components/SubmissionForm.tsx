import { useState, useEffect, useRef } from "react";
import axios from "axios";
import MonthYearSelector from "./MonthYearSelector";
import MonthlyGrid from "./MonthlyGrid";
import GuestModal from "./GuestModal";
import MetricsDisplay from "./MetricsDisplay";
import SaveButton from "./SaveButton";
import RoomSearchBar from "./RoomSearchBar";
import DolphinSpinner from "./DolphinSpinner";
import { FixedSizeGrid as VirtualizedGrid } from "react-window";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const SubmissionForm = () => {
  const [selectedDate, setSelectedDate] = useState<number | null>(null),
    [selectedRoom, setSelectedRoom] = useState<number | null>(null),
    [isModalOpen, setIsModalOpen] = useState(false),
    [occupiedRooms, setOccupiedRooms] = useState<any[]>([]),
    [monthlyData, setMonthlyData] = useState<any>({}),
    [isFormSaved, setIsFormSaved] = useState(false),
    [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1),
    [selectedYear, setSelectedYear] = useState(new Date().getFullYear()),
    [averageGuestNights, setAverageGuestNights] = useState("0"),
    [averageRoomOccupancyRate, setAverageRoomOccupancyRate] = useState("0"),
    [averageGuestsPerRoom, setAverageGuestsPerRoom] = useState("0"),
    [user, setUser] = useState<any | null>(null),
    [numberOfRooms, setNumberOfRooms] = useState(0),
    [hasSubmitted, setHasSubmitted] = useState(false),
    [isLoading, setIsLoading] = useState(true);

    const mainGridRef = useRef<VirtualizedGrid>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

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
    
    // Reset form saved state when switching months
    setIsFormSaved(false);
    // console.log(`🔄 Month/Year changed to ${selectedMonth}/${selectedYear} - Reset isFormSaved to false`);
    
    (async () => {
      try {
        const token = sessionStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE_URL}/api/submissions/check-submission`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { user_id: user.user_id, month: selectedMonth, year: selectedYear }
        });
        setHasSubmitted(data.hasSubmitted);
        // console.log(`📋 Submission status for ${selectedMonth}/${selectedYear}: hasSubmitted = ${data.hasSubmitted}`);
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
        if (!token) {
          throw new Error("No authentication token found");
        }

        const [serverRes, localData] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/submissions/draft/${user.user_id}/${selectedMonth}/${selectedYear}`, { 
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000 // 10 second timeout
          }),
          loadDataFromLocalStorage(user.user_id)
        ]);
        
        const serverData = Array.isArray(serverRes.data?.days) ? serverRes.data.days : [];
        const localMonthData = Array.isArray(localData[key]) ? localData[key] : [];
        const getRoomKey = (r: any) => `${r.day}-${r.room}`;
        const uniqueRooms = new Map<string, any>();
        localMonthData.forEach(r => uniqueRooms.set(getRoomKey(r), r));
        serverData.forEach(r => uniqueRooms.set(getRoomKey(r), r));
        let mergedRooms = Array.from(uniqueRooms.values());

        // Load previous month's continuing stays - FIXED LOGIC
        const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1, prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
        try {
          const prevRes = await axios.get(`${API_BASE_URL}/api/submissions/draft/${user.user_id}/${prevMonth}/${prevYear}`, { 
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000
          });
          const prevData = Array.isArray(prevRes.data?.days) ? prevRes.data.days : [];
          // const prevMonthDays = getDaysInMonth(prevMonth, prevYear);
          
          // Find continuing stays that extend into the current month - FIXED LOGIC
          const continuingStays = new Map();
          prevData.forEach(entry => {
            if (entry.startDay && entry.lengthOfStay && entry.stayId && entry.startMonth && entry.startYear) {
              // Calculate the actual end day of the stay from the original start date
              const originalStartDate = new Date(entry.startYear, entry.startMonth - 1, entry.startDay);
              const endDate = new Date(originalStartDate);
              endDate.setDate(originalStartDate.getDate() + entry.lengthOfStay - 1);
              
              // Calculate the end day in the previous month
              const prevMonthEndDate = new Date(prevYear, prevMonth, 0); // Last day of previous month
              
              // Check if the stay extends beyond the previous month
              if (endDate > prevMonthEndDate) {
                // Calculate how many days this stay should have in the current month
                const currentMonthStartDate = new Date(selectedYear, selectedMonth - 1, 1);
                const daysInCurrentMonth = getDaysInMonth(selectedMonth, selectedYear);
                const currentMonthEndDate = new Date(selectedYear, selectedMonth - 1, daysInCurrentMonth);
                
                // Calculate the actual days this stay should occupy in the current month
                const nextDayAfterPrevMonth = new Date(prevMonthEndDate);
                nextDayAfterPrevMonth.setDate(prevMonthEndDate.getDate() + 1);
                
                const stayStartInCurrentMonth = new Date(Math.max(currentMonthStartDate.getTime(), nextDayAfterPrevMonth.getTime()));
                const stayEndInCurrentMonth = new Date(Math.min(currentMonthEndDate.getTime(), endDate.getTime()));
                
                const daysInCurrentMonthForThisStay = Math.max(0, Math.floor((stayEndInCurrentMonth.getTime() - stayStartInCurrentMonth.getTime()) / (24 * 60 * 60 * 1000)) + 1);
                
                if (daysInCurrentMonthForThisStay > 0) {
                  // console.log(`Continuing stay ${entry.stayId}: ${daysInCurrentMonthForThisStay} days in ${selectedMonth}/${selectedYear}`);
                  
                  // Create entries for each day in the current month
                  for (let day = 1; day <= daysInCurrentMonthForThisStay; day++) {
                    const key = `${day}-${entry.room}`;
                    if (!continuingStays.has(key)) {
                      continuingStays.set(key, {
                        ...entry,
                        day: day,
                        isCheckIn: false, // Not a check-in day in current month
                        isStartDay: false // Not the start day in current month
                      });
                    }
                  }
                }
              }
            }
          });
          
          // Add continuing stays to merged rooms, avoiding duplicates
          const continuingEntries = Array.from(continuingStays.values());
          if (continuingEntries.length > 0) {
            // console.log(`Found ${continuingEntries.length} continuing stay entries from previous month`);
            mergedRooms = [...mergedRooms, ...continuingEntries];
          }
        } catch (prevErr) {
          console.warn("Could not load previous month data:", prevErr);
        }

        // Clean up any duplicate entries before setting the data
        const cleanedRooms = removeDuplicateEntries(mergedRooms);
        const mergedData = { ...localData, [key]: cleanedRooms };
        setMonthlyData(mergedData);
        setOccupiedRooms(cleanedRooms);

        // If no draft, check for submitted data
        if (mergedRooms.length === 0) {
          try {
            const subRes = await axios.get(`${API_BASE_URL}/api/submissions/${user.user_id}/${selectedMonth}/${selectedYear}`, { 
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000
            });
            if (subRes.data) {
              const submittedData = Array.isArray(subRes.data.days) ? subRes.data.days : [];
              const updatedData = { ...mergedData, [key]: submittedData };
              setMonthlyData(updatedData);
              setOccupiedRooms(submittedData);
              saveDataToLocalStorage(user.user_id, updatedData);
            }
          } catch (subErr) {
            console.warn("Could not load submitted data:", subErr);
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
        const cachedData = loadDataFromLocalStorage(user.user_id);
        const fallbackData = Array.isArray(cachedData[key]) ? cachedData[key] : [];
        setMonthlyData({ ...cachedData, [key]: fallbackData });
        setOccupiedRooms(fallbackData);
      } finally { 
        setIsLoading(false); 
      }
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
        if (!token) {
          console.warn("No authentication token found for saving data");
          return;
        }
        
        await axios.post(`${API_BASE_URL}/api/submissions/draft`, {
          userId: user.user_id, month: selectedMonth, year: selectedYear, data: cleanData
        }, { 
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          timeout: 10000
        });
        
        // Also save data for other months that might have been affected
        const allMonthKeys = Object.keys(monthlyData);
        for (const monthKey of allMonthKeys) {
          if (monthKey !== key) {
            const [year, month] = monthKey.split('-').map(Number);
            const monthData = monthlyData[monthKey] || [];
            const cleanMonthData = monthData.map(item => ({
              ...item,
              guests: item.guests.map(g => ({ ...g, age: Number(g.age) || 0, isCheckIn: Boolean(g.isCheckIn) }))
            }));
            
            try {
              await axios.post(`${API_BASE_URL}/api/submissions/draft`, {
                userId: user.user_id, month, year, data: cleanMonthData
              }, { 
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                timeout: 10000
              });
            } catch (err) {
              console.error(`Background save failed for ${month}/${year}:`, err);
            }
          }
        }
      } catch (err) { 
        console.error("Background save failed:", err);
        // Don't show user-facing error for background saves
      }
    };
    const debounceTimer = setTimeout(saveData, 500);
    return () => clearTimeout(debounceTimer);
  }, [monthlyData, user, selectedMonth, selectedYear, isLoading]);

  // Room search
    const handleSearch = (roomNumber: number) => {
      if (roomNumber > 0 && roomNumber <= numberOfRooms) {
        // Calculate the column index (0-based)
        const columnIndex = roomNumber - 1;
        
        // Scroll the main grid to the room column
        if (mainGridRef.current) {
          mainGridRef.current.scrollToItem({
            columnIndex,
            align: "center"
          });
        }
      } else {
        alert("Invalid room number");
      }
    };

    const handleScrollToTotals = () => {
      if (mainGridRef.current) {
        // Calculate the column index for the first totals column (Check-ins)
        const totalsStartColumn = numberOfRooms;
        
        // Scroll to the first totals column (Check-ins)
        mainGridRef.current.scrollToItem({
          columnIndex: totalsStartColumn,
          align: "center"
        });
        
        // If you want to scroll to a specific totals column, you can adjust the index:
        // Check-ins: numberOfRooms
        // Overnight: numberOfRooms + 1
        // Occupied: numberOfRooms + 2
      }
    };

  // Cell click
  const handleCellClick = (day: number, room: number) => {
    // Check if this is a following day (non-editable)
    const roomData = occupiedRooms.find(r => r.day === day && r.room === room);
    if (roomData && !roomData.isStartDay) {
      // Find the start day for this stay
      const startDayData = occupiedRooms.find(r => 
        r.stayId === roomData.stayId && r.isStartDay
      );
      if (startDayData) {
        alert(`This day is part of a stay starting on Day ${startDayData.day}. Please edit the start day to modify this stay.`);
        return;
      }
    }
    setSelectedDate(day);
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  // Save guest data for a day/room
  const handleSaveGuests = (day: number, room: number, guestData: any) => {
    const { guests, lengthOfStay, isCheckIn } = guestData;
    if (!guests?.length) return alert("Please add at least one guest");
    const stayLength = parseInt(lengthOfStay);
    if (isNaN(stayLength) || stayLength <= 0) return alert("Please enter a valid length of stay");
    
    // Check if we're editing an existing stay
    const existingEntry = occupiedRooms.find(r => r.day === day && r.room === room);
    const currentStayId = existingEntry?.stayId || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Check for conflicts (excluding current stay)
    const conflictDetails = findRoomConflictAcrossMonths(day, room, stayLength, occupiedRooms, monthlyData, currentStayId);
    if (conflictDetails.hasConflict) {
      return alert(`⚠️ This Length of Overnight Stay overlaps with existing occupied rooms. Conflict found in ${conflictDetails.month}/${conflictDetails.year}`);
    }
    
    const updatedGuests = guests.map(g => ({ ...g, isCheckIn }));
    
    // If editing an existing stay, remove excess days first
    let updatedMonthlyData = monthlyData;
    if (existingEntry?.stayId) {
      // console.log(`Editing existing stay: ${existingEntry.stayId}, new length: ${stayLength}`);
      // Remove all entries for this stay across all months
      updatedMonthlyData = removeExistingStay(currentStayId, monthlyData);
      // console.log('Removed existing stay data, updating with new length');
    }
    
    // Add the new/updated stay
    const newMonthlyData = addStayToMonthlyData(
      updatedMonthlyData, day, room, stayLength, updatedGuests, isCheckIn, currentStayId, selectedMonth, selectedYear
    );
    
    // Update all affected months in the state
    setMonthlyData(newMonthlyData);
    
    // Update the current month's view
    const currentMonthKey = `${selectedYear}-${selectedMonth}`;
    setOccupiedRooms(newMonthlyData[currentMonthKey] || []);
    
    // Force refresh of other months that might be affected
    const affectedMonths = getAffectedMonths(day, selectedMonth, selectedYear, stayLength);
    // console.log(`Affected months for stay:`, affectedMonths);
    affectedMonths.forEach(({ month, year }) => {
      const monthKey = `${year}-${month}`;
      if (monthKey !== currentMonthKey && newMonthlyData[monthKey]) {
        // console.log(`Refreshing data for ${monthKey}`);
        // Trigger a re-render for other affected months
        setTimeout(() => {
          setMonthlyData(prev => ({ ...prev }));
        }, 100);
      }
    });
  };

  // Room color
  const getRoomColor = (day: number, room: number) => {
    if (!Array.isArray(occupiedRooms)) return "white";
    const roomData = occupiedRooms.find(r => r.day === day && r.room === room);
    if (!roomData) return "white";
    
    // Yellow for check-in start days, Blue for non-check-in start days, Green for following days
    if (roomData.isStartDay) {
      return roomData.isCheckIn ? "#FBBF24" : "#3B82F6"; // Yellow for check-in, Blue for non-check-in
    }
    return "#34D399"; // Green for following days
  };

  // Guest data for modal
  const getGuestData = (day: number, room: number) => Array.isArray(occupiedRooms) ? occupiedRooms.find(r => r.day === day && r.room === room) : null;

  // Daily totals
  const calculateDailyTotals = (day: number) => {
    const rooms = Array.isArray(occupiedRooms) ? occupiedRooms : [];
    if (!rooms.length) return { checkIns: 0, overnight: 0, occupied: 0 };
    
    // Filter rooms for the specific day and remove duplicates based on room and stayId
    const dayRooms = rooms.filter(r => r.day === day);
    const uniqueRooms = new Map();
    
    dayRooms.forEach(room => {
      const key = `${room.room}-${room.stayId || 'no-stay-id'}`;
      if (!uniqueRooms.has(key)) {
        uniqueRooms.set(key, room);
      } else {
        // If duplicate found, prefer the one with isStartDay = true or isCheckIn = true
        const existing = uniqueRooms.get(key);
        if ((room.isStartDay && !existing.isStartDay) || (room.isCheckIn && !existing.isCheckIn)) {
          uniqueRooms.set(key, room);
        }
      }
    });
    
    const uniqueDayRooms = Array.from(uniqueRooms.values());
    const checkIns = uniqueDayRooms.filter(r => r.isCheckIn === true).reduce((a, r) => a + (r.guests?.length || 0), 0);
    const overnight = uniqueDayRooms.reduce((a, r) => a + (r.guests?.length || 0), 0);
    const occupied = new Set(uniqueDayRooms.map(r => r.room)).size;
    
    // Debug logging for Day 1 totals
    if (day === 1 && (checkIns > 0 || overnight > 0)) {
      // console.log(`Day ${day} totals:`, { checkIns, overnight, occupied });
      // console.log(`Day ${day} rooms:`, uniqueDayRooms.map(r => ({ room: r.room, stayId: r.stayId, guests: r.guests?.length, isCheckIn: r.isCheckIn, isStartDay: r.isStartDay })));
    }
    
    return { checkIns, overnight, occupied };
  };

  // Overall metrics
  const calculateOverallTotals = () => {
    const totalCheckIns = occupiedRooms.filter(r => r.isCheckIn === true && r.guests.length > 0).reduce((a, r) => a + r.guests.length, 0);
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
  const handleRemoveAllGuests = async (day: number, room: number) => {
    const roomData = occupiedRooms.find(r => r.day === day && r.room === room);
    if (!roomData) return;
    
    // console.log(`\n🗑️ REMOVE ALL GUESTS REQUEST`);
    // console.log(`   📅 Day: ${day}, Room: ${room}`);
    // console.log(`   🏨 StayId: ${roomData.stayId}`);
    // console.log(`   🚀 isStartDay: ${roomData.isStartDay}`);
    
    // If this is a start day, remove the entire stay from all months
    if (roomData.isStartDay && roomData.stayId) {
      // console.log(`   🔥 Removing entire stay ${roomData.stayId} from all months...`);
      
      // Remove from database first
      await removeStayFromDatabase(roomData.stayId);
      
      // Then remove from ALL months in the frontend state
      setMonthlyData(prev => {
        const updatedMonthlyData = { ...prev };
        
        // Remove the stay from all months in the state
        Object.keys(updatedMonthlyData).forEach(monthKey => {
          const monthData = updatedMonthlyData[monthKey];
          if (Array.isArray(monthData)) {
            const filteredData = monthData.filter(r => r.stayId !== roomData.stayId);
            updatedMonthlyData[monthKey] = filteredData;
            // console.log(`   🗑️ Removed stay from frontend state: ${monthKey} (${monthData.length - filteredData.length} entries)`);
          }
        });
        
        return updatedMonthlyData;
      });
      
      // Update current month's occupied rooms
      const updatedRooms = occupiedRooms.filter(r => r.stayId !== roomData.stayId);
      setOccupiedRooms(updatedRooms);
      
      // console.log(`   ✅ Successfully removed entire stay from all months (frontend + database)`);
    } else {
      // If this is a following day, remove only this specific day
      // console.log(`   🎯 Removing only this specific day (following day)`);
      
      const updatedRooms = occupiedRooms.filter(r => !(r.day === day && r.room === room));
      const key = `${selectedYear}-${selectedMonth}`;
      setOccupiedRooms(updatedRooms);
      setMonthlyData(prev => ({ ...prev, [key]: updatedRooms }));
      
      // console.log(`   ✅ Successfully removed specific day`);
    }
  };



  // Days in month
  const getDaysInMonth = (month: number, year: number) => new Date(year, month, 0).getDate();
  const [daysInMonth, setDaysInMonth] = useState(getDaysInMonth(selectedMonth, selectedYear));
  useEffect(() => { setDaysInMonth(getDaysInMonth(selectedMonth, selectedYear)); }, [selectedMonth, selectedYear]);

  // LocalStorage helpers
  const saveDataToLocalStorage = (userId: string, data: any) => {
    try { localStorage.setItem(`submission_${userId}`, JSON.stringify(data)); } catch (err) { console.error("Error saving to localStorage:", err); }
  };
  const loadDataFromLocalStorage = (userId: string) => {
    try { const d = localStorage.getItem(`submission_${userId}`); return d ? JSON.parse(d) : {}; } catch { return {}; }
  };

  // Month helpers
  const isCurrentMonth = (m: number, y: number) => {
    const d = new Date(), cy = d.getFullYear(), cm = d.getMonth() + 1;
    return y === cy && m === cm;
  };
  const isFutureMonth = (m: number, y: number) => {
    const d = new Date(), cy = d.getFullYear(), cm = d.getMonth() + 1;
    return y > cy || (y === cy && m > cm);
  };

  // Date calculation helpers for stayId logic
  // const calculateDayNumberFromStart = (entryDay: number, entryMonth: number, entryYear: number, startDay: number, startMonth: number, startYear: number) => {
  //   const startDate = new Date(startYear, startMonth - 1, startDay);
  //   const entryDate = new Date(entryYear, entryMonth - 1, entryDay);
    
  //   // Handle timezone issues by setting both to midnight
  //   startDate.setHours(0, 0, 0, 0);
  //   entryDate.setHours(0, 0, 0, 0);
    
  //   const diffTime = entryDate.getTime() - startDate.getTime();
  //   const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  //   return diffDays + 1; // +1 because day 1 is the start day
  // };

  // const removeExcessStayDays = (allEntries: any[], stayId: string, newLengthOfStay: number) => {
  //   // Find the start day entry
  //   const startEntry = allEntries.find(entry => 
  //     entry.stayId === stayId && entry.isStartDay === true
  //   );
    
  //   if (!startEntry) return allEntries;
    
  //   // Filter out entries that are beyond the new length
  //   return allEntries.filter(entry => {
  //     if (entry.stayId !== stayId) return true; // Keep entries from other stays
      
  //     // Calculate day number from start
  //     const dayNumber = calculateDayNumberFromStart(
  //       entry.day, entry.month || selectedMonth, entry.year || selectedYear,
  //       startEntry.startDay, startEntry.startMonth, startEntry.startYear
  //     );
      
  //     // Keep if within the new length of stay
  //     return dayNumber <= newLengthOfStay;
  //   });
  // };

  const getAffectedMonths = (startDay: number, startMonth: number, startYear: number, lengthOfStay: number) => {
    const affectedMonths = [];
    let currentDay = startDay;
    let currentMonth = startMonth;
    let currentYear = startYear;
    let remainingDays = lengthOfStay;

    while (remainingDays > 0) {
      const daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);
      const daysToAdd = Math.min(remainingDays, daysInCurrentMonth - currentDay + 1);
      
      affectedMonths.push({ month: currentMonth, year: currentYear });
      
      remainingDays -= daysToAdd;
      currentDay = 1;
      if (++currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }
    
    return affectedMonths;
  };

  // Helper function to remove duplicate entries
  const removeDuplicateEntries = (rooms: any[]) => {
    const uniqueEntries = new Map();
    
    rooms.forEach(room => {
      const key = `${room.day}-${room.room}-${room.stayId || 'no-stay-id'}`;
      if (!uniqueEntries.has(key)) {
        uniqueEntries.set(key, room);
      } else {
        // If duplicate found, prefer the one with isStartDay = true or isCheckIn = true
        const existing = uniqueEntries.get(key);
        if ((room.isStartDay && !existing.isStartDay) || (room.isCheckIn && !existing.isCheckIn)) {
          uniqueEntries.set(key, room);
        }
      }
    });
    
    return Array.from(uniqueEntries.values());
  };
  const isFutureMonthValue = isFutureMonth(selectedMonth, selectedYear);
  const isCurrentMonthValue = isCurrentMonth(selectedMonth, selectedYear);

  // Room conflict helpers
  const hasRoomConflict = (startDay: number, room: number, lengthOfStay: number, currentOccupancies: any[]) =>
    findRoomConflictAcrossMonths(startDay, room, lengthOfStay, currentOccupancies, monthlyData).hasConflict;

  function findRoomConflictAcrossMonths(startDay: number, room: number, lengthOfStay: number, currentOccupancies: any[], allMonthlyData: any, currentStayId?: string) {
    let remainingDays = lengthOfStay;
    let currentDay = startDay;
    let currentMonth = selectedMonth;
    let currentYear = selectedYear;
    let daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);

    const checkForConflict = (day: number, month: number, year: number) => {
      const monthKey = `${year}-${month}`;
      const monthData = month === selectedMonth && year === selectedYear ? currentOccupancies : allMonthlyData[monthKey] || [];
      return monthData.some(occ =>
        occ.room === room && occ.day >= day && occ.day <= day + Math.min(remainingDays, daysInCurrentMonth - day + 1) - 1 && 
        (!currentStayId || occ.stayId !== currentStayId)
      );
    };

    while (remainingDays > 0) {
      const daysToCheck = Math.min(remainingDays, daysInCurrentMonth - currentDay + 1);
      if (checkForConflict(currentDay, currentMonth, currentYear)) {
        return { hasConflict: true, month: currentMonth, year: currentYear, day: currentDay };
      }
      remainingDays -= daysToCheck;
      currentDay = 1;
      if (++currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
      daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);
    }
    return { hasConflict: false };
  }

  // function findAvailableRoomAcrossMonths(startDay: number, lengthOfStay: number, currentOccupancies: any[], allMonthlyData: any, excludedRoom?: number | null) {
  //   for (let room = 1; room <= numberOfRooms; room++) {
  //     if (room === excludedRoom) continue;
  //     if (!findRoomConflictAcrossMonths(startDay, room, lengthOfStay, currentOccupancies, allMonthlyData).hasConflict) return room;
  //   }
  //   return null;
  // }

  function removeExistingStay(stayId: string, monthlyData: any) {
    const updated = { ...monthlyData };
    let totalRemoved = 0;
    
    // Remove from currently loaded months
    for (const k in updated) {
      if (Array.isArray(updated[k])) {
        const beforeCount = updated[k].length;
        updated[k] = updated[k].filter(r => r.stayId !== stayId);
        const afterCount = updated[k].length;
        const removed = beforeCount - afterCount;
        if (removed > 0) {
          // console.log(`Removed ${removed} entries from ${k} for stayId: ${stayId}`);
          totalRemoved += removed;
        }
      }
    }
    
    // Also remove from database for months that might not be loaded
    // This ensures we clean up data in months that aren't currently in the state
    // Run this asynchronously to not block the UI
    removeStayFromDatabase(stayId).catch(err => {
      console.error("Background database cleanup failed:", err);
    });
    
    // console.log(`Total entries removed for stayId ${stayId}: ${totalRemoved}`);
    return updated;
  }

  // Helper function to remove stay from database for all months
  const removeStayFromDatabase = async (stayId: string) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token || !user) {
        // console.log("❌ No token or user found, skipping database removal");
        return;
      }
      
      // console.log(`\n🗄️ DATABASE REMOVAL REQUEST`);
      // console.log(`   🏨 StayId: ${stayId}`);
      // console.log(`   👤 User: ${user.user_id}`);
      // console.log(`   🌐 API URL: ${API_BASE_URL}/api/submissions/stay/${user.user_id}/${stayId}`);
      
      // Use the new backend endpoint to remove stay from all months efficiently
      // const response = await axios.delete(
      //   `${API_BASE_URL}/api/submissions/stay/${user.user_id}/${stayId}`,
      //   { 
      //     headers: { Authorization: `Bearer ${token}` },
      //     timeout: 10000
      //   }
      // );
      
      // console.log(`   ✅ Successfully removed stayId ${stayId} from all months`);
      // console.log(`   📊 Response:`, response.data);
      
    } catch (err: any) {
      console.error("❌ Error removing stay from database:", err);
      console.error("❌ Error details:", err.response?.data || err.message);
      // Fallback to the old method if the new endpoint fails
      // console.log("🔄 Falling back to manual removal method...");
      await removeStayFromDatabaseFallback(stayId);
    }
  };

  // Fallback method for removing stay from database (old implementation)
  const removeStayFromDatabaseFallback = async (stayId: string) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token || !user) return;
      
      // Find the start day entry to determine which months to check
      const startEntry = Object.values(monthlyData).flat().find((entry: any) => 
        entry.stayId === stayId && entry.isStartDay
      ) as any;
      
      if (!startEntry) {
        // console.log(`No start entry found for stayId ${stayId}, skipping database cleanup`);
        return;
      }
      
      // Calculate which months are likely to contain this stay
      const { startDay, startMonth, startYear, lengthOfStay } = startEntry;
      const affectedMonths = getAffectedMonths(startDay, startMonth, startYear, lengthOfStay);
      
      // console.log(`Fallback: Checking ${affectedMonths.length} months for stayId ${stayId}:`, affectedMonths);
      
      for (const { month, year } of affectedMonths) {
        try {
          // Get the draft data for this month
          const response = await axios.get(
            `${API_BASE_URL}/api/submissions/draft/${user.user_id}/${month}/${year}`,
            { 
              headers: { Authorization: `Bearer ${token}` },
              timeout: 5000
            }
          );
          
          const monthData = response.data?.days || [];
          const hasStayData = monthData.some((entry: any) => entry.stayId === stayId);
          
          if (hasStayData) {
            // console.log(`Fallback: Found stayId ${stayId} in ${month}/${year}, removing...`);
            
            // Remove the stay from this month's data
            const filteredData = monthData.filter((entry: any) => entry.stayId !== stayId);
            
            // Save the updated data back to database
            await axios.post(
              `${API_BASE_URL}/api/submissions/draft`,
              {
                userId: user.user_id,
                month,
                year,
                data: filteredData
              },
              { 
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                timeout: 5000
              }
            );
            
            // console.log(`Fallback: Successfully removed stayId ${stayId} from ${month}/${year}`);
          }
        } catch (err) {
          // Ignore errors for months that don't have data
          console.warn(`Fallback: Could not check/update ${month}/${year}:`, err instanceof Error ? err.message : String(err));
        }
      }
    } catch (err) {
      console.error("Fallback: Error removing stay from database:", err);
    }
  };

  function addStayToMonthlyData(
    monthlyData: any,
    startDay: number,
    room: number,
    lengthOfStay: number,
    guests: any[],
    isCheckIn: boolean,
    stayId: string,
    startMonth: number,
    startYear: number
  ) {
    // Input validation
    if (lengthOfStay <= 0) return monthlyData;
    const daysInStartMonth = getDaysInMonth(startMonth, startYear);
    if (startDay < 1 || startDay > daysInStartMonth) {
      console.error("Invalid start day");
      return monthlyData;
    }

    // console.log(`\n🏨 Creating stay: ${stayId}`);
    // console.log(`   📅 Start: ${startMonth}/${startYear} Day ${startDay}`);
    // console.log(`   📊 Length: ${lengthOfStay} days`);
    // console.log(`   🏠 Room: ${room}`);

    const updated = { ...monthlyData };
    let remainingDays = lengthOfStay;
    let currentDay = startDay;
    let currentMonth = startMonth;
    let currentYear = startYear;
    let isFirstDay = true;

    const addDaysToMonth = (day: number, month: number, year: number, daysToAdd: number) => {
      const monthKey = `${year}-${month}`;
      const monthData = updated[monthKey] || [];
      // console.log(`   📝 Adding ${daysToAdd} days to ${monthKey} starting from day ${day}`);
      
      for (let d = day; d < day + daysToAdd; d++) {
        monthData.push({
          day: d,
          room,
          guests: guests.map(g => ({ ...g, isCheckIn: isFirstDay && isCheckIn })),
          lengthOfStay,
          isCheckIn: isFirstDay && isCheckIn,
          stayId,
          startDay,
          startMonth,
          startYear,
          isStartDay: isFirstDay
        });
        isFirstDay = false;
      }
      updated[monthKey] = monthData;
      // console.log(`   ✅ Total entries in ${monthKey} after adding: ${monthData.length}`);
    };

    while (remainingDays > 0) {
      const daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);
      const availableDays = daysInCurrentMonth - currentDay + 1;
      const daysToAdd = Math.min(remainingDays, availableDays);

      addDaysToMonth(currentDay, currentMonth, currentYear, daysToAdd);
      remainingDays -= daysToAdd;

      // Only move to next month if there are remaining days
      if (remainingDays > 0) {
        currentDay = 1;
        currentMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        currentYear = currentMonth === 1 ? currentYear + 1 : currentYear;
      }
    }

    return updated;
  }

  return (
    <div className="container mt-5" style={{ position: 'relative' }}>
      {/* Loading Overlay */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            borderRadius: '8px',
          }}
        >
          <DolphinSpinner size="lg" />
          <p className="mt-3 text-muted" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
            Loading data for {selectedMonth}/{selectedYear}...
          </p>
        </div>
      )}
      
      <h2>Monthly Recording Format</h2>
      <p>Form: DAE-1A</p>
      <SaveButton
        onSave={handleSaveForm}
        isFormSaved={isFormSaved}
        hasSubmitted={hasSubmitted}
        isFutureMonth={isFutureMonthValue}
        isCurrentMonth={isCurrentMonthValue}
        disabled={isLoading}
      />
      <MonthYearSelector
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={e => setSelectedMonth(parseInt(e.target.value))}
        onYearChange={e => setSelectedYear(parseInt(e.target.value))}
        disabled={isLoading}
      />
      <div className="d-flex align-items-center gap-2 mb-3">
        <RoomSearchBar onSearch={handleSearch} disabled={isLoading} />
        <button 
          onClick={() => handleScrollToTotals()}
          className="btn btn-outline-primary"
          disabled={isLoading}
          style={{
            whiteSpace: 'nowrap',
            padding: '0.375rem 0.75rem',
            height: '38px' // Match the search bar height
          }}
        >
          <i className="bi bi-bar-chart-fill me-1"></i> Show Summary
        </button>
      </div>
      <div ref={gridRef}>
        <MonthlyGrid
          daysInMonth={daysInMonth}
          numberOfRooms={numberOfRooms}
          onCellClick={handleCellClick}
          getRoomColor={getRoomColor}
          calculateDailyTotals={calculateDailyTotals}
          disabled={hasSubmitted || isFutureMonthValue || isLoading}
          gridRef={mainGridRef}
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
          disabled={hasSubmitted || isLoading}
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