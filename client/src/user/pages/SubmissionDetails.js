import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx"; // For Excel file generation
import { saveAs } from "file-saver"; // For file download
import { Modal, Button, ListGroup } from "react-bootstrap";

const SubmissionDetails = () => {
  const { submissionId } = useParams();
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
        console.log("Submission details response:", response.data); // Debugging
        setSubmission(response.data);
      } catch (err) {
        console.error("Error fetching submission details:", err);
        setError("Failed to fetch submission details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionDetails();
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
    <div className="container mt-5">
      <h2>Submission Details</h2>
      <p>
        <strong>Month:</strong>{" "}
        {new Date(0, submission.month - 1).toLocaleString("default", {
          month: "long",
        })}
      </p>
      <p>
        <strong>Year:</strong> {submission.year}
      </p>
      <p>
        <strong>Submitted At:</strong>{" "}
        {new Date(submission.submitted_at).toLocaleString()}
      </p>

      <button
        className="btn btn-success mb-4"
        onClick={() => exportToExcel(submission)}
      >
        Export to Excel
      </button>

      {/* Nationality Count Button */}
      <button
        className="btn btn-info mb-4"
        onClick={() => setShowNationalityModal(true)}
      >
        View Nationality Counts
      </button>

      {/* Export Nationality Counts Button */}
      <button
        className="btn btn-warning mb-4 ms-2"
        onClick={exportNationalityCountsToExcel}
      >
        Export Nationality Counts to Excel
      </button>

      {/* Nationality Count Modal */}
      <Modal
        show={showNationalityModal}
        onHide={() => setShowNationalityModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Nationality Counts (Check-ins Only)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {sortedNationalities.map((nationality) => (
              <ListGroup.Item key={nationality}>
                {nationality}: {nationalityCounts[nationality]}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowNationalityModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Totals Section */}
      <div className="mt-4">
        <h3>Totals</h3>
        <div className="row">
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Total Check-Ins</h5>
                <p className="card-text">{totalCheckIns}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Total Overnight</h5>
                <p className="card-text">{totalOvernight}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Total Occupied</h5>
                <p className="card-text">{totalOccupied}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Averages Section */}
      <div className="mt-4">
        <h3>Averages</h3>
        <div className="row">
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Average Guest-Nights</h5>
                <p className="card-text">{averageGuestNights}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Average Room Occupancy Rate</h5>
                <p className="card-text">{averageRoomOccupancyRate}%</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Average Guests per Room</h5>
                <p className="card-text">{averageGuestsPerRoom}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Metrics Table */}
      <h3 className="mt-4">Daily Metrics</h3>
      {submission.days.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Day</th>
                <th>Check Ins</th>
                <th>Overnight</th>
                <th>Occupied</th>
                <th>Guests</th>                         
              </tr>
            </thead>
            <tbody>
              {submission.days.map((day) => (
                <tr key={day.day}>
                  <td>{day.day}</td>
                  <td>{day.check_ins || 0}</td>
                  <td>{day.overnight || 0}</td>
                  <td>{day.occupied || 0}</td>
                  <td>
                    <ul>
                      {day.guests && day.guests.map((guest, index) => (
                        <li key={index}>
                          Room {guest.room_number}, {guest.gender}, {guest.age}, {guest.status}, {guest.nationality}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No data available for this submission.</p>
      )}

      {/* Back Button */}
      <button className="btn btn-secondary mt-4" onClick={() => navigate(-1)}>
        Back to History
      </button>
    </div>
  );
};

export default SubmissionDetails;