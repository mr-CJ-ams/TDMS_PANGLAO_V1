/**
 * MainDashboard.tsx
 * 
 * Panglao Tourist Data Management System - Main Dashboard Component (Frontend)
 * 
 * =========================
 * Overview:
 * =========================
 * This React component serves as the main statistics dashboard for both admin and authenticated users in the Panglao TDMS frontend.
 * It aggregates, visualizes, and presents key analytics for Panglao tourism, including monthly check-ins, metrics, guest demographics, nationality counts, and regional distribution.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Fetches monthly check-in data, metrics, nationality counts, and guest demographics from the backend API.
 * - Renders interactive charts and tables for visualizing tourism statistics.
 * - Provides year and month filters for dynamic data selection.
 * - Fills missing months with zeroes to ensure complete data visualization.
 * - Displays predicted data for future months (e.g., 2025) when available.
 * - Integrates subcomponents for line charts, metrics tables, demographics, regional distribution, and nationality breakdowns.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Uses axios for API communication and sessionStorage for authentication.
 * - Responsive and modular UI with reusable subcomponents (LineChartComponent, MonthlyMetrics, GuestDemographics, NationalityCounts, RegionalDistribution).
 * - Efficient data fetching with Promise.all and error handling.
 * - Dynamic data filling for months with missing statistics.
 * - Supports both admin and user roles for viewing Panglao-wide statistics.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Used in the admin dashboard and user dashboard (Panglao Statistics section) to visualize system-wide tourism analytics.
 * - Allows admins and users to analyze trends, review metrics, and export data for reporting.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - Update API endpoints or data structure as backend requirements change.
 * - Extend subcomponents or add new analytics features as needed.
 * - Ensure predicted data logic is updated for future years.
 * - For new filters or metrics, update the Filters and MonthlyMetrics components accordingly.
 * 
 * =========================
 * Related Files:
 * =========================
 * - src/admin/components/LineChart.tsx           (monthly check-ins chart)
 * - src/admin/components/MonthlyMetrics.tsx      (metrics table)
 * - src/admin/components/GuestDemographics.tsx   (guest demographics table)
 * - src/admin/components/NationalityCounts.tsx   (nationality breakdown)
 * - src/admin/components/RegionalDistribution.jsx (regional distribution chart)
 * - server/controllers/adminController.js        (backend analytics logic)
 * - server/routes/admin.js                       (defines backend analytics endpoints)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

import { useState, useEffect } from "react";
import axios from "axios";
import Filters from "../components/Filters";
import MonthlyMetrics from "../components/MonthlyMetrics";
import LineChartComponent from "../components/LineChart";
import GuestDemographics from "../components/GuestDemographics";
import NationalityCounts from "../components/NationalityCounts";
import RegionalDistribution from "../components/RegionalDistribution";


interface CheckInData {
  month: number;
  total_check_ins: number;
  isPredicted?: boolean;
}

interface MonthlyMetric {
  month: number;
  total_check_ins: number;
  total_overnight: number;
  total_occupied: number;
  average_guest_nights: number;
  average_room_occupancy_rate: number;
  average_guests_per_room: number;
  total_submissions: number;
  submission_rate: number;
  total_rooms: number;
}

interface NationalityCount {
  nationality: string;
  count: number;
  male_count: number;
  female_count: number;
}

interface DemographicData {
  // Define the structure based on your actual data
  age_group: string;
  gender: string;
  status: string;
  count: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const predictedData2025: CheckInData[] = [
  { month: 1, total_check_ins: 72807, isPredicted: true },
  { month: 2, total_check_ins: 71334, isPredicted: true },
  { month: 3, total_check_ins: 69434, isPredicted: true },
  { month: 4, total_check_ins: 72970, isPredicted: true },
  { month: 5, total_check_ins: 73620, isPredicted: true },
  { month: 6, total_check_ins: 70163, isPredicted: true },
  { month: 7, total_check_ins: 0, isPredicted: true },
  { month: 8, total_check_ins: 0, isPredicted: true },
  { month: 9, total_check_ins: 0, isPredicted: true },
  { month: 10, total_check_ins: 0, isPredicted: true },
  { month: 11, total_check_ins: 0, isPredicted: true },
  { month: 12, total_check_ins: 0, isPredicted: true },
];

interface MainDashboardProps {
  user?: {
    role: string;
  };
}

const MainDashboard = ({ user }: MainDashboardProps) => {
  const [monthlyCheckIns, setMonthlyCheckIns] = useState<CheckInData[]>([]);
  const [monthlyMetrics, setMonthlyMetrics] = useState<MonthlyMetric[]>([]);
  const [nationalityCounts, setNationalityCounts] = useState<NationalityCount[]>([]);
  const [guestDemographics, setGuestDemographics] = useState<DemographicData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const [checkInsRes, metricsRes, nationalityRes, demographicsRes] = await Promise.all([
          axios.get<CheckInData[]>(`${API_BASE_URL}/admin/monthly-checkins`, { 
            headers: { Authorization: `Bearer ${token}` }, 
            params: { year: selectedYear } 
          }),
          axios.get<MonthlyMetric[]>(`${API_BASE_URL}/admin/monthly-metrics`, { 
            headers: { Authorization: `Bearer ${token}` }, 
            params: { year: selectedYear } 
          }),
          axios.get<NationalityCount[]>(`${API_BASE_URL}/admin/nationality-counts`, { 
            headers: { Authorization: `Bearer ${token}` }, 
            params: { year: selectedYear, month: selectedMonth } 
          }),
          axios.get<DemographicData[]>(`${API_BASE_URL}/admin/guest-demographics`, { 
            headers: { Authorization: `Bearer ${token}` }, 
            params: { year: selectedYear, month: selectedMonth } 
          }),
        ]);

        const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);
        
        const fillMonths = <T extends { month: number }>(
          data: T[], 
          keys: Array<keyof T> = []
        ): T[] => {
          return allMonths.map(month => {
            const d = data.find(x => x.month === month);
            if (keys.length > 0) {
              return keys.reduce((acc, k) => ({ 
                ...acc, 
                [k]: d ? d[k] : 0,
                month
              }), {} as T);
            }
            return { 
              month, 
              total_check_ins: d ? (d as unknown as CheckInData).total_check_ins : 0, 
              isPredicted: false 
            } as unknown as T;
          });
        };

        const checkInsData = fillMonths<CheckInData>(checkInsRes.data);
        setMonthlyCheckIns(
          selectedYear === 2025 ? [...checkInsData, ...predictedData2025] : checkInsData
        );
        
        setMonthlyMetrics(
          fillMonths<MonthlyMetric>(metricsRes.data, [
            "total_check_ins", "total_overnight", "total_occupied", "average_guest_nights",
            "average_room_occupancy_rate", "average_guests_per_room", "total_submissions", 
            "submission_rate", "total_rooms"
          ])
        );
        
        setNationalityCounts(nationalityRes.data);
        setGuestDemographics(demographicsRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedMonth]);

  const formatMonth = (m: number): string => 
    new Date(2023, m - 1).toLocaleString("default", { month: "long" });

  const toNumber = (v: string | number, d: number = 0): number => 
    isNaN(parseFloat(v as string)) ? d : parseFloat(v as string);

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
        user={user}
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