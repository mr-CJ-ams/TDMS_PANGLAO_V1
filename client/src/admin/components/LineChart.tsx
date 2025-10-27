import { useCallback } from "react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from "recharts";
import { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

interface MonthlyCheckIn {
  month: number;
  total_check_ins: number;
  isPredicted?: boolean;
}

interface LineChartComponentProps {
  monthlyCheckIns: MonthlyCheckIn[];
  selectedYear: number;
  formatMonth: (month: number) => string;
}

// Actual data for 2022 (all months)
const actualData2022: MonthlyCheckIn[] = [
  { month: 1, total_check_ins: 7029, isPredicted: true },
  { month: 2, total_check_ins: 15450, isPredicted: true },
  { month: 3, total_check_ins: 23567, isPredicted: true },
  { month: 4, total_check_ins: 21597, isPredicted: true },
  { month: 5, total_check_ins: 21765, isPredicted: true },
  { month: 6, total_check_ins: 33630, isPredicted: true },
  { month: 7, total_check_ins: 36175, isPredicted: true },
  { month: 8, total_check_ins: 38115, isPredicted: true },
  { month: 9, total_check_ins: 29633, isPredicted: true },
  { month: 10, total_check_ins: 35641, isPredicted: true },
  { month: 11, total_check_ins: 37466, isPredicted: true },
  { month: 12, total_check_ins: 50383, isPredicted: true },
];

// Actual data for 2023 (all months)
const actualData2023: MonthlyCheckIn[] = [
  { month: 1, total_check_ins: 55321, isPredicted: true },
  { month: 2, total_check_ins: 52341, isPredicted: true },
  { month: 3, total_check_ins: 55664, isPredicted: true },
  { month: 4, total_check_ins: 57980, isPredicted: true },
  { month: 5, total_check_ins: 55678, isPredicted: true },
  { month: 6, total_check_ins: 56624, isPredicted: true },
  { month: 7, total_check_ins: 61441, isPredicted: true },
  { month: 8, total_check_ins: 68938, isPredicted: true },
  { month: 9, total_check_ins: 55246, isPredicted: true },
  { month: 10, total_check_ins: 55503, isPredicted: true },
  { month: 11, total_check_ins: 59808, isPredicted: true },
  { month: 12, total_check_ins: 68828, isPredicted: true },
];

// Actual data for 2024 (all months)
const actualData2024: MonthlyCheckIn[] = [
  { month: 1, total_check_ins: 72264, isPredicted: true },
  { month: 2, total_check_ins: 65976, isPredicted: true },
  { month: 3, total_check_ins: 67741, isPredicted: true },
  { month: 4, total_check_ins: 71858, isPredicted: true },
  { month: 5, total_check_ins: 72783, isPredicted: true },
  { month: 6, total_check_ins: 66344, isPredicted: true },
  { month: 7, total_check_ins: 71180, isPredicted: true },
  { month: 8, total_check_ins: 74329, isPredicted: true },
  { month: 9, total_check_ins: 63784, isPredicted: true },
  { month: 10, total_check_ins: 66896, isPredicted: true },
  { month: 11, total_check_ins: 79680, isPredicted: true },
  { month: 12, total_check_ins: 84679, isPredicted: true },
];

// Predicted data for 2024 (June–December)
const predictedData2024: MonthlyCheckIn[] = [
  { month: 6, total_check_ins: 65270, isPredicted: true },
  { month: 7, total_check_ins: 68691, isPredicted: true },
  { month: 8, total_check_ins: 67953, isPredicted: true },
  { month: 9, total_check_ins: 63336, isPredicted: true },
  { month: 10, total_check_ins: 67377, isPredicted: true },
  { month: 11, total_check_ins: 70662, isPredicted: true },
  { month: 12, total_check_ins: 72353, isPredicted: true },
];

// Predicted data for 2025 (full year)
const predictedData2025: MonthlyCheckIn[] = [
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

const LineChartComponent: React.FC<LineChartComponentProps> = ({
  monthlyCheckIns,
  selectedYear,
  formatMonth
}) => {
  // Use abbreviated month names for X-Axis
  const formatMonthAbbr = (m: number): string => {
    const abbrMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return abbrMonths[m - 1] || "";
  };

  // Merge actual and predicted data for 2022, 2023, 2024, predicted for 2025
  let chartData: Array<any> = [];
  if (selectedYear === 2022) {
    chartData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const actual = actualData2022.find(a => a.month === month);
      return {
        month,
        actual_check_ins: actual ? actual.total_check_ins : 0,
        predicted_check_ins: undefined,
      };
    });
  } else if (selectedYear === 2023) {
    chartData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const actual = actualData2023.find(a => a.month === month);
      return {
        month,
        actual_check_ins: actual ? actual.total_check_ins : 0,
        predicted_check_ins: undefined,
      };
    });
  } else if (selectedYear === 2024) {
    chartData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const actual = actualData2024.find(a => a.month === month);
      const predicted = predictedData2024.find(p => p.month === month);
      return {
        month,
        actual_check_ins: actual ? actual.total_check_ins : 0,
        predicted_check_ins: predicted ? predicted.total_check_ins : undefined,
      };
    });
  } else if (selectedYear === 2025) {
    chartData = monthlyCheckIns.map((actual, idx) => ({
      month: actual.month,
      actual_check_ins: actual.total_check_ins,
      predicted_check_ins: predictedData2025[idx]?.total_check_ins ?? 0,
    }));
  } else {
    chartData = monthlyCheckIns.map(actual => ({
      month: actual.month,
      actual_check_ins: actual.total_check_ins,
      predicted_check_ins: undefined,
    }));
  }

  const CustomTooltip = useCallback((
    { active, payload, label }: TooltipProps<ValueType, NameType>
  ) => {
    if (active && payload && payload.length) {
      const month = formatMonth(Number(label));
      const actualArrivals = payload.find((entry) => entry.name === "Actual Arrivals")?.value;
      const predictedArrivals = payload.find((entry) => entry.name === "Predicted Arrivals")?.value;

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
          {predictedArrivals !== undefined &&
            <p style={{ color: "#FF6F00" }}>Predicted Arrivals: {predictedArrivals}</p>
          }
        </div>
      );
    }
    return null;
  }, [formatMonth]);

  // Calculate max value for Y-axis dynamically
  const maxY = Math.max(
    ...chartData.map(d => Math.max(
      Number(d.actual_check_ins) || 0,
      Number(d.predicted_check_ins) || 0
    ))
  );
  const yDomain = [0, Math.ceil(maxY * 1.1)];

  // Generate Y-axis ticks every 10000 units
  const yTicks = [];
  for (let i = 0; i <= yDomain[1]; i += 10000) {
    yTicks.push(i);
  }

  return (
    <div>
      <div style={{ width: "100%", overflowX: "auto" }}>
        <div style={{ minWidth: 700, width: "100%" }}>
          <ResponsiveContainer width="100%" height={400}>
            <RechartsLineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="beachGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E0F7FA" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#FFF3E0" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <rect x={0} y={0} width="100%" height="100%" fill="url(#beachGradient)" />

              <CartesianGrid strokeDasharray="3 3" stroke="#B0BEC5" strokeOpacity={0.5} />

              <XAxis
                dataKey="month"
                tickFormatter={formatMonthAbbr}
                tick={{ fill: "#37474F", fontSize: 12, fontWeight: "bold" }}
                axisLine={{ stroke: "#37474F", strokeWidth: 1 }}
              />

              <YAxis
                tick={{ fill: "#37474F", fontSize: 12, fontWeight: "bold" }}
                axisLine={{ stroke: "#37474F", strokeWidth: 1 }}
                domain={yDomain}
                ticks={yTicks}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                  color: "#37474F",
                }}
              />

              <Line
                type="monotone"
                dataKey="actual_check_ins"
                stroke="#0288D1"
                activeDot={{ r: 8, fill: "#0288D1" }}
                name="Actual Arrivals"
                strokeOpacity={0.8}
                dot={false}
                strokeWidth={2}
              />
              {(selectedYear === 2024 || selectedYear === 2025) && (
                <Line
                  type="monotone"
                  dataKey="predicted_check_ins"
                  stroke="#FF6F00"
                  name="Predicted Arrivals"
                  strokeDasharray="5 5"
                  dot={false}
                  strokeWidth={2}
                />
              )}
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default LineChartComponent;
