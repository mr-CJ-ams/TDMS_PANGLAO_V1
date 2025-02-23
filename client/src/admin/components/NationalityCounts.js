// client/src/components/NationalityCounts.js
import React from "react";

const NationalityCounts = ({ data, year, month, onExport }) => {
  return (
    <div>
      <h3>Nationality Counts (Check-Ins Only) - {new Date(0, month - 1).toLocaleString("default", { month: "long" })} {year}</h3>
      <button className="btn btn-success mb-3" onClick={onExport}>
        Export Nationality Counts to Excel
      </button>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Nationality</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {data.map((nationality) => (
              <tr key={nationality.nationality}>
                <td>{nationality.nationality}</td>
                <td>{nationality.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NationalityCounts;