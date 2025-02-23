// client/src/components/MonthlyMetrics.js
import React from "react";
import { toNumber } from "../utils/helpers";

const MonthlyMetrics = ({ data, year, onExport }) => {
  return (
    <div>
      <h3>Monthly Metrics ({year})</h3>
      <button className="btn btn-success mb-3" onClick={onExport}>
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
            </tr>
          </thead>
          <tbody>
            {data.map((metrics, index) => {
              // Ensure safe values and prevent null-related errors
              const totalCheckIns = toNumber(metrics.total_check_ins) || 0;
              const totalOvernight = toNumber(metrics.total_overnight) || 0;
              const totalOccupied = toNumber(metrics.total_occupied) || 0;
              const averageGuestNights = toNumber(metrics.average_guest_nights) || 0;
              const averageRoomOccupancyRate = toNumber(metrics.average_room_occupancy_rate) || 0;
              const averageGuestsPerRoom = toNumber(metrics.average_guests_per_room) || 0;

              return (
                <tr key={index}>
                  <td>
                    {metrics.month
                      ? new Date(0, metrics.month - 1).toLocaleString("default", { month: "long" })
                      : "Unknown"}
                  </td>
                  <td>{totalCheckIns}</td>
                  <td>{totalOvernight}</td>
                  <td>{totalOccupied}</td>
                  <td>{averageGuestNights.toFixed(2)}</td>
                  <td>{averageRoomOccupancyRate.toFixed(2)}%</td>
                  <td>{averageGuestsPerRoom.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyMetrics;
