import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const [showNationalityModal, setShowNationalityModal] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  // ... (rest of your code remains the same until the return statement)

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
                    <td className="px-6 py-4">
                      {day.guests && day.guests.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                          {day.guests.map((guest, index) => (
                            <div key={index} className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                              <div><strong>Room:</strong> {guest.room_number}</div>
                              <div><strong>Gender:</strong> {guest.gender}</div>
                              <div><strong>Age:</strong> {guest.age}</div>
                              <div><strong>Status:</strong> {guest.status}</div>
                              <div><strong>Nationality:</strong> {guest.nationality}</div>
                            </div>
                          ))}
                        </div>
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
        {/* Back Button */}
        <ActionButton onClick={() => navigate(-1)} variant="secondary">
          <ArrowLeft className="w-4 h-4 inline mr-2" />
          Back to History
        </ActionButton>
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