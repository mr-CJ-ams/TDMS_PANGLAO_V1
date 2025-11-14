import { useState, useEffect, useRef } from "react";
import axios from "axios";
import MonthYearSelector from "../components/MonthYearSelector";
import MonthlyGrid from "../components/MonthlyGrid";
import GuestModal from "../components/GuestModal";
import MetricsDisplay from "../components/MetricsDisplay";
import SaveButton from "../components/SubmitButton";
import RoomSearchBar from "../components/RoomSearchBar";
import DolphinSpinner from "../components/DolphinSpinner";
import { FixedSizeGrid as VirtualizedGrid } from "react-window";
import { ArrowBigLeft, ArrowBigRight, ChevronDown, ChevronUp, Edit2, Save, X } from "lucide-react"; // Add icons for toggle/edit/save/cancel

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
    [isLoading, setIsLoading] = useState(true),
    [roomNames, setRoomNames] = useState<string[]>([]),
    [editingRoomNames, setEditingRoomNames] = useState(false),
    [roomNamesDraft, setRoomNamesDraft] = useState<string[]>([]),
    [roomNamesLoading, setRoomNamesLoading] = useState(false),
    [roomNamesCollapsed, setRoomNamesCollapsed] = useState(true);

  const mainGridRef = useRef<VirtualizedGrid>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  // Modal state
  const [modal, setModal] = useState<{ show: boolean; title: string; message: string; onClose?: () => void }>({ show: false, title: "", message: "" });
  const [confirmModal, setConfirmModal] = useState(false);

// Generate a unique stay ID for each guest - ENHANCED for better readability
const generateStayId = (day: number, room: number, guest: any, startMonth: number, startYear: number) => {
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase(); // Shorter, uppercase random suffix
  
  // Create a more readable ID format: G-YYYY-MM-DD-RR-GENDER-AGE-RANDOM
  const genderCode = guest.gender.substring(0, 1).toUpperCase();
  const age = guest.age || 'NA';
  
  return `G-${startYear}${startMonth.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}-R${room.toString().padStart(2, '0')}-${genderCode}-${age}-${randomSuffix}`;
};
  // Fetch user profile
  useEffect(() => {
    (async () => {
      try {
        const token = sessionStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE_URL}/api/auth/user`, { headers: { Authorization: `Bearer ${token}` } });
        setUser(data);
        setNumberOfRooms(data.number_of_rooms);

        // Initialize room names if not set
        setRoomNames(Array.from({ length: data.number_of_rooms }, (_, i) => `Room ${i + 1}`));
      } catch (err) { console.error("Error fetching user profile:", err); }
    })();
  }, []);

  // Check if already submitted for month/year
  useEffect(() => {
    if (!user) return;
    
    // Reset form saved state when switching months
    setIsFormSaved(false);
    
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

  // Load data for selected month/year - Simplified cross-month handling
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

        // Load current month data
        const [serverRes, localData] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/submissions/draft/${user.user_id}/${selectedMonth}/${selectedYear}`, { 
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000
          }),
          loadDataFromLocalStorage(user.user_id)
        ]);
        
        const serverData = Array.isArray(serverRes.data?.days) ? serverRes.data.days : [];
        const localMonthData = Array.isArray(localData[key]) ? localData[key] : [];
        
        // Merge server and local data for current month
        const getRoomKey = (r: any) => `${r.day}-${r.room}-${r.stayId}`;
        const uniqueRooms = new Map<string, any>();
        localMonthData.forEach(r => uniqueRooms.set(getRoomKey(r), r));
        serverData.forEach(r => uniqueRooms.set(getRoomKey(r), r));
        
        let mergedRooms = Array.from(uniqueRooms.values());

        // Clean up any duplicate entries before setting the data
        const cleanedRooms = removeDuplicateEntries(mergedRooms);
        const mergedData = { ...localData, [key]: cleanedRooms };
        
        setMonthlyData(mergedData);
        setOccupiedRooms(cleanedRooms);

        // If no draft, check for submitted data
        if (cleanedRooms.length === 0) {
          try {
            const subRes = await axios.get(`${API_BASE_URL}/api/submissions/${user.user_id}/${selectedMonth}/${selectedYear}`, { 
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000
            });
            if (subRes.data) {
              const submittedData = Array.isArray(subRes.data.days) ? subRes.data.days : [];
              const updatedDataWithSubmission = { ...mergedData, [key]: submittedData };
              setMonthlyData(updatedDataWithSubmission);
              setOccupiedRooms(submittedData);
              saveDataToLocalStorage(user.user_id, updatedDataWithSubmission);
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

  // Load all data for all months from the server on app start
useEffect(() => {
  if (!user) return;

  const loadData = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const { data } = await axios.get(`${API_BASE_URL}/api/submissions/all-drafts/${user.user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });

      // Merge server data with local data
      const serverData = data || {};
      const localData = loadDataFromLocalStorage(user.user_id);
      const mergedData = { ...serverData, ...localData };

      setMonthlyData(mergedData);

      // Set occupied rooms for the current month
      const currentKey = `${selectedYear}-${selectedMonth}`;
      setOccupiedRooms(mergedData[currentKey] || []);
    } catch (err) {
      console.error("Error loading data from server:", err);
    }
  };

  loadData();
}, [user, selectedMonth, selectedYear]);

  // Save to localStorage and server on monthlyData change
  useEffect(() => {
    if (!user || isLoading) return;

    const saveData = async () => {
      try {
        // Save to localStorage
        saveDataToLocalStorage(user.user_id, monthlyData);

        const token = sessionStorage.getItem("token");
        if (!token) {
          console.warn("No authentication token found for saving data");
          return;
        }

        // Save data for all months that have data
        const allMonthKeys = Object.keys(monthlyData);
        for (const monthKey of allMonthKeys) {
          const [year, month] = monthKey.split('-').map(Number);
          const monthData = monthlyData[monthKey] || [];

          // Only save if there's actual data
          if (monthData.length > 0) {
            const cleanMonthData = monthData.map(item => ({
              ...item,
              guests: item.guests.map(g => ({
                ...g,
                age: Number(g.age) || 0,
                isCheckIn: Boolean(g.isCheckIn),
                gender: g.gender,
                status: g.status,
                nationality: g.nationality,
                lengthOfStay: Number(g.lengthOfStay) || 0,
                _isStartDay: g._isStartDay,
                _stayId: g._stayId,
                _startDay: g._startDay,
                _startMonth: g._startMonth,
                _startYear: g._startYear,
              })),
            }));

            try {
              await axios.post(
                `${API_BASE_URL}/api/submissions/draft`,
                {
                  userId: user.user_id,
                  month,
                  year,
                  data: cleanMonthData,
                },
                {
                  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                  timeout: 10000,
                }
              );
            } catch (err) {
              console.error(`Background save failed for ${month}/${year}:`, err);
            }
          }
        }
      } catch (err) {
        console.error("Background save failed:", err);
      }
    };

    const debounceTimer = setTimeout(saveData, 500);
    return () => clearTimeout(debounceTimer);
  }, [monthlyData, user, isLoading]);

  // Room search
  const handleSearch = (roomNumber: number) => {
    if (roomNumber > 0 && roomNumber <= numberOfRooms) {
      // Calculate the column index (0-based)
      const columnIndex = roomNumber - 1;
      if (mainGridRef.current) {
        mainGridRef.current.scrollToItem({
          columnIndex,
          align: "center"
        });
      }
    } else {
      setModal({
        show: true,
        title: "Invalid Room",
        message: "Invalid room number",
      });
    }
  };

  // Cell click
  const handleCellClick = (day: number, room: number) => {
    setSelectedDate(day);
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  // Save guest data for a day/room - Fixed cross-month propagation and deletion
  const handleSaveGuests = async (day: number, room: number, guestData: any) => {
    const { guests, removeGuest, isEdit } = guestData;

  // --- REMOVAL LOGIC ---
  if (removeGuest && removeGuest._stayId) {
    let updatedMonthlyData = { ...monthlyData };
    const guestStayId = removeGuest._stayId;

    // Remove guest from ALL months and ALL days by stayId
    Object.keys(updatedMonthlyData).forEach(monthKey => {
      if (updatedMonthlyData[monthKey]) {
        updatedMonthlyData[monthKey] = updatedMonthlyData[monthKey]
          .map((entry: any) => {
            if (entry.guests && Array.isArray(entry.guests)) {
              // Remove only guests with matching stayId
              entry.guests = entry.guests.filter((g: any) => g._stayId !== guestStayId);
            }
            // Remove entry if no guests left
            if (!entry.guests || entry.guests.length === 0) return null;
            return entry;
          })
          .filter((entry: any) => entry !== null);
      }
    });

    // Clean up any empty months
    Object.keys(updatedMonthlyData).forEach(monthKey => {
      if (updatedMonthlyData[monthKey] && updatedMonthlyData[monthKey].length === 0) {
        delete updatedMonthlyData[monthKey];
      }
    });

    setMonthlyData(updatedMonthlyData);
    setOccupiedRooms(updatedMonthlyData[`${selectedYear}-${selectedMonth}`] || []);
    return;
  }

  // --- EDIT LOGIC ---
  let updatedMonthlyData = { ...monthlyData };

  guests.forEach(guest => {
    const guestStayLength = parseInt(guest.lengthOfStay);
    const newStayId = guest._stayId || generateStayId(day, room, guest, selectedMonth, selectedYear);

    // If editing, remove all old entries with the original stayId
    if (isEdit && guest._originalStayId) {
      Object.keys(updatedMonthlyData).forEach(monthKey => {
        if (updatedMonthlyData[monthKey]) {
          updatedMonthlyData[monthKey] = updatedMonthlyData[monthKey]
            .map((entry: any) => {
              if (entry.guests && Array.isArray(entry.guests)) {
                entry.guests = entry.guests.filter((g: any) => g._stayId !== guest._originalStayId);
              }
              if (!entry.guests || entry.guests.length === 0) return null;
              return entry;
            })
            .filter((entry: any) => entry !== null);
        }
      });
    }

    // Propagate the new/edited guest across all months
    let currentDay = day;
    let currentMonth = selectedMonth;
    let currentYear = selectedYear;
    let remainingDays = guestStayLength;
    let isFirstDay = true;

    while (remainingDays > 0) {
      const daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);
      const daysToAdd = Math.min(remainingDays, daysInCurrentMonth - currentDay + 1);
      const monthKey = `${currentYear}-${currentMonth}`;

      if (!updatedMonthlyData[monthKey]) {
        updatedMonthlyData[monthKey] = [];
      }

      for (let i = 0; i < daysToAdd; i++) {
        const targetDay = currentDay + i;
        // Create new guest entry
        const guestEntry = {
          ...guest,
          age: parseInt(guest.age),
          lengthOfStay: guestStayLength,
          roomNumber: room,
          isCheckIn: isFirstDay ? !!guest.isCheckIn : false,
          _isStartDay: isFirstDay,
          _startDay: day,
          _stayId: newStayId,
          _startMonth: selectedMonth,
          _startYear: selectedYear
        };

        // Find or create entry for this day/room
        const existingEntryIndex = updatedMonthlyData[monthKey].findIndex(
          (e: any) => e.day === targetDay && e.room === room
        );

        if (existingEntryIndex !== -1) {
          // Remove any guest with the same stayId before adding
          updatedMonthlyData[monthKey][existingEntryIndex].guests = updatedMonthlyData[monthKey][existingEntryIndex].guests.filter(
            (g: any) => g._stayId !== newStayId
          );
          updatedMonthlyData[monthKey][existingEntryIndex].guests.push(guestEntry);
        } else {
          updatedMonthlyData[monthKey].push({
            day: targetDay,
            room,
            guests: [guestEntry],
            isCheckIn: isFirstDay ? !!guest.isCheckIn : false,
            isStartDay: isFirstDay,
            stayId: newStayId,
            startDay: day,
            startMonth: selectedMonth,
            startYear: selectedYear,
            lengthOfStay: guestStayLength,
            month: currentMonth,
            year: currentYear,
          });
        }
        isFirstDay = false;
      }

      remainingDays -= daysToAdd;
      currentDay = 1;
      if (++currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }
  });

  // Clean up any empty entries and remove duplicates
  Object.keys(updatedMonthlyData).forEach(monthKey => {
    if (updatedMonthlyData[monthKey]) {
      updatedMonthlyData[monthKey] = updatedMonthlyData[monthKey].filter((entry: any) =>
        entry.guests && entry.guests.length > 0
      );
      // Remove duplicate entries (same day, room, and guest combination)
      const uniqueEntries = [];
      const entryMap = new Map();
      updatedMonthlyData[monthKey].forEach((entry: any) => {
        const key = `${entry.day}-${entry.room}-${entry.stayId}`;
        if (!entryMap.has(key)) {
          entryMap.set(key, entry);
          uniqueEntries.push(entry);
        }
      });
      updatedMonthlyData[monthKey] = uniqueEntries;
    }
  });

  const currentKey = `${selectedYear}-${selectedMonth}`;
  setMonthlyData(updatedMonthlyData);
  setOccupiedRooms(updatedMonthlyData[currentKey] || []);
};

  // Room color - FIXED: Properly handles multiple guests and updates after deletions
  const getRoomColor = (day: number, room: number) => {
    if (!Array.isArray(occupiedRooms)) return "white";

  // Find all entries for this day/room
  const roomEntries = occupiedRooms.filter(r => r.day === day && r.room === room);
  if (!roomEntries.length) return "white";

  // Check if ANY guest in this room/day is on their start day AND has check-in
  const hasStartDayWithCheckIn = roomEntries.some(entry =>
    entry.guests.some(g => g._isStartDay && g.isCheckIn)
  );

  // Check if ANY guest in this room/day is on their start day but NO check-in
  const hasStartDayWithoutCheckIn = roomEntries.some(entry =>
    entry.guests.some(g => g._isStartDay && !g.isCheckIn)
  );

  // Priority: Check-in > No check-in > Following days
  if (hasStartDayWithCheckIn) {
    return "#FBBF24"; // Yellow for check-in start day
  } else if (hasStartDayWithoutCheckIn) {
    return "#3B82F6"; // Blue for no check-in start day
  } else {
    return "#34D399"; // Green for following days
  }
  };

  // Guest data for modal - FIXED start day detection
  const getGuestData = (day: number, room: number) => {
    if (!Array.isArray(occupiedRooms)) return null;
    
    // Find all entries for this day/room
    const entries = occupiedRooms.filter(r => r.day === day && r.room === room);
    if (!entries.length) return null;
    
    // Build comprehensive guest stay information from ALL monthly data
    const guestStayInfo = new Map();
    
    // First pass: Find the ACTUAL start day for each guest across ALL months
    Object.keys(monthlyData).forEach(monthKey => {
      const monthData = monthlyData[monthKey] || [];
      monthData.forEach((entry: any) => {
        if (entry.room === room && entry.guests && entry.isStartDay) {
          // This is a start day entry - use it as authoritative source
          entry.guests.forEach((guest: any) => {
            const guestKey = `${guest.gender}-${guest.age}-${guest.status}-${guest.nationality}`;
            const [entryYear, entryMonth] = monthKey.split('-').map(Number);
            
            const guestInfo = {
              startDay: entry.startDay || entry.day,
              stayId: entry.stayId,
              lengthOfStay: entry.lengthOfStay || guest.lengthOfStay,
              startMonth: entry.startMonth || entryMonth,
              startYear: entry.startYear || entryYear,
              isCheckIn: entry.isCheckIn,
              // Mark this as the authoritative start day information
              _isAuthoritative: true
            };
            
            // Only set if this is the earliest start day we've found for this guest
            const currentInfo = guestStayInfo.get(guestKey);
            if (!currentInfo || guestInfo.startDay < currentInfo.startDay) {
              guestStayInfo.set(guestKey, guestInfo);
            }
          });
        }
      });
    });
    
    // Second pass: For guests without start day entries, try to find their stay info
    Object.keys(monthlyData).forEach(monthKey => {
      const monthData = monthlyData[monthKey] || [];
      monthData.forEach((entry: any) => {
        if (entry.room === room && entry.guests) {
          entry.guests.forEach((guest: any) => {
            const guestKey = `${guest.gender}-${guest.age}-${guest.status}-${guest.nationality}`;
            if (!guestStayInfo.has(guestKey)) {
              // Use guest's own stored start day information
              if (guest._startDay) {
                const [entryYear, entryMonth] = monthKey.split('-').map(Number);
                guestStayInfo.set(guestKey, {
                  startDay: guest._startDay,
                  stayId: guest._stayId || entry.stayId,
                  lengthOfStay: guest.lengthOfStay || entry.lengthOfStay,
                  startMonth: guest._startMonth || entryMonth,
                  startYear: guest._startYear || entryYear,
                  isCheckIn: guest.isCheckIn,
                  _isAuthoritative: false
                });
              }
            }
          });
        }
      });
    });
    
    // Third pass: Aggregate guests for the current day/room with correct start day flags
    const guestMap = new Map();
    
    entries.forEach(entry => {
      entry.guests.forEach(guest => {
        const guestKey = `${guest.gender}-${guest.age}-${guest.status}-${guest.nationality}`;
        const guestStayData = guestStayInfo.get(guestKey);
        
        if (guestStayData) {
          // Determine if this is the ACTUAL start day for this guest
          const isActualStartDay = 
            guestStayData.startDay === day && 
            guestStayData.startMonth === selectedMonth && 
            guestStayData.startYear === selectedYear;
          
         // In getGuestData function, update the guest mapping:
          if (!guestMap.has(guestKey)) {
            guestMap.set(guestKey, {
              ...guest,
              lengthOfStay: guestStayData?.lengthOfStay || guest.lengthOfStay || "",
              _saved: true,
              _isStartDay: isActualStartDay,
              _stayId: guestStayData.stayId,
              _startDay: guestStayData.startDay,
              _startMonth: guestStayData.startMonth,
              _startYear: guestStayData.startYear,
              // Store original data for editing including length of stay
              _originalGender: guest.gender,
              _originalAge: guest.age,
              _originalStatus: guest.status,
              _originalNationality: guest.nationality,
              _originalStayId: guestStayData.stayId,
              _originalLengthOfStay: guestStayData.lengthOfStay || guest.lengthOfStay // Track original length
            });
          }
        } else {
          // Fallback for guests without stay information
          if (!guestMap.has(guestKey)) {
            guestMap.set(guestKey, {
              ...guest,
              _saved: true,
              _isStartDay: false, // Assume not start day if we can't find info
              _startDay: day,
              _stayId: entry.stayId,
              _startMonth: selectedMonth,
              _startYear: selectedYear,
              _originalGender: guest.gender,
              _originalAge: guest.age,
              _originalStatus: guest.status,
              _originalNationality: guest.nationality,
              _originalStayId: entry.stayId
            });
          }
        }
      });
    });
    
    const guests = Array.from(guestMap.values());
    
    return {
      day,
      room,
      guests,
      isCheckIn: entries[0]?.isCheckIn ?? true,
    };
  };

  // Daily totals
  const calculateDailyTotals = (day: number) => {
    const rooms = Array.isArray(occupiedRooms) ? occupiedRooms : [];
    if (!rooms.length) return { checkIns: 0, overnight: 0, occupied: 0 };

    // Filter entries for the specific day
    const dayEntries = rooms.filter(r => r.day === day);

    // Count only guests with isCheckIn true on start day for check-ins
    const checkIns = dayEntries
      .filter(r => r.isStartDay)
      .reduce((a, r) => a + r.guests.filter(g => g.isCheckIn).length, 0);

    // Overnight: all guests present
    const overnight = dayEntries.reduce((a, r) => a + (r.guests?.length || 0), 0);
    const occupied = new Set(dayEntries.map(r => r.room)).size;

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
    setConfirmModal(true);
  };

  // The actual submission logic, previously inside handleSaveForm
  const doSubmitForm = async () => {
    if (hasSubmitted) {
      setModal({
        show: true,
        title: "Already Submitted",
        message: "You have already submitted for this month and year.",
      });
      return;
    }
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
      setModal({
        show: true,
        title: "Success",
        message: "Submission saved successfully!",
      });
    } catch (err) {
      console.error("Submission failed:", err);
      setModal({
        show: true,
        title: "Error",
        message: "Failed to save submission. Please try again.",
      });
    }
  };

// Remove all guests for a day/room - ONLY for the specific day, not entire stays
const handleRemoveAllGuests = async (day: number, room: number) => {
  console.log(`🔥 GLOBAL REMOVE: Removing all guests from Room ${room}, Day ${day} ONLY`);
  
  const roomEntries = occupiedRooms.filter(r => r.day === day && r.room === room);
  if (!roomEntries.length) {
    console.log(`ℹ️ No guests found in Room ${room}, Day ${day}`);
    return;
  }

  console.log(`📋 Found ${roomEntries.length} entries with guests to remove from Day ${day}`);
  
  let updatedMonthlyData = { ...monthlyData };
  const currentKey = `${selectedYear}-${selectedMonth}`;
  
  // Remove guests ONLY from the specific day and room
  if (updatedMonthlyData[currentKey]) {
    const beforeCount = updatedMonthlyData[currentKey].length;
    
    updatedMonthlyData[currentKey] = updatedMonthlyData[currentKey]
      .map((entry: any) => {
        // Only process entries for the specific day and room
        if (entry.day === day && entry.room === room) {
          console.log(`🗑️ Removing all ${entry.guests?.length || 0} guests from Room ${room}, Day ${day}`);
          
          // Return null to remove the entire entry for this day/room
          return null;
        }
        return entry;
      })
      .filter((entry: any) => entry !== null);
    
    const afterCount = updatedMonthlyData[currentKey].length;
    console.log(`✅ Removed ${beforeCount - afterCount} entries from Room ${room}, Day ${day}`);
  }

  // Also clean up any empty entries in other months for this specific day/room combination
  Object.keys(updatedMonthlyData).forEach(monthKey => {
    if (monthKey !== currentKey && updatedMonthlyData[monthKey]) {
      updatedMonthlyData[monthKey] = updatedMonthlyData[monthKey]
        .map((entry: any) => {
          // Only remove if it's the exact same day/room combination in other months
          if (entry.day === day && entry.room === room) {
            console.log(`🗑️ Also removing from ${monthKey}: Room ${room}, Day ${day}`);
            return null;
          }
          return entry;
        })
        .filter((entry: any) => entry !== null);
    }
  });

  setMonthlyData(updatedMonthlyData);
  setOccupiedRooms(updatedMonthlyData[currentKey] || []);
  
  console.log(`✅ GLOBAL REMOVE COMPLETE: All guests removed from Room ${room}, Day ${day} ONLY`);
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
    try {
      const data = localStorage.getItem(`submission_${userId}`);
      if (!data) {
        console.warn("Local storage is empty. Falling back to server data.");
        return {};
      }
      return JSON.parse(data);
    } catch {
      return {};
    }
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

  useEffect(() => {
    if (!user) return;
    setRoomNamesLoading(true);
    axios.get(`${API_BASE_URL}/api/auth/user/${user.user_id}/room-names`, {
      headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
    })
      .then(res => {
        let names = Array.isArray(res.data.roomNames) ? res.data.roomNames : [];
        // If numberOfRooms increased, add default names for new rooms
        if (names.length < numberOfRooms) {
          names = [
            ...names,
            ...Array.from({ length: numberOfRooms - names.length }, (_, i) => `Room ${names.length + i + 1}`)
          ];
        }
        // If numberOfRooms decreased, trim the names
        if (names.length > numberOfRooms) {
          names = names.slice(0, numberOfRooms);
        }
        setRoomNames(names);
        setRoomNamesDraft(names);
      })
      .catch(() => {
        setRoomNames(Array.from({ length: numberOfRooms }, (_, i) => `Room ${i + 1}`));
        setRoomNamesDraft(Array.from({ length: numberOfRooms }, (_, i) => `Room ${i + 1}`));
      })
      .finally(() => setRoomNamesLoading(false));
  }, [user, numberOfRooms]);

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
        {/* Go to Room 1 Button */}
        <button
          onClick={() => handleSearch(1)}
          className="btn btn-outline-secondary"
          disabled={isLoading}
          style={{
            whiteSpace: 'nowrap',
            padding: '0.375rem 0.75rem',
            height: '38px'
          }}
        >
          <ArrowBigLeft size={16}/>
        </button>
        <button 
          onClick={() => handleSearch(numberOfRooms)}
          className="btn btn-outline-secondary"
          disabled={isLoading}
          style={{
            whiteSpace: 'nowrap',
            padding: '0.375rem 0.75rem',
            height: '38px'
          }}
        >
           <ArrowBigRight size={16}/>
        </button>
      </div>
      <div className="mb-3">
      <div className="d-flex align-items-center mb-2" style={{ gap: "0.5rem" }}>
        <h5 className="mb-0">Edit Room Names</h5>
        <button
          className="btn btn-link d-flex align-items-center gap-1"
          style={{
            fontWeight: 500,
            fontSize: "1rem",
            textDecoration: "none",
            marginLeft: "0.5rem"
          }}
          onClick={() => setRoomNamesCollapsed(!roomNamesCollapsed)}
          aria-expanded={!roomNamesCollapsed}
          aria-controls="room-names-edit-section"
        >
          {roomNamesCollapsed ? (
            <>
              <span>Show</span>
              <ChevronDown size={18} />
            </>
          ) : (
            <>
              <span>Hide</span>
              <ChevronUp size={18} />
            </>
          )}
        </button>
      </div>
      {!roomNamesCollapsed && (
        <div id="room-names-edit-section" className="p-3 rounded bg-light border mb-2">
          <div className="d-flex flex-wrap gap-2 mb-2">
            {(editingRoomNames ? roomNamesDraft : roomNames).map((name, idx) => (
              <input
                key={idx}
                type="text"
                value={editingRoomNames ? roomNamesDraft[idx] : name}
                onChange={e => {
                  if (!editingRoomNames) return;
                  const newNames = [...roomNamesDraft];
                  newNames[idx] = e.target.value;
                  setRoomNamesDraft(newNames);
                }}
                className="form-control"
                style={{
                  width: 120,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
                disabled={!editingRoomNames || hasSubmitted || isLoading || roomNamesLoading}
                aria-label={`Room ${idx + 1} name`}
              />
            ))}
          </div>
          <div className="mt-2">
            {!editingRoomNames ? (
              <button
                className="btn btn-outline-primary d-flex align-items-center gap-1"
                onClick={() => setEditingRoomNames(true)}
                disabled={hasSubmitted || isLoading || roomNamesLoading}
              >
                <Edit2 size={16} />
                Edit Room Names
              </button>
            ) : (
              <>
                <button
                  className="btn btn-success me-2 d-flex align-items-center gap-1"
                  onClick={async () => {
                    setRoomNamesLoading(true);
                    try {
                      await axios.post(
                        `${API_BASE_URL}/api/auth/user/${user.user_id}/room-names`,
                        { roomNames: roomNamesDraft },
                        { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } }
                      );
                      setRoomNames(roomNamesDraft);
                      setEditingRoomNames(false);
                    } catch {
                      alert("Failed to save room names.");
                    } finally {
                      setRoomNamesLoading(false);
                    }
                  }}
                  disabled={roomNamesLoading}
                >
                  <Save size={16} />
                  Save Room Names
                </button>
                <button
                  className="btn btn-secondary d-flex align-items-center gap-1"
                  onClick={() => {
                    setRoomNamesDraft(roomNames);
                    setEditingRoomNames(false);
                  }}
                  disabled={roomNamesLoading}
                >
                  <X size={16} />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
    <div ref={gridRef}>
        <MonthlyGrid
          daysInMonth={daysInMonth}
          numberOfRooms={numberOfRooms}
          roomNames={roomNames}
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

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-semibold text-sky-900 mb-4">Confirm Submission</h3>
            <p className="mb-6 text-gray-700">
              Are you sure you want to submit the form? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setConfirmModal(false);
                  await doSubmitForm();
                }}
                className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for alerts */}
      {modal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-sky-900">{modal.title}</h3>
              <button
                onClick={() => {
                  setModal(m => ({ ...m, show: false }));
                  modal.onClose && modal.onClose();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <p className="mb-6 text-gray-700">{modal.message}</p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setModal(m => ({ ...m, show: false }));
                  modal.onClose && modal.onClose();
                }}
                className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionForm;