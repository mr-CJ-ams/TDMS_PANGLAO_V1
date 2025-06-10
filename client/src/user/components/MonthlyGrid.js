import React from "react";
import { Hotel } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

const MonthlyGrid = ({
  daysInMonth,
  numberOfRooms,
  onCellClick,
  getRoomColor,
  calculateDailyTotals,
  disabled,
}) => {
  const rooms = Array.from({ length: numberOfRooms }, (_, i) => i + 1);

  return (
    <div className="table-responsive" style={{ overflowX: "auto" }}>
      <table
        className="table text-center"
        style={{
          minWidth: 900,
          borderCollapse: "separate",
          borderSpacing: "0 8px",
          backgroundColor: "#f0f8ff",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                position: "sticky",
                left: 0,
                zIndex: 2,
                backgroundColor: "#06b6d4",
                color: "#fff",
                fontWeight: "bold",
                padding: 12,
                borderRadius: "12px 0 0 12px",
              }}
            >
              Day
            </th>
            {rooms.map((room) => (
              <th
                key={room}
                data-room={room}
                style={{
                  backgroundColor: "#06b6d4",
                  color: "#fff",
                  fontWeight: "bold",
                  padding: 12,
                }}
              >
                Room {room}
              </th>
            ))}
            {["Check In", "Overnight", "Occupied"].map((label, i) => (
              <th
                key={label}
                style={{
                  backgroundColor: "#06b6d4",
                  color: "#fff",
                  fontWeight: "bold",
                  padding: 12,
                  borderRadius: i === 2 ? "0 12px 12px 0" : undefined,
                }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const totals = calculateDailyTotals(day);
            return (
              <tr key={day}>
                <td
                  style={{
                    position: "sticky",
                    left: 0,
                    zIndex: 1,
                    backgroundColor: "#fffaf0",
                    fontWeight: "bold",
                    padding: 12,
                    borderRadius: "12px 0 0 12px",
                  }}
                >
                  {day}
                </td>
                {rooms.map((room) => (
                  <td key={`${day}-${room}`}>
                    <button
                      onClick={() => !disabled && onCellClick(day, room)}
                      className="btn w-100 d-flex align-items-center justify-content-center gap-2 px-2 py-1 border-0"
                      style={{
                        backgroundColor: getRoomColor(day, room),
                        borderRadius: 12,
                        fontSize: 14,
                        color: "#333",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        cursor: disabled ? "not-allowed" : "pointer",
                        opacity: disabled ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!disabled) {
                          e.currentTarget.style.transform = "scale(1.05)";
                          e.currentTarget.style.boxShadow = "0 6px 8px rgba(0,0,0,0.15)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!disabled) {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                        }
                      }}
                      disabled={disabled}
                    >
                      <Hotel size={16} />Room {room}
                    </button>
                  </td>
                ))}
                {[totals.checkIns, totals.overnight, totals.occupied].map((val, i) => (
                  <td
                    key={i}
                    style={{
                      backgroundColor: "#fffaf0",
                      fontWeight: "bold",
                      padding: 12,
                      borderRadius: i === 2 ? "0 12px 12px 0" : undefined,
                    }}
                  >
                    <strong>{val}</strong>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlyGrid;