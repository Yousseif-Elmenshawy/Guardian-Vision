import "../../styles/App.scss";
import { Link, useLocation } from "react-router-dom";
import { MoveRight, GraduationCap, Calendar, Calculator, Globe, BookOpen, Atom, Brain, Network, Award, Users, BookMarked, Radio, Wifi } from "lucide-react";
import PerformanceChart from "./Chart-com";
import { useEffect, useState } from "react";
import SubjectsPerformanceChart from "./Chart2-com";
import { getCurrentStudent, getSavedStudent, getStudentPerformance, getStudentSubjects } from "../../api/client";
import StudentReport from "./StudentReport";

const months = [
    { id: 1, name: "يناير" },
    { id: 2, name: "فبراير" },
    { id: 3, name: "مارس" }
];

const subjectIcons = {
    Calculator: <Calculator size={20} color="white" />,
    Globe: <Globe size={20} color="white" />,
    BookOpen: <BookOpen size={20} color="white" />,
    Atom: <Atom size={20} color="white" />,
    Brain: <Brain size={20} color="white" />,
    Network: <Network size={20} color="white" />,
    Award: <Award size={20} color="white" />,
    Users: <Users size={20} color="white" />,
    BookMarked: <BookMarked size={20} color="white" />,
    Radio: <Radio size={20} color="white" />,
    Wifi: <Wifi size={20} color="white" />,
};

const mapSubjectFromApi = (subject) => ({
    id: subject.subject_id,
    name: subject.subject_name_en,
    arabicName: subject.subject_name_ar,
    score: Number(subject.score),
    maxScore: Number(subject.max_score),
    progress: Number(subject.max_score) > 0 ? (Number(subject.score) / Number(subject.max_score)) * 100 : 0,
    month: subject.month_name,
    icon: subjectIcons[subject.icon_name] || <BookOpen size={20} color="white" />,
    colorIcon: subject.color_hex,
    evaluation: subject.evaluation,
    recommendation: subject.recommendation,
});

const mapPerformanceFromApi = (item) => ({
    month_id: item.month_id,
    month: item.month_name,
    month_name: item.month_name,
    rate: Number(item.general_rate),
    behavior: Number(item.behavior_rate),
    attendance: Number(item.attendance_rate),
});

export default function Resault() {
    const location = useLocation();
    const major = location.state?.major || "غير محدد";







    const [selectedMonth, setSelectedMonth] = useState(null);
    const [student, setStudent] = useState(getSavedStudent());
    const [subjects, setSubjects] = useState([]);
    const [subjectHistory, setSubjectHistory] = useState([]);
    const [performanceData, setPerformanceData] = useState([]);
    const [apiError, setApiError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [studentData, performance, subjectScores, history] = await Promise.all([
                    getCurrentStudent(),
                    getStudentPerformance(),
                    getStudentSubjects(),
                    Promise.all(months.map((month) => getStudentSubjects(month.id))),
                ]);
                setStudent(studentData);
                setPerformanceData((performance || []).map(mapPerformanceFromApi));
                setSubjects((subjectScores || []).map(mapSubjectFromApi));
                setSubjectHistory(
                    history.flatMap((monthScores) => monthScores || []).map(mapSubjectFromApi)
                );
                setApiError("");
            } catch (error) {
                setApiError(error.message);
            }
        };

        loadDashboard();
    }, []);

    const handleMonthClick = async (month) => {
        setSelectedMonth(month);
        try {
            const subjectScores = await getStudentSubjects(month);
            setSubjects((subjectScores || []).map(mapSubjectFromApi));
            setApiError("");
        } catch (error) {
            setApiError(error.message);
        }
    };
    return (
        <section>
            <div className="resault">
                <div className="back-link">
                    <Link to="/"><MoveRight size={18} /> العودة الرئيسية</Link>
                </div>
                <br />
                <h1>لوحه التحكم - {student?.grade_name || "الصف الثاني"}</h1>
                <div className="major-box">
                    <p className="major"><GraduationCap size={24} /> التخصص: {student?.major_name || major}</p>
                </div>
                <div className="major-box">
                    <p className="major"><Users size={24} /> الطالب: {student?.full_name || "غير مسجل"}</p>
                </div>
                {apiError && <p style={{ color: "red", textAlign: "center" }}>{apiError}</p>}
                <p className="description">متابعه شامله لي مستوى الطالب الاكاديمى</p>
                <StudentReport performance={performanceData} subjects={subjects} monthId={selectedMonth} />
                <div className="month">
                    <p className="month-title"><Calendar size={24} /> اختيار الشهر:</p>
                    {months.map((month) => (
                        <div key={month.id} onClick={() => handleMonthClick(month.id)} className={`month-box ${selectedMonth === month.id ? "focused1" : ""}`}>
                            <p>{month.name}</p>
                        </div>
                    ))}
                </div>
                <PerformanceChart data={performanceData} />
                <br />
                <SubjectsPerformanceChart data={subjectHistory} />
                <div className="subjects">
                    <div className="subjects-title" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '10px' }}>
                        <BookOpen size={28} />
                        <h2>المواد الدراسية</h2>
                    </div>
                    <div className="subjects-content">
                        {subjects.map((subject) => (
                            <Link key={subject.id} to={`/subject/${subject.name}`} className="subject-card" style={{textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column'}}>
                                <div className="card-header">
                                    <div className="icon-wrapper" style={{ backgroundColor: subject.colorIcon }}>
                                        {subject.icon}
                                    </div>
                                    <div className="names">
                                        <h3>{subject.name}</h3>
                                        <p>{subject.arabicName}</p>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="score-text">
                                        <span>الدرجة</span>
                                        <span className="score">{subject.score}/{subject.maxScore}</span>
                                    </div>
                                    <div className="progress-container">
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${subject.progress}%` }}></div>
                                        </div>
                                    </div>
                                    <p className="evaluation">{subject.evaluation}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}