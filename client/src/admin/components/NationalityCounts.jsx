import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const NationalityCounts = ({ nationalityCounts, selectedYear, selectedMonth, formatMonth }) => {
  const exportNationalityCounts = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      nationalityCounts.map(n => ({
        Nationality: n.nationality,
        Count: n.count,
        Male: n.male_count,
        Female: n.female_count,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, worksheet, "Nationality Counts");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }),
      `Nationality_Counts_${selectedYear}_${formatMonth(selectedMonth)}.xlsx`
    );
  };

  return (
    <div style={{ padding: 20, backgroundColor: "#E0F7FA" }}>
      <button
        style={{
          backgroundColor: "#00BCD4", color: "#FFF", border: "none",
          padding: "10px 20px", borderRadius: 8, cursor: "pointer", marginBottom: 20
        }}
        onClick={exportNationalityCounts}
      >
        Export Nationality Counts to Excel
      </button>
      <div className="table-responsive">
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "#FFF",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#00BCD4", color: "#FFF" }}>
              {["Nationality", "Count", "Male", "Female"].map(label => (
                <th key={label} style={{ padding: 12, textAlign: "left" }}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nationalityCounts.map((n, i) => (
              <tr
                key={n.nationality}
                style={{
                  borderBottom: "1px solid #B0BEC5",
                  backgroundColor: i % 2 === 0 ? "#F5F5F5" : "#FFF",
                }}
              >
                <td style={{ padding: 12, color: "#37474F" }}>{n.nationality}</td>
                <td style={{ padding: 12, color: "#37474F" }}>{n.count}</td>
                <td style={{ padding: 12, color: "#37474F" }}>{n.male_count}</td>
                <td style={{ padding: 12, color: "#37474F" }}>{n.female_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NationalityCounts;