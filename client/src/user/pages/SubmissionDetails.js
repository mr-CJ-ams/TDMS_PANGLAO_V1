import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Modal, ListGroup } from "react-bootstrap";
import { FileSpreadsheet, Users, ArrowLeft } from "lucide-react";
import { MetricsCard } from "../components/MetricsCard";
import { ActionButton } from "../components/ActionButton";
const SubmissionDetails = ({ submissionId }) => {
  const [submission, setSubmission] = useState({ days: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNationalityModal, setShowNationalityModal] = useState(false); // State for modal
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  // Function to calculate metrics and totals
  const calculateMetrics = (submission) => {
    if (!submission || !submission.days) {
      return {
        totalCheckIns: 0,
        totalOvernight: 0,
        totalOccupied: 0,
        averageGuestNights: 0,
        averageRoomOccupancyRate: 0,
        averageGuestsPerRoom: 0,
      };
    }

    const { days } = submission;
    const numberOfRooms = submission.number_of_rooms || 1; // Fallback to 1 if not provided

    // Calculate totals
    const totalCheckIns = days.reduce((acc, day) => acc + (day.check_ins || 0), 0);
    const totalOvernight = days.reduce((acc, day) => acc + (day.overnight || 0), 0);
    const totalOccupied = days.reduce((acc, day) => acc + (day.occupied || 0), 0);

    // Calculate averages 
    const averageGuestNights = totalCheckIns > 0 ? (totalOvernight / totalCheckIns).toFixed(2) : 0;
    const averageRoomOccupancyRate =
      numberOfRooms > 0 ? ((totalOccupied / (numberOfRooms * days.length)) * 100).toFixed(2) : 0;
    const averageGuestsPerRoom = totalOccupied > 0 ? (totalOvernight / totalOccupied).toFixed(2) : 0;

    return {
      totalCheckIns,
      totalOvernight,
      totalOccupied,
      averageGuestNights,
      averageRoomOccupancyRate,
      averageGuestsPerRoom,
    };
  };

  // Fetch submission details
  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(
          `${API_BASE_URL}/api/submissions/details/${submissionId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubmission(response.data);
      } catch (err) {
        console.error("Error fetching submission details:", err);
        setError("Failed to fetch submission details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      fetchSubmissionDetails();
    }
  }, [submissionId]);

  // Calculate nationality counts
  const calculateNationalityCounts = (submission) => {
    if (!submission || !submission.days) {
      return {};
    }

    const nationalityCounts = {};

    // Loop through each day and guest to count nationalities for check-ins only
    submission.days.forEach((day) => {
      if (day.guests && day.guests.length > 0) {
        day.guests.forEach((guest) => {
          if (guest.isCheckIn) {
            const nationality = guest.nationality;
            nationalityCounts[nationality] = (nationalityCounts[nationality] || 0) + 1;
          }
        });
      }
    });

    console.log("Nationality Counts:", nationalityCounts); // Debugging
    return nationalityCounts;
  };

  // Sort nationalities alphabetically
  const getSortedNationalities = (nationalityCounts) => {
    return Object.keys(nationalityCounts).sort((a, b) => a.localeCompare(b));
  };

  // Calculate nationality counts
  const nationalityCounts = calculateNationalityCounts(submission);
  console.log("Nationality Counts:", nationalityCounts); // Debugging

  // Sort nationalities alphabetically
  const sortedNationalities = getSortedNationalities(nationalityCounts);
  console.log("Sorted Nationalities:", sortedNationalities); // Debugging

  // Loading state
  if (loading) {
    return <p>Loading submission details...</p>;
  }

  // Error state
  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  // No data state
  if (!submission || !submission.days) {
    return <p>No submission details found.</p>;
  }

  // Calculate metrics and totals
  const {
    totalCheckIns,
    totalOvernight,
    totalOccupied,
    averageGuestNights,
    averageRoomOccupancyRate,
    averageGuestsPerRoom,
  } = calculateMetrics(submission);

  // Export submission details to Excel
  const exportToExcel = (submission) => {
    // Prepare data for the Excel sheet
    const data = [];

    // Add headers
    data.push([
      "Day",
      "Check Ins",
      "Overnight",
      "Occupied",
      "Room Number",
      "Gender",
      "Age",
      "Status",
      "Nationality",
    ]);

    // Add rows for each day
    submission.days.forEach((day) => {
      if (day.guests && day.guests.length > 0) {
        day.guests.forEach((guest) => {
          data.push([
            day.day,
            day.check_ins || 0,
            day.overnight || 0,
            day.occupied || 0,
            guest.room_number,
            guest.gender,
            guest.age,
            guest.status,
            guest.nationality,
          ]);
        });
      } else {
        data.push([day.day, day.check_ins || 0, day.overnight || 0, day.occupied || 0, "", "", "", "", ""]);
      }
    });

    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Submission Details");

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    // Download the file
    saveAs(blob, `Submission_Details_${submission.month}_${submission.year}.xlsx`);
  };

  // Export nationality counts to Excel
  const exportNationalityCountsToExcel = () => {
    // Prepare data for Excel
    const data = [["Nationality", "Count"]];
    sortedNationalities.forEach((nationality) => {
      data.push([nationality, nationalityCounts[nationality]]);
    });

    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Nationality Counts");

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    // Download the file
    saveAs(blob, `Nationality_Counts_Submission_${submissionId}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Submission Details</h1>
          <div className="mt-2 text-gray-600">
            <p className="mb-1">
              <span className="font-medium">Month:</span>{" "}
              {new Date(0, submission.month - 1).toLocaleString("default", { month: "long" })}
            </p>
            <p className="mb-1">
              <span className="font-medium">Year:</span> {submission.year}
            </p>
            <p>
              <span className="font-medium">Submitted:</span>{" "}
              {new Date(submission.submitted_at).toLocaleString()}
            </p>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <ActionButton onClick={() => exportToExcel(submission)}>
            <FileSpreadsheet className="w-4 h-4 inline mr-2" />
            Export to Excel
          </ActionButton>
          <ActionButton onClick={() => setShowNationalityModal(true)} variant="outline">
            <Users className="w-4 h-4 inline mr-2" />
            View Nationality Counts
          </ActionButton>
          <ActionButton onClick={exportNationalityCountsToExcel}>
            <FileSpreadsheet className="w-4 h-4 inline mr-2" />
            Export Nationality Counts
          </ActionButton>
        </div>
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <MetricsCard title="Total Check-Ins" value={totalCheckIns} />
          <MetricsCard title="Total Rooms" value={submission.number_of_rooms} />
          <MetricsCard title="Total Overnight" value={totalOvernight} />
          <MetricsCard title="Total Occupied" value={totalOccupied} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <MetricsCard title="Average Guest-Nights" value={`${averageGuestNights}`} />
          <MetricsCard title="Room Occupancy Rate" value={`${averageRoomOccupancyRate}%`} />
          <MetricsCard title="Guests per Room" value={averageGuestsPerRoom} />
        </div>
        {/* Daily Metrics Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <h2 className="text-xl font-semibold p-6 border-b">Daily Metrics</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Ins</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overnight</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupied</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submission.days.map((day) => (
                  <tr key={day.day} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{day.day}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{day.check_ins || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{day.overnight || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{day.occupied || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {day.guests && day.guests.length > 0 ? (
                        <ul className="list-none space-y-1">
                          {day.guests.map((guest, index) => (
                            <li key={index} className="text-sm text-gray-600 whitespace-nowrap">
                              Room {guest.room_number}, {guest.gender}, {guest.age}, {guest.status}, {guest.nationality}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400">No guests</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Nationality Modal */}
        <Modal show={showNationalityModal} onHide={() => setShowNationalityModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Nationality Counts (Check-ins Only)</Modal.Title>
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
