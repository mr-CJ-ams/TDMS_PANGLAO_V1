/**
 * UserStatistics.jsx
 * 
 * Panglao Tourist Data Management System - User Statistics Component (Frontend)
 * 
 * =========================
 * Overview:
 * =========================
 * This React component displays comprehensive statistics and analytics for the authenticated user's accommodation submissions.
 * It includes a monthly line chart of guest check-ins, a metrics table, guest demographics, and nationality counts for the selected year and month.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Fetches monthly check-in data and metrics from the backend API for the authenticated user.
 * - Renders a responsive line chart showing monthly guest check-ins for the selected year.
 * - Provides year and month filters for viewing statistics and analytics.
 * - Displays monthly metrics, guest demographics, and nationality counts using dedicated subcomponents.
 * - Handles loading, error, and empty states gracefully.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Uses recharts for interactive and responsive charting.
 * - Modular design with subcomponents for metrics, demographics, and nationality breakdowns.
 * - Uses axios for API communication and sessionStorage for authentication.
 * - Custom tooltip and year/month selection for improved UX.
 * - Ensures all months are shown in the chart and metrics table, filling missing data with zeroes.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Used in the user dashboard to review and analyze monthly accommodation statistics.
 * - Allows users to visualize trends, export metrics, and review guest demographics and nationality breakdowns.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - The backend endpoints for fetching data are:
 *     GET /api/submissions/statistics/:userId
 *     GET /api/submissions/metrics/:userId?year=YYYY
 * - Extend this component to support additional analytics, export features, or custom chart types.
 * - Update year/month filter logic as business requirements change.
 * 
 * =========================
 * Related Files:
 * =========================
 * - src/user/components/UserMonthlyMetrics.jsx      (monthly metrics table)
 * - src/user/components/UserGuestDemographics.jsx   (guest demographics table)
 * - src/user/components/UserNationalityCounts.jsx   (nationality counts table)
 * - server/controllers/submissionsController.js     (handles backend statistics logic)
 * - server/routes/submissions.js                    (defines backend endpoints)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { submissionsAPI } from "../../services/api";
import UserMonthlyMetrics from "../components/UserMonthlyMetrics";
import UserGuestDemographics from "../components/UserGuestDemographics";
import UserNationalityCounts from "../components/UserNationalityCounts";

const UserStatistics = ({ user }) => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [monthlyMetrics, setMonthlyMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Format month function
  const formatMonth = useCallback((monthNumber) => {
    return new Date(0, monthNumber - 1).toLocaleString("default", { month: "long" });
  }, []);

  // Fetch user statistics data - REFACTORED
  useEffect(() => {
    if (!user) return;
    
    const fetchUserStatistics = async () => {
      setLoading(true);
      try {
        const response = await submissionsAPI.getUserStatistics(user.user_id);
        setMonthlyData(response);
      } catch (error) {
        console.error("Error fetching user statistics:", error);
        setMonthlyData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStatistics();
  }, [user]);

  // Fetch user monthly metrics data - REFACTORED
  useEffect(() => {
    if (!user) return;
    
    const fetchUserMonthlyMetrics = async () => {
      try {
        const response = await submissionsAPI.getUserMonthlyMetrics(user.user_id, selectedYear);
        setMonthlyMetrics(response);
      } catch (error) {
        console.error("Error fetching user monthly metrics:", error);
        setMonthlyMetrics([]);
      }
    };

    fetchUserMonthlyMetrics();
  }, [user, selectedYear]);

  // Ensure all months are present in the metrics table
  const filledMonthlyMetrics = useMemo(() => {
    // Map for quick lookup
    const metricsMap = new Map((monthlyMetrics || []).map(m => [Number(m.month), m]));
    return Array.from({ length: 12 }, (_, i) => {
      const monthNumber = i + 1;
      const m = metricsMap.get(monthNumber);
      return m || {
        month: monthNumber,
        year: selectedYear,
        total_check_ins: 0,
        total_overnight: 0,
        total_occupied: 0,
        average_guest_nights: 0,
        average_room_occupancy_rate: 0,
        average_guests_per_room: 0,
        total_rooms: 0,
      };
    });
  }, [monthlyMetrics, selectedYear]);

  // Filter data based on selected year and ensure all months are shown
  const filteredData = useMemo(() => {
    const yearData = monthlyData.filter(item => item.year === selectedYear);
    
    // Create array with all 12 months, filling missing months with 0
    const allMonths = Array.from({ length: 12 }, (_, i) => {
      const monthNumber = i + 1;
      const existingData = yearData.find(item => item.month === monthNumber);
      return {
        month: monthNumber,
        year: selectedYear,
        total_check_ins: existingData ? existingData.total_check_ins : 0
      };
    });
    
    return allMonths;
  }, [monthlyData, selectedYear]);

  // Generate year options (10 years from now moving forward)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYear + i);
  }, []);

  // Custom tooltip component
  const CustomTooltip = useCallback(({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const month = formatMonth(label);
      const checkIns = payload[0]?.value;

      return (
        <div style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #B0BEC5",
          borderRadius: "8px",
          padding: "12px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        }}>
          <p style={{ fontWeight: "bold", color: "#263238", marginBottom: "8px" }}>{month}</p>
          <p style={{ color: "#0288D1" }}>Check-ins: {checkIns}</p>
        </div>
      );
    }
    return null;
  }, [formatMonth]);

  const selectStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #B0BEC5",
    backgroundColor: "#FFFFFF",
    color: "#37474F",
    fontSize: "14px",
    cursor: "pointer",
  };

  // Helper function to safely convert to number
  const toNumber = (value) => {
    if (value === null || value === undefined) return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-b from-cyan-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-2xl font-semibold text-gray-800">My Statistics</h3>
        </div>

        {/* Filters */}
        <div style={{ padding: 20, backgroundColor: "#E0F7FA", borderRadius: 12, boxShadow: "0px 4px 12px rgba(0,0,0,0.1)", marginBottom: 20 }}>
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="yearFilter" style={{ display: "block", color: "#37474F", fontWeight: "bold", marginBottom: 8 }}>
              Select Year:
            </label>
            <select
              id="yearFilter"
              style={selectStyle}
              value={selectedYear}
              onChange={e => setSelectedYear(+e.target.value)}
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="monthFilter" style={{ display: "block", color: "#37474F", fontWeight: "bold", marginBottom: 8 }}>
              Select Month:
            </label>
            <select
              id="monthFilter"
              style={selectStyle}
              value={selectedMonth}
              onChange={e => setSelectedMonth(+e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{formatMonth(i + 1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Chart */}
        {filteredData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">No data available for the selected year.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Monthly Check-ins for {selectedYear}</h4>
            {/* Responsive horizontal scroll for mobile */}
            <div className="w-full overflow-x-auto">
              <div
                style={{
                  minWidth: 700, // Ensures all months are visible and chart is not compressed
                  width: "100%",
                  maxWidth: "1200px",
                }}
              >
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={filteredData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    {/* Background gradient */}
                    <defs>
                      <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E0F7FA" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#FFF3E0" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <rect x={0} y={0} width="100%" height="100%" fill="url(#userGradient)" />

                    {/* Grid */}
                    <CartesianGrid strokeDasharray="3 3" stroke="#B0BEC5" strokeOpacity={0.5} />

                    {/* X Axis */}
                    <XAxis
                      dataKey="month"
                      tickFormatter={formatMonth}
                      tick={{ fill: "#37474F", fontSize: 12, fontWeight: "bold" }}
                      axisLine={{ stroke: "#37474F", strokeWidth: 1 }}
                    />

                    {/* Y Axis */}
                    <YAxis
                      tick={{ fill: "#37474F", fontSize: 12, fontWeight: "bold" }}
                      axisLine={{ stroke: "#37474F", strokeWidth: 1 }}
                    />

                    {/* Tooltip */}
                    <Tooltip content={<CustomTooltip />} />

                    {/* Legend */}
                    <Legend
                      wrapperStyle={{
                        paddingTop: "20px",
                        color: "#37474F",
                      }}
                    />

                    {/* Line */}
                    <Line
                      type="monotone"
                      dataKey="total_check_ins"
                      stroke="#0288D1"
                      activeDot={{ r: 8, fill: "#0288D1" }}
                      name="Monthly Check-ins"
                      strokeOpacity={0.8}
                      dot={{ fill: "#0288D1", strokeWidth: 2, r: 4 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Metrics Table */}
        {monthlyMetrics.length > 0 && (
          <UserMonthlyMetrics
            monthlyMetrics={filledMonthlyMetrics}
            selectedYear={selectedYear}
            formatMonth={formatMonth}
            toNumber={toNumber}
            user={user}
          />
        )}

        {/* Guest Demographics Table */}
        <UserGuestDemographics
          user={user}
          selectedYear={Number(selectedYear)}
          selectedMonth={Number(selectedMonth)}
          formatMonth={formatMonth}
        />

        {/* Nationality Counts Table */}
        <UserNationalityCounts
          user={user}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          formatMonth={formatMonth}
        />

      </div>
    </div>
  );
};

export default UserStatistics;
