import {
  Assignment,
  AssignmentGroup,
  BannerCourse,
  Course,
  GradeStatistics,
  STAT_KEYS,
  getAssignmentsForCourse,
} from '@/services/database';
import {
  GroupStat,
  averageCourseStats,
  getStatsPerGroup,
  getGroupWeight,
  getGroupColor,
  getCourseAttributes,
} from '@/services/data-aggregation';
import { SummaryData } from './summary-data/summary-data';
import CourseClientComponent from './course-client-component';
import AssignmentGraph from './assignment-graph/assignment-graph';
import { GroupTable } from './group-table/group-table';

const CourseComponent = async ({
  courseData,
  groupStats,
  bannerCourses,
}: // assignmentData,
{
  courseData: Course;
  assignments: Assignment[];
  groupStats: GroupStat[];
  bannerCourses: BannerCourse[];
}) => {
  const { semester, courseCode, courseYear, courseName } =
    getCourseAttributes(courseData);
  const assignments = await getAssignmentsForCourse(String(courseData.id));
  if (assignments.length === 0) {
    return <></>;
  }

  const { stats: avgStats, totalWeight } = averageCourseStats(groupStats);
  const summaryData = (
    <SummaryData
      {...{
        course: courseData,
        courseCode,
        semester,
        courseYear,
        avgStats,
        bannerCourses,
      }}
    />
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
