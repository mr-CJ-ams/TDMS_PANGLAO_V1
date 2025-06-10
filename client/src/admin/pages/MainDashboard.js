import { useState, useEffect } from "react";
import axios from "axios";
import Filters from "../components/Filters";
import MonthlyMetrics from "../components/MonthlyMetrics";
import LineChartComponent from "../components/LineChart";
import GuestDemographics from "../components/GuestDemographics";
import NationalityCounts from "../components/NationalityCounts";
import RegionalDistribution from "../components/RegionalDistribution";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
const predictedData2025 = [
  { month: 1, total_check_ins: 72807, isPredicted: true },
  { month: 2, total_check_ins: 71334, isPredicted: true },
  { month: 3, total_check_ins: 69434, isPredicted: true },
  { month: 4, total_check_ins: 72970, isPredicted: true },
  { month: 5, total_check_ins: 73620, isPredicted: true },
  { month: 6, total_check_ins: 70163, isPredicted: true },
];

const MainDashboard = () => {
  const [monthlyCheckIns, setMonthlyCheckIns] = useState([]),
    [monthlyMetrics, setMonthlyMetrics] = useState([]),
    [nationalityCounts, setNationalityCounts] = useState([]),
    [guestDemographics, setGuestDemographics] = useState([]),
    [selectedYear, setSelectedYear] = useState(new Date().getFullYear()),
    [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1),
    [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const token = sessionStorage.getItem("token");
        const [checkInsRes, metricsRes, nationalityRes, demographicsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/admin/monthly-checkins`, { headers: { Authorization: `Bearer ${token}` }, params: { year: selectedYear } }),
          axios.get(`${API_BASE_URL}/admin/monthly-metrics`, { headers: { Authorization: `Bearer ${token}` }, params: { year: selectedYear } }),
          axios.get(`${API_BASE_URL}/admin/nationality-counts`, { headers: { Authorization: `Bearer ${token}` }, params: { year: selectedYear, month: selectedMonth } }),
          axios.get(`${API_BASE_URL}/admin/guest-demographics`, { headers: { Authorization: `Bearer ${token}` }, params: { year: selectedYear, month: selectedMonth } }),
        ]);
        const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);
        const fillMonths = (data, keys = []) =>
          allMonths.map(month => {
            const d = data.find(x => x.month === month);
            return keys.length
              ? keys.reduce((acc, k) => ({ ...acc, [k]: d ? d[k] : 0 }), { month })
              : { month, total_check_ins: d ? d.total_check_ins : 0, isPredicted: false };
          });
        const checkInsData = fillMonths(checkInsRes.data);
        setMonthlyCheckIns(selectedYear === 2025 ? [...checkInsData, ...predictedData2025] : checkInsData);
        setMonthlyMetrics(
          fillMonths(metricsRes.data, [
            "total_check_ins", "total_overnight", "total_occupied", "average_guest_nights",
            "average_room_occupancy_rate", "average_guests_per_room", "total_submissions", "submission_rate", "total_rooms"
          ])
        );
        setNationalityCounts(nationalityRes.data);
        setGuestDemographics(demographicsRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedYear, selectedMonth]);

  const formatMonth = m => new Date(2023, m - 1).toLocaleString("default", { month: "long" });
  const toNumber = (v, d = 0) => (isNaN(parseFloat(v)) ? d : parseFloat(v));

  return (
    <div>
      <h2>Main Dashboard</h2>
      <Filters
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        formatMonth={formatMonth}
      />
      {loading ? (
        <p>Loading monthly check-ins...</p>
      ) : (
        <LineChartComponent
          monthlyCheckIns={monthlyCheckIns}
          selectedYear={selectedYear}
          formatMonth={formatMonth}
        />
      )}
      <MonthlyMetrics
        monthlyMetrics={monthlyMetrics}
        selectedYear={selectedYear}
        formatMonth={formatMonth}
        toNumber={toNumber}
      />
      <GuestDemographics
        guestDemographics={guestDemographics}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        formatMonth={formatMonth}
      />
      <RegionalDistribution
        nationalityCounts={nationalityCounts}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        formatMonth={formatMonth}
      />
      <NationalityCounts
        nationalityCounts={nationalityCounts}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        formatMonth={formatMonth}
      />
    </div>
  );
};

export default MainDashboard;