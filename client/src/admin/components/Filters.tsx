import React from "react";

interface FiltersProps {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  formatMonth: (month: number) => string;
  showMonth?: boolean; // <-- added optional flag
}

const Filters: React.FC<FiltersProps> = ({
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  formatMonth,
  showMonth = true // default true to preserve behavior
}) => {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => (currentYear-3) + i);

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
      padding: 20, 
      backgroundColor: "#E0F7FA", 
      borderRadius: 12, 
      boxShadow: "0px 4px 12px rgba(0,0,0,0.1)" 
    }}>
      <div style={{ marginBottom: 20 }}>
        <label 
          htmlFor="yearFilter" 
          style={{ 
            display: "block", 
            color: "#37474F", 
            fontWeight: "bold", 
            marginBottom: 8 
          }}
        >
          Select Year:
        </label>
        <select
          id="yearFilter"
          style={selectStyle}
          value={selectedYear}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
            setSelectedYear(parseInt(e.target.value))
          }
        >
          {yearOptions.map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Only render the month selector if showMonth is true */}
      {showMonth && (
        <div style={{ marginBottom: 20 }}>
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
      )}
    </div>
  );
};

export default Filters;
