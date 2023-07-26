import {
  Assignment,
  AssignmentGroup,
  Course,
  GradeStatistics,
  STAT_KEYS,
} from "@/services/database";
import styles from "./course-component.module.scss";
import {
  averageCourseStats,
  getStatsPerGroup,
} from "@/services/data-aggregation";
type CourseAttributes = {
  semester: string;
  courseCode: string;
  courseYear: string;
  courseName: string;
};

export default function CourseComponent({
  courseData,
  assignments,
  assignmentGroups,
}: // assignmentData,
{
  courseData: Course;
  assignments: Assignment[];
  assignmentGroups: AssignmentGroup[];
}) {
  const { semester, courseCode, courseYear, courseName } =
    getCourseAttributes(courseData);

  const stats = getStatsPerGroup(assignments, assignmentGroups);
  const { max, min, mean, median, upper_q, lower_q } =
    averageCourseStats(stats);

  let totalWeight = 0;
  for (const stat of stats) {
    totalWeight += stat.group.group_weight || 0;
  }
  return (
    <div className={styles["course-component"]}>
      <div className={styles["course-attributes"]}>
        <div className={styles.code}>{courseCode}</div>
        <span className={styles.when}>
          {semester} {courseYear} {totalWeight}
        </span>
      </div>
      <div className={styles["course-data"]}>
        <div className={styles["course-data-text"]}>
          <div className={styles["data"]}>avg: {mean?.toFixed(2)}%</div>
        </div>
        <div className={styles["course-data-graph"]}>
          {assignments ? (
            <>
              <div
                className={styles["range"]}
                style={{
                  width: `${max - min}%`,
                  left: `${min}%`,
                }}
              />
              <div
                className={styles["iqr"]}
                style={{
                  width: `${upper_q - lower_q}%`,
                  left: `${lower_q}%`,
                }}
              />
              <div
                className={styles["median-grade"]}
                style={{ left: `${Math.round(median)}%` }}
              />
              <div
                className={styles["avg-grade"]}
                style={{ left: `${Math.round(mean)}%` }}
              />
              <div
                className={styles["min-grade"]}
                style={{ left: `${Math.round(min)}%` }}
              />
              <div
                className={styles["max-grade"]}
                style={{ left: `${Math.round(max)}%` }}
              />
            </>
          ) : (
            <div>Loading...</div>
          )}
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
