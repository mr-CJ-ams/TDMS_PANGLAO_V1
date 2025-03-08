import React, { useState } from "react";

const RoomSearchBar = ({ onSearch }) => {
  const [roomNumber, setRoomNumber] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (roomNumber > 0) {
      onSearch(roomNumber);
    } else {
      alert("Please enter a valid positive room number.");
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Allow only positive integers
    if (/^\d*$/.test(value)) {
      setRoomNumber(value);
    }
  };

  return (
    <form onSubmit={handleSearch} className="mb-4">
        <label>Search Room</label>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Enter Room Number"
          value={roomNumber}
          onChange={handleInputChange}
          style={{
            border: "1px solid #52B3D0", // cyan-400 border
            borderRadius: "8px 0 0 8px",
          }}
        />
        <button
          type="submit"
          className="btn"
          style={{
            backgroundColor: "#22d3ee", // cyan-400 background
            color: "white",
            border: "1px solid #52B3D0",
            borderRadius: "0 8px 8px 0",
            fontWeight: "bold",
          }}
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default RoomSearchBar;