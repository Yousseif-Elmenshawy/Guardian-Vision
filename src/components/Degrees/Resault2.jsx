import "../../styles/App.scss";
import { Link, useLocation } from "react-router-dom";
import { MoveRight, GraduationCap, Calendar, Calculator, Globe, BookOpen, Atom, Brain, Network, Award, Users, BookMarked, Radio, Wifi } from "lucide-react";
import PerformanceChart from "./Chart-com";
import { useEffect, useState } from "react";
import SubjectsPerformanceChart from "./Chart2-com";
import { getCurrentStudent, getSavedStudent, getStudentPerformance, getStudentSubjects } from "../../api/client";

const months = [
    {
        id: 1,
        name: "يناير",
    },
    {
        id: 2,
        name: "فبراير",
    },
    {
        id: 3,
        name: "مارس",
    }
]

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
    progress: Number(subject.score),
    icon: subjectIcons[subject.icon_name] || <BookOpen size={20} color="white" />,
    colorIcon: subject.color_hex,
    evaluation: subject.evaluation,
});

const mapPerformanceFromApi = (item) => ({
    month: item.month_name,
    rate: Number(item.general_rate),
    behavior: Number(item.behavior_rate),
    attendance: Number(item.attendance_rate),
});

export default function Resault() {
    const location = useLocation();
    const major = location.state?.major || "غير محدد";
    const majorKey = location.state?.majorKey || "IT";

    const majorSubjectDetails = {
        "IT": { name: "IT", arabicName: "تكنولوجيا المعلومات", icon: <BookMarked size={20} color="white" />, colorIcon: "#ec4899" },
        "Communications": { name: "Communications", arabicName: "اتصالات", icon: <Radio size={20} color="white" />, colorIcon: "#ec4899" },
        "Networking": { name: "Networking", arabicName: "الشبكات", icon: <Wifi size={20} color="white" />, colorIcon: "#ec4899" }
    };
    const currentMajorDetails = majorSubjectDetails[majorKey] || majorSubjectDetails["IT"];

    const defaultSubjects = [
        { id: 1, name:"Math", arabicName: "رياضيات", progress: 85, icon: <Calculator size={20} color="white" />, colorIcon: "#3b82f6", evaluation: "جيد جداً" },
        { id: 2, name: "English", arabicName: "لغة إنجليزية", progress: 78, icon: <Globe size={20} color="white" />, colorIcon: "#a855f7", evaluation: "جيد جداً" },
        { id: 3, name: "Arabic", arabicName: "لغة عربية", progress: 88, icon: <BookOpen size={20} color="white" />, colorIcon: "#10b981", evaluation: "جيد جداً" },
        { id: 4, name: "Physics", arabicName: "فيزياء", progress: 88, icon: <Atom size={20} color="white" />, colorIcon: "#22c55e", evaluation: "جيد جداً" },
        { id: 5, name: "TCS", arabicName: "مهارات التواصل التقني", progress: 92, icon: <Brain size={20} color="white" />, colorIcon: "#6366f1", evaluation: "ممتاز" },
        { id: 6, name: "CDC", arabicName: "التوجيه والارشاد وريادة الأعمال", progress: 80, icon: <Network size={20} color="white" />, colorIcon: "#eab308", evaluation: "جيد جداً" },
        { id: 7, name: currentMajorDetails.name, arabicName: currentMajorDetails.arabicName, progress: 90, icon: currentMajorDetails.icon, colorIcon: currentMajorDetails.colorIcon, evaluation: "ممتاز" },
        { id: 8, name: "Capstone", arabicName: "مشروع التخرج", progress: 98, icon: <Award size={20} color="white" />, colorIcon: "#14b8a6", evaluation: "ممتاز" },
        { id: 9, name: "Social studies", arabicName: "دراسات اجتماعية", progress: 85, icon: <Users size={20} color="white" />, colorIcon: "#f97316", evaluation: "جيد جداً" }
    ];

    const [selectedMonth, setSelectedMonth] = useState(null);
    const [student, setStudent] = useState(getSavedStudent());
    const [subjects, setSubjects] = useState(defaultSubjects);
    const [performanceData, setPerformanceData] = useState([]);
    const [apiError, setApiError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [studentData, performance, subjectScores] = await Promise.all([
                    getCurrentStudent(),
                    getStudentPerformance(),
                    getStudentSubjects(),
                ]);
                setStudent(studentData);
                setPerformanceData(performance.map(mapPerformanceFromApi));
                if (subjectScores.length) {
                    setSubjects(subjectScores.map(mapSubjectFromApi));
                }
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
            if (subjectScores.length) {
                setSubjects(subjectScores.map(mapSubjectFromApi));
            }
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
                <SubjectsPerformanceChart />
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
                                        <span className="score">{subject.progress}/100</span>
                                    </div>
                                    <div className="progress-container">
                                        <div className="progress-bar" style={{ width: `${subject.progress}%` }}></div>
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
