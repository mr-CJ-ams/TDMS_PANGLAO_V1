import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const UserGuestDemographics = ({ user, selectedYear, selectedMonth, formatMonth }) => {
  const [guestDemographics, setGuestDemographics] = useState([]);
  const [nationalityCounts, setNationalityCounts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !selectedYear || !selectedMonth) return;
    setLoading(true);
    
    // Fetch both guest demographics and nationality counts
    Promise.all([
      axios.get(`${API_BASE_URL}/api/submissions/guest-demographics/${user.user_id}?year=${selectedYear}&month=${selectedMonth}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      }),
      axios.get(`${API_BASE_URL}/api/submissions/nationality-counts/${user.user_id}?year=${selectedYear}&month=${selectedMonth}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      })
    ])
    .then(([demographicsRes, nationalityRes]) => {
      setGuestDemographics(demographicsRes.data);
      setNationalityCounts(nationalityRes.data);
    })
    .catch(err => {
      setGuestDemographics([]);
      setNationalityCounts([]);
      console.error("Error fetching data:", err);
    })
    .finally(() => setLoading(false));
  }, [user, selectedYear, selectedMonth]);

  // Calculate summary
  const summary = {
    Male: 0,
    Female: 0,
    Minors: 0,
    Adults: 0,
    Married: 0,
    Single: 0,
  };
  guestDemographics.forEach(({ gender, age_group, status, count }) => {
    const c = Number(count) || 0;
    if (gender === "Male") summary.Male += c;
    if (gender === "Female") summary.Female += c;
    if (age_group === "Minors") summary.Minors += c;
    if (age_group === "Adults") summary.Adults += c;
    if (status === "Married") summary.Married += c;
    if (status === "Single") summary.Single += c;
  });

  const summaryTableData = [
    { Category: "Male", Total: summary.Male },
    { Category: "Female", Total: summary.Female },
    { Category: "Minors", Total: summary.Minors },
    { Category: "Adults", Total: summary.Adults },
    { Category: "Married", Total: summary.Married },
    { Category: "Single", Total: summary.Single },
  ];

  const exportGuestDemographics = () => {
    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Guest Demographics
    const demographicsData = [
      ["GUEST DEMOGRAPHICS REPORT"],
      [""], // Empty row for spacing
      ["Company Name", user?.company_name || "N/A"],
      ["Accommodation Type", user?.accommodation_type || "N/A"],
      ["Month", formatMonth(selectedMonth)],
      ["Year", selectedYear],
      [""], // Empty row for spacing
      [""], // Empty row for spacing
      // Summary section
      ["SUMMARY"],
      ["Category", "Total"],
      ...summaryTableData.map(row => [row.Category, row.Total]),
      [""], // Empty row for spacing
      [""], // Empty row for spacing
      // Detailed section
      ["DETAILED BREAKDOWN"],
      ["Gender", "Age Group", "Status", "Count"],
      ...guestDemographics.map(demo => [
        demo.gender,
        demo.age_group,
        demo.status,
        demo.count
      ])
    ];
    
    const demographicsWorksheet = XLSX.utils.aoa_to_sheet(demographicsData);
    XLSX.utils.book_append_sheet(wb, demographicsWorksheet, "Guest Demographics");
    
    // Auto-size columns for demographics sheet
    demographicsWorksheet['!cols'] = [
      { width: 20 }, // Company Name, Category, Gender
      { width: 25 }, // Accommodation Type, Total, Age Group
      { width: 15 }, // Month, Status
      { width: 15 }, // Year, Count
    ];
    
    // Sheet 2: Nationality Counts
    const nationalityData = [
      ["NATIONALITY COUNTS REPORT"],
      [""], // Empty row for spacing
      ["Company Name", user?.company_name || "N/A"],
      ["Accommodation Type", user?.accommodation_type || "N/A"],
      ["Month", formatMonth(selectedMonth)],
      ["Year", selectedYear],
      [""], // Empty row for spacing
      [""], // Empty row for spacing
      ["Nationality", "Count", "Male", "Female"],
      ...nationalityCounts.map(n => [
        n.nationality,
        n.count,
        n.male_count,
        n.female_count
      ])
    ];
    
    const nationalityWorksheet = XLSX.utils.aoa_to_sheet(nationalityData);
    XLSX.utils.book_append_sheet(wb, nationalityWorksheet, "Nationality Counts");
    
    // Auto-size columns for nationality sheet
    nationalityWorksheet['!cols'] = [
      { width: 25 }, // Nationality
      { width: 15 }, // Count
      { width: 15 }, // Male
      { width: 15 }, // Female
    ];
    
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], { type: "application/octet-stream" }), 
      `${user?.company_name || 'Resort'}_${formatMonth(selectedMonth)}_${selectedYear}_Guest_Demographics_Report.xlsx`
    );
  };

  return (
    <div style={{ padding: 20, backgroundColor: "#E0F7FA", marginTop: 24, borderRadius: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ color: "#37474F", margin: 0 }}>Guest Demographics of Guest Check-Ins</h3>
        <button
          style={{
            backgroundColor: "#00BCD4",
            color: "#FFF",
            border: "none",
            padding: "10px 20px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: "14px"
          }}
          onClick={exportGuestDemographics}
        >
          {/* Button: Export Guest Demographics and Nationality Counts */}
          <Download size={16}/>
        </button>
      </div>
      <div style={{ marginBottom: 20 }}>
        <span style={{ color: "#0288D1", fontWeight: 500 }}>
          Year: {selectedYear} &nbsp; | &nbsp; Month: {formatMonth(selectedMonth)}
        </span>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 24 }}>Loading...</div>
      ) : (
        <>
          <div className="table-responsive">
            <table style={{
              width: "100%", borderCollapse: "collapse", backgroundColor: "#FFF",
              borderRadius: 12, overflow: "hidden", boxShadow: "0px 4px 12px rgba(0,0,0,0.1)"
            }}>
              <thead>
                <tr style={{ backgroundColor: "#00BCD4", color: "#FFF" }}>
                  <th style={{ padding: 12, textAlign: "left" }}>Category</th>
                  <th style={{ padding: 12, textAlign: "left" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {summaryTableData.map((row, i) => (
                  <tr key={i} style={{
                    borderBottom: "1px solid #B0BEC5",
                    backgroundColor: i % 2 === 0 ? "#F5F5F5" : "#FFF"
                  }}>
                    <td style={{ padding: 12, color: "#37474F" }}>{row.Category}</td>
                    <td style={{ padding: 12, color: "#37474F" }}>{row.Total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detailed Table */}
          <div className="table-responsive" style={{ marginTop: 24 }}>
            <table style={{
              width: "100%", borderCollapse: "collapse", backgroundColor: "#FFF",
              borderRadius: 12, overflow: "hidden", boxShadow: "0px 4px 12px rgba(0,0,0,0.1)"
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
                  <tr key={i} style={{
                    borderBottom: "1px solid #B0BEC5",
                    backgroundColor: i % 2 === 0 ? "#F5F5F5" : "#FFF"
                  }}>
                    <td style={{ padding: 12, color: "#37474F" }}>{demo.gender}</td>
                    <td style={{ padding: 12, color: "#37474F" }}>{demo.age_group}</td>
                    <td style={{ padding: 12, color: "#37474F" }}>{demo.status}</td>
                    <td style={{ padding: 12, color: "#37474F" }}>{demo.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default UserGuestDemographics; 