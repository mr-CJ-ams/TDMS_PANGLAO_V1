// src/admin/components/NationalityCounts.js
import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const NationalityCounts = ({ nationalityCounts, selectedYear, selectedMonth, formatMonth }) => {
  const exportNationalityCounts = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      nationalityCounts.map((nationality) => ({
        Nationality: nationality.nationality,
        Count: nationality.count,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Nationality Counts");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Nationality_Counts_${selectedYear}_${formatMonth(selectedMonth)}.xlsx`);
  };

  return (
    <div>
      {/* <h3>Nationality Counts (Check-Ins Only)</h3>
      <button className="btn btn-success mb-3" onClick={exportNationalityCounts}>
        Export Nationality Counts to Excel
      </button> */}
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Nationality</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {nationalityCounts.map((nationality) => (
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