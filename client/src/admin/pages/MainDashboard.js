// client/src/admin/pages/MainDashboard.js
import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";
import * as XLSX from "xlsx"; // For Excel file generation
import { saveAs } from "file-saver"; // For file download

// Helper function to safely convert a value to a number
const toNumber = (value, defaultValue = 0) => {
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
};

const MainDashboard = () => {
  const [monthlyCheckIns, setMonthlyCheckIns] = useState([]);
  const [monthlyMetrics, setMonthlyMetrics] = useState([]);
  const [nationalityCounts, setNationalityCounts] = useState([]);
  const [guestDemographics, setGuestDemographics] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Default to current month
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";


  // Predicted data for January 2025 to June 2025
  const predictedData = [
    { month: 1, total_check_ins: 71680, isPredicted: true },
    { month: 2, total_check_ins: 71274, isPredicted: true },
    { month: 3, total_check_ins: 69351, isPredicted: true },
    { month: 4, total_check_ins: 71232, isPredicted: true },
    { month: 5, total_check_ins: 72463, isPredicted: true },
    { month: 6, total_check_ins: 67578, isPredicted: true },
  ];

    // Fetch guest demographics data
    const fetchGuestDemographics = async () => {
        try {
          const token = sessionStorage.getItem("token");
          const response = await axios.get(`${API_BASE_URL}/admin/guest-demographics`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { year: selectedYear, month: selectedMonth },
          });
          setGuestDemographics(response.data);
        } catch (err) {
          console.error("Error fetching guest demographics:", err);
        }
      };

  // Fetch monthly check-ins data
  const fetchMonthlyCheckIns = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");

      // Fetch monthly check-ins
      const checkInsResponse = await axios.get(`${API_BASE_URL}/admin/monthly-checkins`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { year: selectedYear },
      });

      // Fill in missing months with zero check-ins
      const allMonths = Array.from({ length: 12 }, (_, i) => i + 1); // [1, 2, ..., 12]
      const dataWithAllMonths = allMonths.map((month) => {
        const monthData = checkInsResponse.data.find((d) => d.month === month);
        return {
          month,
          total_check_ins: monthData ? monthData.total_check_ins : 0,
          isPredicted: false, // Mark as actual data
        };
      });

      // Append predicted data if the selected year is 2025
      const finalData = selectedYear === 2025 ? [...dataWithAllMonths, ...predictedData] : dataWithAllMonths;

      setMonthlyCheckIns(finalData);

      // Fetch monthly metrics
      const metricsResponse = await axios.get(`${API_BASE_URL}/admin/monthly-metrics`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { year: selectedYear },
      });

      // Fill in missing months with zero values
      const metricsWithAllMonths = allMonths.map((month) => {
        const monthData = metricsResponse.data.find((d) => d.month === month);
        return {
          month,
          total_check_ins: monthData ? monthData.total_check_ins : 0,
          total_overnight: monthData ? monthData.total_overnight : 0,
          total_occupied: monthData ? monthData.total_occupied : 0,
          average_guest_nights: monthData ? monthData.average_guest_nights : 0,
          average_room_occupancy_rate: monthData ? monthData.average_room_occupancy_rate : 0,
          average_guests_per_room: monthData ? monthData.average_guests_per_room : 0,
          total_submissions: monthData ? monthData.total_submissions : 0,
          submission_rate: monthData ? monthData.submission_rate : 0,
        };
      });

      setMonthlyMetrics(metricsWithAllMonths);

      // Fetch nationality counts
      const nationalityResponse = await axios.get(`${API_BASE_URL}/admin/nationality-counts`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { year: selectedYear, month: selectedMonth },
      });

      setNationalityCounts(nationalityResponse.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all data when year or month changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchMonthlyCheckIns();
      await fetchGuestDemographics();
      setLoading(false);
    };
    fetchData();
  }, [selectedYear, selectedMonth]);

  

  // Generate year options for the dropdown
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // Format month names
  const formatMonth = (month) => {
    const date = new Date(2023, month - 1); // Use any year (2023 is arbitrary)
    return date.toLocaleString("default", { month: "long" });
  };

  // Export Monthly Metrics to Excel
  const exportMonthlyMetrics = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      monthlyMetrics.map((metrics) => ({
        Month: formatMonth(metrics.month),
        "Total Check-Ins": toNumber(metrics.total_check_ins),
        "Total Overnight": toNumber(metrics.total_overnight),
        "Total Occupied": toNumber(metrics.total_occupied),
        "Average Guest-Nights": toNumber(metrics.average_guest_nights).toFixed(2),
        "Average Room Occupancy Rate": `${toNumber(metrics.average_room_occupancy_rate).toFixed(2)}%`,
        "Average Guests per Room": toNumber(metrics.average_guests_per_room).toFixed(2),
        "Total Submissions": toNumber(metrics.total_submissions),
        "Submission Rate": `${toNumber(metrics.submission_rate).toFixed(2)}%`,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Metrics");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Monthly_Metrics_${selectedYear}.xlsx`);
  };

  // Export Nationality Counts to Excel
  const exportNationalityCounts = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      nationalityCounts.map((nationality) => ({
        Nationality: nationality.nationality,
        Count: nationality.count,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Nationality Counts");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Nationality_Counts_${selectedYear}_${formatMonth(selectedMonth)}.xlsx`);
  };

  // Export Guest Demographics to Excel
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
      <h2>Main Dashboard</h2>

      {/* Year Filter Dropdown */}
      <div className="mb-4">
        <label htmlFor="yearFilter">Select Year:</label>
        <select
          id="yearFilter"
          className="form-control"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Month Filter Dropdown */}
      <div className="mb-4">
        <label htmlFor="monthFilter">Select Month:</label>
        <select
          id="monthFilter"
          className="form-control"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {formatMonth(i + 1)}
            </option>
          ))}
        </select>
      </div>

      {/* Line Graph */}
      {loading ? (
        <p>Loading monthly check-ins...</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={monthlyCheckIns}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth} // Display full month names
            />
            <YAxis />
            <Tooltip />
            <Legend />
            {/* Actual Data Line */}
            <Line
              type="monotone"
              dataKey="total_check_ins"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
              name="Actual Guest Check-In"
              strokeOpacity={0.8}
              dot={false}
            />
            {/* Predicted Data Line */}
            {selectedYear === 2025 && (
              <Line
                type="monotone"
                dataKey="total_check_ins"
                stroke="#ff0000" // Red color for predicted data
                strokeDasharray="5 5" // Dashed line for predicted data
                name="Prediction of Guest Check-In"
                strokeOpacity={0.8}
                dot={false}
                data={monthlyCheckIns.filter((d) => d.isPredicted)}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Monthly Metrics Table */}
      <h3 className="mt-5">Monthly Metrics</h3>
      <button className="btn btn-success mb-3" onClick={exportMonthlyMetrics}>
        Export Monthly Metrics to Excel
      </button>
      {loading ? (
        <p>Loading monthly metrics...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Month</th>
                <th>Total Check-Ins</th>
                <th>Total Overnight</th>
                <th>Total Occupied</th>
                <th>Average Guest-Nights</th>
                <th>Average Room Occupancy Rate</th>
                <th>Average Guests per Room</th>
                <th>Total Submissions</th>
                <th>Submission Rate</th>
              </tr>
            </thead>
            <tbody>
              {monthlyMetrics.map((metrics) => (
                <tr key={metrics.month}>
                  <td>{formatMonth(metrics.month)}</td>
                  <td>{toNumber(metrics.total_check_ins)}</td>
                  <td>{toNumber(metrics.total_overnight)}</td>
                  <td>{toNumber(metrics.total_occupied)}</td>
                  <td>{toNumber(metrics.average_guest_nights).toFixed(2)}</td>
                  <td>{toNumber(metrics.average_room_occupancy_rate).toFixed(2)}%</td>
                  <td>{toNumber(metrics.average_guests_per_room).toFixed(2)}</td>
                  <td>{toNumber(metrics.total_submissions)}</td>
                  <td>{toNumber(metrics.submission_rate).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

        {/* Guest Demographics Section */}
        <h3 className="mt-5">Guest Demographics (Check-Ins Only)</h3>
      <button className="btn btn-success mb-3" onClick={exportGuestDemographics}>
        Export Guest Demographics to Excel
      </button>
      {loading ? (
        <p>Loading guest demographics...</p>
      ) : (
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
      )}

      {/* Nationality Counts Table */}
      <h3 className="mt-5">Nationality Counts (Check-Ins Only)</h3>
      <button className="btn btn-success mb-3" onClick={exportNationalityCounts}>
        Export Nationality Counts to Excel
      </button>
      {loading ? (
        <p>Loading nationality counts...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Nationality</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {nationalityCounts.map((nationality) => (
                <tr key={nationality.nationality}>
                  <td>{nationality.nationality}</td>
                  <td>{nationality.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MainDashboard;