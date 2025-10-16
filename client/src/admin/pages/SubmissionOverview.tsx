/**
 * SubmissionOverview.tsx
 * 
 * Panglao Tourist Data Management System - Admin Submission Overview Page (Frontend)
 * 
 * =========================
 * Overview:
 * =========================
 * This React component provides administrators with a comprehensive overview and management interface for all monthly accommodation submissions in the Panglao TDMS system.
 * It supports filtering, searching, paginating, viewing details, handling penalties, and exporting submission data to Excel.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Fetches paginated and filtered submissions from the backend API for admin review.
 * - Renders a responsive table listing all submissions with key metrics, status, penalty information, and actions.
 * - Provides filters for month, year, status, penalty status, and company name search.
 * - Allows admins to view detailed submission data in a modal, including daily metrics and guest details.
 * - Handles penalty payment workflow, including access code verification and receipt number entry.
 * - Supports quick room search and paginated room display for submissions with many rooms.
 * - Exports submission details, daily metrics, and nationality counts to a multi-sheet Excel report.
 * - Integrates with modals for viewing nationality counts and confirming access code for penalties.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Uses axios for API communication and sessionStorage for authentication.
 * - Responsive table layout with color-coded status and penalty indicators.
 * - Advanced modal for viewing and exporting detailed submission data.
 * - Room quick search and pagination for efficient navigation in large submissions.
 * - XLSX and file-saver integration for exporting multi-sheet Excel reports.
 * - Modular design with helper functions for metrics calculation and data formatting.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Used by administrators in the admin dashboard to review, manage, and export monthly accommodation submissions.
 * - Allows admins to track submission status, handle penalties, and access detailed records for analytics and reporting.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - The backend endpoint for fetching submissions is GET /admin/submissions with filters and pagination.
 * - The backend endpoint for updating penalty status is PUT /api/submissions/penalty/:submissionId.
 * - Update this component if table columns, metrics, penalty logic, or export requirements change.
 * - Extend modal logic or table rendering for new analytics or reporting features.
 * 
 * =========================
 * Related Files:
 * =========================
 * - src/admin/pages/AdminDashboard.tsx         (renders SubmissionOverview)
 * - src/admin/pages/NationalityCountsModal.tsx (modal for nationality breakdown)
 * - src/admin/components/AccessCodePrompt.tsx  (access code confirmation modal)
 * - server/controllers/adminController.js      (handles backend submission logic)
 * - server/routes/admin.js                     (defines backend endpoints)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

import React, { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import NationalityCountsModal from "./NationalityCountsModal";
import AccessCodePrompt from "../components/AccessCodePrompt";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Define types for the submission data
interface Guest {
  room_number: number;
  isCheckIn: boolean;
  gender: string;
  age: string;
  status: string;
  nationality: string;
}

interface DayData {
  day: number;
  guests: Guest[];
}

interface Submission {
  submission_id: string;
  user_id: string;
  company_name: string;
  month: number;
  year: number;
  submitted_at: string;
  penalty?: boolean;
  receipt_number?: string;
  accommodation_type?: string;
  number_of_rooms: number;
  days: DayData[];
  nationalityCounts?: Record<string, number>;
}

interface Metrics {
  totalCheckIns: number;
  totalOvernight: number;
  totalOccupied: number;
  averageGuestNights: number;  // Changed from string to number
  averageRoomOccupancyRate: number;  // Changed from string to number
  averageGuestsPerRoom: number;  // Changed from string to number
}

interface SubmissionOverviewProps {
  submissions: Submission[];
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
  getMonthName: (m: number) => string;
  isSubmissionLate: (submission: Submission) => boolean;
  fetchSubmissionDetails: (submissionId: string) => void;
  handlePenaltyPayment: (submissionId: string, penaltyStatus: boolean) => void;
  selectedSubmission: Submission | null;
  showSubmissionModal: boolean;
  setShowSubmissionModal: (show: boolean) => void;
  calculateMetrics: (submission: Submission) => Metrics;
  activeSection: string;
}

interface Filters {
  month: string;
  year: string;
  status: string;
  penaltyStatus: string;
  search: string;
}

const SubmissionOverview: React.FC<SubmissionOverviewProps> = ({
  submissions,
  setSubmissions,
  getMonthName,
  isSubmissionLate,
  fetchSubmissionDetails,
  selectedSubmission,
  showSubmissionModal,
  setShowSubmissionModal,
  calculateMetrics,
  activeSection,
}) => {
  const [filters, setFilters] = useState<Filters>({ 
    month: "", 
    year: "", 
    status: "", 
    penaltyStatus: "", 
    search: "" 
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;
  const [showNationalityCountsModal, setShowNationalityCountsModal] = useState(false);
  const [loadingPenalty, setLoadingPenalty] = useState<Record<string, boolean>>({});
  const [showAccessCodePrompt, setShowAccessCodePrompt] = useState(false);
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | null>(null);
  const [roomSearchTerm, setRoomSearchTerm] = useState("");
  const [highlightedRoom, setHighlightedRoom] = useState<number | null>(null);
  const [receiptNumbers, setReceiptNumbers] = useState<Record<string, string>>({});
  const [invalidAccessCodeModal, setInvalidAccessCodeModal] = useState(false);
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Pagination states for rooms
  const [roomPage, setRoomPage] = useState(1);
  const roomsPerPage = 20;

  useEffect(() => {
    if (activeSection !== "submission-overview") return;
    
    const fetchSubmissions = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE_URL}/admin/submissions`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { ...filters, page, limit },
        });
        setSubmissions(data.submissions); 
        setTotal(data.total);
      } catch (err) { 
        console.error("Error fetching submissions:", err); 
      }
    };
    
    fetchSubmissions();
  }, [filters, page, activeSection, API_BASE_URL, setSubmissions]);

  useEffect(() => {
    if (showSubmissionModal) {
      setRoomPage(1);
      setHighlightedRoom(null);
    }
  }, [showSubmissionModal]);

  // Calculate pagination for rooms
  const totalRoomPages = selectedSubmission
    ? Math.ceil((selectedSubmission.number_of_rooms || 1) / roomsPerPage)
    : 1;
  const startRoom = (roomPage - 1) * roomsPerPage + 1;
  const endRoom = Math.min(
    startRoom + roomsPerPage - 1,
    selectedSubmission?.number_of_rooms || 1
  );
  const visibleRooms = Array.from(
    { length: endRoom - startRoom + 1 },
    (_, i) => startRoom + i
  );

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { 
    setFilters(f => ({ ...f, [e.target.name]: e.target.value })); 
    setPage(1); 
  };

  const handlePenaltyPayment = (submissionId: string) => {
    setCurrentSubmissionId(submissionId);
    setShowAccessCodePrompt(true);
  };

  const confirmPenaltyPayment = async (accessCode: string, receiptNumber: string) => {
    if (!currentSubmissionId) return;

    setShowAccessCodePrompt(false);
    setLoadingPenalty(p => ({ ...p, [currentSubmissionId]: true }));

    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/api/submissions/penalty/${currentSubmissionId}`,
        { penalty: true, receipt_number: receiptNumber, access_code: accessCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmissions(submissions.map(s =>
        s.submission_id === currentSubmissionId
          ? { ...s, penalty: true, receipt_number: receiptNumber }
          : s
      ));
      setReceiptNumbers(rn => ({
        ...rn,
        [currentSubmissionId]: receiptNumber
      }));
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setInvalidAccessCodeModal(true);
      } else {
        console.error("Error updating penalty status:", err);
      }
    } finally {
      setLoadingPenalty(p => ({ ...p, [currentSubmissionId]: false }));
    }
  };

  const handleRoomSearch = () => {
    if (!selectedSubmission) return;
    
    const roomNumber = parseInt(roomSearchTerm);
    if (roomNumber && roomNumber >= 1 && roomNumber <= selectedSubmission.number_of_rooms) {
      setHighlightedRoom(roomNumber);

      // Calculate which page the room is on
      const targetPage = Math.ceil(roomNumber / roomsPerPage);
      setRoomPage(targetPage);

      // Wait for page update, then scroll to the room column
      setTimeout(() => {
        const roomElement = document.getElementById(`admin-room-${roomNumber}`);
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
      }, 200);
    } else {
      setHighlightedRoom(null);
    }
  };

  const handleRoomSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRoomSearch();
    }
  };

  const resetRoomSearch = () => {
    setRoomSearchTerm("");
    setHighlightedRoom(null);
  };

  const exportDailyMetricsToExcel = () => {
    if (!selectedSubmission) return;
    
    const getDaysInMonth = (month: number, year: number) => {
      return new Date(year, month, 0).getDate();
    };
    const daysInMonth = getDaysInMonth(selectedSubmission.month, selectedSubmission.year);
    
    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Submission Details
    const submissionDetailsData = [
      ["SUBMISSION DETAILS"],
      [""], // Empty row for spacing
      ["Month", getMonthName(selectedSubmission.month)],
      ["Year", selectedSubmission.year],
      ["Company Name", selectedSubmission.company_name || "N/A"],
      ["Accommodation Type", selectedSubmission.accommodation_type || "N/A"],
      ["Submitted At", new Date(selectedSubmission.submitted_at).toLocaleString()],
      ["Total Rooms", selectedSubmission.number_of_rooms],
      [""], // Empty row for spacing
      ["TOTALS"],
      ["Total No. of Guest Check-Ins", calculateMetrics(selectedSubmission).totalCheckIns],
      ["Total No. Guest Staying Overnight", calculateMetrics(selectedSubmission).totalOvernight],
      ["Total No. of Occupied Rooms", calculateMetrics(selectedSubmission).totalOccupied],
      [""], // Empty row for spacing
      ["AVERAGES"],
      ["Ave. Guest-Nights", calculateMetrics(selectedSubmission).averageGuestNights],
      ["Ave. Room Occupancy Rate", `${calculateMetrics(selectedSubmission).averageRoomOccupancyRate}%`],
      ["Ave. Guests per Room", calculateMetrics(selectedSubmission).averageGuestsPerRoom],
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
    for (let i = 1; i <= selectedSubmission.number_of_rooms; i++) {
      headers.push(`Room ${i}`);
    }
    headers.push("Check-ins", "Overnight", "Occupied");
    
    const data = [headers];
    
    // Add data for each day
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = selectedSubmission.days.find(d => d.day === day);
      const dayGuests = dayData?.guests || [];
      
      // Group guests by room
      const guestsByRoom: Record<number, Guest[]> = {};
      for (let roomNum = 1; roomNum <= selectedSubmission.number_of_rooms; roomNum++) {
        guestsByRoom[roomNum] = dayGuests.filter(g => g.room_number === roomNum);
      }
      
      // Calculate summary
      const totalCheckIns = dayGuests.filter(g => g.isCheckIn).length;
      const totalOvernight = dayGuests.length;
      const totalOccupied = Object.values(guestsByRoom).filter(guests => guests.length > 0).length;
      
      const row: (string | number)[] = [day];
      
      // Add room data
      for (let roomNum = 1; roomNum <= selectedSubmission.number_of_rooms; roomNum++) {
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
      
      data.push(row.map(String));
    }
    
    const dailyMetricsWs = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, dailyMetricsWs, "Daily Metrics");
    
    // Auto-size columns for daily metrics
    const colWidths = [8]; // Day column
    for (let i = 1; i <= selectedSubmission.number_of_rooms; i++) {
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
      for (let colIndex = 1; colIndex <= selectedSubmission.number_of_rooms; colIndex++) {
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
    const nationalityCounts: Record<string, number> = {};
    selectedSubmission.days?.forEach((day) =>
      day.guests?.forEach((g) => {
        if (g.isCheckIn) nationalityCounts[g.nationality] = (nationalityCounts[g.nationality] || 0) + 1;
      })
    );
    
    const nationalityData = [
      ["Year", "=", selectedSubmission.year],
      ["Month", "=", getMonthName(selectedSubmission.month)],
      ["(PANGLAO REPORT)", selectedSubmission.company_name || "Resort"],
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
      `${selectedSubmission.company_name || 'Resort'}_${getMonthName(selectedSubmission.month)}_${selectedSubmission.year}_Tourist_Arrival_Report.xlsx`
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white p-8">
      <h2 className="text-3xl font-semibold text-sky-900 mb-8">Submission Overview</h2>
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-sky-900">Month & Year</label>
            <div className="flex gap-2">
              <select name="month" value={filters.month} onChange={handleFilterChange}
                className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-500">
                <option value="">Select Month</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                ))}
              </select>
              <input type="text" name="year" placeholder="Year" value={filters.year} onChange={handleFilterChange}
                className="w-24 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-500" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-sky-900">Status Filters</label>
            <div className="flex gap-2">
              <select name="status" value={filters.status} onChange={handleFilterChange}
                className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-500">
                <option value="">Select Status</option>
                <option value="Late">Late</option>
                <option value="On-Time">On-Time</option>
              </select>
              <select name="penaltyStatus" value={filters.penaltyStatus} onChange={handleFilterChange}
                className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-500">
                <option value="">Select Penalty Status</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-sky-900">Search</label>
            <div className="relative">
              <input type="text" name="search" placeholder="Search by Company Name" value={filters.search} onChange={handleFilterChange}
                className="w-full pl-10 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-200 focus:border-sky-500" />
            </div>
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow-lg bg-white">
        <table className="w-full">
          <thead>
            <tr className="bg-sky-100 text-sky-900">
              {["Submission ID", "User ID", "Company Name", "Month", "Year", "Submitted At", "Status", "Penalty Status", "Receipt Number", "Actions"].map(h => (
                <th key={h} className="p-4 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-100">
            {submissions.map(submission => (
              <tr key={submission.submission_id} className="hover:bg-sky-50 transition-colors">
                <td className="p-4">{submission.submission_id}</td>
                <td className="p-4">{submission.user_id}</td>
                <td className="p-4 font-medium">{submission.company_name}</td>
                <td className="p-4">{getMonthName(submission.month)}</td>
                <td className="p-4">{submission.year}</td>
                <td className="p-4">{new Date(submission.submitted_at).toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${isSubmissionLate(submission) ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {isSubmissionLate(submission) ? "Late" : "On-Time"}
                  </span>
                </td>
                <td className="p-4">
                  {isSubmissionLate(submission) && (
                    <button
                      onClick={() => handlePenaltyPayment(submission.submission_id)}
                      disabled={submission.penalty || loadingPenalty[submission.submission_id]}
                      className={`px-4 py-2 rounded transition-colors ${submission.penalty ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}`}>
                      {submission.penalty ? "Paid" : "Unpaid"}
                    </button>
                  )}
                </td>
                <td className="p-4">
                  {submission.receipt_number || receiptNumbers[submission.submission_id] || "-"}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => fetchSubmissionDetails(submission.submission_id)}
                    className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center bg-white rounded-lg shadow p-4">
        <button onClick={() => setPage(page - 1)} disabled={page === 1}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <ChevronLeft size={20} />Previous
        </button>
        <span className="text-sky-900">Page {page} of {totalPages}</span>
        <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Next<ChevronRight size={20} />
        </button>
      </div>
      {/* Modal */}
      {selectedSubmission && showSubmissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-sky-900">Submission Details</h3>
                <button onClick={() => setShowSubmissionModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-8">
                <button
                  onClick={exportDailyMetricsToExcel}
                  className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-medium"
                >
                  Export Daily Metrics
                </button>
              </div>
              
              {/* Submission Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-50 rounded-xl shadow-sm p-6">
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Month</h3>
                  <p className="text-xl font-semibold text-slate-800">
                    {getMonthName(selectedSubmission.month)}
                  </p>
                </div>
                
                <div className="bg-slate-50 rounded-xl shadow-sm p-6">
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Year</h3>
                  <p className="text-xl font-semibold text-slate-800">{selectedSubmission.year}</p>
                </div>
                
                <div className="bg-slate-50 rounded-xl shadow-sm p-6">
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Submitted At</h3>
                  <p className="text-xl font-semibold text-slate-800">
                    {new Date(selectedSubmission.submitted_at).toLocaleString()}
                  </p>
                </div>
              </div>
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Totals */}
                <div className="bg-slate-50 rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Totals</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500">Total No. of Guest Check-Ins</p>
                      <p className="text-2xl font-semibold text-slate-800">{calculateMetrics(selectedSubmission).totalCheckIns}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Total No. Guest Staying Overnight</p>
                      <p className="text-2xl font-semibold text-slate-800">{calculateMetrics(selectedSubmission).totalOvernight}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Total No. of Occupied Rooms</p>
                      <p className="text-2xl font-semibold text-slate-800">{calculateMetrics(selectedSubmission).totalOccupied}</p>
                    </div>
                  </div>
                </div>
                {/* Averages */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Averages</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-green-600">Ave. Guest-Nights</p>
                      <p className="text-2xl font-semibold text-slate-800">{calculateMetrics(selectedSubmission).averageGuestNights}</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-600">Ave. Room Occupancy Rate</p>
                      <p className="text-2xl font-semibold text-slate-800">{calculateMetrics(selectedSubmission).averageRoomOccupancyRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-600">Ave. Guests per Room</p>
                      <p className="text-2xl font-semibold text-slate-800">{calculateMetrics(selectedSubmission).averageGuestsPerRoom}</p>
                    </div>
                  </div>
                </div>
                {/* Top Markets Ranking */}
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Top Markets Ranking</h3>
                  <button 
                    onClick={() => setShowNationalityCountsModal(true)}
                    className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                  >
                    View Nationality Counts
                  </button>
                </div>
              </div>
              {/* Daily Metrics Table */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xl font-semibold text-sky-900">Daily Metrics</h4>
                  
                  {/* Room Quick Search and Pagination Controls */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="number"
                      placeholder="Room #"
                      value={roomSearchTerm}
                      onChange={(e) => setRoomSearchTerm(e.target.value)}
                      onKeyPress={handleRoomSearchKeyPress}
                      min="1"
                      max={selectedSubmission?.number_of_rooms || 1}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 w-20"
                    />
                    <button
                      onClick={handleRoomSearch}
                      className="px-3 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors text-sm font-medium"
                    >
                      Go to Room
                    </button>
                    <button
                      onClick={resetRoomSearch}
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Clear
                    </button>
                    {/* Pagination Controls */}
                    <div className="flex items-center gap-2 ml-auto">
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
                </div>
                
                {selectedSubmission.days?.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-sky-50">
                          <th className="p-3 text-left text-sm font-medium text-sky-900 border-r sticky left-0 bg-sky-50 z-10" style={{ minWidth: 80, maxWidth: 120 }}>
                            Day
                          </th>
                          {visibleRooms.map((roomNum) => (
                            <th
                              key={roomNum}
                              id={`admin-room-${roomNum}`}
                              className={`p-3 text-left text-sm font-medium text-sky-900 border-r ${
                                highlightedRoom === roomNum ? "bg-yellow-100 border-yellow-400" : ""
                              }`}
                            >
                              Room {roomNum}
                            </th>
                          ))}
                          <th className="p-3 text-left text-sm font-medium text-sky-900">Summary</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(() => {
                          const getDaysInMonth = (month: number, year: number) => new Date(year, month, 0).getDate();
                          const daysInMonth = getDaysInMonth(selectedSubmission.month, selectedSubmission.year);

                          return Array.from({ length: daysInMonth }, (_, dayIndex) => {
                            const day = dayIndex + 1;
                            const dayData = selectedSubmission.days.find((d) => d.day === day);
                            const dayGuests = dayData?.guests || [];

                            // Group guests by room for visible rooms only
                            const guestsByRoom: Record<number, Guest[]> = {};
                            for (let roomNum = startRoom; roomNum <= endRoom; roomNum++) {
                              guestsByRoom[roomNum] = dayGuests.filter((g) => g.room_number === roomNum);
                            }

                            // Calculate summary
                            const totalCheckIns = dayGuests.filter((g) => g.isCheckIn).length;
                            const totalOvernight = dayGuests.length;
                            const totalOccupied = Object.values(guestsByRoom).filter((guests) => guests.length > 0).length;

                            return (
                              <tr key={day} className="hover:bg-sky-50">
                                <td className="p-3 font-medium text-sky-900 border-r sticky left-0 bg-white z-10" style={{ minWidth: 80, maxWidth: 120 }}>
                                  {day}
                                </td>
                                {visibleRooms.map((roomNum) => {
                                  const roomGuests = guestsByRoom[roomNum] || [];
                                  return (
                                    <td
                                      key={roomNum}
                                      id={`admin-room-${roomNum}-day-${day}`}
                                      className={`p-3 border-r ${
                                        highlightedRoom === roomNum ? "bg-yellow-50 border-yellow-300" : ""
                                      }`}
                                    >
                                      {roomGuests.length > 0 ? (
                                        <div className="space-y-1">
                                          {roomGuests.map((guest, guestIndex) => (
                                            <div key={guestIndex} className="text-xs text-gray-600 p-1 bg-gray-50 rounded">
                                              <div className="font-medium">
                                                {guest.isCheckIn ? "✓" : "●"} {guest.gender}, {guest.age}
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
                                <td className="p-3">
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
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No data available for this submission.</p>
                )}
              </div>
            </div>
          </div>
          <NationalityCountsModal
            show={showNationalityCountsModal}
            onHide={() => setShowNationalityCountsModal(false)}
            nationalityCounts={selectedSubmission?.nationalityCounts || {}}
          />
        </div>
      )}
      {/* Access Code Prompt Modal */}
      {showAccessCodePrompt && (
        <AccessCodePrompt
          onConfirm={confirmPenaltyPayment}
          onCancel={() => setShowAccessCodePrompt(false)}
        />
      )}
      {/* Invalid Access Code Modal */}
      {invalidAccessCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-semibold text-rose-700 mb-4">Invalid Access Code</h3>
            <p className="mb-6 text-gray-700">The access code you entered is incorrect. Please try again.</p>
            <div className="flex justify-end">
              <button
                onClick={() => setInvalidAccessCodeModal(false)}
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

export default SubmissionOverview;
