import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const colors = [
  "#00C4DF",
  "#A855F7",
  "#EB144C",
  "#F87171",
  "#FB923C",
  "#06B6D4",
  "#F97316",
  "#60A5FA",
  "#3B82F6",
  "#10B981",
  "#EAB308",
  "#EC4899",
];

export default function SubjectsPerformanceChart({ data = [] }) {
  const subjects = [...new Map(data.map((item) => [item.id, item])).values()];
  const months = [...new Set(data.map((item) => item.month))];
  const chartData = months.map((month) => {
    const row = { month };
    data
      .filter((item) => item.month === month)
      .forEach((item) => {
        row[`subject_${item.id}`] = item.progress;
      });
    return row;
  });

  return (
    <div
      style={{
        background: "#fff",
        padding: "30px",
        borderRadius: "15px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        direction: "rtl",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "0 0 30px" }}>
        تطور درجات المواد الدراسية
      </h2>
      {!chartData.length ? (
        <p>لا توجد درجات كافية لعرض الرسم البياني.</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip />
              {subjects.map((subject, index) => (
                <Line
                  key={subject.id}
                  type="monotone"
                  dataKey={`subject_${subject.id}`}
                  name={subject.arabicName || subject.name}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  connectNulls
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "12px",
              marginTop: "24px",
              fontSize: "0.8rem",
              color: "#666",
            }}
          >
            {subjects.map((subject, index) => (
              <span key={subject.id}>
                <i
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: colors[index % colors.length],
                    marginLeft: 5,
                  }}
                />
                {subject.arabicName || subject.name}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
