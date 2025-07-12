import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const UserGuestDemographics = ({ user, selectedYear, selectedMonth, formatMonth }) => {
  const [guestDemographics, setGuestDemographics] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !selectedYear || !selectedMonth) return;
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/api/submissions/guest-demographics/${user.user_id}?year=${selectedYear}&month=${selectedMonth}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      })
      .then(res => setGuestDemographics(res.data))
      .catch(err => {
        setGuestDemographics([]);
        console.error("Error fetching guest demographics:", err);
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

  return (
    <div style={{ padding: 20, backgroundColor: "#E0F7FA", marginTop: 24, borderRadius: 12 }}>
      <h3 style={{ color: "#37474F", marginBottom: 20 }}>Guest Demographics of Guest Check-Ins</h3>
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