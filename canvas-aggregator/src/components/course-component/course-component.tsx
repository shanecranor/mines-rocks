import {
  Assignment,
  AssignmentGroup,
  Course,
  GradeStatistics,
  STAT_KEYS,
} from "@/services/database";
import styles from "./course-component.module.scss";
import { getStatsByGroup } from "@/services/data-aggregation";
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

  const stats = getStatsByGroup(assignments, assignmentGroups);
  let totalWeight = 0;
  for (const stat of stats) {
    totalWeight += stat.group.group_weight || 0;
  }
  // stats is an array of objects, each object has a stats and group property
  // stats.stats is a GradeStatistics object
  // stats.group is an AssignmentGroup object
  // average each property of stats.stats using a weighted average with stats.group.group_weight
  const { max, min, mean, median, upper_q, lower_q } = stats.reduce(
    (prev, curr) => {
      const weight = curr.group.group_weight || 0;
      const weightedStats = STAT_KEYS.reduce((statsObj, statKey) => {
        return {
          ...statsObj,
          [statKey]: ((curr.stats[statKey] || 0) * weight) / 100,
        };
      }, {} as GradeStatistics);
      return {
        max: prev.max + weightedStats.max,
        min: prev.min + weightedStats.min,
        mean: prev.mean + weightedStats.mean,
        median: prev.median + weightedStats.median,
        upper_q: prev.upper_q + weightedStats.upper_q,
        lower_q: prev.lower_q + weightedStats.lower_q,
      };
    },
    {
      max: 0,
      min: 0,
      mean: 0,
      median: 0,
      upper_q: 0,
      lower_q: 0,
    }
  );
  // const averageGrade = averageStatistic(assignmentList, "mean");
  // const minGrade = averageStatistic(assignmentList, "min") || 0;
  // const maxGrade = averageStatistic(assignmentList, "max") || 0;
  // const medianGrade = averageStatistic(assignmentList, "median");
  // const upperQuartile = averageStatistic(assignmentList, "upper_q") || 0;
  // const lowerQuartile = averageStatistic(assignmentList, "lower_q") || 0;
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
