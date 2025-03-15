// src/admin/components/MonthlyMetrics.js
import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const MonthlyMetrics = ({ monthlyMetrics, selectedYear, formatMonth, toNumber }) => {
  const exportMonthlyMetrics = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      monthlyMetrics.map((metrics) => ({
        Month: formatMonth(metrics.month),
        "Total Check-Ins": toNumber(metrics.total_check_ins),
        "Total Overnight": toNumber(metrics.total_overnight),
        "Total Occupied": toNumber(metrics.total_occupied),
        "Average Guest-Nights": toNumber(metrics.average_guest_nights).toFixed(2),
        "Average Room Occupancy Rate": `${toNumber(metrics.average_room_occupancy_rate).toFixed(2)}%`,
        "Average Guests per Room": toNumber(metrics.average_guests_per_room).toFixed(2),
        "Total Rooms": toNumber(metrics.total_rooms), // Add this line
        "Total Submissions": toNumber(metrics.total_submissions),
        "Submission Rate": `${toNumber(metrics.submission_rate).toFixed(2)}%`,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Metrics");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Monthly_Metrics_${selectedYear}.xlsx`);
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#E0F7FA"}}>
      <h3 style={{ color: "#37474F", marginBottom: "20px" }}>Monthly Metrics</h3>
      <button
        style={{
          backgroundColor: "#00BCD4",
          color: "#FFFFFF",
          border: "none",
          padding: "10px 20px",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
        onClick={exportMonthlyMetrics}
      >
        Export Monthly Metrics to Excel
      </button>
      <div className="table-responsive">
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#00BCD4", color: "#FFFFFF" }}>
              <th style={{ padding: "12px", textAlign: "left" }}>Month</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Total Check-Ins</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Total Overnight</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Total Occupied</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Average Guest-Nights</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Average Room Occupancy Rate</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Average Guests per Room</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Total Rooms</th> {/* Add this line */}
              <th style={{ padding: "12px", textAlign: "left" }}>Total Submissions</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Submission Rate</th>
              
            </tr>
          </thead>
          <tbody>
            {monthlyMetrics.map((metrics) => (
              <tr
                key={metrics.month}
                style={{
                  borderBottom: "1px solid #B0BEC5",
                  backgroundColor: metrics.month % 2 === 0 ? "#F5F5F5" : "#FFFFFF",
                }}
              >
                <td style={{ padding: "12px", color: "#37474F" }}>{formatMonth(metrics.month)}</td>
                <td style={{ padding: "12px", color: "#37474F" }}>{toNumber(metrics.total_check_ins)}</td>
                <td style={{ padding: "12px", color: "#37474F" }}>{toNumber(metrics.total_overnight)}</td>
                <td style={{ padding: "12px", color: "#37474F" }}>{toNumber(metrics.total_occupied)}</td>
                <td style={{ padding: "12px", color: "#37474F" }}>{toNumber(metrics.average_guest_nights).toFixed(2)}</td>
                <td style={{ padding: "12px", color: "#37474F" }}>
                  {toNumber(metrics.average_room_occupancy_rate).toFixed(2)}%
                </td>
                <td style={{ padding: "12px", color: "#37474F" }}>
                  {toNumber(metrics.average_guests_per_room).toFixed(2)}
                </td>
                <td style={{ padding: "12px", color: "#37474F" }}>{toNumber(metrics.total_rooms)}</td> {/* Add this line */}
                <td style={{ padding: "12px", color: "#37474F" }}>{toNumber(metrics.total_submissions)}</td>
                <td style={{ padding: "12px", color: "#37474F" }}>
                  {toNumber(metrics.submission_rate).toFixed(2)}%
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyMetrics;