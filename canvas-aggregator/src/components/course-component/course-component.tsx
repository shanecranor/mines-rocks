import { Course } from "@/services/database";
import styles from "./course-component.module.scss";
type CourseAttributes = {
  semester: string;
  courseCode: string;
  courseYear: string;
  courseName: string;
};

export default function CourseComponent({
  courseData,
}: // assignmentData,
{
  courseData: Course;
  // assignmentData: Assignments[];
}) {
  const { semester, courseCode, courseYear, courseName } =
    getCourseAttributes(courseData);
  const averageGrade = 0;
  const minGrade = 0;
  const maxGrade = 0;
  const medianGrade = 0;
  const upperQuartile = 0;
  const lowerQuartile = 0;
  return (
    <div className={styles["course-component"]}>
      <div className={styles["course-attributes"]}>
        <div className={styles.code}>{courseCode}</div>
        <span className={styles.when}>
          {semester} {courseYear}
        </span>
      </div>
      <div className={styles["course-data"]}>
        <div className={styles["course-data-text"]}>
          <div className={styles["data"]}>avg: {averageGrade.toFixed(2)}%</div>
        </div>
        <div className={styles["course-data-graph"]}>
          <div
            className={styles["range"]}
            style={{
              width: `${maxGrade - minGrade}%`,
              left: `${minGrade}%`,
            }}
          />
          <div
            className={styles["iqr"]}
            style={{
              width: `${upperQuartile - lowerQuartile}%`,
              left: `${lowerQuartile}%`,
            }}
          />
          <div
            className={styles["median-grade"]}
            style={{ left: `${Math.round(medianGrade)}%` }}
          />
          <div
            className={styles["avg-grade"]}
            style={{ left: `${Math.round(averageGrade)}%` }}
          />
          <div
            className={styles["min-grade"]}
            style={{ left: `${Math.round(minGrade)}%` }}
          />
          <div
            className={styles["max-grade"]}
            style={{ left: `${Math.round(maxGrade)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export const getCourseAttributes = (course: Course): CourseAttributes => {
  const dataString = course.course_code || "";
  // split on both . and space
  const dataList = dataString.split(/\.|\s/);
  const semester = dataList[0]
    .replace("Sprg", "Spring")
    .replace("Smr", "Summer");
  const courseYear = dataList[1];
  // find the first 3 digit number, then remove everything after it
  const courseCode = dataList[2].replace(/(\d{3}).*/, "$1");
  return {
    semester,
    courseCode,
    courseYear,
    courseName: course.name || "",
  };
};
