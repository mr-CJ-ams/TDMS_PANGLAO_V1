import { useState } from "react";

// Add type annotations for props
interface RoomSearchBarProps {
  onSearch: (roomNumber: number) => void;
  disabled?: boolean;
}

const RoomSearchBar = ({ onSearch, disabled = false }: RoomSearchBarProps) => {
  const [roomNumber, setRoomNumber] = useState<string>("");

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const num = parseInt(roomNumber, 10);
    if (num > 0) onSearch(num);
    else alert("Please enter a valid positive room number.");
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
          onChange={(e) =>
            /^\d*$/.test(e.target.value) && setRoomNumber(e.target.value)
          }
          disabled={disabled}
          style={{
            border: "1px solid #52B3D0", // cyan-400 border
            borderRadius: "8px 0 0 8px",
          }}
        />
        <button
          type="submit"
          className="btn"
          disabled={disabled}
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