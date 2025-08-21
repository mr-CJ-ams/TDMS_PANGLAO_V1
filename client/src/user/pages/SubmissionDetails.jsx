/**
 * SubmissionDetails.jsx
 * 
 * Panglao Tourist Data Management System - Submission Details Page (Frontend)
 * 
 * =========================
 * Overview:
 * =========================
 * This React component displays detailed information about a specific accommodation submission, including daily guest metrics, room occupancy, nationality counts, and summary statistics.
 * It provides interactive features for searching, filtering, paginating, and exporting submission data, supporting both user and admin review workflows.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Fetches submission details from the backend API using the provided submissionId.
 * - Displays daily metrics in a paginated, filterable table with room-level granularity.
 * - Calculates and displays summary statistics (totals, averages) for the submission.
 * - Shows guest check-in rankings by nationality and allows viewing detailed counts in a modal.
 * - Supports searching and filtering by guest attributes (room, nationality, gender, status).
 * - Allows exporting submission data and daily metrics to Excel, including nationality breakdowns.
 * - Handles loading, error, and empty states gracefully.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Uses axios for API communication and sessionStorage for authentication.
 * - Implements advanced table features: pagination, quick room search, summary navigation, and temporary cell highlighting.
 * - Utilizes XLSX and file-saver libraries for exporting multi-sheet Excel reports.
 * - Responsive and accessible UI with clear feedback and interactive controls.
 * - Modular design with reusable components (MetricsCard, ActionButton, Nationality).
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Accessed by users or admins to review the details of a monthly accommodation submission.
 * - Used for data validation, analytics, and reporting, including exporting to Excel for official records.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - The backend endpoint for fetching submission details is GET /api/submissions/details/:submissionId.
 * - Update this component if table structure, metrics, or export requirements change.
 * - Ensure guest data and metrics calculations match backend logic for consistency.
 * - Extend filtering and export logic as needed for new analytics or reporting features.
 * 
 * =========================
 * Related Files:
 * =========================
 * - src/user/pages/SubmissionHistory.jsx        (lists submissions and links to details)
 * - server/controllers/submissionsController.js (handles backend submission details logic)
 * - server/routes/submissions.js                (defines backend submission details route)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Modal, ListGroup } from "react-bootstrap";
import { FileSpreadsheet, Users, Search, Filter } from "lucide-react";
import { MetricsCard } from "../components/MetricsCard";
import { ActionButton } from "../components/ActionButton";
import Nationality from "../components/Nationality";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const SubmissionDetails = ({ submissionId }) => {
  const [submission, setSubmission] = useState({ days: [] }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(null),
    [showNationalityModal, setShowNationalityModal] = useState(false);

  // Pagination and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRoom, setFilterRoom] = useState("");
  const [filterNationality, setFilterNationality] = useState("");
  const [roomSearchTerm, setRoomSearchTerm] = useState("");
  const [highlightedRoom, setHighlightedRoom] = useState(null);
  const [roomPage, setRoomPage] = useState(1);
  const roomsPerPage = 20; // You can adjust this number

  useEffect(() => {
    if (!submissionId) return;
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/api/submissions/details/${submissionId}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      })
      .then((res) => setSubmission(res.data))
      .catch(() => setError("Failed to fetch submission details. Please try again."))
      .finally(() => setLoading(false));
  }, [submissionId]);

  // Filter and pagination logic
  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const daysInMonth = submission ? getDaysInMonth(submission.month, submission.year) : 31;

  const filteredDays = Array.from({ length: daysInMonth }, (_, dayIndex) => {
    const day = dayIndex + 1;
    const dayData = submission?.days.find(d => d.day === day);
    const dayGuests = dayData?.guests || [];
    
    // Apply filters
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const hasMatchingGuest = dayGuests.some(guest => 
        guest.nationality.toLowerCase().includes(searchLower) ||
        guest.gender.toLowerCase().includes(searchLower) ||
        guest.status.toLowerCase().includes(searchLower) ||
        guest.room_number.toString().includes(searchTerm)
      );
      if (!hasMatchingGuest) return null;
    }
    
    if (filterRoom) {
      const hasRoomGuest = dayGuests.some(guest => 
        guest.room_number.toString() === filterRoom
      );
      if (!hasRoomGuest) return null;
    }
    
    if (filterNationality) {
      const hasNationalityGuest = dayGuests.some(guest => 
        guest.nationality.toLowerCase().includes(filterNationality.toLowerCase())
      );
      if (!hasNationalityGuest) return null;
    }
    
    return { day, dayData, dayGuests };
  }).filter(Boolean);

  const resetFilters = () => {
    setSearchTerm("");
    setFilterRoom("");
    setFilterNationality("");
    setRoomSearchTerm("");
    setHighlightedRoom(null);
  };

  const handleRoomSearch = () => {
    const roomNumber = parseInt(roomSearchTerm);
    if (
      roomNumber &&
      roomNumber >= 1 &&
      roomNumber <= submission?.number_of_rooms
    ) {
      setHighlightedRoom(roomNumber);

      // Calculate which page the room is on
      const targetPage = Math.ceil(roomNumber / roomsPerPage);
      setRoomPage(targetPage);

      // Wait for page update, then scroll to the room column
      setTimeout(() => {
        const roomElement = document.getElementById(`room-${roomNumber}`);
        if (roomElement) {
          roomElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });

          // Add a temporary highlight effect
          roomElement.classList.add(
            "bg-yellow-100",
            "border-2",
            "border-yellow-400"
          );
          setTimeout(() => {
            roomElement.classList.remove(
              "bg-yellow-100",
              "border-2",
              "border-yellow-400"
            );
          }, 3000);
        }
      }, 200); // Wait for table to re-render
    } else {
      setHighlightedRoom(null);
    }
  };

  const handleRoomSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRoomSearch();
    }
  };

  const scrollToSummary = () => {
    const summaryHeader = document.getElementById('summary-header');
    if (summaryHeader) {
      summaryHeader.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });

      // Add temporary highlight effect
      const allSummaryCells = document.querySelectorAll('td:last-child');
      allSummaryCells.forEach(cell => {
        cell.classList.add('bg-blue-100', 'border-2', 'border-blue-400');
        setTimeout(() => {
          cell.classList.remove('bg-blue-100', 'border-2', 'border-blue-400');
        }, 3000);
      });
    }
  };

  const calculateMetrics = (s) => {
    if (!s || !s.days)
      return {
        totalCheckIns: 0,
        totalOvernight: 0,
        totalOccupied: 0,
        averageGuestNights: 0,
        averageRoomOccupancyRate: 0,
        averageGuestsPerRoom: 0,
      };
    const { days } = s,
      numberOfRooms = s.number_of_rooms || 1,
      totalCheckIns = days.reduce((a, d) => a + (d.check_ins || 0), 0),
      totalOvernight = days.reduce((a, d) => a + (d.overnight || 0), 0),
      totalOccupied = days.reduce((a, d) => a + (d.occupied || 0), 0),
      averageGuestNights = totalCheckIns > 0 ? (totalOvernight / totalCheckIns).toFixed(2) : 0,
      averageRoomOccupancyRate = numberOfRooms > 0 ? ((totalOccupied / (numberOfRooms * days.length)) * 100).toFixed(2) : 0,
      averageGuestsPerRoom = totalOccupied > 0 ? (totalOvernight / totalOccupied).toFixed(2) : 0;
    return { totalCheckIns, totalOvernight, totalOccupied, averageGuestNights, averageRoomOccupancyRate, averageGuestsPerRoom };
  };

  const nationalityCounts = React.useMemo(() => {
    const counts = {};
    submission.days?.forEach((day) =>
      day.guests?.forEach((g) => {
        if (g.isCheckIn) counts[g.nationality] = (counts[g.nationality] || 0) + 1;
      })
    );
    return counts;
  }, [submission]);

  const sortedNationalities = React.useMemo(
    () =>
      Object.entries(nationalityCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([nationality]) => nationality),
    [nationalityCounts]
  );


  const exportDailyMetricsToExcel = () => {
    const getDaysInMonth = (month, year) => {
      return new Date(year, month, 0).getDate();
    };
    const daysInMonth = getDaysInMonth(submission.month, submission.year);
    
    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Submission Details
    const submissionDetailsData = [
      ["SUBMISSION DETAILS"],
      [""], // Empty row for spacing
      ["Month", new Date(0, submission.month - 1).toLocaleString("default", { month: "long" })],
      ["Year", submission.year],
      ["Company Name", submission.company_name || "N/A"],
      ["Accommodation Type", submission.accommodation_type || "N/A"],
      ["Submitted At", new Date(submission.submitted_at).toLocaleString()],
      ["Total Rooms", submission.number_of_rooms],
      [""], // Empty row for spacing
      ["TOTALS"],
      ["Total No. of Guest Check-Ins", totalCheckIns],
      ["Total No. Guest Staying Overnight", totalOvernight],
      ["Total No. of Occupied Rooms", totalOccupied],
      [""], // Empty row for spacing
      ["AVERAGES"],
      ["Ave. Guest-Nights", averageGuestNights],
      ["Ave. Room Occupancy Rate", `${averageRoomOccupancyRate}%`],
      ["Ave. Guests per Room", averageGuestsPerRoom],
    ];
    
    const submissionWs = XLSX.utils.aoa_to_sheet(submissionDetailsData);
    XLSX.utils.book_append_sheet(wb, submissionWs, "Submission Details");
    
    // Auto-size columns for submission details
    submissionWs['!cols'] = [
      { width: 25 }, // Label column
      { width: 20 }  // Value column
    ];
    
    // Sheet 2: Daily Metrics
    // Create headers: Day, Room 1, Room 2, ..., Room N, Summary
    const headers = ["Day"];
    for (let i = 1; i <= submission.number_of_rooms; i++) {
      headers.push(`Room ${i}`);
    }
    headers.push("Check-ins", "Overnight", "Occupied");
    
    const data = [headers];
    
    // Add data for each day
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = submission.days.find(d => d.day === day);
      const dayGuests = dayData?.guests || [];
      
      // Group guests by room
      const guestsByRoom = {};
      for (let roomNum = 1; roomNum <= submission.number_of_rooms; roomNum++) {
        guestsByRoom[roomNum] = dayGuests.filter(g => g.room_number === roomNum);
      }
      
      // Calculate summary
      const totalCheckIns = dayGuests.filter(g => g.isCheckIn).length;
      const totalOvernight = dayGuests.length;
      const totalOccupied = Object.values(guestsByRoom).filter(guests => guests.length > 0).length;
      
      const row = [day];
      
      // Add room data
      for (let roomNum = 1; roomNum <= submission.number_of_rooms; roomNum++) {
        const roomGuests = guestsByRoom[roomNum] || [];
        if (roomGuests.length > 0) {
          const guestDetails = roomGuests.map(guest => 
            `${guest.isCheckIn ? '✓' : '●'} ${guest.gender}, ${guest.age}, ${guest.status}, ${guest.nationality}`
          ).join('\n'); // Use line breaks instead of semicolons
          row.push(guestDetails);
        } else {
          row.push("Empty");
        }
      }
      
      // Add summary data
      row.push(totalCheckIns, totalOvernight, totalOccupied);
      
      data.push(row);
    }
    
    const dailyMetricsWs = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, dailyMetricsWs, "Daily Metrics");
    
    // Auto-size columns for daily metrics
    const colWidths = [8]; // Day column
    for (let i = 1; i <= submission.number_of_rooms; i++) {
      colWidths.push(30); // Room columns
    }
    colWidths.push(12, 12, 12); // Summary columns
    
    dailyMetricsWs['!cols'] = colWidths.map(width => ({ width }));
    
    // Auto-fit rows for multi-line content
    const maxRowHeight = 15; // Base row height
    for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      let maxLines = 1;
      
      // Check each room column for number of lines
      for (let colIndex = 1; colIndex <= submission.number_of_rooms; colIndex++) {
        const cellValue = row[colIndex];
        if (cellValue && cellValue !== "Empty") {
          const lines = cellValue.split('\n').length;
          maxLines = Math.max(maxLines, lines);
        }
      }
      
      // Set row height based on content
      const rowHeight = Math.max(maxRowHeight, maxLines * 15);
      if (!dailyMetricsWs['!rows']) dailyMetricsWs['!rows'] = [];
      dailyMetricsWs['!rows'][rowIndex] = { hpt: rowHeight };
    }
    
    // Sheet 3: Nationality Counts
    const nationalityData = [
      ["Year", "=", submission.year],
      ["Month", "=", new Date(0, submission.month - 1).toLocaleString("default", { month: "long" })],
      ["(PANGLAO REPORT)", submission.company_name || "Resort"],
      [""], // Empty row for spacing
      ["COUNTRY OF RESIDENCE"],
      ["TOTAL PHILIPPINE RESIDENTS", "=", nationalityCounts["Philippines"] || 0],
      ["NON-PHILIPPINE RESIDENTS", "=", Object.entries(nationalityCounts).filter(([country]) => country !== "Philippines").reduce((sum, [, count]) => sum + count, 0)],
      [""], // Empty row for spacing
      
      // ASIA - ASEAN
      ["ASIA - ASEAN"],
      ["   Brunei", "=", nationalityCounts["Brunei"] || 0],
      ["   Cambodia", "=", nationalityCounts["Cambodia"] || 0],
      ["   Indonesia", "=", nationalityCounts["Indonesia"] || 0],
      ["   Laos", "=", nationalityCounts["Laos"] || 0],
      ["   Malaysia", "=", nationalityCounts["Malaysia"] || 0],
      ["   Myanmar", "=", nationalityCounts["Myanmar"] || 0],
      ["   Singapore", "=", nationalityCounts["Singapore"] || 0],
      ["   Thailand", "=", nationalityCounts["Thailand"] || 0],
      ["   Vietnam", "=", nationalityCounts["Vietnam"] || 0],
      [""], // Empty row for spacing
      
      // ASIA - EAST ASIA
      ["ASIA - EAST ASIA"],
      ["   China", "=", nationalityCounts["China"] || 0],
      ["   Hong Kong", "=", nationalityCounts["Hong Kong"] || 0],
      ["   Japan", "=", nationalityCounts["Japan"] || 0],
      ["   Korea", "=", nationalityCounts["Korea"] || 0],
      ["   Taiwan", "=", nationalityCounts["Taiwan"] || 0],
      [""], // Empty row for spacing
      
      // ASIA - SOUTH ASIA
      ["ASIA - SOUTH ASIA"],
      ["   Bangladesh", "=", nationalityCounts["Bangladesh"] || 0],
      ["   India", "=", nationalityCounts["India"] || 0],
      ["   Iran", "=", nationalityCounts["Iran"] || 0],
      ["   Nepal", "=", nationalityCounts["Nepal"] || 0],
      ["   Pakistan", "=", nationalityCounts["Pakistan"] || 0],
      ["   Sri Lanka", "=", nationalityCounts["Sri Lanka"] || 0],
      [""], // Empty row for spacing
      
      // MIDDLE EAST
      ["MIDDLE EAST"],
      ["   Bahrain", "=", nationalityCounts["Bahrain"] || 0],
      ["   Egypt", "=", nationalityCounts["Egypt"] || 0],
      ["   Israel", "=", nationalityCounts["Israel"] || 0],
      ["   Jordan", "=", nationalityCounts["Jordan"] || 0],
      ["   Kuwait", "=", nationalityCounts["Kuwait"] || 0],
      ["   Saudi Arabia", "=", nationalityCounts["Saudi Arabia"] || 0],
      ["   United Arab Emirates", "=", nationalityCounts["United Arab Emirates"] || 0],
      [""], // Empty row for spacing
      
      // AMERICA - NORTH AMERICA
      ["AMERICA - NORTH AMERICA"],
      ["   Canada", "=", nationalityCounts["Canada"] || 0],
      ["   Mexico", "=", nationalityCounts["Mexico"] || 0],
      ["   USA", "=", nationalityCounts["USA"] || 0],
      [""], // Empty row for spacing
      
      // AMERICA - SOUTH AMERICA
      ["AMERICA - SOUTH AMERICA"],
      ["   Argentina", "=", nationalityCounts["Argentina"] || 0],
      ["   Brazil", "=", nationalityCounts["Brazil"] || 0],
      ["   Colombia", "=", nationalityCounts["Colombia"] || 0],
      ["   Peru", "=", nationalityCounts["Peru"] || 0],
      ["   Venezuela", "=", nationalityCounts["Venezuela"] || 0],
      [""], // Empty row for spacing
      
      // EUROPE - WESTERN EUROPE
      ["EUROPE - WESTERN EUROPE"],
      ["   Austria", "=", nationalityCounts["Austria"] || 0],
      ["   Belgium", "=", nationalityCounts["Belgium"] || 0],
      ["   France", "=", nationalityCounts["France"] || 0],
      ["   Germany", "=", nationalityCounts["Germany"] || 0],
      ["   Luxembourg", "=", nationalityCounts["Luxembourg"] || 0],
      ["   Netherlands", "=", nationalityCounts["Netherlands"] || 0],
      ["   Switzerland", "=", nationalityCounts["Switzerland"] || 0],
      [""], // Empty row for spacing
      
      // EUROPE - NORTHERN EUROPE
      ["EUROPE - NORTHERN EUROPE"],
      ["   Denmark", "=", nationalityCounts["Denmark"] || 0],
      ["   Finland", "=", nationalityCounts["Finland"] || 0],
      ["   Ireland", "=", nationalityCounts["Ireland"] || 0],
      ["   Norway", "=", nationalityCounts["Norway"] || 0],
      ["   Sweden", "=", nationalityCounts["Sweden"] || 0],
      ["   United Kingdom", "=", nationalityCounts["United Kingdom"] || 0],
      [""], // Empty row for spacing
      
      // EUROPE - SOUTHERN EUROPE
      ["EUROPE - SOUTHERN EUROPE"],
      ["   Greece", "=", nationalityCounts["Greece"] || 0],
      ["   Italy", "=", nationalityCounts["Italy"] || 0],
      ["   Portugal", "=", nationalityCounts["Portugal"] || 0],
      ["   Spain", "=", nationalityCounts["Spain"] || 0],
      ["   Union of Serbia and Montenegro", "=", nationalityCounts["Union of Serbia and Montenegro"] || 0],
      [""], // Empty row for spacing
      
      // EUROPE - EASTERN EUROPE
      ["EUROPE - EASTERN EUROPE"],
      ["   Poland", "=", nationalityCounts["Poland"] || 0],
      ["   Russia", "=", nationalityCounts["Russia"] || 0],
      [""], // Empty row for spacing
      
      // AUSTRALASIA/PACIFIC
      ["AUSTRALASIA/PACIFIC"],
      ["   Australia", "=", nationalityCounts["Australia"] || 0],
      ["   Guam", "=", nationalityCounts["Guam"] || 0],
      ["   Nauru", "=", nationalityCounts["Nauru"] || 0],
      ["   New Zealand", "=", nationalityCounts["New Zealand"] || 0],
      ["   Papua New Guinea", "=", nationalityCounts["Papua New Guinea"] || 0],
      [""], // Empty row for spacing
      
      // AFRICA
      ["AFRICA"],
      ["   Nigeria", "=", nationalityCounts["Nigeria"] || 0],
      ["   South Africa", "=", nationalityCounts["South Africa"] || 0],
      [""], // Empty row for spacing
      
      // OTHERS AND UNSPECIFIED RESIDENCES
      ["OTHERS AND UNSPECIFIED RESIDENCES"],
      ["   Others and Unspecified Residences", "=", nationalityCounts["Others and Unspecified Residences"] || 0],
      [""], // Empty row for spacing
      
      // Summary totals
      ["TOTAL NON-PHILIPPINE RESIDENTS", "=", Object.entries(nationalityCounts).filter(([country]) => country !== "Philippines").reduce((sum, [, count]) => sum + count, 0)],
      [""], // Empty row for spacing
      ["GRAND TOTAL GUEST ARRIVALS", "=", Object.values(nationalityCounts).reduce((sum, count) => sum + count, 0)],
      ["   Total Philippine Residents", "=", nationalityCounts["Philippines"] || 0],
      ["   Total Non-Philippine Residents", "=", Object.entries(nationalityCounts).filter(([country]) => country !== "Philippines").reduce((sum, [, count]) => sum + count, 0)],
      ["   Total Overseas Filipinos", "=", nationalityCounts["Overseas Filipinos"] || 0],
    ];
    
    const nationalityWs = XLSX.utils.aoa_to_sheet(nationalityData);
    XLSX.utils.book_append_sheet(wb, nationalityWs, "Nationality Counts");
    
    // Auto-size columns for nationality counts
    nationalityWs['!cols'] = [
      { width: 35 }, // Country/Region column
      { width: 5 },  // Equals sign column
      { width: 15 }  // Count column
    ];
    
    saveAs(
      new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }),
      `${submission.company_name || 'Resort'}_${new Date(0, submission.month - 1).toLocaleString("default", { month: "long" })}_${submission.year}_Tourist_Arrival_Report.xlsx`
    );
  };

  if (loading) return <p>Loading submission details...</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (!submission || !submission.days) return <p>No submission details found.</p>;

  const {
    totalCheckIns,
    totalOvernight,
    totalOccupied,
    averageGuestNights,
    averageRoomOccupancyRate,
    averageGuestsPerRoom,
  } = calculateMetrics(submission);

  const totalRoomPages = Math.ceil((submission.number_of_rooms || 1) / roomsPerPage);
  const startRoom = (roomPage - 1) * roomsPerPage + 1;
  const endRoom = Math.min(startRoom + roomsPerPage - 1, submission.number_of_rooms || 1);
  const visibleRooms = Array.from({ length: endRoom - startRoom + 1 }, (_, i) => startRoom + i);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Submission Details</h1>
        </div>
        
        {/* Basic Info Cards - Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-50 rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Month</h3>
            <p className="text-xl font-semibold text-slate-800">
              {new Date(0, submission.month - 1).toLocaleString("default", { month: "long" })}
            </p>
          </div>
          
          <div className="bg-slate-50 rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Year</h3>
            <p className="text-xl font-semibold text-slate-800">{submission.year}</p>
          </div>
          
          <div className="bg-slate-50 rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Submitted At</h3>
            <p className="text-xl font-semibold text-slate-800">
              {new Date(submission.submitted_at).toLocaleString()}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <ActionButton onClick={exportDailyMetricsToExcel}>
            <FileSpreadsheet className="w-4 h-4 inline mr-2" />
            Export Daily Metrics
          </ActionButton>
        </div>
        
        {/* Metrics Cards - Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Totals Card */}
          <div className="bg-slate-50 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Totals</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Total No. of Guest Check-Ins</p>
                <p className="text-2xl font-semibold text-slate-800">{totalCheckIns}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Total No. Guest Staying Overnight</p>
                <p className="text-2xl font-semibold text-slate-800">{totalOvernight}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Total No. of Occupied Rooms</p>
                <p className="text-2xl font-semibold text-slate-800">{totalOccupied}</p>
              </div>
            </div>
          </div>
          
          {/* Averages Card */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Averages</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-green-600">Ave. Guest-Nights</p>
                <p className="text-2xl font-semibold text-slate-800">{averageGuestNights}</p>
              </div>
              <div>
                <p className="text-sm text-green-600">Ave. Room Occupancy Rate</p>
                <p className="text-2xl font-semibold text-slate-800">{averageRoomOccupancyRate}%</p>
              </div>
              <div>
                <p className="text-sm text-green-600">Ave. Guests per Room</p>
                <p className="text-2xl font-semibold text-slate-800">{averageGuestsPerRoom}</p>
              </div>
            </div>
          </div>
          
          {/* Top Markets Ranking Card */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Guest Check-in Rankings by Nationality</h3>
            <button 
              onClick={() => setShowNationalityModal(true)}
              className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              View
            </button>
        </div>
        </div>
        
        {/* Daily Metrics Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Daily Metrics</h2>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-wrap gap-4 items-center mb-4">
              
              {/* Room Quick Search */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Room #"
                value={roomSearchTerm}
                onChange={(e) => setRoomSearchTerm(e.target.value)}
                onKeyPress={handleRoomSearchKeyPress}
                min="1"
                max={submission?.number_of_rooms || 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 w-20"
              />
              <button
                onClick={handleRoomSearch}
                className="px-3 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors text-sm font-medium"
              >
                Search Room
              </button>
              <button
                onClick={scrollToSummary}
                className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                View Summary
              </button>
            </div>
              
              <button
                onClick={resetFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                Clear Filters
              </button>

              {/* Pagination Controls */}
          <div className="flex justify-end items-center gap-2 p-4">
            <button
              disabled={roomPage === 1}
              onClick={() => setRoomPage(roomPage - 1)}
              className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Prev
            </button>
            <span>
              Page {roomPage} of {totalRoomPages}
            </span>
            <button
              disabled={roomPage === totalRoomPages}
              onClick={() => setRoomPage(roomPage + 1)}
              className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Next
            </button>
          </div>
            </div>
            
            {/* Results Summary */}
            <div className="text-sm text-gray-600 mb-4">
              Showing {filteredDays.length} of {daysInMonth} days
              {searchTerm || filterRoom || filterNationality ? (
                <span className="ml-2 text-cyan-600">
                  (filtered)
                </span>
              ) : null}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r sticky left-0 bg-gray-50 z-10"
                    style={{ minWidth: 80, maxWidth: 120 }}
                  >
                    Day
                  </th>
                  {visibleRooms.map((roomNum) => (
                    <th
                      key={roomNum}
                      id={`room-${roomNum}`}
                      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r ${
                        highlightedRoom === roomNum ? 'bg-yellow-100 border-yellow-400' : ''
                      }`}
                    >
                      Room {roomNum}
                    </th>
                  ))}
                  <th
                    id="summary-header"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Summary
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDays.map(({ day, dayGuests }) => {
                  // Group guests by room
                  const guestsByRoom = {};
                  for (let roomNum = startRoom; roomNum <= endRoom; roomNum++) {
                    guestsByRoom[roomNum] = dayGuests.filter(g => g.room_number === roomNum);
                  }
                  
                  // Calculate summary
                  const totalCheckIns = dayGuests.filter(g => g.isCheckIn).length;
                  const totalOvernight = dayGuests.length;
                  const totalOccupied = Object.values(guestsByRoom).filter(guests => guests.length > 0).length;
                  
                  return (
                    <tr key={day} className="hover:bg-gray-50">
                      <td
                        className="px-4 py-4 whitespace-nowrap font-medium text-gray-900 border-r sticky left-0 bg-white z-10"
                        style={{ minWidth: 80, maxWidth: 120 }}
                      >
                        {day}
                      </td>
                      {visibleRooms.map((roomNum) => {
                        const roomGuests = guestsByRoom[roomNum] || [];
                        return (
                          <td
                            key={roomNum}
                            id={`room-${roomNum}-day-${day}`}
                            className={`px-4 py-4 border-r ${
                              highlightedRoom === roomNum ? 'bg-yellow-50 border-yellow-300' : ''
                            }`}
                          >
                            {roomGuests.length > 0 ? (
                              <div className="space-y-1">
                                {roomGuests.map((guest, guestIndex) => (
                                  <div key={guestIndex} className="text-xs text-gray-600 p-1 bg-gray-50 rounded">
                                    <div className="font-medium">
                                      {guest.isCheckIn ? '✓' : '●'} {guest.gender}, {guest.age}
                                    </div>
                                    <div className="text-gray-500">
                                      {guest.status}, {guest.nationality}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">Empty</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-4">
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Check-ins:</span>
                            <span className="font-medium">{totalCheckIns}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Overnight:</span>
                            <span className="font-medium">{totalOvernight}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Occupied:</span>
                            <span className="font-medium">{totalOccupied}</span>
                          </div>
                        </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
        </div>
        {/* Nationality Modal */}
        <Modal show={showNationalityModal} onHide={() => setShowNationalityModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Guest Nationalities (Check-in Data)</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ListGroup>
              {sortedNationalities.map((nationality) => (
                <ListGroup.Item key={nationality} className="d-flex justify-content-between align-items-center">
                  <span>{nationality}</span>
                  <span className="badge bg-primary rounded-pill">{nationalityCounts[nationality]}</span>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Modal.Body>
          <Modal.Footer>
            <ActionButton onClick={() => setShowNationalityModal(false)} variant="secondary">
              Close
            </ActionButton>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default SubmissionDetails;
