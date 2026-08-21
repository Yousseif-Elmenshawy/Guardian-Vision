import { Link } from "react-router-dom";
import { GraduationCap, School, BookOpen, ShoppingBag, ArrowLeft } from "lucide-react";
import "../styles/App.scss";

const cards = [
    {
        title: "الصف الأول",
        description: "اضغط هنا للدخول والتسجيل بالرقم القومي",
        icon: <BookOpen size={32} />,
        styleIcon: "#3B82F6",
        link: "/Form"
    },
    {
        title: "الصف الثاني",
        description: "اضغط هنا للدخول والتسجيل بالرقم القومي",
        icon: <School size={32} />,
        styleIcon: "#22C55E",
        link: "/Form2"
    },
    {
        title: "الصف الثالث",
        description: "اضغط هنا للدخول والتسجيل بالرقم القومي",
        icon: <GraduationCap size={32} />,
        styleIcon: "#A855F7",
        link: "/Form2"
    },
];

function Home() {
    return (
        <div className="home">
            <section className="home-hero">
                <div className="home-content">
                    <h1 className="home-title">مع Guardian Vision… نتابع اليوم لنصنع نجاح الغد.</h1>
                    <p className="home-description">نحن منصة تعليمية رائدة تهدف إلى تسهيل العملية التعليمية للطلاب والمعلمين على حد سواء. نسعى جاهدين لتوفير أفضل الأدوات والتقنيات الحديثة لضمان مستقبل أفضل لأبنائنا.</p>
                </div>
                
                <div className="home-cards">
                    {cards.map((card, index) => (
                        <Link to={card.link} className="home-card-link" key={index}>
                            <div className="home-card">
                                <div className="home-card-icon" style={{backgroundColor: card.styleIcon}}>
                                    {card.icon}
                                </div>
                                <h2 className="home-card-title">{card.title}</h2>
                                <p className="home-card-description">{card.description}</p>
                                <div className="link-wrapper">
                                    <span className="link">دخول الآن</span>
                                    <ArrowLeft size={18} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="uniform-card-container">
                    <Link to="/unform" className="uniform-card-link">
                        <div className="uniform-card">
                            <div className="uniform-card-icon-wrapper">
                                <div className="uniform-card-icon">
                                    <ShoppingBag size={28} />
                                </div>
                            </div>
                            <div className="uniform-card-content">
                                <h2 className="uniform-card-title">حجز الزي المدرسي</h2>
                                <p className="uniform-card-description">اطلب الزي المدرسي بالمقاس المناسب لطفلك</p>
                            </div>
                            <div className="uniform-link-wrapper">
                                <span className="link">احجز الآن</span>
                                <ArrowLeft size={18} />
                            </div>
                        </div>
                    </Link>
                </div>
            </section>
        </div>
    );
}

export default Home;
