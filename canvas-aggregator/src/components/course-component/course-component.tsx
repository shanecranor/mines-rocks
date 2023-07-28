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
import { group } from "console";
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
    const isOpen$ = useObservable<boolean>(true);
    const { semester, courseCode, courseYear, courseName } =
      getCourseAttributes(courseData);
    if (assignments.length === 0) {
      return;
    }
    const stats = getStatsPerGroup(assignments, assignmentGroups);
    const { stats: avgStats, totalWeight } = averageCourseStats(stats);
    function getGroupColor(
      name: string | null
    ): import("csstype").Property.Background<string | number> | undefined {
      //convert name to an int
      if (!name) return "white";
      const hash = name.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + acc * 2;
      }, 0);
      const hue = hash % 360;
      return `HSL(${hue}, 50%, 60%)`;
    }

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
                <thead>
                  <tr>
                    <td className={styles["weight"]}>Weight</td>
                    <td className={styles["category"]}>Category</td>
                    <td>Average</td>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((stat, idx) => {
                    const isOpen = isOpen$.get();
                    const groupWeight = getGroupWeight(stat, totalWeight);
                    const transitionTime =
                      typeof groupWeight === "number" ? groupWeight / 75 : 0;
                    const transitionDelay = `${
                      isOpen ? idx / 30 : (stats.length - idx) / 100
                    }s`;
                    return (
                      <tr key={stat.group.id}>
                        <td>
                          {getGroupWeight(stat, totalWeight)}%
                          <div
                            className={styles["weight-bar"]}
                            style={{
                              width: `${isOpen ? groupWeight : 0}%`,
                              background: getGroupColor(stat.group.name),
                              transitionDelay,
                              transition: `width ${transitionTime}s ease-in-out`,
                            }}
                          />
                        </td>
                        <td>{stat.group.name}</td>
                        <td>{Math.round(stat.stats.mean)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
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
