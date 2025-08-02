
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import processNationalityCounts from "../utils/processNationalityCounts";
import axios from "axios";
import React from "react";
import regions from "../utils/regions";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const RegionalDistribution = ({ nationalityCounts, selectedYear, selectedMonth, formatMonth, user }) => {
  const [establishmentData, setEstablishmentData] = React.useState([]);

  React.useEffect(() => {
    async function fetchEstablishmentData() {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/admin/nationality-counts-by-establishment`, {
          params: { year: selectedYear, month: selectedMonth },
          headers: { Authorization: `Bearer ${token}` },
        });
        setEstablishmentData(res.data);
      } catch (err) {
        setEstablishmentData([]);
      }
    }
    fetchEstablishmentData();
  }, [selectedYear, selectedMonth]);

  const processedData = processNationalityCounts(nationalityCounts);

  // Function to convert month number to month name
  const getMonthName = (monthNumber) => {
    const date = new Date(selectedYear, monthNumber - 1, 1); // Month is 0-indexed in JavaScript
    return date.toLocaleString("default", { month: "long" }); // Get full month name
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new(); // <-- Move this to the top!
    const worksheetData = [];

    // Add headers
    worksheetData.push(["REGIONAL DISTRIBUTION OF TRAVELLERS"]);
    worksheetData.push(["Year =", selectedYear]);
    worksheetData.push(["Month =", getMonthName(selectedMonth)]); // Add month name
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
    worksheetData.push(["GRAND TOTAL GUEST ARRIVALS =", processedData.PHILIPPINE_RESIDENTS + processedData.NON_PHILIPPINE_RESIDENTS + processedData.OVERSEAS_FILIPINOS]);
    worksheetData.push(["   Total Philippine Residents =", processedData.PHILIPPINE_RESIDENTS]);
    worksheetData.push(["   Total Non-Philippine Residents =", processedData.NON_PHILIPPINE_RESIDENTS]);
    worksheetData.push(["   Total Overseas Filipinos =", processedData.OVERSEAS_FILIPINOS || 0]);

    // --- New Sheet: Per-Establishment Nationality Counts ---
    if (establishmentData.length > 0) {
      const allEstablishments = Array.from(new Set(establishmentData.map(e => e.establishment))).sort((a, b) => a.localeCompare(b)).slice(0, 10);
      // Build a lookup: {establishment: {nationality: count}}
      const lookup = {};
      establishmentData.forEach(({ establishment, nationality, count }) => {
        if (!lookup[establishment]) lookup[establishment] = {};
        lookup[establishment][nationality] = count;
      });
      // Helper to sum for each establishment
      const sumForEst = (est, nats) => nats.reduce((sum, nat) => sum + Number(lookup[est]?.[nat] || 0), 0);
      const sheetData = [];
      // Header rows
      sheetData.push(["REGIONAL DISTRIBUTION OF TRAVELLERS", ...Array(10).fill("")]);
      sheetData.push(["Year =", selectedYear, ...Array(9).fill("")]);
      sheetData.push(["Month =", formatMonth(selectedMonth), ...Array(9).fill("")]);
      sheetData.push(["(PANGLAO REPORT)", ...allEstablishments]);
      sheetData.push([]);
      // Country of Residence
      sheetData.push(["COUNTRY OF RESIDENCE", ...Array(10).fill("")]);
      // Add Philippine and Non-Philippine Residents
      sheetData.push([
        "TOTAL PHILIPPINE RESIDENTS =",
        ...allEstablishments.map(est => sumForEst(est, ["Philippines"]))
      ]);
      sheetData.push([
        "NON-PHILIPPINE RESIDENTS =",
        ...allEstablishments.map(est => {
          // All except "Philippines" and "Overseas Filipino"
          const allNats = Object.keys(lookup[est] || {});
          return allNats.reduce((sum, nat) =>
            nat !== "Philippines" && nat !== "Overseas Filipino" ? sum + Number(lookup[est][nat] || 0) : sum, 0);
        })
      ]);
      sheetData.push([]);
      // Regions and subregions
      const addRegion = (regionList, label) => {
        sheetData.push([label, ...Array(10).fill("")]);
        regionList.forEach(nat => {
          const row = ["   " + nat + " ="];
          allEstablishments.forEach(est => {
            row.push(Number(lookup[est]?.[nat] || 0));
          });
          sheetData.push(row);
        });
        sheetData.push([]);
      };
      // ASIA
      addRegion(regions.ASIA.ASEAN, "ASIA - ASEAN");
      addRegion(regions.ASIA.EAST_ASIA, "ASIA - EAST ASIA");
      addRegion(regions.ASIA.SOUTH_ASIA, "ASIA - SOUTH ASIA");
      // MIDDLE EAST
      addRegion(regions.MIDDLE_EAST, "MIDDLE EAST");
      // AMERICA
      addRegion(regions.AMERICA.NORTH_AMERICA, "AMERICA - NORTH AMERICA");
      addRegion(regions.AMERICA.SOUTH_AMERICA, "AMERICA - SOUTH AMERICA");
      // EUROPE
      addRegion(regions.EUROPE.WESTERN_EUROPE, "EUROPE - WESTERN EUROPE");
      addRegion(regions.EUROPE.NORTHERN_EUROPE, "EUROPE - NORTHERN EUROPE");
      addRegion(regions.EUROPE.SOUTHERN_EUROPE, "EUROPE - SOUTHERN EUROPE");
      addRegion(regions.EUROPE.EASTERN_EUROPE, "EUROPE - EASTERN EUROPE");
      // AUSTRALASIA/PACIFIC
      addRegion(regions.AUSTRALASIA_PACIFIC, "AUSTRALASIA/PACIFIC");
      // AFRICA
      addRegion(regions.AFRICA, "AFRICA");
      // OTHERS
      addRegion(regions.OTHERS, "OTHERS AND UNSPECIFIED RESIDENCES");
      // Add totals
      sheetData.push([
        "TOTAL NON-PHILIPPINE RESIDENTS =",
        ...allEstablishments.map(est => {
          // All except "Philippines" and "Overseas Filipino"
          const allNats = Object.keys(lookup[est] || {});
          return allNats.reduce((sum, nat) =>
            nat !== "Philippines" && nat !== "Overseas Filipino" ? sum + Number(lookup[est][nat] || 0) : sum, 0);
        })
      ]);
      sheetData.push([]);
      sheetData.push([
        "GRAND TOTAL GUEST ARRIVALS =",
        ...allEstablishments.map(est => {
          const phil = sumForEst(est, ["Philippines"]);
          const nonPhil = Object.keys(lookup[est] || {}).reduce((sum, nat) =>
            nat !== "Philippines" && nat !== "Overseas Filipino" ? sum + Number(lookup[est][nat] || 0) : sum, 0);
          const ofw = sumForEst(est, ["Overseas Filipino"]);
          return phil + nonPhil + ofw;
        })
      ]);
      sheetData.push([
        "   Total Philippine Residents =",
        ...allEstablishments.map(est => sumForEst(est, ["Philippines"]))
      ]);
      sheetData.push([
        "   Total Non-Philippine Residents =",
        ...allEstablishments.map(est => {
          const allNats = Object.keys(lookup[est] || {});
          return allNats.reduce((sum, nat) =>
            nat !== "Philippines" && nat !== "Overseas Filipino" ? sum + Number(lookup[est][nat] || 0) : sum, 0);
        })
      ]);
      sheetData.push([
        "   Total Overseas Filipinos =",
        ...allEstablishments.map(est => sumForEst(est, ["Overseas Filipino"]))
      ]);
      // 5. Create and append the new sheet
      const estSheet = XLSX.utils.aoa_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(workbook, estSheet, "By Establishment");
    }

    // Create worksheet and append as first sheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Regional Distribution");

    // Merge cells for "REGIONAL DISTRIBUTION OF TRAVELLERS"
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }, // Merge A1 to B1
    ];

    // Auto-fit columns
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxWidth = 0;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: R, c: C })];
        if (cell && cell.v) {
          const cellWidth = cell.v.toString().length;
          if (cellWidth > maxWidth) {
            maxWidth = cellWidth;
          }
        }
      }
      worksheet["!cols"] = worksheet["!cols"] || [];
      worksheet["!cols"][C] = { wch: maxWidth + 2 }; // Add padding
    }

    // Export to Excel
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Regional_Distribution_${selectedYear}_${formatMonth(selectedMonth)}.xlsx`);
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#E0F7FA" }}>
      <h3 style={{ color: "#37474F", marginBottom: "20px" }}> Top Markets Ranking </h3>
      {user?.role === "admin" && (
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
          Export DAE-form 2
        </button>
      )}
      {/* <pre>{JSON.stringify(processedData, null, 2)}</pre> For debugging */}
    </div>
  );
};

export default RegionalDistribution;