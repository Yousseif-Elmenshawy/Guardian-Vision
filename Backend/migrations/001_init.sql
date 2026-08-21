SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS guardian_vision
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE guardian_vision;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS uniform_order_items;
DROP TABLE IF EXISTS uniform_orders;
DROP TABLE IF EXISTS uniform_sizes;
DROP TABLE IF EXISTS uniform_products;
DROP TABLE IF EXISTS student_subject_scores;
DROP TABLE IF EXISTS monthly_performance;
DROP TABLE IF EXISTS grade_subjects;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS academic_months;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS majors;
DROP TABLE IF EXISTS grades;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE grades (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name_ar VARCHAR(100) NOT NULL,
  level TINYINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_grades_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE majors (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  name_ar VARCHAR(150) NOT NULL,
  name_en VARCHAR(150) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_majors_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE students (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  national_id CHAR(14) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  gender ENUM('male', 'female') NOT NULL,
  grade_id INT UNSIGNED NOT NULL,
  major_id INT UNSIGNED NULL,
  parent_phone VARCHAR(20) NOT NULL,
  class_name VARCHAR(50) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_students_national_id (national_id),
  KEY idx_students_grade_id (grade_id),
  KEY idx_students_major_id (major_id),
  CONSTRAINT fk_students_grade
    FOREIGN KEY (grade_id) REFERENCES grades (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_students_major
    FOREIGN KEY (major_id) REFERENCES majors (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE academic_months (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name_ar VARCHAR(50) NOT NULL,
  sort_order TINYINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_academic_months_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE subjects (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(80) NOT NULL,
  name_en VARCHAR(120) NOT NULL,
  name_ar VARCHAR(150) NOT NULL,
  color_hex CHAR(7) NOT NULL,
  icon_name VARCHAR(80) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_subjects_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE grade_subjects (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  grade_id INT UNSIGNED NOT NULL,
  subject_id INT UNSIGNED NOT NULL,
  major_id INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_grade_subjects_grade_id (grade_id),
  KEY idx_grade_subjects_subject_id (subject_id),
  KEY idx_grade_subjects_major_id (major_id),
  CONSTRAINT fk_grade_subjects_grade
    FOREIGN KEY (grade_id) REFERENCES grades (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_grade_subjects_subject
    FOREIGN KEY (subject_id) REFERENCES subjects (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_grade_subjects_major
    FOREIGN KEY (major_id) REFERENCES majors (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE monthly_performance (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_id INT UNSIGNED NOT NULL,
  month_id INT UNSIGNED NOT NULL,
  general_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  behavior_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  attendance_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_monthly_performance_student_month (student_id, month_id),
  KEY idx_monthly_performance_month_id (month_id),
  CONSTRAINT fk_monthly_performance_student
    FOREIGN KEY (student_id) REFERENCES students (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_monthly_performance_month
    FOREIGN KEY (month_id) REFERENCES academic_months (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE student_subject_scores (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_id INT UNSIGNED NOT NULL,
  subject_id INT UNSIGNED NOT NULL,
  month_id INT UNSIGNED NOT NULL,
  score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  max_score DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  evaluation VARCHAR(80) NOT NULL,
  participation_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  homework_done INT UNSIGNED NOT NULL DEFAULT 0,
  homework_total INT UNSIGNED NOT NULL DEFAULT 0,
  attendance_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  last_exam_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  last_exam_max_score DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  recommendation TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_student_subject_scores_student_subject_month (student_id, subject_id, month_id),
  KEY idx_student_subject_scores_subject_id (subject_id),
  KEY idx_student_subject_scores_month_id (month_id),
  CONSTRAINT fk_student_subject_scores_student
    FOREIGN KEY (student_id) REFERENCES students (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_student_subject_scores_subject
    FOREIGN KEY (subject_id) REFERENCES subjects (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_student_subject_scores_month
    FOREIGN KEY (month_id) REFERENCES academic_months (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE uniform_products (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name_ar VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  color_hex CHAR(7) NOT NULL,
  icon_name VARCHAR(80) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE uniform_sizes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(10) NOT NULL,
  name_ar VARCHAR(80) NOT NULL,
  sort_order TINYINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_uniform_sizes_code (code),
  UNIQUE KEY uq_uniform_sizes_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE uniform_orders (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_number VARCHAR(40) NOT NULL,
  student_id INT UNSIGNED NULL,
  student_name VARCHAR(200) NOT NULL,
  student_gender ENUM('male', 'female') NOT NULL,
  grade_id INT UNSIGNED NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled', 'delivered') NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_uniform_orders_order_number (order_number),
  KEY idx_uniform_orders_student_id (student_id),
  KEY idx_uniform_orders_grade_id (grade_id),
  CONSTRAINT fk_uniform_orders_student
    FOREIGN KEY (student_id) REFERENCES students (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_uniform_orders_grade
    FOREIGN KEY (grade_id) REFERENCES grades (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE uniform_order_items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  size_id INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_uniform_order_items_order_id (order_id),
  KEY idx_uniform_order_items_product_id (product_id),
  KEY idx_uniform_order_items_size_id (size_id),
  CONSTRAINT fk_uniform_order_items_order
    FOREIGN KEY (order_id) REFERENCES uniform_orders (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_uniform_order_items_product
    FOREIGN KEY (product_id) REFERENCES uniform_products (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_uniform_order_items_size
    FOREIGN KEY (size_id) REFERENCES uniform_sizes (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO grades (id, name_ar, level) VALUES
  (1, 'الصف الأول', 1),
  (2, 'الصف الثاني', 2),
  (3, 'الصف الثالث', 3);

INSERT INTO majors (id, code, name_ar, name_en) VALUES
  (1, 'GENERAL', 'عام', 'General'),
  (2, 'IT', 'تكنولوجيا المعلومات', 'Information Technology'),
  (3, 'COMMUNICATIONS', 'اتصالات', 'Communications'),
  (4, 'NETWORKING', 'الشبكات', 'Networking');

INSERT INTO academic_months (id, name_ar, sort_order) VALUES
  (1, 'يناير', 1),
  (2, 'فبراير', 2),
  (3, 'مارس', 3);

INSERT INTO subjects (id, code, name_en, name_ar, color_hex, icon_name) VALUES
  (1, 'MATH', 'Math', 'رياضيات', '#3B82F6', 'Calculator'),
  (2, 'ENGLISH', 'English', 'لغة إنجليزية', '#A855F7', 'Globe'),
  (3, 'ARABIC', 'Arabic', 'لغة عربية', '#10B981', 'BookOpen'),
  (4, 'PHYSICS', 'Physics', 'فيزياء', '#22C55E', 'Atom'),
  (5, 'TCS', 'TCS', 'مهارات التواصل التقني', '#6366F1', 'Brain'),
  (6, 'CDC', 'CDC', 'التوجيه والإرشاد وريادة الأعمال', '#EAB308', 'Network'),
  (7, 'CAPSTONE', 'Capstone', 'مشروع التخرج', '#14B8A6', 'Award'),
  (8, 'SOCIAL_STUDIES', 'Social studies', 'دراسات اجتماعية', '#F97316', 'Users'),
  (9, 'IT', 'IT', 'تكنولوجيا المعلومات', '#EC4899', 'BookMarked'),
  (10, 'COMMUNICATIONS', 'Communications', 'اتصالات', '#06B6D4', 'Radio'),
  (11, 'NATIONAL_STUDIES', 'National studies', 'دراسات وطنية', '#8B5CF6', 'Landmark'),
  (12, 'NETWORKING', 'Networking', 'الشبكات', '#EC4899', 'Wifi');

INSERT INTO grade_subjects (grade_id, subject_id, major_id) VALUES
  (1, 1, NULL), (1, 2, NULL), (1, 3, NULL), (1, 4, NULL), (1, 5, NULL), (1, 6, NULL),
  (1, 7, NULL), (1, 8, NULL), (1, 9, NULL), (1, 10, NULL), (1, 11, NULL),
  (2, 1, NULL), (2, 2, NULL), (2, 3, NULL), (2, 4, NULL), (2, 5, NULL), (2, 6, NULL),
  (2, 7, NULL), (2, 8, NULL), (2, 9, 2), (2, 10, 3), (2, 12, 4),
  (3, 1, NULL), (3, 2, NULL), (3, 3, NULL), (3, 4, NULL), (3, 5, NULL), (3, 6, NULL),
  (3, 7, NULL), (3, 8, NULL), (3, 9, 2), (3, 10, 3), (3, 12, 4);

INSERT INTO students (id, national_id, password_hash, full_name, gender, grade_id, major_id, parent_phone, class_name) VALUES
  (1, '30001011234567', SHA2('123456', 256), 'أحمد محمد علي', 'male', 1, 1, '01000000001', '1A'),
  (2, '30002021234567', SHA2('123456', 256), 'ملك أحمد حسن', 'female', 2, 2, '01000000002', '2IT'),
  (3, '30003031234567', SHA2('123456', 256), 'يوسف محمود سالم', 'male', 2, 3, '01000000003', '2COM'),
  (4, '30004041234567', SHA2('123456', 256), 'سارة علي إبراهيم', 'female', 3, 4, '01000000004', '3NET');

INSERT INTO monthly_performance (student_id, month_id, general_rate, behavior_rate, attendance_rate) VALUES
  (1, 1, 75.00, 70.00, 90.00),
  (1, 2, 78.00, 75.00, 92.00),
  (1, 3, 82.00, 80.00, 95.00),
  (2, 1, 85.00, 88.00, 94.00),
  (2, 2, 88.00, 90.00, 95.00),
  (2, 3, 91.00, 92.00, 96.00),
  (3, 1, 80.00, 82.00, 90.00),
  (3, 2, 84.00, 85.00, 92.00),
  (3, 3, 87.00, 88.00, 93.00),
  (4, 1, 79.00, 83.00, 91.00),
  (4, 2, 82.00, 86.00, 94.00),
  (4, 3, 89.00, 90.00, 95.00);

INSERT INTO student_subject_scores
  (student_id, subject_id, month_id, score, max_score, evaluation, participation_rate, homework_done, homework_total, attendance_rate, last_exam_score, last_exam_max_score, recommendation)
VALUES
  (1, 1, 3, 85.00, 100.00, 'جيد جداً', 94.00, 8, 15, 84.00, 98.00, 100.00, 'مستوى الطالب جيد جداً. ينصح بالتركيز على بعض النقاط البسيطة للوصول للامتياز.'),
  (1, 2, 3, 78.00, 100.00, 'جيد جداً', 88.00, 9, 15, 90.00, 84.00, 100.00, 'مستوى الطالب جيد جداً ويحتاج إلى تدريب أكثر على المحادثة والكتابة.'),
  (1, 3, 3, 88.00, 100.00, 'جيد جداً', 92.00, 10, 15, 93.00, 90.00, 100.00, 'أداء قوي مع الاستمرار في القراءة اليومية.'),
  (1, 4, 3, 88.00, 100.00, 'جيد جداً', 90.00, 8, 15, 91.00, 89.00, 100.00, 'ينصح بمراجعة المسائل التطبيقية بانتظام.'),
  (1, 5, 3, 92.00, 100.00, 'ممتاز', 95.00, 12, 15, 96.00, 94.00, 100.00, 'مستوى ممتاز في مهارات التواصل التقني.'),
  (1, 6, 3, 80.00, 100.00, 'جيد جداً', 86.00, 9, 15, 90.00, 82.00, 100.00, 'ينصح بالمشاركة أكثر في الأنشطة.'),
  (1, 7, 3, 98.00, 100.00, 'ممتاز', 98.00, 15, 15, 98.00, 99.00, 100.00, 'أداء متميز في مشروع التخرج.'),
  (1, 8, 3, 85.00, 100.00, 'جيد جداً', 89.00, 11, 15, 92.00, 87.00, 100.00, 'مستوى جيد جداً مع مراجعة الخرائط الزمنية.'),
  (1, 9, 3, 95.00, 100.00, 'ممتاز', 96.00, 13, 15, 95.00, 97.00, 100.00, 'مستوى ممتاز في تكنولوجيا المعلومات.'),
  (1, 10, 3, 82.00, 100.00, 'جيد جداً', 87.00, 10, 15, 91.00, 83.00, 100.00, 'ينصح بتطبيقات عملية أكثر في الاتصالات.'),
  (1, 11, 3, 90.00, 100.00, 'ممتاز', 93.00, 12, 15, 94.00, 91.00, 100.00, 'أداء ممتاز في الدراسات الوطنية.'),
  (2, 1, 3, 90.00, 100.00, 'ممتاز', 95.00, 14, 15, 95.00, 92.00, 100.00, 'استمرار ممتاز في الرياضيات.'),
  (2, 2, 3, 86.00, 100.00, 'جيد جداً', 90.00, 12, 15, 94.00, 88.00, 100.00, 'مستوى جيد جداً في اللغة الإنجليزية.'),
  (2, 3, 3, 89.00, 100.00, 'جيد جداً', 92.00, 13, 15, 95.00, 90.00, 100.00, 'أداء جيد جداً في اللغة العربية.'),
  (2, 4, 3, 87.00, 100.00, 'جيد جداً', 88.00, 11, 15, 93.00, 89.00, 100.00, 'ينصح بالتركيز على قوانين الفيزياء.'),
  (2, 5, 3, 93.00, 100.00, 'ممتاز', 96.00, 15, 15, 97.00, 95.00, 100.00, 'مستوى ممتاز في التواصل التقني.'),
  (2, 6, 3, 84.00, 100.00, 'جيد جداً', 89.00, 12, 15, 94.00, 86.00, 100.00, 'مشاركة جيدة وتحتاج إلى ثبات أكبر.'),
  (2, 7, 3, 98.00, 100.00, 'ممتاز', 99.00, 15, 15, 98.00, 99.00, 100.00, 'أداء متميز في المشروع.'),
  (2, 8, 3, 88.00, 100.00, 'جيد جداً', 91.00, 13, 15, 95.00, 89.00, 100.00, 'مستوى جيد جداً في الدراسات.'),
  (2, 9, 3, 94.00, 100.00, 'ممتاز', 97.00, 15, 15, 97.00, 96.00, 100.00, 'مستوى ممتاز في تخصص تكنولوجيا المعلومات.');

INSERT INTO uniform_products (id, name_ar, description, price, color_hex, icon_name, is_active) VALUES
  (1, 'الهودي', 'اختر نوع الزي والمقاس المناسب لطفلك', 100.00, '#F5A623', 'Sun', TRUE),
  (2, 'الجاكيت', 'اختر نوع الزي والمقاس المناسب لطفلك', 100.00, '#4A90E2', 'Wind', TRUE),
  (3, 'الزي الرياضي', 'اختر نوع الزي والمقاس المناسب لطفلك', 100.00, '#27AE60', 'Dumbbell', TRUE),
  (4, 'الزي المدرسي', 'اختر نوع الزي والمقاس المناسب لطفلك', 100.00, '#9013FE', 'Shirt', TRUE);

INSERT INTO uniform_sizes (id, code, name_ar, sort_order) VALUES
  (1, 'XS', 'صغير جداً', 1),
  (2, 'S', 'صغير', 2),
  (3, 'M', 'متوسط', 3),
  (4, 'L', 'كبير', 4),
  (5, 'XL', 'كبير جداً', 5),
  (6, 'XXL', 'كبير جداً جداً', 6);
