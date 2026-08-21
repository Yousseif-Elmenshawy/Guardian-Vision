import "../styles/App.scss";
import { Link } from "react-router-dom";
import { MoveRight, ShieldCheck, Users, Target } from "lucide-react";

const card = [
    {
        icon: <Target size={64} />,
        title: "رؤيتنا",
        description: "في Guardian Vision نسعى إلى أن نكون المنصة الرائدة في تعزيز التواصل بين المدرسة وولي الأمر، من خلال نظام ذكي يضمن متابعة دقيقة وشفافة لكل طالب."
    },
    {
        icon: <Users size={64} />,
        title: "فريقنا",
        description: "في Guardian Vision يقف خلف المنصة فريق شغوف يجمع بين الخبرة التقنية والفهم العميق للعملية التعليمية."
    },
    {
        icon: <ShieldCheck size={64} />,
        title: "قيمنا",
        description: "قيمنا في Guardian Vision تقوم على الشفافية، الدقة، الأمان، التطوير المستمر، والشراكة الفعّالة؛ لنصنع تجربة متابعة تعليمية موثوقة ومتميزة."
    },
]

function About() {
    return (
        <>
        <section className="about">
            <div className="about-container">
                <div className="back-link">
                    <Link to="/"><MoveRight size={18} /> العودة الرئيسية</Link>
                </div>
                <div className="about-content">
                    <h1>من نحن</h1>
                    <p>Guardian Vision هي منصة تعليمية رقمية تهدف إلى تمكين أولياء الأمور من متابعة المستوى الدراسي والسلوكي لأبنائهم بسهولة ودقة من خلال الرقم القومي فقط، دون تعقيدات أو إجراءات طويلة.</p>
                    <div className="about-cards">
                        {card.map((item, index) => (
                            <div className="about-card" key={index}>
                                <div className="about-card-icon">
                                    {item.icon}
                                </div>
                                <div className="about-card-content">
                                    <h2>{item.title}</h2>
                                    <p>{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="about-story">
                    <h2>قصتنا</h2>
                    <p>بدأت فكرة Guardian Vision من ملاحظة بسيطة لكنها مؤثرة: الكثير من أولياء الأمور لا يملكون وسيلة سهلة وسريعة لمتابعة المستوى الدراسي والسلوكي لأبنائهم بشكل مستمر، مما يخلق فجوة في التواصل بين المدرسة والأسرة.</p>
                    <br />
                    <p>من هنا جاءت رؤيتنا لتصميم منصة رقمية ذكية تُمكّن ولي الأمر من متابعة أداء أبنائه باستخدام الرقم القومي فقط، في تجربة بسيطة، آمنة، وفعّالة. هدفنا لم يكن مجرد إنشاء موقع، بل بناء جسر ثقة يربط بين البيت والمدرسة.</p>
                    <br />
                    <b>تنطلق فكرتنا من إيماننا بدور التكنولوجيا في دعم التعليم وتحقيق أهداف أوسع تتماشى مع أهداف التنمية المستدامة (SDGs)، وعلى رأسها:</b>
                    <div className="SDGs">
                        <ul>
                            <li><b>لهدف الرابع: التعليم الجيد (Quality Education)<br /><span id="subP">نسعى لتعزيز جودة التعليم من خلال المتابعة الدقيقة، ودعم التحصيل الدراسي، وتحفيز الطلاب على التفوق.</span></b></li>
                            <li><b>الهدف السادس عشر: السلام والعدل والمؤسسات القوية (Peace, Justice and Strong Institutions)<br /><span id="subP">نُرسّخ مبدأ الشفافية وتبادل المعلومات بشكل منظم وآمن بين الأطراف المعنية بالعملية التعليمية.</span></b></li>
                            <li><b>الهدف التاسع: الصناعة والابتكار والهياكل الأساسية (Industry, Innovation and Infrastructure)<br /><span id="subP">نوظف الابتكار الرقمي لبناء بنية تكنولوجية حديثة تخدم قطاع التعليم بكفاءة.</span></b></li>
                        </ul>
                    </div>
                    <br />
                    <p>نؤمن أن المتابعة ليست مجرد أرقام ودرجات، بل هي دعم مستمر، واهتمام حقيقي، ومسؤولية مشتركة لصناعة مستقبل أفضل لأبنائنا.</p>
                    <br />
                    <hr />
                    <footer>
                        <h2 style={{"textAlign": "center"}}>Guardian Vision – نتابع اليوم… لنصنع نجاح الغد.</h2>
                    </footer>
                </div>
            </div>
        </section>
        </>
    );
}

export default About;