import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// 1. البيانات: لاحظ أن كل كائن يمثل "شهر" ويحتوي على قيم كل المواد لذلك الشهر.
// هذه بيانات تجريبية تحاكي الصورة.
const performanceData = [
  { month: 'يناير', mathematics: 95, english: 90, physics: 88, communication: 82, career: 78, IT: 85, studies: 80, religion: 92, project: 98 },
  { month: 'فبراير', mathematics: 96, english: 91, physics: 90, communication: 85, career: 82, IT: 88, studies: 83, religion: 93, project: 99 },
  { month: 'مارس', mathematics: 98, english: 93, physics: 92, communication: 87, career: 85, IT: 90, studies: 86, religion: 95, project: 100 },
];

// 2. تخصيص الـ Tooltip لعرض اسم المادة بالوقوف عليها
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', direction: 'rtl' }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ margin: 0, color: entry.color, fontSize: '0.8rem' }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// 3. الـ Component الرئيسي
const SubjectsPerformanceChart = () => {
  return (
    // حاوية خارجية بنفس الستايل السابق (أبيض بظل خفيف وزوايا دائرية)
    <div style={{ background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', direction: 'rtl', fontFamily: 'Arial, sans-serif' }}>
      
      {/* عنوان الـ Chart */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>تطور درجات المواد الدراسية</h2>
      </div>

      {/* حاوية لجعل الـ Chart متجاوباً */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={performanceData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          {/* خطوط الشبكة الخلفية، تم تقليل عدد الخطوط العمودية */}
          <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#E0E0E0" />
          
          {/* محور X (الأشهر) */}
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            style={{ fontSize: '0.8rem', fill: '#666' }} 
          />
          
          {/* محور Y (الدرجات) بنفس تدريج الصورة */}
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            ticks={[0, 25, 50, 75, 100]} 
            style={{ fontSize: '0.8rem', fill: '#666' }}
            tickFormatter={(value) => `${value}`} // يمكنك إضافة % هنا إذا أردت
          />
          
          {/* الـ Tooltip الذي يظهر عند الوقوف على النقطة */}
          <Tooltip content={<CustomTooltip />} />

          {/* إضافة كل خط (Line) لكل مادة */}
          {/* ملاحظة: التدرجات اللونية تحاكي الصورة، و dataKey يطابق اسم الخاصية في البيانات */}
          <Line type="linear" dataKey="mathematics" name="رياضيات" stroke="#00C4DF" strokeWidth={2} dot={{ r: 4, stroke: '#00C4DF', strokeWidth: 1.5, fill: '#fff' }} />
          <Line type="linear" dataKey="english" name="لغة إنجليزية" stroke="#A855F7" strokeWidth={2} dot={{ r: 4, stroke: '#A855F7', strokeWidth: 1.5, fill: '#fff' }} />
          <Line type="linear" dataKey="physics" name="فيزياء" stroke="#EB144C" strokeWidth={2} dot={{ r: 4, stroke: '#EB144C', strokeWidth: 1.5, fill: '#fff' }} />
          <Line type="linear" dataKey="communication" name="مهارات التواصل" stroke="#F87171" strokeWidth={2} dot={{ r: 4, stroke: '#F87171', strokeWidth: 1.5, fill: '#fff' }} />
          <Line type="linear" dataKey="career" name="ريادة الأعمال" stroke="#FB923C" strokeWidth={2} dot={{ r: 4, stroke: '#FB923C', strokeWidth: 1.5, fill: '#fff' }} />
          <Line type="linear" dataKey="IT" name="تكنولوجيا المعلومات" stroke="#06B6D4" strokeWidth={2} dot={{ r: 4, stroke: '#06B6D4', strokeWidth: 1.5, fill: '#fff' }} />
          <Line type="linear" dataKey="studies" name="دراسات وطلبة" stroke="#F97316" strokeWidth={2} dot={{ r: 4, stroke: '#F97316', strokeWidth: 1.5, fill: '#fff' }} />
          <Line type="linear" dataKey="religion" name="تربية دينية" stroke="#60A5FA" strokeWidth={2} dot={{ r: 4, stroke: '#60A5FA', strokeWidth: 1.5, fill: '#fff' }} />
          <Line type="linear" dataKey="project" name="مشروع التخرج" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4, stroke: '#3B82F6', strokeWidth: 1.5, fill: '#fff' }} />
        </LineChart>
      </ResponsiveContainer>

      {/* الـ Legend في الأسفل، قمت بتنظيمه أفقياً مثل الصورة */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'x-small', marginTop: '30px', fontSize: '0.8rem', color: '#666' }}>
        <LegendItem color="#3B82F6" name="مشروع التخرج" />
        <LegendItem color="#60A5FA" name="تربية دينية" />
        <LegendItem color="#F97316" name="دراسات وطلبة" />
        <LegendItem color="#06B6D4" name="تكنولوجيا المعلومات" />
        <LegendItem color="#FB923C" name="ريادة الأعمال" />
        <LegendItem color="#F87171" name="مهارات التواصل" />
        <LegendItem color="#EB144C" name="فيزياء" />
        <LegendItem color="#A855F7" name="لغة إنجليزية" />
        <LegendItem color="#00C4DF" name="رياضيات" />
      </div>
    </div>
  );
};

// Component بسيط لعرض عنصر واحد في الـ Legend
const LegendItem = ({ color, name }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', margin: '0 5px' }}>
    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block' }}></span>
    {name}
  </div>
);

export default SubjectsPerformanceChart;