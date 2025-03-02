import React from "react";
import { Hotel } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

const MonthlyGrid = ({
  daysInMonth,
  numberOfRooms,
  onCellClick,
  isRoomOccupied,
  getRoomColor,
  calculateDailyTotals,
}) => {
  const rooms = Array.from({ length: numberOfRooms }, (_, i) => i + 1);

  return (
    <div className="table-responsive" style={{ overflowX: "auto" }}>
      <table
        className="table text-center"
        style={{
          minWidth: "900px",
          borderCollapse: "separate",
          borderSpacing: "0 8px",
          backgroundColor: "#f0f8ff", // Light ocean blue background
        }}
      >
        <thead>
        <tr>
          <th
            style={{
              position: "sticky",
              left: 0,
              zIndex: 2,
              backgroundColor: "#06b6d4", // cyan-500
              color: "white",
              fontWeight: "bold",
              padding: "12px",
              borderRadius: "12px 0 0 12px",
            }}
          >
            Day
          </th>
          {rooms.map((room) => (
            <th
              key={room}
              style={{
                backgroundColor: "#06b6d4", // cyan-500
                color: "white",
                fontWeight: "bold",
                padding: "12px",
              }}
            >
              Room {room}
            </th>
          ))}
          <th
            style={{
              backgroundColor: "#06b6d4", // cyan-500
              color: "white",
              fontWeight: "bold",
              padding: "12px",
            }}
          >
            Check In
          </th>
          <th
            style={{
              backgroundColor: "#06b6d4", // cyan-500
              color: "white",
              fontWeight: "bold",
              padding: "12px",
            }}
          >
            Overnight
          </th>
          <th
            style={{
              backgroundColor: "#06b6d4", // cyan-500
              color: "white",
              fontWeight: "bold",
              padding: "12px",
              borderRadius: "0 12px 12px 0",
            }}
          >
            Occupied
          </th>
        </tr>
        </thead>
        <tbody>
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day, index) => {
            const totals = calculateDailyTotals(day);
            return (
              <tr key={day}>
                <td
                  style={{
                    position: "sticky",
                    left: 0,
                    zIndex: 1,
                    backgroundColor: "#fffaf0", // Sandy beige
                    fontWeight: "bold",
                    padding: "12px",
                    borderRadius: "12px 0 0 12px",
                  }}
                >
                  {day}
                </td>
                {rooms.map((room) => (
                  <td key={`${day}-${room}`}>
                    <button
                      onClick={() => onCellClick(day, room)}
                      className="btn w-100 d-flex align-items-center justify-content-center gap-2 px-2 py-1 border-0"
                      style={{
                        backgroundColor: getRoomColor(day, room),
                        borderRadius: "12px",
                        fontSize: "14px",
                        color: "#333",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                        e.currentTarget.style.boxShadow = "0 6px 8px rgba(0, 0, 0, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
                      }}
                    >
                      <Hotel size={16} />
                      Room {room}
                    </button>
                  </td>
                ))}
                <td
                  style={{
                    backgroundColor: "#fffaf0", // Sandy beige
                    fontWeight: "bold",
                    padding: "12px",
                  }}
                >
                  <strong>{totals.checkIns}</strong>
                </td>
                <td
                  style={{
                    backgroundColor: "#fffaf0", // Sandy beige
                    fontWeight: "bold",
                    padding: "12px",
                  }}
                >
                  <strong>{totals.overnight}</strong>
                </td>
                <td
                  style={{
                    backgroundColor: "#fffaf0", // Sandy beige
                    fontWeight: "bold",
                    padding: "12px",
                    borderRadius: "0 12px 12px 0",
                  }}
                >
                  <strong>{totals.occupied}</strong>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlyGrid;