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
    <div>
      <h3>Monthly Metrics</h3>
      <button className="btn btn-success mb-3" onClick={exportMonthlyMetrics}>
        Export Monthly Metrics to Excel
      </button>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Month</th>
              <th>Total Check-Ins</th>
              <th>Total Overnight</th>
              <th>Total Occupied</th>
              <th>Average Guest-Nights</th>
              <th>Average Room Occupancy Rate</th>
              <th>Average Guests per Room</th>
              <th>Total Submissions</th>
              <th>Submission Rate</th>
            </tr>
          </thead>
          <tbody>
            {monthlyMetrics.map((metrics) => (
              <tr key={metrics.month}>
                <td>{formatMonth(metrics.month)}</td>
                <td>{toNumber(metrics.total_check_ins)}</td>
                <td>{toNumber(metrics.total_overnight)}</td>
                <td>{toNumber(metrics.total_occupied)}</td>
                <td>{toNumber(metrics.average_guest_nights).toFixed(2)}</td>
                <td>{toNumber(metrics.average_room_occupancy_rate).toFixed(2)}%</td>
                <td>{toNumber(metrics.average_guests_per_room).toFixed(2)}</td>
                <td>{toNumber(metrics.total_submissions)}</td>
                <td>{toNumber(metrics.submission_rate).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyMetrics;