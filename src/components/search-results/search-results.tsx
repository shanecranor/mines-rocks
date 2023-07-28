import styles from "./search-results.module.scss";
import { Assignment, AssignmentGroup, Course } from "@/services/database";
import CourseComponent, {
  getCourseAttributes,
} from "@/components/course-component/course-component";
import { observer } from "@legendapp/state/react";
import { Observable } from "@legendapp/state";
import { getAssignmentsByCourse } from "@/services/data-aggregation";
const SearchResults = observer(
  ({
    courses$,
    assignments$,
    assignmentGroups$,
    searchOptions$,
  }: {
    courses$: Observable<Course[]>;
    assignments$: Observable<Assignment[]>;
    assignmentGroups$: Observable<AssignmentGroup[]>;
    searchOptions$: any; //TODO add types for options
  }) => {
    const courseList = filterCourseList(courses$.get(), searchOptions$);
    const assignments = assignments$.get();
    const assignmentGroups = assignmentGroups$.get();
    return (
      <div className={styles["results"]}>
        {!courseList ? (
          <div>Loading...</div>
        ) : (
          filterCourseList(courseList, searchOptions$).map((course: Course) => (
            <CourseComponent
              courseData={course}
              key={course.id}
              assignments={getAssignmentsByCourse(assignments, course)}
              assignmentGroups={assignmentGroups}
            />
          ))
        )}
      </div>
    );
  }
);
function filterCourseList(courseList: any, searchOptions$: any) {
  return courseList.filter((c: Course) => {
    const attributes = getCourseAttributes(c);
    const semesterPrefs = searchOptions$.semester.get();
    const semesterKeys = Object.keys(searchOptions$.semester.get());
    const semesterValues = Object.values(searchOptions$.semester.get());
    const isSemsesterMatch = semesterKeys.some((key, index) => {
      if (semesterValues[index]) {
        if (attributes.semester.toLowerCase().includes(key)) {
          return true;
        }
      }
    });
    if (isSemsesterMatch) {
      return true;
    }
    return false;
  });
}
export default SearchResults;
