// src/admin/components/GuestDemographics.js
import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const GuestDemographics = ({ guestDemographics, selectedYear, selectedMonth, formatMonth }) => {
  const exportGuestDemographics = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      guestDemographics.map((demo) => ({
        Gender: demo.gender,
        AgeGroup: demo.age_group,
        Status: demo.status,
        Count: demo.count,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guest Demographics");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Guest_Demographics_${selectedYear}_${selectedMonth}.xlsx`);
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#E0F7FA"}}>
      <h3 style={{ color: "#37474F", marginBottom: "20px" }}>Guest Demographics (Check-Ins Only)</h3>
      <button
        style={{
          backgroundColor: "#00BCD4",
          color: "#FFFFFF",
          border: "none",
          padding: "10px 20px",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
        onClick={exportGuestDemographics}
      >
        Export Guest Demographics to Excel
      </button>
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
              <th style={{ padding: "12px", textAlign: "left" }}>Gender</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Age Group</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Count</th>
            </tr>
          </thead>
          <tbody>
            {guestDemographics.map((demo, index) => (
              <tr
                key={index}
                style={{
                  borderBottom: "1px solid #B0BEC5",
                  backgroundColor: index % 2 === 0 ? "#F5F5F5" : "#FFFFFF",
                }}
              >
                <td style={{ padding: "12px", color: "#37474F" }}>{demo.gender}</td>
                <td style={{ padding: "12px", color: "#37474F" }}>{demo.age_group}</td>
                <td style={{ padding: "12px", color: "#37474F" }}>{demo.status}</td>
                <td style={{ padding: "12px", color: "#37474F" }}>{demo.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GuestDemographics;