// FILE: client\src\user\components\RoomSearchBar.tsx

import { useState } from "react";

// Update props interface to accept room names
interface RoomSearchBarProps {
  onSearch: (searchValue: string | number) => void;
  disabled?: boolean;
  roomNames?: string[]; // Add room names for search suggestions
}

const RoomSearchBar = ({ onSearch, disabled = false, roomNames = [] }: RoomSearchBarProps) => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!searchValue.trim()) {
      alert("Please enter a room number or room name.");
      return;
    }

    // Check if search value is a number (room number)
    const num = parseInt(searchValue, 10);
    if (num > 0) {
      onSearch(num);
      return;
    }

    // Check if search value matches a room name
    const matchedRoom = roomNames.findIndex(name => 
      name.toLowerCase().includes(searchValue.toLowerCase())
    );
    
    if (matchedRoom !== -1) {
      // Room names are 0-indexed, but rooms are 1-indexed
      onSearch(matchedRoom + 1);
      return;
    }

    alert("No matching room found. Please enter a valid room number or room name.");
  };

  // Filter suggestions based on input
  const filteredSuggestions = roomNames.filter(name =>
    name.toLowerCase().includes(searchValue.toLowerCase())
  ).slice(0, 5); // Limit to 5 suggestions

  const handleSuggestionClick = (roomName: string, index: number) => {
    setSearchValue(roomName);
    setShowSuggestions(false);
    onSearch(index + 1); // Room numbers are 1-indexed
  };

  return (
    <form onSubmit={handleSearch} className="mb-4" style={{ position: 'relative' }}>
      <label>Search Room</label>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Enter Room Name"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          disabled={disabled}
          style={{
            border: "1px solid #52B3D0",
            borderRadius: "8px 0 0 8px",
          }}
        />
        <button
          type="submit"
          className="btn"
          disabled={disabled}
          style={{
            backgroundColor: "#22d3ee",
            color: "white",
            border: "1px solid #52B3D0",
            borderRadius: "0 8px 8px 0",
            fontWeight: "bold",
          }}
        >
          Search
        </button>
      </div>
      
      {/* Search Suggestions Dropdown */}
      {showSuggestions && searchValue && filteredSuggestions.length > 0 && (
        <div 
          className="border rounded shadow-sm bg-white"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto'
          }}
        >
          {filteredSuggestions.map((name, index) => (
            <div
              key={index}
              className="p-2 border-bottom cursor-pointer hover-bg-light"
              style={{ cursor: 'pointer' }}
              onMouseDown={() => handleSuggestionClick(name, roomNames.indexOf(name))}
            >
              <div className="fw-bold">{name}</div>
              <small className="text-muted">Room {roomNames.indexOf(name) + 1}</small>
            </div>
          ))}
        </div>
      )}
    </form>
  );
};

export default RoomSearchBar;