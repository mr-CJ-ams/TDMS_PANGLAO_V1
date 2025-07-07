import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Modal, ListGroup } from "react-bootstrap";
import { FileSpreadsheet, Users } from "lucide-react";
import { MetricsCard } from "../components/MetricsCard";
import { ActionButton } from "../components/ActionButton";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const SubmissionDetails = ({ submissionId }) => {
  const [submission, setSubmission] = useState({ days: [] }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(null),
    [showNationalityModal, setShowNationalityModal] = useState(false);

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
    () => Object.keys(nationalityCounts).sort((a, b) => a.localeCompare(b)),
    [nationalityCounts]
  );

  const exportToExcel = () => {
    const data = [
      ["Day", "Check Ins", "Overnight", "Occupied", "Room Number", "Gender", "Age", "Status", "Nationality"],
      ...submission.days.flatMap((day) =>
        day.guests?.length
          ? day.guests.map((guest) => [
              day.day,
              day.check_ins || 0,
              day.overnight || 0,
              day.occupied || 0,
              guest.room_number,
              guest.gender,
              guest.age,
              guest.status,
              guest.nationality,
            ])
          : [[day.day, day.check_ins || 0, day.overnight || 0, day.occupied || 0, "", "", "", "", ""]]
      ),
    ];
    const ws = XLSX.utils.aoa_to_sheet(data),
      wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Submission Details");
    saveAs(
      new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }),
      `Submission_Details_${submission.month}_${submission.year}.xlsx`
    );
  };

  const exportNationalityCountsToExcel = () => {
    const data = [["Nationality", "Count"], ...sortedNationalities.map((n) => [n, nationalityCounts[n]])],
      ws = XLSX.utils.aoa_to_sheet(data),
      wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Nationality Counts");
    saveAs(
      new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }),
      `Nationality_Counts_Submission_${submissionId}.xlsx`
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
          <ActionButton onClick={exportToExcel}>
            <FileSpreadsheet className="w-4 h-4 inline mr-2" />
            Export to Excel
          </ActionButton>
          <ActionButton onClick={() => setShowNationalityModal(true)} variant="outline">
            <Users className="w-4 h-4 inline mr-2" />
            Top Markets Ranking
          </ActionButton>
          <ActionButton onClick={exportNationalityCountsToExcel}>
            <FileSpreadsheet className="w-4 h-4 inline mr-2" />
            Export Top Markets Ranking
          </ActionButton>
        </div>
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <MetricsCard title="Total No. of Guest Check-Ins" value={totalCheckIns} />
          <MetricsCard title="Total Rooms" value={submission.number_of_rooms} />
          <MetricsCard title="Total No. of Guest Staying Overnight" value={totalOvernight} />
          <MetricsCard title="Total No. of Rooms Occupied" value={totalOccupied} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <MetricsCard title="Ave. Guest-Nights" value={averageGuestNights} />
          <MetricsCard title="Ave. Room Occupancy Rate" value={`${averageRoomOccupancyRate}%`} />
          <MetricsCard title="Ave. Guests per Room" value={averageGuestsPerRoom} />
        </div>
        {/* Daily Metrics Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <h2 className="text-xl font-semibold p-6 border-b">Daily Metrics</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Day", "Check Ins", "Overnight", "Occupied", "Guests"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
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
                      {day.guests?.length > 0 ? (
                        <ul className="list-none space-y-1">
                          {day.guests.map((guest, i) => (
                            <li key={i} className="text-sm text-gray-600 whitespace-nowrap">
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
