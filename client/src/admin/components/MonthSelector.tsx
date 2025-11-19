import React from "react";

interface MonthSelectorProps {
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  formatMonth: (month: number) => string;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ selectedMonth, setSelectedMonth, formatMonth }) => {
  const selectStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #B0BEC5",
    backgroundColor: "#FFFFFF",
    color: "#37474F",
    fontSize: "14px",
    cursor: "pointer",
  };

  return (
    <div style={{
      padding: 10,
      backgroundColor: "#E0F7FA",
      borderRadius: 12,
      boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
      marginTop: 12,     // <-- added spacing from the component above (MonthlyMetrics)
    }}>
      <label
        htmlFor="monthFilter"
        style={{
          display: "block",
          color: "#37474F",
          fontWeight: "bold",
          marginBottom: 8
        }}
      >
        Select Month:
      </label>
      <select
        id="monthFilter"
        style={selectStyle}
        value={selectedMonth}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          setSelectedMonth(parseInt(e.target.value))
        }
      >
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            {formatMonth(i + 1)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MonthSelector;