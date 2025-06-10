
import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";
import * as XLSX from "xlsx"; // For Excel file generation
import { saveAs } from "file-saver"; // For file download
import Filters from "../components/Filters";
import MonthlyMetrics from "../components/MonthlyMetrics";
import LineChartComponent from "../components/LineChart";
import GuestDemographics from "../components/GuestDemographics";
import NationalityCounts from "../components/NationalityCounts";
import RegionalDistribution from "../components/RegionalDistribution";



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
    { month: 1, total_check_ins: 72807, isPredicted: true },
    { month: 2, total_check_ins: 71334, isPredicted: true },
    { month: 3, total_check_ins: 69434, isPredicted: true },
    { month: 4, total_check_ins: 72970, isPredicted: true },
    { month: 5, total_check_ins: 73620, isPredicted: true },
    { month: 6, total_check_ins: 70163, isPredicted: true },
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
          total_rooms: monthData ? monthData.total_rooms : 0, // Ensure this line is added
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

  


  // Format month names
  const formatMonth = (month) => {
    const date = new Date(2023, month - 1); // Use any year (2023 is arbitrary)
    return date.toLocaleString("default", { month: "long" });
  };

  
  const toNumber = (value, defaultValue = 0) => {
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  };

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