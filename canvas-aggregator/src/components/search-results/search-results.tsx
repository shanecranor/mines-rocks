import styles from "./search-results.module.scss";
import {
  Assignment,
  Course,
  getAssignmentsByCourse,
} from "@/services/database";
import CourseComponent, {
  getCourseAttributes,
} from "@/components/course-component/course-component";
import { observer } from "@legendapp/state/react";
import { Observable } from "@legendapp/state";
const SearchResults = observer(
  ({
    courseList,
    assignmentList,
    searchOptions$,
  }: {
    courseList: Course[] | undefined;
    assignmentList: Assignment[] | undefined;
    searchOptions$: any; //TODO add types for options
  }) => {
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

    return (
      <div className={styles["results"]}>
        {!courseList ? (
          <div>Loading...</div>
        ) : (
          filterCourseList(courseList, searchOptions$).map((course: Course) => (
            <CourseComponent
              courseData={course}
              key={course.id}
              assignmentList={getAssignmentsByCourse(assignmentList, course)}
            />
          ))
        )}
      </div>
    );
  }
);

export default SearchResults;
