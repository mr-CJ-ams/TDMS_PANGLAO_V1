// src/admin/components/LineChart.js
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const LineChartComponent = ({ monthlyCheckIns, selectedYear, formatMonth }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={monthlyCheckIns}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tickFormatter={formatMonth} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="total_check_ins"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
          name="Actual Guest Check-In"
          strokeOpacity={0.8}
          dot={false}
        />
        {selectedYear === 2025 && (
          <Line
            type="monotone"
            dataKey="total_check_ins"
            stroke="#ff0000"
            strokeDasharray="5 5"
            name="Prediction of Guest Check-In"
            strokeOpacity={0.8}
            dot={false}
            data={monthlyCheckIns.filter((d) => d.isPredicted)}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;