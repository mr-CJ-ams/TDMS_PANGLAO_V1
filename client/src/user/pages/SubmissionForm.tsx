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
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";

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

  // Modal state
  const [modal, setModal] = useState<{ show: boolean; title: string; message: string; onClose?: () => void }>({ show: false, title: "", message: "" });
  const [confirmModal, setConfirmModal] = useState(false);

  // Helper function to find all entries for a specific stay across all months
  const findAllStayEntries = (stayId: string, monthlyData: any) => {
    const allEntries = [];
    
    Object.keys(monthlyData).forEach(monthKey => {
      const monthEntries = monthlyData[monthKey] || [];
      const stayEntries = monthEntries.filter((entry: any) => entry.stayId === stayId);
      allEntries.push(...stayEntries);
    });
    
    return allEntries;
  };

  

  // Helper function to find stay ID by guest characteristics - FIXED VERSION
const findStayIdByGuest = (guest: any, room: number, day: number, monthlyData: any) => {
  // First, try to find the exact stay by matching the start day
  for (const monthKey in monthlyData) {
    const monthEntries = monthlyData[monthKey] || [];
    for (const entry of monthEntries) {
      // Match by room, start day, and guest characteristics
      if (entry.room === room && 
          entry.startDay === day && 
          entry.startMonth === selectedMonth && 
          entry.startYear === selectedYear && 
          entry.guests) {
        const matchingGuest = entry.guests.find((g: any) =>
          g.gender === guest.gender &&
          g.age === guest.age &&
          g.status === guest.status &&
          g.nationality === guest.nationality
        );
        if (matchingGuest && entry.stayId) {
          return entry.stayId;
        }
      }
    }
  }
  
  // Fallback: find by guest characteristics in any start day entry for this room
  for (const monthKey in monthlyData) {
    const monthEntries = monthlyData[monthKey] || [];
    for (const entry of monthEntries) {
      if (entry.room === room && entry.isStartDay && entry.guests) {
        const matchingGuest = entry.guests.find((g: any) =>
          g.gender === guest.gender &&
          g.age === guest.age &&
          g.status === guest.status &&
          g.nationality === guest.nationality
        );
        if (matchingGuest && entry.stayId) {
          return entry.stayId;
        }
      }
    }
  }
  
  return null;
};

// Generate a unique stay ID for each guest - ENHANCED for better readability
const generateStayId = (day: number, room: number, guest: any, startMonth: number, startYear: number) => {
  const timestamp = Date.now();
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

  // Save to localStorage and server on monthlyData change
  useEffect(() => {
    if (!user || isLoading) return;
    const saveData = async () => {
      try {
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
                lengthOfStay: Number(g.lengthOfStay) || 0
              }))
            }));
            
            try {
              await axios.post(`${API_BASE_URL}/api/submissions/draft`, {
                userId: user.user_id, 
                month, 
                year, 
                data: cleanMonthData
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

  // Helper function to check if an entry falls within a guest's stay period
  const isEntryInGuestStayPeriod = (entry: any, startDay: number, room: number, lengthOfStay: number, guest: any, startMonth: number, startYear: number) => {
    if (entry.room !== room) return false;
    
    // Calculate the end date of the stay
    let endDay = startDay + lengthOfStay - 1;
    let endMonth = startMonth;
    let endYear = startYear;
    
    const daysInStartMonth = getDaysInMonth(startMonth, startYear);
    if (endDay > daysInStartMonth) {
      endDay = endDay - daysInStartMonth;
      endMonth = startMonth === 12 ? 1 : startMonth + 1;
      endYear = startMonth === 12 ? startYear + 1 : startYear;
    }
    
    // Check if entry is within the stay period
    if (entry.month === startMonth && entry.year === startYear) {
      return entry.day >= startDay && entry.day <= startDay + lengthOfStay - 1;
    } else if (entry.month === endMonth && entry.year === endYear) {
      return entry.day <= endDay;
    }
    
    return false;
  };

  // Save guest data for a day/room - Fixed cross-month propagation and deletion
  const handleSaveGuests = async (day: number, room: number, guestData: any) => {
    const { guests, singleGuest, removeGuest, isEdit } = guestData;
    
    // In the handleSaveGuests function - ENHANCED removal section:
    if (removeGuest) {
      const key = `${selectedYear}-${selectedMonth}`;
      let updatedMonthlyData = { ...monthlyData };
      
      console.log(`🗑️ Removing specific guest:`, removeGuest);
      console.log(`📍 From: Room ${room}, Day ${day}`);

      // ENHANCED: Find the COMPLETE stay information for this guest
      let guestStartDay = day;
      let guestStayId = removeGuest._stayId;
      let guestLengthOfStay = 0;
      let guestStartMonth = selectedMonth;
      let guestStartYear = selectedYear;

      // First, comprehensively find the guest's actual start day and stay information
      Object.keys(updatedMonthlyData).forEach(monthKey => {
        if (updatedMonthlyData[monthKey]) {
          updatedMonthlyData[monthKey].forEach((entry: any) => {
            if (entry.guests) {
              entry.guests.forEach((g: any) => {
                if (g.gender === removeGuest.gender &&
                    g.age === removeGuest.age &&
                    g.status === removeGuest.status &&
                    g.nationality === removeGuest.nationality) {
                  
                  // Found the guest - track their actual start day information
                  if (entry.isStartDay || g._isStartDay) {
                    guestStartDay = entry.startDay || entry.day;
                    guestStayId = entry.stayId || g._stayId;
                    guestLengthOfStay = entry.lengthOfStay || g.lengthOfStay || guestLengthOfStay;
                    guestStartMonth = entry.startMonth || entry.month;
                    guestStartYear = entry.startYear || entry.year;
                    console.log(`📅 Found start day: Day ${guestStartDay}, Stay ID: ${guestStayId}, Length: ${guestLengthOfStay}`);
                  }
                  
                  // Also track length of stay from any entry if not found yet
                  if (guestLengthOfStay === 0 && (entry.lengthOfStay || g.lengthOfStay)) {
                    guestLengthOfStay = entry.lengthOfStay || g.lengthOfStay;
                  }
                }
              });
            }
          });
        }
      });

      // If we still don't have length of stay, use a fallback
      if (guestLengthOfStay === 0) {
        guestLengthOfStay = removeGuest.lengthOfStay || 1;
        console.log(`⚠️ Using fallback length of stay: ${guestLengthOfStay}`);
      }

      console.log(`🎯 Removing guest from ALL days of stay: Start Day ${guestStartDay}, Length ${guestLengthOfStay} days`);

      // Calculate ALL days that should contain this guest
      const affectedDays = new Set();
      let currentDay = guestStartDay;
      let currentMonth = guestStartMonth;
      let currentYear = guestStartYear;
      let remainingDays = guestLengthOfStay;

      while (remainingDays > 0) {
        const daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);
        const daysToAdd = Math.min(remainingDays, daysInCurrentMonth - currentDay + 1);
        
        for (let i = 0; i < daysToAdd; i++) {
          const targetDay = currentDay + i;
          const monthKey = `${currentYear}-${currentMonth}`;
          affectedDays.add(`${monthKey}-${targetDay}`);
        }
        
        remainingDays -= daysToAdd;
        currentDay = 1;
        if (++currentMonth > 12) {
          currentMonth = 1;
          currentYear++;
        }
      }

      console.log(`📋 Affected days:`, Array.from(affectedDays));

      // Now remove ALL instances of this guest from ALL affected days
      Object.keys(updatedMonthlyData).forEach(monthKey => {
        if (updatedMonthlyData[monthKey]) {
          const beforeCount = updatedMonthlyData[monthKey].length;
          
          updatedMonthlyData[monthKey] = updatedMonthlyData[monthKey]
            .map((entry: any) => {
              const entryKey = `${monthKey}-${entry.day}`;
              const isAffectedDay = affectedDays.has(entryKey);
              const containsGuestToRemove = entry.guests?.some((g: any) =>
                g.gender === removeGuest.gender &&
                g.age === removeGuest.age &&
                g.status === removeGuest.status &&
                g.nationality === removeGuest.nationality
              );
              
              // Only process if this day should contain the guest AND it actually does
              if (isAffectedDay && containsGuestToRemove) {
                // Remove only this specific guest from the entry
                const filteredGuests = entry.guests.filter((g: any) =>
                  !(
                    g.gender === removeGuest.gender &&
                    g.age === removeGuest.age &&
                    g.status === removeGuest.status &&
                    g.nationality === removeGuest.nationality
                  )
                );
                
                console.log(`✅ Removed guest from ${monthKey} day ${entry.day}, ${filteredGuests.length} guests remain`);
                
                // If there are still other guests, update the entry
                if (filteredGuests.length > 0) {
                  // Recalculate entry flags based on remaining guests
                  const hasCheckIn = filteredGuests.some((g: any) => g.isCheckIn);
                  const hasStartDay = filteredGuests.some((g: any) => g._isStartDay);
                  const remainingStartDays = filteredGuests
                    .filter(g => g._startDay)
                    .map(g => g._startDay)
                    .sort((a, b) => a - b);
                  
                  const newStartDay = remainingStartDays.length > 0 ? remainingStartDays[0] : entry.startDay;
                  
                  // Find the stay ID from remaining start day guests
                  let newStayId = entry.stayId;
                  const startDayGuest = filteredGuests.find(g => g._startDay === newStartDay);
                  if (startDayGuest && startDayGuest._stayId) {
                    newStayId = startDayGuest._stayId;
                  }
                  
                  return {
                    ...entry,
                    guests: filteredGuests,
                    isCheckIn: hasCheckIn,
                    isStartDay: entry.day === newStartDay && hasStartDay,
                    startDay: newStartDay,
                    stayId: newStayId
                  };
                }
                // If no guests left, remove the entire entry
                return null;
              }
              return entry;
            })
            .filter((entry: any) => entry !== null);
          
          const afterCount = updatedMonthlyData[monthKey].length;
          if (beforeCount !== afterCount) {
            console.log(`📊 ${monthKey}: Removed ${beforeCount - afterCount} entries`);
          }
        }
      });

      // Also remove from database using the stay ID if available
      if (guestStayId) {
        await removeStayFromDatabase(guestStayId);
      }

      setMonthlyData(updatedMonthlyData);
      setOccupiedRooms(updatedMonthlyData[key] || []);
      return;
    }

    if (!guests?.length) {
      setModal({
        show: true,
        title: "Missing Guests",
        message: "Please add at least one guest",
      });
      return;
    }

    let updatedMonthlyData = { ...monthlyData };
    
    // Process each guest individually
    guests.forEach(guest => {
      const guestStayLength = parseInt(guest.lengthOfStay);
      const newStayId = generateStayId(day, room, guest, selectedMonth, selectedYear);

      // If this is an EDIT operation, we need to find and remove the OLD guest data first
      if (isEdit && guest._originalStayId) {
        console.log(`✏️ Editing guest with original stay ID: ${guest._originalStayId}`);
        console.log(`📝 Original: Gender=${guest._originalGender}, Age=${guest._originalAge}, Status=${guest._originalStatus}, Nationality=${guest._originalNationality}`);
        console.log(`🔄 New: Gender=${guest.gender}, Age=${guest.age}, Status=${guest.status}, Nationality=${guest.nationality}`);
        console.log(`📅 New length of stay: ${guestStayLength} days`);
        
        // ENHANCED: Calculate the COMPLETE range of the OLD stay to ensure proper removal across ALL months
        let oldStayStartDay = day;
        let oldStayStartMonth = selectedMonth;
        let oldStayStartYear = selectedYear;
        let oldLengthOfStay = guest._originalLengthOfStay || guestStayLength;

        // First, find the actual original start day and length of stay
        Object.keys(updatedMonthlyData).forEach(monthKey => {
          if (updatedMonthlyData[monthKey]) {
            updatedMonthlyData[monthKey].forEach((entry: any) => {
              if (entry.guests) {
                entry.guests.forEach((g: any) => {
                  if (g.gender === guest._originalGender &&
                      g.age === guest._originalAge &&
                      g.status === guest._originalStatus &&
                      g.nationality === guest._originalNationality) {
                    
                    if (entry.isStartDay || g._isStartDay) {
                      oldStayStartDay = entry.startDay || entry.day;
                      oldStayStartMonth = entry.startMonth || entry.month;
                      oldStayStartYear = entry.startYear || entry.year;
                      oldLengthOfStay = entry.lengthOfStay || g.lengthOfStay || oldLengthOfStay;
                      console.log(`📅 Found original stay: Start Day ${oldStayStartDay}, Length ${oldLengthOfStay} days`);
                    }
                  }
                });
              }
            });
          }
        });

        // Calculate ALL months and days that contained the OLD guest
        const oldAffectedMonths = new Set();
        const oldAffectedDays = new Set();
        let currentDay = oldStayStartDay;
        let currentMonth = oldStayStartMonth;
        let currentYear = oldStayStartYear;
        let remainingOldDays = oldLengthOfStay;

        console.log(`🗑️ Removing OLD guest from ${oldLengthOfStay} days starting from Day ${oldStayStartDay}`);

        while (remainingOldDays > 0) {
          const daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);
          const daysToRemove = Math.min(remainingOldDays, daysInCurrentMonth - currentDay + 1);
          const monthKey = `${currentYear}-${currentMonth}`;
          
          oldAffectedMonths.add(monthKey);
          
          for (let i = 0; i < daysToRemove; i++) {
            const targetDay = currentDay + i;
            oldAffectedDays.add(`${monthKey}-${targetDay}`);
          }
          
          remainingOldDays -= daysToRemove;
          currentDay = 1;
          if (++currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
          }
        }

        console.log(`📋 OLD affected months:`, Array.from(oldAffectedMonths));
        console.log(`📋 OLD affected days:`, Array.from(oldAffectedDays));

        // CRITICAL FIX: Remove OLD guest from ALL previously affected months and days
        Object.keys(updatedMonthlyData).forEach(monthKey => {
          if (updatedMonthlyData[monthKey]) {
            // Check if this month was part of the OLD stay
            const wasPartOfOldStay = oldAffectedMonths.has(monthKey);
            
            updatedMonthlyData[monthKey] = updatedMonthlyData[monthKey]
              .map((entry: any) => {
                const entryKey = `${monthKey}-${entry.day}`;
                const wasAffectedByOldStay = oldAffectedDays.has(entryKey);
                const containsOldGuest = entry.guests?.some((g: any) =>
                  g.gender === guest._originalGender &&
                  g.age === guest._originalAge &&
                  g.status === guest._originalStatus &&
                  g.nationality === guest._originalNationality
                );
                
                // Remove the guest if:
                // 1. This day was part of the OLD stay AND contains the guest, OR
                // 2. This month was part of the OLD stay AND contains the guest (safety check)
                if ((wasAffectedByOldStay && containsOldGuest) || (wasPartOfOldStay && containsOldGuest)) {
                  // Remove only the OLD guest from this entry
                  const filteredGuests = entry.guests.filter((g: any) =>
                    !(
                      g.gender === guest._originalGender &&
                      g.age === guest._originalAge &&
                      g.status === guest._originalStatus &&
                      g.nationality === guest._originalNationality
                    )
                  );
                  
                  console.log(`🗑️ Removed OLD guest from ${monthKey} day ${entry.day}, ${filteredGuests.length} guests remain`);
                  
                  // If there are still other guests, update the entry
                  if (filteredGuests.length > 0) {
                    // Recalculate entry metadata based on remaining guests
                    const hasCheckIn = filteredGuests.some((g: any) => g.isCheckIn);
                    const hasStartDay = filteredGuests.some((g: any) => g._isStartDay);
                    const remainingStartDays = filteredGuests
                      .filter(g => g._startDay)
                      .map(g => g._startDay)
                      .sort((a, b) => a - b);
                    
                    const newStartDay = remainingStartDays.length > 0 ? remainingStartDays[0] : entry.startDay;
                    
                    // Find the stay ID from remaining start day guests
                    let newStayId = entry.stayId;
                    const startDayGuest = filteredGuests.find(g => g._startDay === newStartDay);
                    if (startDayGuest && startDayGuest._stayId) {
                      newStayId = startDayGuest._stayId;
                    }
                    
                    // Calculate max length of stay among remaining guests
                    const maxLengthOfStay = Math.max(
                      ...filteredGuests.map((g: any) => g.lengthOfStay || 0),
                      entry.lengthOfStay || 0
                    );
                    
                    return {
                      ...entry,
                      guests: filteredGuests,
                      isCheckIn: hasCheckIn,
                      isStartDay: entry.day === newStartDay && hasStartDay,
                      startDay: newStartDay,
                      stayId: newStayId,
                      lengthOfStay: maxLengthOfStay
                    };
                  }
                  // If no guests left, remove the entire entry
                  return null;
                }
                return entry;
              })
              .filter((entry: any) => entry !== null);
          }
        });

        // EXTRA SAFETY: Clean up any empty months that might have been left behind
        Object.keys(updatedMonthlyData).forEach(monthKey => {
          if (updatedMonthlyData[monthKey] && updatedMonthlyData[monthKey].length === 0) {
            delete updatedMonthlyData[monthKey];
            console.log(`🧹 Cleaned up empty month: ${monthKey}`);
          }
        });
        
        console.log(`🔄 Adding updated guest with new length of stay: ${guestStayLength} days`);
      }

      // Add the guest for each day of their stay (including cross-month) - ENHANCED cross-month handling
      let currentDay = day;
      let currentMonth = selectedMonth;
      let currentYear = selectedYear;
      let remainingDays = guestStayLength;
      let isFirstDay = true;

      console.log(`📅 Adding guest for ${guestStayLength} days starting from ${currentMonth}/${currentDay}/${currentYear}`);

      while (remainingDays > 0) {
        const daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);
        const daysToAdd = Math.min(remainingDays, daysInCurrentMonth - currentDay + 1);
        const monthKey = `${currentYear}-${currentMonth}`;
        
        console.log(`📋 Adding ${daysToAdd} days in ${monthKey} from day ${currentDay}`);
        
        if (!updatedMonthlyData[monthKey]) {
          updatedMonthlyData[monthKey] = [];
        }

        // Add guest for each day in the current month
        for (let i = 0; i < daysToAdd; i++) {
          const targetDay = currentDay + i;
          
          // Create new guest entry
          const guestEntry = {
            ...guest,
            roomNumber: room,
            lengthOfStay: guestStayLength,
            isCheckIn: isFirstDay ? !!guest.isCheckIn : false,
            _isStartDay: isFirstDay,
            _startDay: day,
            _stayId: newStayId,
            _startMonth: selectedMonth,
            _startYear: selectedYear
          };

          // Check if entry already exists for this day/room
          const existingEntryIndex = updatedMonthlyData[monthKey].findIndex(
            (e: any) => e.day === targetDay && e.room === room
          );

          if (existingEntryIndex !== -1) {
            // Entry exists - handle shared entry
            const existingEntry = updatedMonthlyData[monthKey][existingEntryIndex];
            
            // Check if our guest is already in this entry
            const guestExistsIndex = existingEntry.guests.findIndex((g: any) =>
              g.gender === guest.gender &&
              g.age === guest.age &&
              g.status === guest.status &&
              g.nationality === guest.nationality
            );

            if (guestExistsIndex !== -1) {
              // Update existing guest in the entry
              existingEntry.guests[guestExistsIndex] = guestEntry;
            } else {
              // Add our guest to existing entry with other guests
              existingEntry.guests.push(guestEntry);
            }
            
            // Update entry metadata
            if (isFirstDay) {
              existingEntry.isCheckIn = existingEntry.guests.some((g: any) => g.isCheckIn);
              existingEntry.isStartDay = true;
              existingEntry.startDay = day;
              existingEntry.startMonth = selectedMonth;
              existingEntry.startYear = selectedYear;
              
              // Use this guest's stay ID if it's their start day
              existingEntry.stayId = newStayId;
              existingEntry.lengthOfStay = guestStayLength;
            } else {
              // For following days, ensure lengthOfStay is appropriate
              const maxLengthOfStay = Math.max(
                existingEntry.lengthOfStay || 0,
                guestStayLength,
                ...existingEntry.guests.map((g: any) => g.lengthOfStay || 0)
              );
              existingEntry.lengthOfStay = maxLengthOfStay;
            }
          } else {
            // Create new entry
            const newEntry = {
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
            };
            updatedMonthlyData[monthKey].push(newEntry);
            console.log(`✅ Created new entry for ${monthKey} day ${targetDay}`);
          }
          
          isFirstDay = false;
        }

        remainingDays -= daysToAdd;
        
        // Move to next month if there are remaining days
        if (remainingDays > 0) {
          currentDay = 1;
          currentMonth = currentMonth === 12 ? 1 : currentMonth + 1;
          currentYear = currentMonth === 1 ? currentYear + 1 : currentYear;
          console.log(`🔄 Moving to next month: ${currentMonth}/${currentYear}`);
        }
      }
    }); // <-- This closing brace was missing in your code

    // Clean up any empty entries and remove duplicates
    Object.keys(updatedMonthlyData).forEach(monthKey => {
      if (updatedMonthlyData[monthKey]) {
        // Remove empty entries
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
      entry.isStartDay && entry.guests.some(g => g.isCheckIn)
    );

    // Check if ANY guest in this room/day is on their start day but NO check-in
    const hasStartDayWithoutCheckIn = roomEntries.some(entry => 
      entry.isStartDay && !entry.guests.some(g => g.isCheckIn)
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
            _startDay: guestStayData.startDay,
            _stayId: guestStayData.stayId,
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

  // In SubmissionForm.tsx - Update the handleRemoveAllGuests function to add logging
const handleRemoveAllGuests = async (day: number, room: number) => {
  console.log(`🔥 GLOBAL REMOVE: Removing all guests from Room ${room}, Day ${day}`);
  
  const roomEntries = occupiedRooms.filter(r => r.day === day && r.room === room);
  if (!roomEntries.length) {
    console.log(`ℹ️ No guests found in Room ${room}, Day ${day}`);
    return;
  }

  console.log(`📋 Found ${roomEntries.length} entries with guests to remove`);
  
  // Collect all unique stay IDs from this day/room
  const stayIdsToRemove = new Set<string>();
  const guestsToRemove = new Set();
  
  roomEntries.forEach(entry => {
    if (entry.stayId && typeof entry.stayId === 'string') {
      stayIdsToRemove.add(entry.stayId);
      console.log(`🎯 Will remove stay ID: ${entry.stayId}`);
    }
    
    // Also collect guest characteristics for fallback removal
    if (entry.guests) {
      entry.guests.forEach((guest: any) => {
        guestsToRemove.add(JSON.stringify({
          gender: guest.gender,
          age: guest.age,
          status: guest.status,
          nationality: guest.nationality
        }));
      });
    }
  });
  
  let updatedMonthlyData = { ...monthlyData };
  
  // Method 1: Remove by stay ID (most reliable)
  if (stayIdsToRemove.size > 0) {
    console.log(`🗑️ Removing ${stayIdsToRemove.size} unique stay(s) by stay ID`);
    for (const stayId of stayIdsToRemove) {
      // Remove from all months
      Object.keys(updatedMonthlyData).forEach(monthKey => {
        if (updatedMonthlyData[monthKey]) {
          const beforeCount = updatedMonthlyData[monthKey].length;
          updatedMonthlyData[monthKey] = updatedMonthlyData[monthKey].filter(
            (entry: any) => entry.stayId !== stayId
          );
          const afterCount = updatedMonthlyData[monthKey].length;
          if (beforeCount !== afterCount) {
            console.log(`✅ Removed ${beforeCount - afterCount} entries from ${monthKey} for stay ${stayId}`);
          }
        }
      });
      
      // Remove from database
      await removeStayFromDatabase(stayId);
    }
  } 
  // Method 2: Fallback - remove by guest characteristics
  else if (guestsToRemove.size > 0) {
    console.log(`🗑️ Removing ${guestsToRemove.size} unique guest(s) by characteristics`);
    const guestArray = Array.from(guestsToRemove).map(g => JSON.parse(g as string));
    
    for (const guest of guestArray) {
      Object.keys(updatedMonthlyData).forEach(monthKey => {
        if (updatedMonthlyData[monthKey]) {
          updatedMonthlyData[monthKey] = updatedMonthlyData[monthKey]
            .map((entry: any) => {
              if (entry.room === room) {
                return {
                  ...entry,
                  guests: entry.guests.filter((g: any) =>
                    !(
                      g.gender === guest.gender &&
                      g.age === guest.age &&
                      g.status === guest.status &&
                      g.nationality === guest.nationality
                    )
                  ),
                };
              }
              return entry;
            })
            .filter((entry: any) => entry.guests && entry.guests.length > 0);
        }
      });
    }
  }
  
  const currentKey = `${selectedYear}-${selectedMonth}`;
  setMonthlyData(updatedMonthlyData);
  setOccupiedRooms(updatedMonthlyData[currentKey] || []);
  
  console.log(`✅ GLOBAL REMOVE COMPLETE: All guests removed from Room ${room}, Day ${day}`);
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

// Helper function to remove stay from database for all months - FIXED
const removeStayFromDatabase = async (stayId: string) => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token || !user) {
      console.log("No token or user found, skipping database removal");
      return;
    }
    
    // Find all months that might contain this specific stay
    const affectedMonths = new Set<string>();
    Object.keys(monthlyData).forEach(monthKey => {
      const monthData = monthlyData[monthKey] || [];
      const hasStay = monthData.some((entry: any) => entry.stayId === stayId);
      if (hasStay) {
        affectedMonths.add(monthKey);
      }
    });
    
    // Remove from each affected month - only remove the specific stay
    for (const monthKey of Array.from(affectedMonths)) {
      const [year, month] = monthKey.split('-').map(Number);
      try {
        // Get current data for this month
        const response = await axios.get(
          `${API_BASE_URL}/api/submissions/draft/${user.user_id}/${month}/${year}`,
          { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
        );
        
        const monthData = response.data?.days || [];
        
        // Remove only entries with this specific stay ID
        const filteredData = monthData
          .map((entry: any) => {
            if (entry.stayId === stayId) {
              // This entry belongs to the stay we're removing, so remove it entirely
              return null;
            }
            return entry;
          })
          .filter((entry: any) => entry !== null);
        
        // Save filtered data back
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
        
        console.log(`✅ Removed stay ${stayId} from database for ${month}/${year}`);
        
      } catch (err) {
        console.warn(`Could not update database for ${month}/${year}:`, err);
      }
    }
    
  } catch (err: any) {
    console.error("Error removing stay from database:", err);
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
        return;
      }
      
      // Calculate which months are likely to contain this stay
      const { startDay, startMonth, startYear, lengthOfStay } = startEntry;
      const affectedMonths = getAffectedMonths(startDay, startMonth, startYear, lengthOfStay);
      
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
          }
        } catch (err) {
          // Ignore errors for months that don't have data
          console.warn(`Could not check/update ${month}/${year}:`, err instanceof Error ? err.message : String(err));
        }
      }
    } catch (err) {
      console.error("Fallback: Error removing stay from database:", err);
    }
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