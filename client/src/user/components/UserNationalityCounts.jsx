import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const UserNationalityCounts = ({ user, selectedYear, selectedMonth, formatMonth }) => {
  const [nationalityCounts, setNationalityCounts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !selectedYear || !selectedMonth) return;
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/api/submissions/nationality-counts/${user.user_id}?year=${selectedYear}&month=${selectedMonth}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      })
      .then(res => setNationalityCounts(res.data))
      .catch(err => {
        setNationalityCounts([]);
        console.error("Error fetching nationality counts:", err);
      })
      .finally(() => setLoading(false));
  }, [user, selectedYear, selectedMonth]);

  return (
    <div style={{ padding: 20, backgroundColor: "#E0F7FA", marginTop: 24, borderRadius: 12 }}>
      <h3 style={{ color: "#37474F", marginBottom: 20 }}>Nationality Counts</h3>
      <div style={{ marginBottom: 20 }}>
        <span style={{ color: "#0288D1", fontWeight: 500 }}>
          Year: {selectedYear} &nbsp; | &nbsp; Month: {formatMonth(selectedMonth)}
        </span>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 24 }}>Loading...</div>
      ) : (
        <div className="table-responsive">
          <table style={{
            width: "100%", borderCollapse: "collapse", backgroundColor: "#FFF",
            borderRadius: 12, overflow: "hidden", boxShadow: "0px 4px 12px rgba(0,0,0,0.1)"
          }}>
            <thead>
              <tr style={{ backgroundColor: "#00BCD4", color: "#FFF" }}>
                <th style={{ padding: 12, textAlign: "left" }}>Nationality</th>
                <th style={{ padding: 12, textAlign: "left" }}>Count</th>
                <th style={{ padding: 12, textAlign: "left" }}>Male</th>
                <th style={{ padding: 12, textAlign: "left" }}>Female</th>
              </tr>
            </thead>
            <tbody>
              {nationalityCounts.map((n, i) => (
                <tr key={n.nationality} style={{
                  borderBottom: "1px solid #B0BEC5",
                  backgroundColor: i % 2 === 0 ? "#F5F5F5" : "#FFF"
                }}>
                  <td style={{ padding: 12, color: "#37474F" }}>{n.nationality}</td>
                  <td style={{ padding: 12, color: "#37474F" }}>{n.count}</td>
                  <td style={{ padding: 12, color: "#37474F" }}>{n.male_count}</td>
                  <td style={{ padding: 12, color: "#37474F" }}>{n.female_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserNationalityCounts; 