/**
 * RegionalDistribution.jsx
 * 
 * Panglao Tourist Data Management System - Regional Distribution Component (Frontend)
 * 
 * =========================
 * Overview:
 * =========================
 * This React component displays and exports the regional distribution of guest nationalities for Panglao tourism statistics.
 * It aggregates nationality counts by region and subregion, and provides an export feature to generate a multi-sheet Excel report for analytics and official reporting.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Fetches establishment-level nationality counts from the backend API for the selected year and month.
 * - Processes raw nationality counts into regional and subregional breakdowns using utility functions.
 * - Renders summary statistics for Philippine and Non-Philippine residents.
 * - Provides an export button (for admins) to download the regional distribution and per-establishment nationality counts as an Excel file.
 * - Formats and structures Excel sheets with region, subregion, and establishment data for reporting.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Uses axios for API communication and sessionStorage for authentication.
 * - Utilizes XLSX and file-saver libraries to export multi-sheet Excel reports.
 * - Modular logic for processing nationality counts and regional breakdowns.
 * - Responsive UI with styled export button and summary display.
 * - Supports both admin and user roles, with export functionality restricted to admins.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Used in the admin and user dashboards to review and export regional distribution statistics for Panglao tourism.
 * - Allows admins to generate official DAE-form 2 reports for analytics and government submission.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - The backend endpoint for establishment-level data is GET /admin/nationality-counts-by-establishment.
 * - Update regions and subregions in ../utils/regions.jsx as needed for new reporting requirements.
 * - Extend export logic to support additional sheets or custom formatting.
 * - Ensure processedData structure matches backend and reporting needs.
 * 
 * =========================
 * Related Files:
 * =========================
 * - src/admin/utils/processNationalityCounts.jsx   (processes raw nationality counts)
 * - src/admin/utils/regions.jsx                   (defines regions and subregions)
 * - server/controllers/adminController.js         (handles backend nationality logic)
 * - server/routes/admin.js                        (defines backend endpoints)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import processNationalityCounts from "../utils/processNationalityCounts";
import apiClient from "../../services/api";
import React from "react";
import regions from "../utils/regions";
import { Download } from "lucide-react";

const RegionalDistribution = ({ nationalityCounts, selectedYear, selectedMonth, formatMonth, user }) => {
  const [establishmentData, setEstablishmentData] = React.useState([]);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    async function fetchEstablishmentData() {
      setError(null);
      // Only admins should fetch per-establishment detailed data
      if (!user || user.role !== "admin") {
        // Clear any previous admin-only data and do not call admin endpoint
        if (mounted) setEstablishmentData([]);
        return;
      }

      try {
        const res = await apiClient.get("/api/admin/nationality-counts-by-establishment", {
          params: { year: selectedYear, month: selectedMonth },
          signal: controller.signal,
        });
        if (mounted) setEstablishmentData(res.data || []);
      } catch (err) {
        if (!mounted) return;
        if (err?.response?.status === 403) {
          setError("You don't have permission to view establishment-level data.");
          setEstablishmentData([]);
        } else if (err?.name === "CanceledError" || err?.message === "canceled") {
          // request cancelled
        } else {
          console.error("fetchEstablishmentData error:", err);
          setError("Failed to load establishment data.");
          setEstablishmentData([]);
        }
      }
    }

    fetchEstablishmentData();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [selectedYear, selectedMonth, user]);

  const processedData = processNationalityCounts(nationalityCounts);

  // Function to convert month number to month name
  const getMonthName = (monthNumber) => {
    const date = new Date(selectedYear, monthNumber - 1, 1); // Month is 0-indexed in JavaScript
    return date.toLocaleString("default", { month: "long" }); // Get full month name
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheetData = [];

    // Add headers
    worksheetData.push(["REGIONAL DISTRIBUTION OF TRAVELLERS"]);
    worksheetData.push(["Year =", selectedYear]);
    worksheetData.push(["Month =", getMonthName(selectedMonth)]);
    worksheetData.push(["(PANGLAO REPORT)"]);
    worksheetData.push([]);

    // Add Philippine and Non-Philippine Residents
    worksheetData.push(["COUNTRY OF RESIDENCE"]);
    worksheetData.push(["TOTAL PHILIPPINE RESIDENTS =", processedData.PHILIPPINE_RESIDENTS]);
    worksheetData.push(["NON-PHILIPPINE RESIDENTS =", processedData.NON_PHILIPPINE_RESIDENTS]);
    worksheetData.push([]);

    // Helper to add all countries in a region/subregion
    const addRegionAllCountries = (regionCountries, regionData, label) => {
      worksheetData.push([label]);
      regionCountries.forEach(country => {
        const count = regionData && Object.prototype.hasOwnProperty.call(regionData, country)
          ? regionData[country]
          : 0;
        worksheetData.push([`   ${country} =`, count]);
      });
      if (regionData && regionData.SUBTOTAL !== undefined) {
        worksheetData.push(["                 SUB-TOTAL =", regionData.SUBTOTAL]);
      }
      worksheetData.push([]);
    };

    // ASIA
    addRegionAllCountries(regions.ASIA.ASEAN, processedData.ASIA.ASEAN, "ASIA - ASEAN");
    addRegionAllCountries(regions.ASIA.EAST_ASIA, processedData.ASIA.EAST_ASIA, "ASIA - EAST ASIA");
    addRegionAllCountries(regions.ASIA.SOUTH_ASIA, processedData.ASIA.SOUTH_ASIA, "ASIA - SOUTH ASIA");
    // MIDDLE EAST
    addRegionAllCountries(regions.MIDDLE_EAST, processedData.MIDDLE_EAST, "MIDDLE EAST");
    // AMERICA
    addRegionAllCountries(regions.AMERICA.NORTH_AMERICA, processedData.AMERICA.NORTH_AMERICA, "AMERICA - NORTH AMERICA");
    addRegionAllCountries(regions.AMERICA.SOUTH_AMERICA, processedData.AMERICA.SOUTH_AMERICA, "AMERICA - SOUTH AMERICA");
    // EUROPE
    addRegionAllCountries(regions.EUROPE.WESTERN_EUROPE, processedData.EUROPE.WESTERN_EUROPE, "EUROPE - WESTERN EUROPE");
    addRegionAllCountries(regions.EUROPE.NORTHERN_EUROPE, processedData.EUROPE.NORTHERN_EUROPE, "EUROPE - NORTHERN EUROPE");
    addRegionAllCountries(regions.EUROPE.SOUTHERN_EUROPE, processedData.EUROPE.SOUTHERN_EUROPE, "EUROPE - SOUTHERN EUROPE");
    addRegionAllCountries(regions.EUROPE.EASTERN_EUROPE, processedData.EUROPE.EASTERN_EUROPE, "EUROPE - EASTERN EUROPE");
    // AUSTRALASIA/PACIFIC
    addRegionAllCountries(regions.AUSTRALASIA_PACIFIC, processedData.AUSTRALASIA_PACIFIC, "AUSTRALASIA/PACIFIC");
    // AFRICA
    addRegionAllCountries(regions.AFRICA, processedData.AFRICA, "AFRICA");
    // OTHERS
    addRegionAllCountries(regions.OTHERS, processedData.OTHERS, "OTHERS AND UNSPECIFIED RESIDENCES");

    // Add totals
    worksheetData.push(["TOTAL NON-PHILIPPINE RESIDENTS =", processedData.NON_PHILIPPINE_RESIDENTS]);
    worksheetData.push([]);
    worksheetData.push(["GRAND TOTAL GUEST ARRIVALS =", processedData.PHILIPPINE_RESIDENTS + processedData.NON_PHILIPPINE_RESIDENTS + processedData.OVERSEAS_FILIPINOS]);
    worksheetData.push(["   Total Philippine Residents =", processedData.PHILIPPINE_RESIDENTS]);
    worksheetData.push(["   Total Non-Philippine Residents =", processedData.NON_PHILIPPINE_RESIDENTS]);
    worksheetData.push(["   Total Overseas Filipinos =", processedData.OVERSEAS_FILIPINOS || 0]);

    // Create worksheet and append as the first sheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Regional Distribution");

    // If user is admin and establishmentData exists, include per-establishment sheets
    if (user && user.role === "admin" && establishmentData && establishmentData.length > 0) {
      const allEstablishments = Array.from(new Set(establishmentData.map(e => e.establishment))).sort((a, b) => a.localeCompare(b));
      const lookup = {};
      establishmentData.forEach(({ establishment, nationality, count }) => {
        if (!lookup[establishment]) lookup[establishment] = {};
        lookup[establishment][nationality] = count;
      });
      const sumForEst = (est, nats) => nats.reduce((sum, nat) => sum + Number(lookup[est]?.[nat] || 0), 0);

      // Split establishments into chunks of 10
      for (let i = 0; i < allEstablishments.length; i += 10) {
        const chunk = allEstablishments.slice(i, i + 10);
        const sheetData = [];
        sheetData.push(["REGIONAL DISTRIBUTION OF TRAVELLERS", ...Array(chunk.length).fill("")]);
        sheetData.push(["Year =", selectedYear, ...Array(chunk.length - 1).fill("")]);
        sheetData.push(["Month =", formatMonth(selectedMonth), ...Array(chunk.length - 1).fill("")]);
        sheetData.push(["(PANGLAO REPORT)", ...chunk]);
        sheetData.push([]);
        sheetData.push(["COUNTRY OF RESIDENCE", ...Array(chunk.length).fill("")]);
        sheetData.push([
          "TOTAL PHILIPPINE RESIDENTS =",
          ...chunk.map(est => sumForEst(est, ["Philippines"]))
        ]);
        sheetData.push([
          "NON-PHILIPPINE RESIDENTS =",
          ...chunk.map(est => {
            const allNats = Object.keys(lookup[est] || {});
            return allNats.reduce((sum, nat) =>
              nat !== "Philippines" && nat !== "Overseas Filipino" ? sum + Number(lookup[est][nat] || 0) : sum, 0);
          })
        ]);
        sheetData.push([]);
        const addRegion = (regionList, label) => {
          sheetData.push([label, ...Array(chunk.length).fill("")]);
          regionList.forEach(nat => {
            const row = ["   " + nat + " ="];
            chunk.forEach(est => {
              row.push(Number(lookup[est]?.[nat] || 0));
            });
            sheetData.push(row);
          });
          sheetData.push([]);
        };
        addRegion(regions.ASIA.ASEAN, "ASIA - ASEAN");
        addRegion(regions.ASIA.EAST_ASIA, "ASIA - EAST ASIA");
        addRegion(regions.ASIA.SOUTH_ASIA, "ASIA - SOUTH ASIA");
        addRegion(regions.MIDDLE_EAST, "MIDDLE EAST");
        addRegion(regions.AMERICA.NORTH_AMERICA, "AMERICA - NORTH AMERICA");
        addRegion(regions.AMERICA.SOUTH_AMERICA, "AMERICA - SOUTH AMERICA");
        addRegion(regions.EUROPE.WESTERN_EUROPE, "EUROPE - WESTERN EUROPE");
        addRegion(regions.EUROPE.NORTHERN_EUROPE, "EUROPE - NORTHERN EUROPE");
        addRegion(regions.EUROPE.SOUTHERN_EUROPE, "EUROPE - SOUTHERN EUROPE");
        addRegion(regions.EUROPE.EASTERN_EUROPE, "EUROPE - EASTERN EUROPE");
        addRegion(regions.AUSTRALASIA_PACIFIC, "AUSTRALASIA/PACIFIC");
        addRegion(regions.AFRICA, "AFRICA");
        addRegion(regions.OTHERS, "OTHERS AND UNSPECIFIED RESIDENCES");
        sheetData.push([
          "TOTAL NON-PHILIPPINE RESIDENTS =",
          ...chunk.map(est => {
            const allNats = Object.keys(lookup[est] || {});
            return allNats.reduce((sum, nat) =>
              nat !== "Philippines" && nat !== "Overseas Filipino" ? sum + Number(lookup[est][nat] || 0) : sum, 0);
          })
        ]);
        sheetData.push([]);
        sheetData.push([
          "GRAND TOTAL GUEST ARRIVALS =",
          ...chunk.map(est => {
            const phil = sumForEst(est, ["Philippines"]);
            const nonPhil = Object.keys(lookup[est] || {}).reduce((sum, nat) =>
              nat !== "Philippines" && nat !== "Overseas Filipino" ? sum + Number(lookup[est][nat] || 0) : sum, 0);
            const ofw = sumForEst(est, ["Overseas Filipino"]);
            return phil + nonPhil + ofw;
          })
        ]);
        sheetData.push([
          "   Total Philippine Residents =",
          ...chunk.map(est => sumForEst(est, ["Philippines"]))
        ]);
        sheetData.push([
          "   Total Non-Philippine Residents =",
          ...chunk.map(est => {
            const allNats = Object.keys(lookup[est] || {});
            return allNats.reduce((sum, nat) =>
              nat !== "Philippines" && nat !== "Overseas Filipino" ? sum + Number(lookup[est][nat] || 0) : sum, 0);
          })
        ]);
        sheetData.push([
          "   Total Overseas Filipinos =",
          ...chunk.map(est => sumForEst(est, ["Overseas Filipino"]))
        ]);
        const estSheet = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, estSheet, `Establishments ${i + 1}-${i + chunk.length}`);
      }
    }

    // Auto-fit columns for the first sheet
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
      worksheet["!cols"][C] = { wch: maxWidth + 2 };
    }

    // Export to Excel
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Regional_Distribution_${selectedYear}_${formatMonth(selectedMonth)}.xlsx`);
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#E0F7FA" }}>
      <h3 style={{ color: "#37474F", marginBottom: "20px" }}> Top Markets Ranking </h3>

      {/* Export button: available to authenticated users.
          Admins receive per-establishment sheets; regular users get only aggregated regional data. */}
      {user ? (
        <button
          style={{
            backgroundColor: "#00BCD4",
            color: "#FFFFFF",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
          onClick={exportToExcel}
        >
          <Download size={16} />
          DAE-form 2
        </button>
      ) : (
        <div style={{ color: "#37474F", marginBottom: "12px" }}>
          Please login to export the regional distribution report.
        </div>
      )}

      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default RegionalDistribution;
