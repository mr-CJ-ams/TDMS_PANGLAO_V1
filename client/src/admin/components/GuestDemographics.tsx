/**
 * GuestDemographics.tsx
 * 
 * Panglao Tourist Data Management System - Guest Demographics Component (Frontend)
 * 
 * =========================
 * Overview:
 * =========================
 * This React component displays and exports guest demographics for Panglao tourism statistics.
 * It summarizes guest check-in data by gender, age group, and marital status, and provides both detailed and summary tables.
 * Users can export the demographics data as a multi-sheet Excel report for analytics and official reporting.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Receives guest demographics data for a selected year and month.
 * - Calculates totals for each demographic category (gender, age group, marital status).
 * - Renders summary and detailed tables of guest demographics.
 * - Provides an export button to download the data as a multi-sheet Excel file.
 * - Formats tables and export sheets for clarity and official use.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Uses XLSX and file-saver libraries to export multi-sheet Excel reports.
 * - Responsive and accessible UI with styled tables and export button.
 * - Modular logic for calculating totals and formatting data.
 * - Integrates with Lucide icons for improved UX.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Used in admin and user dashboards to review and export guest demographics for monthly accommodation submissions.
 * - Allows users and admins to generate official reports for record-keeping or government submission.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - The guestDemographics prop should be an array of demographic objects for the selected year and month.
 * - Extend this component to support additional demographic categories or export formats as needed.
 * - Update table columns or export logic if reporting requirements change.
 * 
 * =========================
 * Related Files:
 * =========================
 * - src/admin/pages/MainDashboard.tsx        (renders GuestDemographics)
 * - src/user/components/UserGuestDemographics.jsx (user version)
 * - server/controllers/adminController.js    (handles backend demographics logic)
 * - server/routes/admin.js                   (defines backend endpoints)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import React from "react";
import { Download } from "lucide-react";

interface GuestDemographic {
  gender: string;
  age_group: string;
  status: string;
  count: number | string;
}

interface GuestDemographicsProps {
  guestDemographics: GuestDemographic[];
  selectedYear: number;
  selectedMonth: number;
  formatMonth: (month: number) => string;
}

interface Totals {
  Male: number;
  Female: number;
  Minors: number;
  Adults: number;
  Married: number;
  Single: number;
}

interface SummaryTableRow {
  Category: string;
  Total: number;
}

const GuestDemographics: React.FC<GuestDemographicsProps> = ({
  guestDemographics,
  selectedYear,
  selectedMonth,
  formatMonth
}) => {
  const calculateTotals = (): Totals => {
    const totals: Totals = { 
      Male: 0, 
      Female: 0, 
      Minors: 0, 
      Adults: 0, 
      Married: 0, 
      Single: 0 
    };
    
    guestDemographics.forEach(({ gender, age_group, status, count }) => {
      const c = typeof count === 'string' ? parseInt(count) || 0 : count;
      if (gender === "Male") totals.Male += c;
      if (gender === "Female") totals.Female += c;
      if (age_group === "Minors") totals.Minors += c;
      if (age_group === "Adults") totals.Adults += c;
      if (status === "Married") totals.Married += c;
      if (status === "Single") totals.Single += c;
    });
    return totals;
  };

  const exportGuestDemographics = () => {
    const detailedData = guestDemographics.map(d => [
      d.gender, 
      d.age_group, 
      d.status, 
      typeof d.count === 'string' ? parseInt(d.count) || 0 : d.count
    ]);
    
    const totals = calculateTotals();
    const summaryData = [
      ["Male", totals.Male], 
      ["Female", totals.Female], 
      ["Minors", totals.Minors],
      ["Adults", totals.Adults], 
      ["Married", totals.Married], 
      ["Single", totals.Single]
    ];

    const detailedSheet = XLSX.utils.aoa_to_sheet([
      ["Panglao Report of Guest Demographics", "", "", ""],
      ["Year", selectedYear, "", ""],
      ["Month", formatMonth(selectedMonth), "", ""],
      ["Gender", "AgeGroup", "Status", "Count"],
      ...detailedData
    ]);
    detailedSheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];
    detailedSheet["!cols"] = Array(4).fill({ wch: 15 });

    const summarySheet = XLSX.utils.aoa_to_sheet([
      ["Panglao Report of Guest Demographics", "", "", ""],
      ["Year", selectedYear, "", ""],
      ["Month", formatMonth(selectedMonth), "", ""],
      ["Category", "Total", "", ""],
      ...summaryData.map(([cat, total]) => [cat, total, "", ""])
    ]);
    summarySheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];
    summarySheet["!cols"] = Array(4).fill({ wch: 15 });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, detailedSheet, "Detailed Data");
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary Data");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }), 
      `Guest_Demographics_${selectedYear}_${selectedMonth}.xlsx`);
  };

  const totals = calculateTotals();
  const summaryTableData: SummaryTableRow[] = [
    { Category: "Male", Total: totals.Male },
    { Category: "Female", Total: totals.Female },
    { Category: "Minors", Total: totals.Minors },
    { Category: "Adults", Total: totals.Adults },
    { Category: "Married", Total: totals.Married },
    { Category: "Single", Total: totals.Single },
  ];

  return (
    <div style={{ padding: 20, backgroundColor: "#E0F7FA" }}>
      <h3 style={{ color: "#37474F", marginBottom: 20 }}>Guest Demographics of Guest Check-Ins</h3>
      <button
        style={{
          backgroundColor: "#00BCD4", 
          color: "#FFF", 
          border: "none",
          padding: "10px 20px", 
          borderRadius: 8, 
          cursor: "pointer", 
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px", // space between icon and text
        }}
        onClick={exportGuestDemographics}
      >
        <Download size={16}/>Guest Demographics
      </button>
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ color: "#00BCD4", marginBottom: 10 }}>Summary</h4>
        <div className="table-responsive">
          <table style={{
            width: "100%", 
            borderCollapse: "collapse", 
            backgroundColor: "#FFF",
            borderRadius: 12, 
            overflow: "hidden", 
            boxShadow: "0px 4px 12px rgba(0,0,0,0.1)"
          }}>
            <thead>
              <tr style={{ backgroundColor: "#00BCD4", color: "#FFF" }}>
                <th style={{ padding: 12, textAlign: "left" }}>Category</th>
                <th style={{ padding: 12, textAlign: "left" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {summaryTableData.map((row, i) => (
                <tr 
                  key={row.Category}
                  style={{
                    borderBottom: "1px solid #B0BEC5",
                    backgroundColor: i % 2 === 0 ? "#F5F5F5" : "#FFF"
                  }}
                >
                  <td style={{ padding: 12, color: "#37474F" }}>{row.Category}</td>
                  <td style={{ padding: 12, color: "#37474F" }}>{row.Total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="table-responsive">
        <table style={{
          width: "100%", 
          borderCollapse: "collapse", 
          backgroundColor: "#FFF",
          borderRadius: 12, 
          overflow: "hidden", 
          boxShadow: "0px 4px 12px rgba(0,0,0,0.1)"
        }}>
          <thead>
            <tr style={{ backgroundColor: "#00BCD4", color: "#FFF" }}>
              <th style={{ padding: 12, textAlign: "left" }}>Gender</th>
              <th style={{ padding: 12, textAlign: "left" }}>Age Group</th>
              <th style={{ padding: 12, textAlign: "left" }}>Status</th>
              <th style={{ padding: 12, textAlign: "left" }}>Count</th>
            </tr>
          </thead>
          <tbody>
            {guestDemographics.map((demo, i) => (
              <tr 
                key={`${demo.gender}-${demo.age_group}-${demo.status}-${i}`}
                style={{
                  borderBottom: "1px solid #B0BEC5",
                  backgroundColor: i % 2 === 0 ? "#F5F5F5" : "#FFF"
                }}
              >
                <td style={{ padding: 12, color: "#37474F" }}>{demo.gender}</td>
                <td style={{ padding: 12, color: "#37474F" }}>{demo.age_group}</td>
                <td style={{ padding: 12, color: "#37474F" }}>{demo.status}</td>
                <td style={{ padding: 12, color: "#37474F" }}>
                  {typeof demo.count === 'string' ? parseInt(demo.count) || 0 : demo.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GuestDemographics;