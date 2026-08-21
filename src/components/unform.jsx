import React, { useEffect, useState } from "react";
import "../styles/App.scss";
import { Link, useNavigate } from "react-router-dom";
import { MoveRight, ShoppingBag , Sun, Shirt, Dumbbell, Wind} from "lucide-react";
import { createUniformOrder, getGrades, getUniformProducts, getUniformSizes } from "../api/client";

const iconMap = {
    Sun: <Sun size={24} />,
    Shirt: <Shirt size={24} />,
    Dumbbell: <Dumbbell size={24} />,
    Wind: <Wind size={24} />,
};

const fallbackCards = [
    {
        id: 1,
        title: "الهودي",
        description: "اختر نوع الزي والمقاس المناسب لطفلك",
        icon: <Sun size={24} />,
        price: "100 جنيه",
        rawPrice: 100,
        color: "#F5A623"
    },
    {
        id: 2,
        title: "الجاكيت",
        description: "اختر نوع الزي والمقاس المناسب لطفلك",
        icon: <Wind size={24} />,
        price: "100 جنيه",
        rawPrice: 100,
        color: "#4A90E2"
    },
    {
        id: 3,
        title: "الزي الرياضي",
        description: "اختر نوع الزي والمقاس المناسب لطفلك",
        icon: <Dumbbell size={24} />,
        price: "100 جنيه",
        rawPrice: 100,
        color: "#27AE60"
    },
    {
        id: 4,
        title: "الزي المدرسي",
        description: "اختر نوع الزي والمقاس المناسب لطفلك",
        icon: <Shirt size={24} />,
        price: "100 جنيه",
        rawPrice: 100,
        color: "#9013FE"
    },
]

const fallbackSizes = [
      {
        id: 1,
        title: "صغير جدا",
        head: "XS"
      },
      {
        id: 2,
        title: "صغير",
        head: "S"
      },
      {
        id: 3,
        title: "متوسط",
        head: "M"
      },
      {
        id: 4,
        title: "كبير",
        head: "L"
      },
      {
        id: 5,
        title: "كبير جدا",
        head: "XL"
      },
      {
        id: 6,
        title: "كبير جدا جدا",
        head: "XXL"
      },
]

function Cloths() {
    const navigate = useNavigate();
    const [selectedCard, setSelectedCard] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [counter, setCounter] = useState(1);
    const [cards, setCards] = useState(fallbackCards);
    const [sizes, setSizes] = useState(fallbackSizes);
    const [grades, setGrades] = useState([]);
    const [formData, setFormData] = useState({
        studentName: "",
        gender: "",
        gradeID: "",
        parentPhone: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadUniformData = async () => {
            try {
                const [productsData, sizesData, gradesData] = await Promise.all([
                    getUniformProducts(),
                    getUniformSizes(),
                    getGrades(),
                ]);

                setCards(productsData.map((product) => ({
                    id: product.id,
                    title: product.name_ar,
                    description: product.description,
                    icon: iconMap[product.icon_name] || <Shirt size={24} />,
                    price: `${Number(product.price)} جنيه`,
                    rawPrice: Number(product.price),
                    color: product.color_hex,
                })));

                setSizes(sizesData.map((item) => ({
                    id: item.id,
                    title: item.name_ar,
                    head: item.code,
                })));
                setGrades(gradesData);
            } catch (error) {
                console.error(error);
            }
        };

        loadUniformData();
    }, []);

    const increment = () => {
        setCounter(counter + 1);
    };

    const decrement = () => {
        setCounter(Math.max(1, counter - 1));
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedCard) {
            alert("الرجاء اختيار نوع الزي");
            return;
        }

        if (!selectedSize) {
            alert("الرجاء اختيار المقاس");
            return;
        }

        try {
            setIsSubmitting(true);
            const order = await createUniformOrder({
                student_name: formData.studentName,
                student_gender: formData.gender,
                grade_id: Number(formData.gradeID),
                parent_phone: formData.parentPhone,
                items: [
                    {
                        product_id: selectedCard,
                        size_id: selectedSize,
                        quantity: counter,
                    },
                ],
            });
            alert(`تم إرسال طلبك بنجاح. رقم الطلب: ${order.order_number}`);
            navigate("/");
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="uniform">
            <div className="uniform-container">
                <div className="link-back">
                    <Link to="/"><MoveRight size={18} /> العودة الرئيسية</Link>
                </div>
                <div className="uniform-content">
                    <div className="uniform-title">
                        <div className="icon"><ShoppingBag size={24} /></div>
                        <h1>الزي المدرسي</h1>
                    </div>
                    <p>اختر نوع الزي والمقاس المناسب لطفلك</p>
                </div>
                <div className="uniform-cards">
                    {cards.map((card) => (
                        <div 
                            className={`uniform-card ${selectedCard === card.id ? "focused" : ""}`} 
                            key={card.id}
                            onClick={() => setSelectedCard(card.id)}
                        >
                            <div className="uniform-card-title-icon">
                                <div className="uniform-card-icon" style={{ backgroundColor: card.color }}>
                                    {card.icon}
                                </div>
                                <h2>{card.title}</h2>
                            </div>
                            <div className="uniform-card-content">
                                <p>{card.description}</p>
                                <p className="price">{card.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <br /> 
                <div className="uniform-size">
                    <div className="uniform-size-title">
                        <h2>اختر المقاس</h2>
                    </div>
                    <br />
                    <div className="uniform-size-cards">
                        {sizes.map((size) => (
                            <div className={`uniform-size-card ${selectedSize === size.id ? "focused1" : ""}`} onClick={() => setSelectedSize(size.id)} key={size.id}>
                                <div className="uniform-size-card-icon">
                                    <h2>{size.head}</h2>
                                </div>
                                <div className="uniform-size-card-content">
                                    <p>{size.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <br />
                <div className="uniform-counter">
                    <div className="uniform-counter-title">
                        <h2>الكمية</h2>
                    </div>
                    <div className="uniform-counter-content">
                        <p>عدد القطع:</p>
                        <button onClick={increment}>+</button>
                        <p>{counter}</p>
                        <button onClick={decrement}>-</button>
                    </div>
                </div>
                <br />
                <div className="uniform-form">
                    <div className="uniform-form-title">
                        <h2>بيانات الطالب و ولي الامر</h2>
                    </div>
                    <form onSubmit={handleFormSubmit}>
                        <div className="uniform-form-content">
                            <div className="uniform-input-box">
                                <label htmlFor="name">اسم الطالب</label>
                                <input type="text" id="name" name="studentName" placeholder="اسم الطالب" value={formData.studentName} onChange={handleInputChange} required/>
                            </div>
                            <div className="uniform-input-box">
                                <label htmlFor="name">الجنس الطالب</label>
                                <select name="gender" id="gender" value={formData.gender} onChange={handleInputChange} required>
                                    <option value="">اختر الجنس</option>
                                    <option value="male">ذكر</option>
                                    <option value="female">انثى</option>
                                </select>
                            </div>
                            <div className="uniform-input-box">
                                <label htmlFor="name">الصف الدراسي</label>
                                <select name="gradeID" id="grade" value={formData.gradeID} onChange={handleInputChange} required>
                                    <option value="">اختر الصف الدراسي</option>
                                    {grades.map((grade) => (
                                        <option key={grade.id} value={grade.id}>{grade.name_ar}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="uniform-input-box">
                                <label htmlFor="name">رقم ولي المر </label>
                                <input type="text" id="parentPhone" name="parentPhone" placeholder="رقم ولي الأمر" value={formData.parentPhone} onChange={handleInputChange} required/>
                            </div>
                        </div>
                        <div className="uniform-total">
                            <div className="uniform-total-content">
                                <p>نوع الزي:</p>
                                <h2>{cards.find((card) => card.id === selectedCard)?.title}</h2>
                            </div>
                            <div className="uniform-total-content">
                                <p>المقاس:</p>
                                <h2>{sizes.find((size) => size.id === selectedSize)?.head}</h2>
                            </div>
                            <div className="uniform-total-content">
                                <p>الكمية:</p>
                                <h2>{counter}</h2>
                            </div>
                            <hr />
                            <div className="uniform-total-content-price">
                                <p>المجموع:</p>
                                <h2>{counter * (cards.find((card) => card.id === selectedCard)?.rawPrice || 100)} جنيه</h2>
                            </div>
                        </div>
                        <button type="submit" id="btn-submit" disabled={isSubmitting}>{isSubmitting ? "جاري الحجز..." : "تأكيد الحجز"}</button>
                    </form>
                </div>
            </div>
        </section>
    );
}

export default Cloths;
