// src/admin/components/Filters.js
import React from "react";

const Filters = ({ selectedYear, setSelectedYear, selectedMonth, setSelectedMonth, formatMonth }) => {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear + i);

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="yearFilter">Select Year:</label>
        <select
          id="yearFilter"
          className="form-control"
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
      <div className="mb-4">
        <label htmlFor="monthFilter">Select Month:</label>
        <select
          id="monthFilter"
          className="form-control"
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