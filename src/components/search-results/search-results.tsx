"use client";
import styles from "./search-results.module.scss";
import { Assignment, AssignmentGroup, Course } from "@/services/database";
import CourseComponent from "@/components/course-component/course-component";
import { observer } from "@legendapp/state/react";
import { Observable } from "@legendapp/state";
import {
  getAssignmentsByCourse,
  getCourseAttributes,
  getStatsPerGroup,
} from "@/services/data-aggregation";
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
          filterCourseList(courseList, searchOptions$).map((course: Course) => {
            const courseAssignments = getAssignmentsByCourse(
              assignments,
              course
            );
            const stats = getStatsPerGroup(courseAssignments, assignmentGroups);

            return (
              <CourseComponent
                courseData={course}
                key={course.id}
                assignments={courseAssignments}
                groupStats={stats}
              />
            );
          })
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
    const isCourseCodeMatch = attributes.courseCode
      .toLowerCase()
      .includes(searchOptions$.get().searchText.toLowerCase());
    const isSemsesterMatch = semesterKeys.some((key, index) => {
      if (semesterValues[index]) {
        if (attributes.semester.toLowerCase().includes(key)) {
          return true;
        }
      }
    });
    if (isSemsesterMatch && isCourseCodeMatch) {
      return true;
    }
    return false;
  });
}
export default SearchResults;
