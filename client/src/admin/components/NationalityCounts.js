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
    <div style={{ padding: "20px", backgroundColor: "#E0F7FA"}}>
      
      <div className="table-responsive">
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#00BCD4", color: "#FFFFFF" }}>
              <th style={{ padding: "12px", textAlign: "left" }}>Nationality</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Count</th>
            </tr>
          </thead>
          <tbody>
            {nationalityCounts.map((nationality, index) => (
              <tr
                key={nationality.nationality}
                style={{
                  borderBottom: "1px solid #B0BEC5",
                  backgroundColor: index % 2 === 0 ? "#F5F5F5" : "#FFFFFF",
                }}
              >
                <td style={{ padding: "12px", color: "#37474F" }}>{nationality.nationality}</td>
                <td style={{ padding: "12px", color: "#37474F" }}>{nationality.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NationalityCounts;