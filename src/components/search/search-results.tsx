import styles from "./search-results.module.scss";
import { Assignment, AssignmentGroup, Course } from "@/services/database";
import CourseComponent from "@/components/course-component/course-component";
import SearchResultsClient from "@/components/search/search-client";
import {
  getAssignmentsByCourse,
  getCourseAttributes,
  getStatsPerGroup,
} from "@/services/data-aggregation";

const SearchResults = ({
  courses,
  assignments,
  assignmentGroups,
}: {
  courses: Course[];
  assignments: Assignment[];
  assignmentGroups: AssignmentGroup[];
}) => {
  // console.log(courses);
  const courseComponentList = courses.map((course: Course) => {
    const courseAssignments = getAssignmentsByCourse(assignments, course);
    const stats = getStatsPerGroup(courseAssignments, assignmentGroups);
    return {
      course: course,
      courseComponent: (
        <CourseComponent
          courseData={course}
          key={course.id}
          assignments={courseAssignments}
          groupStats={stats}
        />
      ),
    };
  });
  return (
    <div className={styles["results"]}>
      <SearchResultsClient {...{ courseComponentList }} />
    </div>
  );
};
export default SearchResults;
