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
  getGroupWeight,
  getGroupColor,
  getCourseAttributes,
} from "@/services/data-aggregation";
import { SummaryData } from "./summary-data";
import CourseClientComponent from "./course-client-component";
import AssignmentGraph from "./assignment-graph";
import { GroupTable } from "./group-table";

const CourseComponent = ({
  courseData,
  assignments,
  groupStats,
}: // assignmentData,
{
  courseData: Course;
  assignments: Assignment[];
  groupStats: GroupStat[];
}) => {
  const { semester, courseCode, courseYear, courseName } =
    getCourseAttributes(courseData);
  if (assignments.length === 0) {
    return <></>;
  }
  const { stats: avgStats, totalWeight } = averageCourseStats(groupStats);
  const summaryData = (
    <SummaryData {...{ courseCode, semester, courseYear, avgStats }} />
  );
  const groupTableProps = {
    stats: groupStats,
    totalWeight,
  };
  const expandedData = (
    <AssignmentGraph
      {...{
        courseData,
        assignments,
        groupStats,
        totalWeight,
      }}
    />
  );
  return (
    <CourseClientComponent
      {...{ summaryData, expandedData, groupTableProps }}
    />
  );
};

export default CourseComponent;
