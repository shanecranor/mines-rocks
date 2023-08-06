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
import { start } from "repl";
import { Observable } from "@legendapp/state";
import { Group } from "next/dist/shared/lib/router/utils/route-regex";
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
    groupStats,
  }: // assignmentData,
  {
    courseData: Course;
    assignments: Assignment[];
    groupStats: GroupStat[];
  }) => {
    const isOpen$ = useObservable<boolean>(false);
    const { semester, courseCode, courseYear, courseName } =
      getCourseAttributes(courseData);
    if (assignments.length === 0) {
      return <></>;
    }
    const { stats: avgStats, totalWeight } = averageCourseStats(groupStats);
    //add edge to right side of label box
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
                  avg grade: {avgStats.mean?.toFixed(2)}%
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
              <div className={styles["divider"]} />
              <GroupTable {...{ stats: groupStats, totalWeight, isOpen$ }} />
              <AssignmentGraph
                {...{
                  courseData,
                  assignments,
                  groupStats,
                  totalWeight,
                  isOpen$,
                }}
              />
            </div>
          </div>
        </div>
      </>
    );
  }
);
function AssignmentGraph({
  courseData,
  assignments,
  groupStats,
  totalWeight,
  isOpen$,
}: {
  courseData: Course;
  assignments: Assignment[];
  groupStats: GroupStat[];
  totalWeight: number;
  isOpen$: Observable<boolean>;
}) {
  // get start and end dates
  let startDateISO = courseData.start_at;
  let endDateISO = courseData.end_at;
  if (!startDateISO) {
    // get earliest assignment
    return <></>;
  }
  if (!endDateISO) {
    // get latest assignment
    return <></>;
  }
  const startDate = new Date(startDateISO).getTime();
  const endDate = new Date(endDateISO).getTime();
  function getAssignmentDatePercentage(
    assignment: Assignment,
    startDate: number,
    endDate: number
  ) {
    const diff = endDate - startDate;
    const assignmentDateISO = assignment.due_at || assignment.created_at;
    if (!assignmentDateISO) return 0;
    const assignmentDate = new Date(assignmentDateISO).getTime();
    return ((assignmentDate - startDate) / diff) * 100;
  }
  //TODO: filter assignments if they don't have a due date or mean score
  const assignmentsFiltered = assignments.filter(
    (assignment) =>
      (assignment.due_at || assignment.created_at) &&
      assignment.score_statistics &&
      typeof assignment.score_statistics?.mean === "number"
  );

  const assignmentsNoScore = assignments.filter(
    (assignment) =>
      !assignment.score_statistics ||
      typeof assignment.score_statistics.mean !== "number"
  );
  const assignmentsNoDate = assignments.filter(
    (assignment) => !assignment.due_at && !assignment.created_at
  );
  //todo: think about separating assignments that use due date from assignments that use created_at lol
  //TODO calculate overall assignment weight and sort by weight so that the larger assignments are sent to the back
  // maybe add transparency too?
  let possibleErrorRange = 0;
  let totalPointsWeighted = 0;
  function getGroupWeightByID(groupStats: GroupStat[], id: number | null) {
    if (typeof id !== "number") return 0;
    for (const group of groupStats) {
      if (group?.group?.id === id) {
        const weight = getGroupWeight(group, totalWeight);
        if (weight !== "N/A") {
          return weight;
        } else {
          return 0;
        }
      }
    }
    return 0;
  }
  for (const assignment of assignments) {
    totalPointsWeighted +=
      ((assignment.points_possible || 0) *
        getGroupWeightByID(groupStats, assignment.assignment_group_id)) /
      100;
  }
  for (const assignment of assignmentsNoScore) {
    possibleErrorRange +=
      ((assignment.points_possible || 0) *
        getGroupWeightByID(groupStats, assignment.assignment_group_id)) /
      100;
  }
  return (
    <>
      <div className={styles["assignment-graph"]}>
        <div
          className={styles["assignment-graph-content"]}
          // TODO: hide if no graded assignments
          // style={{
          //   display: assignmentsFiltered.length ? "auto" : "none",
          // }}
        >
          <div className="min-label">0%</div>
          <div className="max-label">100%</div>
          {assignmentsFiltered.map((assignment) => (
            <div
              key={assignment.id}
              className={styles["data-point"]}
              style={{
                background: getGroupColor(assignment.assignment_group_id || 0),
                top: `${100 - (getAssignmentMean(assignment) || 0) * 100}%`,
                left: `${getAssignmentDatePercentage(
                  assignment,
                  startDate,
                  endDate
                )}%`,
                width: `5px`,
                height: `5px`,
              }}
            >
              {/* <div className={styles["assignment-name"]}>
        {assignment.name}
      </div> */}
              {/* <div className={styles["assignment-grade"]}>
        {assignment?.score_statistics?.mean}
      </div> */}
            </div>
          ))}
        </div>
        <div className={styles["assignment-graph-content-no-stats"]}>
          {assignmentsNoScore.map((assignment) => (
            <div
              key={assignment.id}
              className={styles["data-point"]}
              style={{
                background: getGroupColor(assignment.assignment_group_id || 0),
                top: `0%`,
                left: `${getAssignmentDatePercentage(
                  assignment,
                  startDate,
                  endDate
                )}%`,
                width: `5px`,
                height: `5px`,
              }}
            />
          ))}
        </div>
      </div>
      {/* {possibleErrorRange / totalPointsWeighted}
      {assignmentsNoScore.map((assignment) => (
        <div>
          {assignment.name} {assignment.points_possible}
        </div>
      ))} */}
    </>
  );
}
function GroupTable({
  stats,
  totalWeight,
  isOpen$,
}: {
  stats: GroupStat[];
  totalWeight: number;
  isOpen$: any;
}) {
  return (
    <table>
      <thead>
        <tr className={styles["column-labels"]}>
          <td className={styles["weight"]}>Weight</td>
          <td className={styles["category"]}>Category</td>
          <td>Average</td>
        </tr>
      </thead>
      <tbody>
        {stats.map((stat, idx) => {
          if (!stat.group.group_weight && !stat.stats.mean) return <></>;
          const isOpen = isOpen$.get();
          const groupWeight = getGroupWeight(stat, totalWeight);
          const transitionTime =
            typeof groupWeight === "number" ? groupWeight / 90 : 0;
          const roundedGroupWeight =
            groupWeight === "N/A" ? "N/A" : Math.round(groupWeight);
          const transitionDelay = `${
            isOpen ? idx / 30 : (stats.length - idx) / 100
          }s`;
          return (
            <tr key={stat.group.id}>
              <td>
                {roundedGroupWeight}%
                <div
                  className={styles["weight-bar"]}
                  style={{
                    width: `${isOpen ? groupWeight : 0}%`,
                    background: getGroupColor(stat.group.id),
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
  );
}
const getGroupWeight = (stat: GroupStat, totalWeight: number) => {
  if (stat.isWeighted || !stat.group.group_weight) {
    return stat.group.group_weight || "N/A";
  }
  //group weights from canvas are by default multiplied by 100 so do that here as well
  return (stat.group.group_weight / totalWeight) * 100;
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
function getGroupColor(
  id: number
): import("csstype").Property.Background<string | number> | undefined {
  const hue = (id * 165) % 360;
  return `HSL(${hue}, 50%, 60%)`;
}
export default CourseComponent;
function getAssignmentMean(assignment: Assignment) {
  if (assignment.score_statistics?.mean && assignment.points_possible) {
    return assignment.score_statistics?.mean / assignment?.points_possible;
  }
}
