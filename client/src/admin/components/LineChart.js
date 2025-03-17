// src/admin/components/LineChart.js
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const LineChartComponent = ({ monthlyCheckIns, selectedYear, formatMonth }) => {
  // Custom Tooltip to display month, actual arrivals, and prediction
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const month = formatMonth(label); // Format the month
      const actualArrivals = payload.find((entry) => entry.name === "Actual Arrivals")?.value;
      const predictedArrivals = payload.find((entry) => entry.name === "Prediction of Arrivals")?.value;

      return (
        <div style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #B0BEC5",
          borderRadius: "8px",
          padding: "12px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        }}>
          <p style={{ fontWeight: "bold", color: "#263238", marginBottom: "8px" }}>{month}</p>
          <p style={{ color: "#0288D1" }}>Actual Arrivals: {actualArrivals}</p>
          {predictedArrivals !== undefined && (
            <p style={{ color: "#FF6F00" }}>Prediction of Arrivals: {predictedArrivals}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={monthlyCheckIns}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          {/* Simplified background */}
          <defs>
            <linearGradient id="beachGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E0F7FA" stopOpacity={0.8} /> {/* Light Cyan */}
              <stop offset="95%" stopColor="#FFF3E0" stopOpacity={0.8} /> {/* Light Peach */}
            </linearGradient>
          </defs>
          <rect x={0} y={0} width="100%" height="100%" fill="url(#beachGradient)" />

          {/* Cartesian Grid with subtle styling */}
          <CartesianGrid strokeDasharray="3 3" stroke="#B0BEC5" strokeOpacity={0.5} />

          {/* XAxis with clean, readable styling */}
          <XAxis
            dataKey="month"
            tickFormatter={formatMonth}
            tick={{ fill: "#37474F", fontSize: 12, fontWeight: "bold" }} // Dark gray text
            axisLine={{ stroke: "#37474F", strokeWidth: 1 }} // Dark gray axis line
          />

          {/* YAxis with clean, readable styling */}
          <YAxis
            tick={{ fill: "#37474F", fontSize: 12, fontWeight: "bold" }} // Dark gray text
            axisLine={{ stroke: "#37474F", strokeWidth: 1 }} // Dark gray axis line
          />

          {/* Custom Tooltip */}
          <Tooltip content={<CustomTooltip />} />

          {/* Legend with clean, readable styling */}
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              color: "#37474F", // Dark gray text for contrast
            }}
          />

          {/* Actual Arrivals Line */}
          <Line
            type="monotone"
            dataKey="total_check_ins"
            stroke="#0288D1" // Deep sky blue for the line
            activeDot={{ r: 8, fill: "#0288D1" }} // Deep sky blue active dot
            name="Actual Arrivals"
            strokeOpacity={0.8}
            dot={false}
            strokeWidth={2}
          />

          {/* Prediction of Arrivals Line (only for 2025) */}
          {selectedYear === 2025 && (
            <Line
              type="monotone"
              dataKey="total_check_ins"
              stroke="#FF6F00" // Amber color for the prediction line
              name="Prediction of Arrivals"
              strokeOpacity={0.8}
              dot={false}
              strokeWidth={2}
              data={monthlyCheckIns.filter((d) => d.isPredicted)}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <a
          href="https://colab.research.google.com/drive/1bu_JoysTvJXpopbX-EA9LscEXdfCl921#scrollTo=bk8J7IJiVnGG"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: "#0288D1",
            color: "#FFFFFF",
            padding: "10px 20px",
            borderRadius: "5px",
            textDecoration: "none",
            fontSize: "16px",
            fontWeight: "bold",
            display: "inline-block",
          }}
        >
          Learn More About Prediction Factors
        </a>
      </div>
    </div>
  );
};

export default LineChartComponent;