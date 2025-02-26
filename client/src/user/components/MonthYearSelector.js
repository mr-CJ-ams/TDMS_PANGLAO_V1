import React from "react";

const MonthYearSelector = ({ selectedMonth, selectedYear, onMonthChange, onYearChange }) => {
  return (
    <div className="mt-4">
      <div className="row">
        <div className="col-md-6">
          <label>Month</label>
          <select
            className="form-control"
            value={selectedMonth}
            onChange={onMonthChange}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {new Date(selectedYear, month - 1).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label>Year</label>
          <select
            className="form-control"
            value={selectedYear}
            onChange={onYearChange}
          >
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default MonthYearSelector;