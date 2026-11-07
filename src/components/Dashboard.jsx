import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Users,
  Calendar,
  TrendingUp,
  BarChart3,
  Activity,
  MoveRight,
  BookOpen,
} from "lucide-react";
import {
  getCurrentStudent,
  getStudentPerformance,
  getStudentSubjects,
} from "../api/client";
import StudentReport from "./Degrees/StudentReport";
import "../styles/App.scss";

export default function Dashboard() {

  const [student, setStudent] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const subjectIcons = {
    Calculator: <span style={{ fontSize: 20 }}>🧮</span>,
    Globe: <span style={{ fontSize: 20 }}>🌐</span>,
    BookOpen: <span style={{ fontSize: 20 }}>📖</span>,
    Atom: <span style={{ fontSize: 20 }}>⚛️</span>,
    Brain: <span style={{ fontSize: 20 }}>🧠</span>,
    Network: <span style={{ fontSize: 20 }}>🌐</span>,
    Award: <span style={{ fontSize: 20 }}>🏆</span>,
    Users: <span style={{ fontSize: 20 }}>👥</span>,
    BookMarked: <span style={{ fontSize: 20 }}>🔖</span>,
    Radio: <span style={{ fontSize: 20 }}>📻</span>,
    Landmark: <span style={{ fontSize: 20 }}>🏛️</span>,
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [studentData, perfData, subjectsData] = await Promise.all([
        getCurrentStudent(),
        getStudentPerformance(),
        getStudentSubjects(selectedMonth || undefined),
      ]);
      setStudent(studentData);
      setPerformance(perfData || []);
      setSubjects(subjectsData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const generalRate = performance.length > 0
    ? Number(performance[performance.length - 1]?.general_rate || 0)
    : 0;
  const avgScore =
    subjects.length > 0
      ? Math.round(
          subjects.reduce((sum, s) => {
            const maxScore = Number(s.max_score) || 0;
            return sum + (maxScore > 0 ? (Number(s.score) / maxScore) * 100 : 0);
          }, 0) /
            subjects.length
        )
      : 0;

  if (loading) {
    return (
      <div className="dashboard">
        <div className="back-link">
          <Link to="/"><MoveRight size={18} /> العودة الرئيسية</Link>
        </div>
        <div className="loader">جاري تحميل بيانات الطالب...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="back-link">
        <Link to="/"><MoveRight size={18} /> العودة الرئيسية</Link>
      </div>
      {error && (
        <div className="error-box">
          <p>{error}</p>
          <button onClick={fetchData}>محاولة مرة أخرى</button>
        </div>
      )}

      {!error && student && (
        <>
          <h1>لوحة التحكم - {student.grade_name || "الصف الأول"}</h1>

          <div className="info-cards">
            <div className="info-card">
              <Users size={32} />
              <div>
                <h3>الطالب</h3>
                <p>{student.full_name || "غير مسجل"}</p>
              </div>
            </div>
            <div className="info-card">
              <GraduationCap size={32} />
              <div>
                <h3>التخصص</h3>
                <p>{student.major_name || "عام"}</p>
              </div>
            </div>
            <div className="info-card">
              <TrendingUp size={32} />
              <div>
                <h3>المعدل العام</h3>
                <p>{generalRate}%</p>
              </div>
            </div>
            <div className="info-card">
              <BarChart3 size={32} />
              <div>
                <h3>متوسط الدرجات</h3>
                <p>{avgScore}/100</p>
              </div>
            </div>
          </div>

          <div className="month-selector">
            <p>اختيار الشهر:</p>
            {[
              { id: 1, name: "يناير" },
              { id: 2, name: "فبراير" },
              { id: 3, name: "مارس" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMonth(m.id)}
                className={selectedMonth === m.id ? "active" : ""}
              >
                {m.name}
              </button>
            ))}
          </div>

          <div className="performance-section">
            <h2><Activity size={24} /> التطور الشهري</h2>
            <StudentReport performance={performance} subjects={subjects} monthId={selectedMonth} />
            <div className="performance-list">
              {performance.map((p) => (
                <div key={p.month_id} className="perf-item">
                  <span>{p.month_name}</span>
                  <div className="perf-bar">
                    <div className="perf-fill" style={{ width: `${p.general_rate}%` }}></div>
                  </div>
                  <span>{p.general_rate}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="subjects-section">
            <h2><BookOpen size={24} /> المواد الدراسية</h2>
            <div className="subjects-grid">
              {subjects.map((subject) => (
                <Link
                  key={subject.id}
                  to={`/subject/${subject.subject_name_en}`}
                  className="subject-card-link"
                >
                  <div className="subject-card">
                    <div className="card-header">
                      <div className="icon-wrapper" style={{ backgroundColor: subject.color_hex }}>
                        {subjectIcons[subject.icon_name] || <BookOpen size={20} />}
                      </div>
                      <div className="names">
                        <h3>{subject.subject_name_en}</h3>
                        <p>{subject.subject_name_ar}</p>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="score-row">
                        <span>الدرجة</span>
                        <span className="score-val">{subject.score}/{subject.max_score}</span>
                      </div>
                      <div className="progress-container">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${subject.progress || 0}%` }}></div>
                        </div>
                      </div>
                      <p className="evaluation">{subject.evaluation}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}