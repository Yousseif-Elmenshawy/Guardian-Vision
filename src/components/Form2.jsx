import "../styles/App.scss";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MoveRight, CircleUser } from "lucide-react";
import { login, saveSession } from "../api/client";

function Form2() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nationalID: "",
        major: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        const errors = {};
        if (!formData.nationalID) {
            errors.nationalID = "الرقم القومي مطلوب";
            document.getElementById("MSG").style.color = "red";
            document.getElementById("MSG").style.fontSize = "20px";
            document.getElementById("MSG").style.textAlign = "center";
        }
        else if (formData.nationalID.length !== 14) {
            errors.nationalID = "الرقم القومي يجب ان يكون 14 رقم";
            document.getElementById("MSG").style.color = "red";
            document.getElementById("MSG").style.fontSize = "20px";
            document.getElementById("MSG").style.textAlign = "center";
        }

        if (!formData.major) {
            errors.major = "الرجاء اختيار الشعبة";
            document.getElementById("MSG").style.color = "red";
            document.getElementById("MSG").style.fontSize = "20px";
            document.getElementById("MSG").style.textAlign = "center";
        }

        if (!formData.password) {
            errors.password = "كلمة المرور مطلوبة";
            document.getElementById("MSG").style.color = "red";
            document.getElementById("MSG").style.fontSize = "20px";
            document.getElementById("MSG").style.textAlign = "center";
        }
        else if (formData.password.length < 6) {
            errors.password = "كلمة المرور يجب ان تكون 6 ارقام على الاقل";
            document.getElementById("MSG").style.color = "red";
            document.getElementById("MSG").style.fontSize = "20px";
            document.getElementById("MSG").style.textAlign = "center";
        }
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                setIsSubmitting(true);
                const session = await login({
                    nationalID: formData.nationalID,
                    password: formData.password,
                    majorCode: formData.major,
                });
                saveSession(session);

                const majorNames = {
                    "IT": "تكنولوجيا المعلومات - IT",
                    "Communications": "اتصالات - Communications",
                    "Networking": "الشبكات - Networking"
                };
                const displayMajor = majorNames[formData.major] || formData.major;
                navigate("/Resault", { state: { major: displayMajor, majorKey: formData.major } });
            } catch (error) {
                setErrors({ api: error.message });
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="form-container">
            <div className="back-link">
                <Link to="/"><MoveRight size={18} /> العودة الرئيسية</Link>
            </div>
            <form onSubmit={handleSubmit} style={{ "height": "800px" }}>
                <div className="title">
                    <div className="icon">
                        <CircleUser size={40} />
                    </div>
                    <h1>تسجيل الدخول الطلاب  </h1>
                </div>

                <div className="inputs">
                    <label htmlFor="nationalID">الرقم القومي</label>
                    <input type="text" name="nationalID" placeholder="ادخل 14 رقم" value={formData.nationalID} onChange={handleChange} />
                </div>
                <div className="inputs">
                    <label htmlFor="password">كلمة المرور</label>
                    <input type="password" name="password" placeholder="ادخل 6 ارقام" value={formData.password} onChange={handleChange} />
                </div>

                <div className="inputs">
                    <label htmlFor="major">الشعبة</label>
                    <select name="major" value={formData.major} onChange={handleChange}>
                        <option value="">اختر الشعبة</option>
                        <option value="IT">تكنولوجيا المعلومات - IT</option>
                        <option value="Communications">اتصالات - Communications</option>
                        <option value="Networking">الشبكات - Networking</option>
                    </select>
                </div>

                <span><p id="MSG">{errors.nationalID || errors.password || errors.major || errors.api}</p></span>
                <button type="submit" id="Enter" disabled={isSubmitting}>{isSubmitting ? "جاري الدخول..." : "دخول"}</button>

                <div className="form-footer">
                    <p>تأكد من إدخاله كما هو موجود في شهادة الميلاد (14 رقم)</p>
                    <br />
                    <p>يمكنك الحصول عليه من إدارة المدرسة (6 أرقام)</p>
                </div>
            </form>
        </div>
    );
}

export default Form2;
