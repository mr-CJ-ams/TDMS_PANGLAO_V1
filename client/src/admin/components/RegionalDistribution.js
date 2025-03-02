// src/admin/components/RegionalDistribution.js
import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import processNationalityCounts from "../utils/processNationalityCounts";

const RegionalDistribution = ({ nationalityCounts, selectedYear, selectedMonth, formatMonth }) => {
  const processedData = processNationalityCounts(nationalityCounts);

  const exportToExcel = () => {
    const worksheetData = [];

    // Add headers
    worksheetData.push(["REGIONAL DISTRIBUTION OF TRAVELLERS"]);
    worksheetData.push(["Year =", selectedYear]);
    worksheetData.push(["(PANGLAO REPORT)"]);
    worksheetData.push([]);

    // Add Philippine and Non-Philippine Residents
    worksheetData.push(["COUNTRY OF RESIDENCE"]);
    worksheetData.push(["TOTAL PHILIPPINE RESIDENTS =", processedData.PHILIPPINE_RESIDENTS]);
    worksheetData.push(["NON-PHILIPPINE RESIDENTS =", processedData.NON_PHILIPPINE_RESIDENTS]);
    worksheetData.push([]);

    // Add regions and sub-regions
    const addRegion = (region, label) => {
      worksheetData.push([label]);
      Object.entries(region).forEach(([country, count]) => {
        if (country !== "SUBTOTAL") {
          worksheetData.push([`   ${country} =`, count]);
        }
      });
      if (region.SUBTOTAL) {
        worksheetData.push(["                 SUB-TOTAL =", region.SUBTOTAL]);
      }
      worksheetData.push([]);
    };

    addRegion(processedData.ASIA.ASEAN, "ASIA - ASEAN");
    addRegion(processedData.ASIA.EAST_ASIA, "ASIA - EAST ASIA");
    addRegion(processedData.ASIA.SOUTH_ASIA, "ASIA - SOUTH ASIA");
    addRegion(processedData.MIDDLE_EAST, "MIDDLE EAST");
    addRegion(processedData.AMERICA.NORTH_AMERICA, "AMERICA - NORTH AMERICA");
    addRegion(processedData.AMERICA.SOUTH_AMERICA, "AMERICA - SOUTH AMERICA");
    addRegion(processedData.EUROPE.WESTERN_EUROPE, "EUROPE - WESTERN EUROPE");
    addRegion(processedData.EUROPE.NORTHERN_EUROPE, "EUROPE - NORTHERN EUROPE");
    addRegion(processedData.EUROPE.SOUTHERN_EUROPE, "EUROPE - SOUTHERN EUROPE");
    addRegion(processedData.EUROPE.EASTERN_EUROPE, "EUROPE - EASTERN EUROPE");
    addRegion(processedData.AUSTRALASIA_PACIFIC, "AUSTRALASIA/PACIFIC");
    addRegion(processedData.AFRICA, "AFRICA");
    addRegion(processedData.OTHERS, "OTHERS AND UNSPECIFIED RESIDENCES");

    // Add totals
    worksheetData.push(["TOTAL NON-PHILIPPINE RESIDENTS =", processedData.NON_PHILIPPINE_RESIDENTS]);
    worksheetData.push([]);
    worksheetData.push(["GRAND TOTAL GUEST ARRIVALS =", processedData.PHILIPPINE_RESIDENTS + processedData.NON_PHILIPPINE_RESIDENTS]);
    worksheetData.push(["   Total Philippine Residents =", processedData.PHILIPPINE_RESIDENTS]);
    worksheetData.push(["   Total Non-Philippine Residents =", processedData.NON_PHILIPPINE_RESIDENTS]);

    // Create worksheet and workbook
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Regional Distribution");

    // Export to Excel
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Regional_Distribution_${selectedYear}_${formatMonth(selectedMonth)}.xlsx`);
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#E0F7FA" }}>
      <h3 style={{ color: "#37474F", marginBottom: "20px" }}>Regional Distribution of Travellers</h3>
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
        onClick={exportToExcel}
      >
        Export Regional Distribution to Excel
      </button>
      {/* <pre>{JSON.stringify(processedData, null, 2)}</pre> For debugging */}
    </div>
  );
};

export default RegionalDistribution;