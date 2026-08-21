import React from 'react';
import { Link } from 'react-router-dom';
import { MoveRight, Calculator, Trophy, CheckSquare, Lightbulb, BookOpen, Globe } from 'lucide-react';
import '../../styles/App.scss';
import PerformanceChart from '../Degrees/Chart-com';
import SubjectsPerformanceChart from "../Degrees/Chart2-com";

export default function English() {
    const totalgrade = 85;
    let recommendation;

    if (totalgrade >= 90) {
        recommendation = (
            <div className="rec-card green-rec">
                <p>مستوى الطالب ممتاز في هذه المادة. يُنصح بالاستمرار في هذا الأداء المتميز.</p>
                <CheckSquare size={20} color="green" />
            </div>
        );
    } else if (totalgrade >= 75) {
        recommendation = (
            <div className="rec-card blue-rec">
                <p>مستوى الطالب جيد جداً. يُنصح بالتركيز على بعض النقاط البسيطة للوصول للامتياز.</p>
                <Lightbulb size={20} color="#3b82f6" />
            </div>
        );
    } else {
        recommendation = (
            <div className="rec-card yellow-rec">
                <p>يحتاج الطالب إلى بذل مجهود إضافي في هذه المادة ومراجعة الدروس بانتظام.</p>
                <BookOpen size={20} color="#eab308" />
            </div>
        );
    }

    return (
        <section className="subject-details-page">
            <div className="back-link">
                <Link to="/resault" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                    العودة للمواد <MoveRight size={18} />
                </Link>
            </div>
            <div className="resault container">
                <div id="subject-content" >
                <div className="subject-header">
                    <div className="title-area">
                        <h1>لغة إنجليزية</h1>
                        <span>English</span>
                    </div>
                    <div className="icon-wrapper" style={{ backgroundColor: "#a855f7" }}>
                        <Globe size={32} color="white" />
                    </div>
                </div>

                <div className="stats-cards">
                    <div className="stat-card">
                        <div className="stat-header">
                            <span>المشاركة</span>
                        </div>
                        <div className="stat-val">94%</div>
                        <div className="progress-bar-small"><div style={{ width: '94%' }}></div></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-header">
                            <span>الواجبات المنجزة</span>
                        </div>
                        <div className="stat-val">8/15</div>
                        <div className="progress-bar-small"><div style={{ width: '53%' }}></div></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-header">
                            <span>نسبة الحضور</span>
                        </div>
                        <div className="stat-val">84%</div>
                        <div className="progress-bar-small"><div style={{ width: '84%' }}></div></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-header">
                            <span>الدرجة الإجمالية</span>
                        </div>
                        <div className="stat-val">85/100</div>
                        <div className="progress-bar-small"><div style={{ width: '85%' }}></div></div>
                    </div>
                </div>

                <div className="last-exam-section">
                    <h3>نتيجة آخر امتحان</h3>
                    <div className="exam-card">
                        <div className="exam-info">
                            <div className="trophy-icon">
                                <Trophy size={20} color="black"/>
                            </div>
                            <div className="exam-score">
                                <span>الدرجة</span>
                                <h4>98/100</h4>
                            </div>
                        </div>
                        <div className="progress-bar-large"><div style={{ width: '98%' }}></div></div>
                    </div>
                </div>
                
                <div className="recommendations-section">
                    <h3>ملاحظات وتوصيات</h3>
                    {recommendation}
                </div>
                </div>
                <br/>
                <PerformanceChart />
                <br/>
                <SubjectsPerformanceChart />
            </div>
        </section>
    );
}
