export default function StudentReport({ performance = [], subjects = [], monthId = null }) {
  const validScores = subjects
    .map((subject) => ({
      score: Number(subject.score),
      maxScore: Number(subject.max_score ?? subject.maxScore) || 0,
    }))
    .filter((subject) => subject.maxScore > 0);
  const average = validScores.length
    ? validScores.reduce((total, subject) => total + (subject.score / subject.maxScore) * 100, 0)
      / validScores.length
    : null;
  const lowestSubject = [...subjects].sort((left, right) => {
    const leftMax = Number(left.max_score ?? left.maxScore) || 1;
    const rightMax = Number(right.max_score ?? right.maxScore) || 1;
    return Number(left.score) / leftMax - Number(right.score) / rightMax;
  })[0];
  const latestPerformance = monthId
    ? performance.find((item) => Number(item.month_id) === Number(monthId))
    : performance[performance.length - 1];

  return (
    <div className="student-report" dir="rtl">
      <h2>تقرير الطالب</h2>
      {average === null ? (
        <p>لا توجد درجات مسجلة لهذا الطالب حتى الآن.</p>
      ) : (
        <>
          <p>
            متوسط الدرجات: <strong>{average.toFixed(1)}%</strong>
            {latestPerformance ? ` — ${latestPerformance.month_name || latestPerformance.month}` : ""}
          </p>
          {latestPerformance && (
            <p>
            المعدل العام: {Number(latestPerformance.general_rate ?? latestPerformance.rate).toFixed(1)}%،
            السلوك: {Number(latestPerformance.behavior_rate ?? latestPerformance.behavior).toFixed(1)}%،
            الحضور: {Number(latestPerformance.attendance_rate ?? latestPerformance.attendance).toFixed(1)}%
            </p>
          )}
          {lowestSubject && (
            <p>
            مادة تحتاج إلى متابعة: {lowestSubject.subject_name_ar || lowestSubject.arabicName} (
            {Number(lowestSubject.score).toFixed(1)}/
            {Number(lowestSubject.max_score ?? lowestSubject.maxScore).toFixed(1)}).
              {" "}{lowestSubject.recommendation}
            </p>
          )}
        </>
      )}
    </div>
  );
}
