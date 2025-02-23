import React from "react";

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
      <table className="table table-bordered">
        <thead>
          <tr>
            <th style={{ position: "sticky", left: 0, zIndex: 1, backgroundColor: "white" }}>
              Day
            </th>
            {rooms.map((room) => (
              <th key={room}>Room {room}</th>
            ))}
            <th>Check In</th>
            <th>Overnight</th>
            <th>Occupied</th>
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
                    backgroundColor: "white",
                  }}
                >
                  {day}
                </td>
                {rooms.map((room) => (
                  <td key={`${day}-${room}`}>
                    <button
                      onClick={() => onCellClick(day, room)}
                      className="btn btn-light w-100"
                      style={{ backgroundColor: getRoomColor(day, room) }}
                    >
                      Room {room}
                    </button>
                  </td>
                ))}
                <td>{totals.checkIns}</td>
                <td>{totals.overnight}</td>
                <td>{totals.occupied}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlyGrid;