import {
  Assignment,
  AssignmentGroup,
  Course,
  GradeStatistics,
  STAT_KEYS,
} from "@/services/database";
import styles from "./course-component.module.scss";
import {
  GroupStat,
  averageCourseStats,
  getStatsPerGroup,
} from "@/services/data-aggregation";
import { observer, useObservable } from "@legendapp/state/react";
import BoxPlot from "./box-plot";
import { get } from "http";
type CourseAttributes = {
  semester: string;
  courseCode: string;
  courseYear: string;
  courseName: string;
};

const CourseComponent = observer(
  ({
    courseData,
    assignments,
    assignmentGroups,
  }: // assignmentData,
  {
    courseData: Course;
    assignments: Assignment[];
    assignmentGroups: AssignmentGroup[];
  }) => {
    const isOpen$ = useObservable<boolean>(false);
    const { semester, courseCode, courseYear, courseName } =
      getCourseAttributes(courseData);
    if (assignments.length === 0) {
      return;
    }
    const stats = getStatsPerGroup(assignments, assignmentGroups);
    const { stats: avgStats, totalWeight } = averageCourseStats(stats);
    return (
      <>
        <div
          className={`${styles["course-component"]}`}
          onClick={() => isOpen$.set(!isOpen$.peek())}
        >
          <div className={styles["small-view"]}>
            <div className={styles["course-attributes"]}>
              <div className={styles.code}>{courseCode}</div>
              <span className={styles.when}>
                {semester} {courseYear}
              </span>
            </div>
            <div className={styles["course-data"]}>
              <div className={styles["course-data-text"]}>
                <div className={styles["data"]}>
                  avg: {avgStats.mean?.toFixed(2)}%
                </div>
              </div>

              {avgStats.mean ? (
                <BoxPlot stats={avgStats} />
              ) : (
                <div>no stats found</div>
              )}
            </div>
          </div>
          {/* TY to the goat https://css-tricks.com/author/chriscoyier/ for CSS Grid animations :) */}
          <div
            className={styles["big-view"]}
            style={{ gridTemplateRows: isOpen$.get() ? "1fr" : "0fr" }}
          >
            <div
              className={styles["big-content"]}
              style={{
                visibility: isOpen$.get() ? "visible" : "hidden",
              }}
            >
              <table>
                <tr>
                  <td>Weight</td>
                  <td>Category</td>
                  <td>Average</td>
                </tr>
                {stats.map((stat) => (
                  <tr key={stat.group.id}>
                    <td>{getGroupWeight(stat, totalWeight)}%</td>
                    <td>{stat.group.name}</td>
                    <td>{Math.round(stat.stats.mean)}%</td>
                  </tr>
                ))}
              </table>
            </div>
          </div>
        </div>
        {/* {stats.map((stat) => (
          <div>
            {stat.group.name} {stat.group.group_weight} {stat.stats.mean}
          </div>
        ))} */}
      </>
    );
  }
);
const getGroupWeight = (stat: GroupStat, totalWeight: number) => {
  if (stat.isWeighted || !stat.group.group_weight) {
    return stat.group.group_weight || "N/A";
  }
  return Math.round((stat.group.group_weight / totalWeight) * 100);
};
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

export default CourseComponent;
