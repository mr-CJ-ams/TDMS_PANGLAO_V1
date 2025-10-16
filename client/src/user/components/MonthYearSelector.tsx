import React from "react";

// Add type annotations for props
interface MonthYearSelectorProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onYearChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}

const MonthYearSelector = ({ selectedMonth, selectedYear, onMonthChange, onYearChange, disabled = false }: MonthYearSelectorProps) => {
  return (
    <div className="mt-4">
      <div className="row">
        <div className="col-md-6">
          <label>Month</label>
          <select
            className="form-control"
            value={selectedMonth}
            onChange={onMonthChange}
            disabled={disabled}
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
            disabled={disabled}
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
