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
    <div>
      <h3>Guest Demographics (Check-Ins Only)</h3>
      <button className="btn btn-success mb-3" onClick={exportGuestDemographics}>
        Export Guest Demographics to Excel
      </button>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Gender</th>
              <th>Age Group</th>
              <th>Status</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {guestDemographics.map((demo, index) => (
              <tr key={index}>
                <td>{demo.gender}</td>
                <td>{demo.age_group}</td>
                <td>{demo.status}</td>
                <td>{demo.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GuestDemographics;