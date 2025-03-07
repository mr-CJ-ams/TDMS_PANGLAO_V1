// client/src/admin/components/GuestDemographics.js
import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const GuestDemographics = ({ guestDemographics, selectedYear, selectedMonth, formatMonth }) => {
  const exportGuestDemographics = () => {
    // Prepare detailed data for the first sheet
    const detailedData = guestDemographics.map((demo) => ({
      Gender: demo.gender,
      AgeGroup: demo.age_group,
      Status: demo.status,
      Count: demo.count,
    }));

    // Prepare summary data for the second sheet
    const totals = calculateTotals();
    const summaryData = [
      { Category: "Male", Total: totals.Male },
      { Category: "Female", Total: totals.Female },
      { Category: "Minors", Total: totals.Minors },
      { Category: "Adults", Total: totals.Adults },
      { Category: "Married", Total: totals.Married },
      { Category: "Single", Total: totals.Single },
    ];

    // Create worksheets
    const detailedWorksheet = XLSX.utils.json_to_sheet([]); // Start with an empty sheet
    const summaryWorksheet = XLSX.utils.json_to_sheet([]); // Start with an empty sheet

    // Add headers and data to the detailed worksheet
    XLSX.utils.sheet_add_aoa(
      detailedWorksheet,
      [
        ["Panglao Report of Guest Demographics", "", "", ""], // Row 1 (merged across A1:D1)
        ["Year", selectedYear, "", ""], // Row 2
        ["Month", formatMonth(selectedMonth), "", ""], // Row 3
        ["Gender", "AgeGroup", "Status", "Count"], // Row 4 (Column headers)
        ...detailedData.map((demo) => [
          demo.Gender,
          demo.AgeGroup,
          demo.Status,
          demo.Count,
        ]),
      ],
      { origin: "A1" } // Start adding from the first cell
    );

    // Merge cells for "Panglao Report of Guest Demographics" in the detailed worksheet
    detailedWorksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Merge A1:D1
    ];

    // Add headers and data to the summary worksheet
    XLSX.utils.sheet_add_aoa(
      summaryWorksheet,
      [
        ["Panglao Report of Guest Demographics", "", "", ""], // Row 1 (merged across A1:D1)
        ["Year", selectedYear, "", ""], // Row 2
        ["Month", formatMonth(selectedMonth), "", ""], // Row 3
        ["Category", "Total", "", ""], // Row 4 (Column headers)
        ...summaryData.map((row) => [
          row.Category,
          row.Total,
          "", // Empty column for C
          "", // Empty column for D
        ]),
      ],
      { origin: "A1" } // Start adding from the first cell
    );

    // Merge cells for "Panglao Report of Guest Demographics" in the summary worksheet
    summaryWorksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Merge A1:D1
    ];

    // Set column widths (simulate AutoFit)
    const colWidth = 15; // Fixed width for all columns
    detailedWorksheet["!cols"] = [
      { wch: colWidth }, // Column A
      { wch: colWidth }, // Column B
      { wch: colWidth }, // Column C
      { wch: colWidth }, // Column D
    ];
    summaryWorksheet["!cols"] = [
      { wch: colWidth }, // Column A
      { wch: colWidth }, // Column B
      { wch: colWidth }, // Column C
      { wch: colWidth }, // Column D
    ];

    // Create a workbook and add the worksheets
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, detailedWorksheet, "Detailed Data");
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary Data");

    // Write the workbook to a file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Guest_Demographics_${selectedYear}_${selectedMonth}.xlsx`);
  };

  const calculateTotals = () => {
    const totals = {
      Male: 0,
      Female: 0,
      Minors: 0,
      Adults: 0,
      Married: 0,
      Single: 0,
    };

    guestDemographics.forEach((demo) => {
      const count = Number(demo.count); // Ensure count is a number
      if (demo.gender === "Male") totals.Male += count;
      if (demo.gender === "Female") totals.Female += count;
      if (demo.age_group === "Minors") totals.Minors += count;
      if (demo.age_group === "Adults") totals.Adults += count;
      if (demo.status === "Married") totals.Married += count;
      if (demo.status === "Single") totals.Single += count;
    });

    return totals;
  };

  const totals = calculateTotals();

  // Summary data for the table
  const summaryTableData = [
    { Category: "Male", Total: totals.Male },
    { Category: "Female", Total: totals.Female },
    { Category: "Minors", Total: totals.Minors },
    { Category: "Adults", Total: totals.Adults },
    { Category: "Married", Total: totals.Married },
    { Category: "Single", Total: totals.Single },
  ];

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
      
      {/* Summary Section as a Table */}
      <div style={{ marginBottom: "20px" }}>
        <h4 style={{ color: "#00BCD4", marginBottom: "10px" }}>Summary</h4>
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
                <th style={{ padding: "12px", textAlign: "left" }}>Category</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {summaryTableData.map((row, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: "1px solid #B0BEC5",
                    backgroundColor: index % 2 === 0 ? "#F5F5F5" : "#FFFFFF",
                  }}
                >
                  <td style={{ padding: "12px", color: "#37474F" }}>{row.Category}</td>
                  <td style={{ padding: "12px", color: "#37474F" }}>{row.Total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Data Table */}
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