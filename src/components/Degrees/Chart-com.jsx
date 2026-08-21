import "../../styles/App.scss";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// 1. بيانات تجريبية مشابهة للصورة
// يمكنك استبدالها ببيانات حقيقية من الـ API
const defaultPerformanceData = [
  { month: 'يناير', rate: 75, behavior: 70, attendance: 90 },
  { month: 'فبراير', rate: 78, behavior: 75, attendance: 92 },
  { month: 'مارس', rate: 82, behavior: 80, attendance: 95 },
];

// 2. تخصيص الـ Tooltip ليظهر باللغة العربية عند الوقوف على النقطة
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', direction: 'rtl' }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
        <p style={{ margin: 0, color: '#6B46C1' }}>
          {`المعدل العام: ${payload[0].value}%`}
        </p>
      </div>
    );
  }
  return null;
};

// 3. الـ Component الرئيسي
const PerformanceChart = ({ data = defaultPerformanceData }) => {
  const performanceData = data.length ? data : defaultPerformanceData;

  return (
    // حاوية خارجية بستايل مشابه للصورة (أبيض بظل خفيف وزوايا دائرية)
    <div style={{ background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', direction: 'rtl', fontFamily: 'Arial, sans-serif' }}>
      
      {/* رأس الـ Chart */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
          <span style={{ marginLeft: '10px', display: 'inline-block', transform: 'scaleX(-1)' }}>📈</span>
          تطور الأداء خلال الأشهر الثلاثة
        </h2>
      </div>
      <p style={{ color: '#666', marginBottom: '30px', fontSize: '1rem' }}>المؤشرات العامة</p>

      {/* حاوية لجعل الـ Chart متجاوباً */}
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={performanceData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          {/* تعريف التدرج اللوني (Gradient) */}
          <defs>
            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
              {/* اللون العلوي الأزرق الفاتح */}
              <stop offset="5%" stopColor="#4184F3" stopOpacity={0.8}/>
              {/* التلاشي التدريجي للأبيض */}
              <stop offset="95%" stopColor="#4184F3" stopOpacity={0}/>
            </linearGradient>
          </defs>

          {/* خطوط الشبكة الخلفية */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
          
          {/* محور X (الأشهر) */}
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            style={{ fontSize: '0.8rem', fill: '#666' }} 
          />
          
          {/* محور Y (النسبة المئوية) */}
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            ticks={[0, 25, 50, 75, 100]} 
            style={{ fontSize: '0.8rem', fill: '#666' }}
            tickFormatter={(value) => `${value}`} // يمكنك إضافة % هنا إذا أردت
          />
          
          {/* الـ Tooltip الذي يظهر عند الوقوف على الـ Chart */}
          <Tooltip content={<CustomTooltip />} />

          {/* المساحة الملونة مع الخط */}
          <Area 
            type="monotone" // لجعل الخط منحنياً بنعومة
            dataKey="rate" 
            stroke="#4184F3" // لون الخط الرئيسي
            strokeWidth={3} // سمك الخط
            fillOpacity={1} 
            fill="url(#colorRate)" // استخدام التدرج اللوني الذي عرفناه في defs
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 3, fill: '#4184F3' }} // شكل النقطة عند التفاعل
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* الـ Legend في الأسفل */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px', fontSize: '0.9rem', color: '#666' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#6B46C1', display: 'inline-block' }}></span>
          المعدل العام
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38A169', display: 'inline-block' }}></span>
          السلوك
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3182CE', display: 'inline-block' }}></span>
          الحضور
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
