"use client";
import styles from "./search-results.module.scss";
import { Course } from "@/services/database";
import { observer } from "@legendapp/state/react";
import { getCourseAttributes } from "@/services/data-aggregation";
import { searchOptions$ } from "../search-options";
type CourseAndComponent = { course: Course; courseComponent: React.ReactNode };

const SearchResultsClient = observer(
  ({ courseComponentList }: { courseComponentList: CourseAndComponent[] }) => {
    const courseList = filterCourseList(courseComponentList, searchOptions$);
    return (
      <div className={styles["results"]}>
        {filterCourseList(courseList, searchOptions$).map(
          (c: CourseAndComponent) => {
            return c.courseComponent;
          }
        )}
      </div>
    );
  }
);

function filterCourseList(courseList: any, searchOptions$: any) {
  return courseList.filter((courseAndComponent: CourseAndComponent) => {
    const c = courseAndComponent.course;
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
export default SearchResultsClient;
