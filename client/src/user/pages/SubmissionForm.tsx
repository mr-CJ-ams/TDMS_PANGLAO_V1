// FILE: client\src\user\pages\SubmissionForm.tsx
import React, { useRef, useEffect, useState } from 'react';
import { submissionsAPI, authAPI } from "../../services/api";
import MonthYearSelector from "../components/MonthYearSelector";
import MonthlyGrid from "../components/MonthlyGrid";
import GuestModal from "../components/GuestModal";
import MetricsDisplay from "../components/MetricsDisplay";
import SaveButton from "../components/SubmitButton";
import RoomSearchBar from "../components/RoomSearchBar";
import DolphinSpinner from "../components/DolphinSpinner";
import { FixedSizeGrid as VirtualizedGrid } from "react-window";
import { ArrowBigLeft, ArrowBigRight, ChevronDown, ChevronUp, Edit2, Save, X } from "lucide-react";
import PQueue from 'p-queue';

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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(Date.now());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isViewOnly, setIsViewOnly] = useState(false);


  // Generate a unique stay ID for each guest
  const generateStayId = (day: number, room: number, guest: any, startMonth: number, startYear: number) => {
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const genderCode = guest.gender.substring(0, 1).toUpperCase();
    const age = guest.age || 'NA';
    const statusCode = guest.status ? guest.status.substring(0, 1).toUpperCase() : 'U'; // U for Unknown
    
    return `G-${startYear}${startMonth.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}-R${room.toString().padStart(2, '0')}-${genderCode}-${age}-${statusCode}-${randomSuffix}`;
  };

  // Fetch user profile
  useEffect(() => {
    (async () => {
      try {
        const userData = await authAPI.getUser();
        setUser(userData);
        setNumberOfRooms(userData.number_of_rooms);

        // Initialize room names if not set
        setRoomNames(Array.from({ length: userData.number_of_rooms }, (_, i) => `Room ${i + 1}`));
      } catch (err) { 
        console.error("Error fetching user profile:", err); 
      }
    })();
  }, []);

  // Check if already submitted for month/year
   useEffect(() => {
    if (!user) return;
    
    // Reset form saved state when switching months
    setIsFormSaved(false);
    
    (async () => {
      try {
        const data = await submissionsAPI.checkSubmission(user.user_id, selectedMonth, selectedYear);
        setHasSubmitted(data.hasSubmitted);
        // Set view-only mode if submitted, but allow editing draft data
        setIsViewOnly(data.hasSubmitted);
        
      } catch (err) { 
        console.error("Error checking submission:", err); 
      }
    })();
  }, [user, selectedMonth, selectedYear]);



// Load draft stays for selected month/year - FIXED VERSION
useEffect(() => {
  if (!user) return;
  
  let isMounted = true; // Add mount check to prevent state updates on unmounted component
  setIsLoading(true);
  
  (async () => {
    try {
      // Always load draft stays first for editing
      const [serverStays, localData, submissionCheck] = await Promise.all([
        submissionsAPI.getDraftStays(user.user_id, selectedMonth, selectedYear),
        loadDataFromLocalStorage(user.user_id),
        submissionsAPI.checkSubmission(user.user_id, selectedMonth, selectedYear)
      ]);

      if (!isMounted) return;

      const currentKey = `${selectedYear}-${selectedMonth}`;
      
      // Convert draft stays to monthly data format
      const staysToMonthlyData = (stays: any[]) => {
        const monthlyData: any = {};
        stays.forEach(stay => {
          const monthKey = `${stay.year}-${stay.month}`;
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = [];
          }
          
          monthlyData[monthKey].push({
            day: stay.day,
            room: stay.room_number,
            guests: stay.guests || [],
            isCheckIn: stay.is_check_in,
            isStartDay: stay.is_start_day,
            stayId: stay.stay_id,
            startDay: stay.start_day,
            startMonth: stay.start_month,
            startYear: stay.start_year,
            lengthOfStay: stay.length_of_stay
          });
        });
        return monthlyData;
      };

      const serverData = staysToMonthlyData(serverStays);
      const mergedData = { ...localData, ...serverData };
      
      // Set submission status FIRST
      setHasSubmitted(submissionCheck.hasSubmitted);
      
      // Determine view-only mode: only view-only if submitted AND no draft data exists
      const hasDraftData = serverStays.length > 0 || mergedData[currentKey]?.length > 0;
      const shouldBeViewOnly = submissionCheck.hasSubmitted && !hasDraftData;
      
      console.log('🔧 Setting view mode:', {
        hasSubmitted: submissionCheck.hasSubmitted,
        hasDraftData,
        shouldBeViewOnly,
        serverStaysCount: serverStays.length,
        localDataCount: mergedData[currentKey]?.length || 0
      });
      
      setIsViewOnly(shouldBeViewOnly);
      
      // ✅ ALWAYS use draft data for display
      setMonthlyData(mergedData);
      setOccupiedRooms(mergedData[currentKey] || []);

      // If no draft data exists but we have a submission, load submitted data for viewing only
      if (!hasDraftData && submissionCheck.hasSubmitted) {
        try {
          const submissionData = await submissionsAPI.getSubmission(user.user_id, selectedMonth, selectedYear);
          if (submissionData && isMounted) {
            const submittedData = Array.isArray(submissionData.days) ? submissionData.days : [];
            const updatedDataWithSubmission = { ...mergedData, [currentKey]: submittedData };
            setMonthlyData(updatedDataWithSubmission);
            setOccupiedRooms(submittedData);
            saveDataToLocalStorage(user.user_id, updatedDataWithSubmission);
          }
        } catch (subErr) {
          console.warn("Could not load submitted data:", subErr);
        }
      }
    } catch (err) {
      console.error("Error loading draft stays:", err);
      if (isMounted) {
        const cachedData = loadDataFromLocalStorage(user.user_id);
        const currentKey = `${selectedYear}-${selectedMonth}`;
        const fallbackData = Array.isArray(cachedData[currentKey]) ? cachedData[currentKey] : [];
        setMonthlyData({ ...cachedData, [currentKey]: fallbackData });
        setOccupiedRooms(fallbackData);
        setIsViewOnly(false); // Default to editable on error
      }
    } finally { 
      if (isMounted) {
        setIsLoading(false); 
      }
    }
  })();

  return () => {
    isMounted = false; // Cleanup function
  };
}, [user, selectedMonth, selectedYear]);

  // Save to localStorage on monthlyData change (remove server auto-save for drafts)
  useEffect(() => {
    if (!user || isLoading) return;

    const saveData = () => {
      try {
        // Save to localStorage only
        saveDataToLocalStorage(user.user_id, monthlyData);
      } catch (err) {
        console.error("Background save to localStorage failed:", err);
      }
    };

    const debounceTimer = setTimeout(saveData, 500);
    return () => clearTimeout(debounceTimer);
  }, [monthlyData, user, isLoading]);

  // Network status detection
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 App came online, reloading data...');
      setIsOnline(true);
      reloadData();
    };

    const handleOffline = () => {
      console.log('🌐 App went offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  // Room search
  const handleSearch = (searchValue: string | number) => {
    let roomNumber: number;

    if (typeof searchValue === 'number') {
      roomNumber = searchValue;
    } else {
      // This case should be handled by RoomSearchBar, but keep as fallback
      const num = parseInt(searchValue, 10);
      if (num > 0) {
        roomNumber = num;
      } else {
        // Try to find by room name
        const matchedIndex = roomNames.findIndex(name => 
          name.toLowerCase().includes(searchValue.toLowerCase())
        );
        if (matchedIndex !== -1) {
          roomNumber = matchedIndex + 1;
        } else {
          setModal({
            show: true,
            title: "Room Not Found",
            message: `No room found matching "${searchValue}". Please enter a valid room number or room name.`,
          });
          return;
        }
      }
    }

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
        message: `Room ${roomNumber} is invalid. Please enter a room number between 1 and ${numberOfRooms}.`,
      });
    }
  };

   // Add this helper function right after your state declarations
  const getActualDisabledState = () => {
    // If loading, always disabled
    if (isLoading) return true;
    
    // If future month, always disabled  
    if (isFutureMonthValue) return true;
    
    // Only disabled if we're in view-only mode (submitted with no drafts)
    return isViewOnly;
  };

  // Cell click
  const handleCellClick = (day: number, room: number) => {
    setSelectedDate(day);
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  // Request queue and pendingRequests as refs to avoid re-creation on each render
  const requestQueueRef = useRef<PQueue | null>(null);
  const pendingRequestsRef = useRef<Map<string, Promise<any>>>(new Map());

  useEffect(() => {
    if (!requestQueueRef.current) {
      // limit concurrency so single user doesn't flood the client or server
      requestQueueRef.current = new PQueue({ concurrency: 3, interval: 1000, intervalCap: 3 });
    }
  }, []);

  // Save guests function using queue and pendingRequests
  const handleSaveGuests = async (day: number, room: number, guestData: any): Promise<boolean> => {
    const requestKey = `save-${day}-${room}`;

    // If a request is already pending for this key, return it to avoid duplicates
    const existing = pendingRequestsRef.current.get(requestKey);
    if (existing) {
      return existing;
    }

    const queue = requestQueueRef.current!;
    const promise = queue.add(async () => {
      try {
        const { guests, removeGuest, isEdit } = guestData;

        // REMOVAL LOGIC
        if (removeGuest && removeGuest._stayId) {
          console.log(`🗑️ REMOVING SINGLE GUEST: StayId ${removeGuest._stayId}`);
          try {
            await submissionsAPI.deleteDraftStay(user.user_id, removeGuest._stayId);
            
            // Reset unsaved changes state
            setHasUnsavedChanges(false);
            setLastSaveTime(Date.now());
            
            // Auto-refresh after removal
            await reloadData(true);
            return true;
          } catch (err) {
            console.error("Error removing stay:", err);
            return false;
          }
        }

        // SAVE LOGIC
        try {      
          for (const guest of guests) {
            const guestStayLength = parseInt(guest.lengthOfStay);
            const stayId = isEdit ? guest._originalStayId : (guest._stayId || generateStayId(day, room, guest, selectedMonth, selectedYear));
            const originalStayId = guest._originalStayId;

            console.log(`👤 PROCESSING GUEST:`, {
              originalStayId,
              newStayId: stayId,
              oldLength: guest._originalLengthOfStay,
              newLength: guestStayLength,
              isEdit: !!isEdit
            });

            // If editing, remove ALL old stay entries first
            if (isEdit && originalStayId) {
              console.log(`🔄 EDIT MODE: Removing OLD stay ${originalStayId}`);
              await submissionsAPI.deleteDraftStay(user.user_id, originalStayId);
            }

            // Only create new stay entries if length is > 0
            if (guestStayLength > 0) {
              const guestStartDay = guest._startDay || day;
              const guestStartMonth = guest._startMonth || selectedMonth;
              const guestStartYear = guest._startYear || selectedYear;

              console.log(`📝 CREATING STAY: ${stayId} for ${guestStayLength} days`);

              // Create stay entries
              let currentDay = guestStartDay;
              let currentMonth = guestStartMonth;
              let currentYear = guestStartYear;
              let remainingDays = guestStayLength;
              let isFirstDay = true;

              while (remainingDays > 0) {
                const daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);
                const daysToAdd = Math.min(remainingDays, daysInCurrentMonth - currentDay + 1);

                for (let i = 0; i < daysToAdd; i++) {
                  const targetDay = currentDay + i;
                  
                  const stayData = {
                    userId: user.user_id,
                    day: targetDay,
                    month: currentMonth,
                    year: currentYear,
                    roomNumber: room,
                    stayId: stayId,
                    isCheckIn: isFirstDay ? !!guest.isCheckIn : false,
                    isStartDay: isFirstDay,
                    lengthOfStay: guestStayLength,
                    startDay: guestStartDay,
                    startMonth: guestStartMonth,
                    startYear: guestStartYear,
                    guests: [{
                      gender: guest.gender,
                      age: parseInt(guest.age),
                      status: guest.status, // Ensure status is included
                      nationality: guest.nationality,
                      isCheckIn: isFirstDay ? !!guest.isCheckIn : false,
                      _isStartDay: isFirstDay,
                      _stayId: stayId,
                      _startDay: guestStartDay,
                      _startMonth: guestStartMonth,
                      _startYear: guestStartYear,
                      lengthOfStay: guestStayLength
                    }]
                  };

                  await submissionsAPI.createDraftStay(stayData);
                  isFirstDay = false;
                }

                remainingDays -= daysToAdd;
                currentDay = 1;
                if (++currentMonth > 12) {
                  currentMonth = 1;
                  currentYear++;
                }
              }
            }
          }

          // Reset unsaved changes state
          setHasUnsavedChanges(false);
          setLastSaveTime(Date.now());

          // Wait a bit before refreshing to ensure backend processed everything
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Auto-refresh after save
          console.log(`🔄 Auto-refreshing data after save...`);
          await reloadData(true);
          
          return true;

        } catch (err) {
          console.error("❌ SAVE ERROR:", err);
          setModal({
            show: true,
            title: "Error",
            message: "Failed to save guest data. Please try again.",
          });
          return false;
        }
      } catch (err) {
        console.error("❌ Save error:", err);
        setModal({
          show: true,
          title: "Error",
          message: "Failed to save. Will retry automatically."
        });
        return false;
      } finally {
        pendingRequestsRef.current.delete(requestKey);
      }
    });

    // store the pending promise and return it
    pendingRequestsRef.current.set(requestKey, promise);

    return promise;
  };



  // Room color
  const getRoomColor = (day: number, room: number) => {
    // Find all entries for this day/room
    const roomEntries = occupiedRooms.filter((entry) => entry.day === day && entry.room === room);
    if (!roomEntries.length) return "white";

    // Check all guests in this room/day
    const allGuests = roomEntries.flatMap(entry => entry.guests);

    // Priority rules for multiple guests:
    // 1. Any guest on start day WITH check-in → YELLOW
    // 2. Any guest on start day WITHOUT check-in → BLUE  
    // 3. All guests are on following days → GREEN

    const hasStartDayWithCheckIn = allGuests.some(guest => 
      guest._isStartDay && guest.isCheckIn
    );

    const hasStartDayWithoutCheckIn = allGuests.some(guest => 
      guest._isStartDay && !guest.isCheckIn
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

  // Guest data for modal
  const getGuestData = (day: number, room: number) => {
    if (!Array.isArray(occupiedRooms)) return null;
    
    // Find all entries for this day/room
    const entries = occupiedRooms.filter(r => r.day === day && r.room === room);
    if (!entries.length) return null;
    
    // Flatten all guests from all entries for this day/room
    const allGuests = entries.flatMap(entry => entry.guests);
    
    // Create a map to avoid duplicates (same stayId)
    const guestMap = new Map();
    
    allGuests.forEach(guest => {
      const guestKey = guest._stayId || `${guest.gender}-${guest.age}-${guest.status}-${guest.nationality}`;
      
      if (!guestMap.has(guestKey)) {
        guestMap.set(guestKey, {
          ...guest,
          _saved: true,
          _isStartDay: guest._isStartDay || 
                      (guest._startDay === day && 
                      guest._startMonth === selectedMonth && 
                      guest._startYear === selectedYear),
          _stayId: guest._stayId,
          _startDay: guest._startDay,
          _startMonth: guest._startMonth,
          _startYear: guest._startYear,
          _originalGender: guest.gender,
          _originalAge: guest.age,
          _originalStatus: guest.status,
          _originalNationality: guest.nationality,
          _originalStayId: guest._stayId,
          _originalLengthOfStay: guest.lengthOfStay
        });
      }
    });
    
    const guests = Array.from(guestMap.values());
    
    return {
      day,
      room,
      guests,
      // For multiple guests, isCheckIn is true if ANY guest is checking in
      isCheckIn: entries.some(entry => entry.isCheckIn) ?? true,
    };
  };

  // Daily totals
  const calculateDailyTotals = (day: number) => {
    // Filter entries for the specific day
    const dayEntries = occupiedRooms.filter((entry) => entry.day === day);

    // Check-Ins: Count guests who are on their start day and marked as check-in
    const checkIns = dayEntries.reduce((total, entry) => {
      const startDayGuests = entry.guests.filter((guest) => guest._isStartDay && guest.isCheckIn);
      return total + startDayGuests.length;
    }, 0);

    // Overnight: Count all guests staying in the room for the given day
    const overnight = dayEntries.reduce((total, entry) => total + entry.guests.length, 0);

    // Occupied: Count unique rooms that have at least one guest
    const occupied = new Set(dayEntries.map((entry) => entry.room)).size;

    return { checkIns, overnight, occupied };
  };  

  // Overall metrics
  const calculateOverallTotals = () => {
    // Aggregate totals for all days in the current month
    const totals = Array.from({ length: daysInMonth }, (_, i) => calculateDailyTotals(i + 1));

    const totalCheckIns = totals.reduce((sum, day) => sum + day.checkIns, 0);
    const totalOvernight = totals.reduce((sum, day) => sum + day.overnight, 0);
    const totalRoomsOccupied = totals.reduce((sum, day) => sum + day.occupied, 0);

    // Calculate averages
    const totalRoomsAvailable = numberOfRooms * daysInMonth;
    const averageGuestNights = totalCheckIns > 0 ? (totalOvernight / totalCheckIns).toFixed(2) : "0";
    const averageRoomOccupancyRate =
      totalRoomsAvailable > 0 ? ((totalRoomsOccupied / totalRoomsAvailable) * 100).toFixed(2) : "0";
    const averageGuestsPerRoom = totalRoomsOccupied > 0 ? (totalOvernight / totalRoomsOccupied).toFixed(2) : "0";

    return {
      averageGuestNights,
      averageRoomOccupancyRate,
      averageGuestsPerRoom,
    };
  };

  // Submit form
  const handleSaveForm = async () => {
    setConfirmModal(true);
  };

  // Submit form implementation
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
        roomNames: roomNames // Add roomNames to submission data
      };
      
      await submissionsAPI.submit(submissionData);
      
      const metrics = calculateOverallTotals();
      setAverageGuestNights(metrics.averageGuestNights);
      setAverageRoomOccupancyRate(metrics.averageRoomOccupancyRate);
      setAverageGuestsPerRoom(metrics.averageGuestsPerRoom);
      setIsFormSaved(true);
      setHasSubmitted(true);
      
      setModal({
        show: true,
        title: "Success", 
        message: "Submission saved successfully! Your data is preserved and will remain visible.",
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


const handleRemoveAllGuests = async (day: number, room: number): Promise<void> => {
  console.log(`🔥 GLOBAL REMOVE: Removing all guests from Room ${room}, Day ${day} ONLY`);
  
  try {
    // FIX: Changed from deleteDraftStaysByRoom to deleteDraftStaysByDayRoom
    await submissionsAPI.deleteDraftStaysByDayRoom(user.user_id, day, selectedMonth, selectedYear, room);
    
    // Update frontend state
    let updatedMonthlyData = { ...monthlyData };
    const currentKey = `${selectedYear}-${selectedMonth}`;
    
    if (updatedMonthlyData[currentKey]) {
      const beforeCount = updatedMonthlyData[currentKey].length;
      updatedMonthlyData[currentKey] = updatedMonthlyData[currentKey].filter(
        (entry: any) => !(entry.day === day && entry.room === room)
      );
      const afterCount = updatedMonthlyData[currentKey].length;
      console.log(`✅ Removed ${beforeCount - afterCount} entries from frontend`);
    }

    setMonthlyData(updatedMonthlyData);
    setOccupiedRooms(updatedMonthlyData[currentKey] || []);
    
    console.log(`✅ GLOBAL REMOVE COMPLETE`);
    
    // Final refresh
    await reloadData(true);
    
  } catch (error) {
    console.error("❌ Error removing all guests:", error);
    throw new Error("Failed to remove all guests");
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

  // Room names management
  useEffect(() => {
    if (!user) return;
    setRoomNamesLoading(true);
    
    authAPI.getRoomNames(user.user_id)  // Changed from submissionsAPI to authAPI
      .then(res => {
        let names = Array.isArray(res.roomNames) ? res.roomNames : [];
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

  // Save room names
  const handleSaveRoomNames = async () => {
    setRoomNamesLoading(true);
    try {
      await authAPI.updateRoomNames(user.user_id, roomNamesDraft);  // Changed from submissionsAPI to authAPI
      setRoomNames(roomNamesDraft);
      setEditingRoomNames(false);
    } catch {
      alert("Failed to save room names.");
    } finally {
      setRoomNamesLoading(false);
    }
  };

  // Reload data function
  const reloadData = async (forceReload = false) => {
    // Don't reload if user has unsaved changes (unless forced)
    if (hasUnsavedChanges && !forceReload) {
      console.log('⏸️ Skipping reload - user has unsaved changes');
      return false;
    }

    try {
      const allStays = await submissionsAPI.getDraftStays(user.user_id);
      
      const staysToMonthlyData = (stays: any[]) => {
        const monthlyData: any = {};
        stays.forEach(stay => {
          const monthKey = `${stay.year}-${stay.month}`;
          if (!monthlyData[monthKey]) monthlyData[monthKey] = [];
          
          monthlyData[monthKey].push({
            day: stay.day,
            room: stay.room_number,
            guests: stay.guests || [],
            isCheckIn: stay.is_check_in,
            isStartDay: stay.is_start_day,
            stayId: stay.stay_id,
            startDay: stay.start_day,
            startMonth: stay.start_month,
            startYear: stay.start_year,
            lengthOfStay: stay.length_of_stay
          });
        });
        return monthlyData;
      };

      const serverData = staysToMonthlyData(allStays);
      
      // Only update if the data is actually different
      const currentDataString = JSON.stringify(monthlyData);
      const newDataString = JSON.stringify(serverData);
      
      if (currentDataString !== newDataString) {
        console.log('🔄 Data changed, updating state...');
        setMonthlyData(serverData);
        setOccupiedRooms(serverData[`${selectedYear}-${selectedMonth}`] || []);
        return true;
      } else {
        console.log('✅ Data is the same, no update needed');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to reload data:', error);
      return false;
    }
  };

  // Also reload when month/year changes
  useEffect(() => {
    if (user && !hasUnsavedChanges) {
      console.log('📅 Month/Year changed, reloading data...');
      reloadData(true); // Force reload on navigation
    } else if (user && hasUnsavedChanges) {
      console.log('⏸️ Skipping month/year reload - user has unsaved changes');
    }
  }, [selectedMonth, selectedYear, user]);

  // Add this useEffect hook near the top of your component, after other useEffect hooks
  useEffect(() => {
    // Push a new history entry when SubmissionForm mounts
    window.history.pushState({ page: "submission-form" }, "");

    const handlePopState = (event) => {
      // When back button is clicked, navigate to homepage
      if (event.state?.page === "submission-form") {
        sessionStorage.setItem("activeSection", "home");
        window.history.back();
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

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
      
      {/* MODIFIED: Only disable submission, not editing */}
       <SaveButton
        onSave={handleSaveForm}
        isFormSaved={isFormSaved}
        hasSubmitted={hasSubmitted}
        isFutureMonth={isFutureMonthValue}
        isCurrentMonth={isCurrentMonthValue}
        disabled={getActualDisabledState()} // ← Updated
      />
      
      <MonthYearSelector
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={e => setSelectedMonth(parseInt(e.target.value))}
        onYearChange={e => setSelectedYear(parseInt(e.target.value))}
        disabled={isLoading}
      />
      
      <div className="d-flex align-items-center gap-2 mb-3">
        <RoomSearchBar 
          onSearch={handleSearch} 
          disabled={isLoading}
          roomNames={roomNames}
        />
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
      
      {/* MODIFIED: Room names editing - allow editing unless view-only */}
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
            disabled={isLoading}
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
                  disabled={!editingRoomNames || getActualDisabledState() || roomNamesLoading} // ← Updated
                  aria-label={`Room ${idx + 1} name`}
                />
              ))}
            </div>
            <div className="mt-2">
              {!editingRoomNames ? (
                <button
                  className="btn btn-outline-primary d-flex align-items-center gap-1"
                  onClick={() => setEditingRoomNames(true)}
                  disabled={getActualDisabledState() || isLoading || roomNamesLoading} // ← Updated
                >
                  <Edit2 size={16} />
                  Edit Room Names
                </button>
              ) : (
                <>
                  <button
                    className="btn btn-success me-2 d-flex align-items-center gap-1"
                    onClick={handleSaveRoomNames}
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
          disabled={getActualDisabledState()} // ← Updated
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
          disabled={getActualDisabledState()} // ← Updated
          hasRoomConflict={hasRoomConflict}
          occupiedRooms={occupiedRooms}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onChange={(hasChanges) => setHasUnsavedChanges(hasChanges)}
          roomNames={roomNames}
        />
      )}
      {isFormSaved && (
        <MetricsDisplay
          averageLengthOfStay={averageGuestNights}
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