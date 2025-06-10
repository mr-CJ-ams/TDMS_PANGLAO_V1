import React from "react";

const Filters = ({ selectedYear, setSelectedYear, selectedMonth, setSelectedMonth, formatMonth }) => {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear + i);

  return (
    <div style={{ padding: "20px", backgroundColor: "#E0F7FA", borderRadius: "12px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}>
      <div style={{ marginBottom: "20px" }}>
        <label
          htmlFor="yearFilter"
          style={{ display: "block", color: "#37474F", fontWeight: "bold", marginBottom: "8px" }}
        >
          Select Year:
        </label>
        <select
          id="yearFilter"
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #B0BEC5",
            backgroundColor: "#FFFFFF",
            color: "#37474F",
            fontSize: "14px",
            cursor: "pointer",
          }}
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: "20px" }}>
        <label
          htmlFor="monthFilter"
          style={{ display: "block", color: "#37474F", fontWeight: "bold", marginBottom: "8px" }}
        >
          Select Month:
        </label>
        <select
          id="monthFilter"
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #B0BEC5",
            backgroundColor: "#FFFFFF",
            color: "#37474F",
            fontSize: "14px",
            cursor: "pointer",
          }}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {formatMonth(i + 1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Filters;