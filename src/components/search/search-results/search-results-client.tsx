"use client";
import styles from "./search-results.module.scss";
import { BannerCourse, Course } from "@/services/database";
import { observer } from "@legendapp/state/react";
import { getCourseAttributes, splitCourseCode } from "@/services/data-aggregation";
import { searchOptions$ } from "../search-options";
import { getEnrollment, getLabAndNonLabCourses, instructorsFromBanner } from "@/services/info-aggregation";
type CourseAndComponent = { course: Course; bannerCourses: BannerCourse[], courseComponent: React.ReactNode };

const SearchResultsClient = observer(
  ({ courseComponentList }: { courseComponentList: CourseAndComponent[] }) => {
    const courseList = filterCourseList(courseComponentList, searchOptions$);
    return (
      <div className={styles["results"]}>
        {sortCourseList(filterCourseList(courseList, searchOptions$), searchOptions$).map(
          (c: CourseAndComponent) => {
            return c.courseComponent;
          }
        )}
      </div>
    );
  }
);
function getCourseDate(course: Course) {
  if (course.start_at !== null)
    return new Date(course.start_at)
  if (course.end_at !== null)
    return new Date(course.end_at)
  if (course.created_at !== null)
    return new Date(course.created_at)
  return new Date(0)
}

function sortCourseList(courseList: any, searchOptions$: any) {
  const sortDirection = searchOptions$.sortOptions.isPrimarySortReversed.get() ? -1 : 1
  return courseList.sort((a: CourseAndComponent, b: CourseAndComponent) => {
    const sortValue = searchOptions$.sortOptions.primarySort.get()
    switch (sortValue) {
      case "Date":
        const bTime = getCourseDate(b.course).getTime()
        const aTime = getCourseDate(a.course).getTime()
        return (bTime - aTime) * sortDirection
      case "Course Number":
        const { deptCode: aDeptCode, courseNumber: aCourseNum } = splitCourseCode(getCourseAttributes(a.course).courseCode)
        const { deptCode: bDeptCode, courseNumber: bCourseNum } = splitCourseCode(getCourseAttributes(b.course).courseCode)
        return (Number(bCourseNum) - Number(aCourseNum)) * sortDirection
      case "Course Name":
        if (a.course.name === null) return 1 * sortDirection
        if (b.course.name === null) return -1 * sortDirection
        return b.course.name.localeCompare(a.course.name, undefined, { sensitivity: 'base' }) * sortDirection
      //cases that need banner data, probably should refactor but this works for now
      case "Total Sections": case "Total Enrollment":
        if (a.bannerCourses.length === 0) return 1 * sortDirection
        if (b.bannerCourses.length === 0) return -1 * sortDirection
        const { nonLabCourses: aNonLabCourses, labCourses: aLabCourses } = getLabAndNonLabCourses(a.bannerCourses)
        const { nonLabCourses: bNonLabCourses, labCourses: bLabCourses } = getLabAndNonLabCourses(b.bannerCourses)
        if (sortValue === "Total Sections") {
          const aSections = aNonLabCourses.length || aLabCourses.length;
          const bSections = bNonLabCourses.length || bLabCourses.length;
          return (bSections - aSections) * sortDirection
        } else if (sortValue === "Total Enrollment") {
          const aEnrollment = getEnrollment(aNonLabCourses, aLabCourses)
          const bEnrollment = getEnrollment(bNonLabCourses, bLabCourses)
          return (bEnrollment - aEnrollment) * sortDirection
        }
    }
  })
}

function filterCourseList(courseList: any, searchOptions$: any) {
  const searchText = searchOptions$.get().searchText.toLowerCase();
  return courseList.filter((courseAndComponent: CourseAndComponent) => {
    const c = courseAndComponent.course;
    const bannerCourses = courseAndComponent.bannerCourses;
    const attributes = getCourseAttributes(c);
    const semesterKeys = Object.keys(searchOptions$.semester.get());
    const semesterValues = Object.values(searchOptions$.semester.get());
    const isSemesterMatch = semesterKeys.some((key, index) => {
      if (semesterValues[index]) {
        if (attributes.semester.toLowerCase().includes(key)) {
          return true;
        }
      }
    });
    //exit if semester filter doesn't match
    if (!isSemesterMatch) {
      return false
    }

    if (attributes.courseCode.toLowerCase().includes(searchText)) {
      return true
    }

    if (c.name) {
      if (c.name.toLowerCase().includes(searchText)) {
        return true;
      }
    }
    if (bannerCourses) {
      const instructors = instructorsFromBanner(bannerCourses);
      for (const instructor of instructors) {
        if (instructor.toLowerCase().includes(searchText)) {
          return true;
        }
      }
      let bannerCourseName = null;
      if (bannerCourses && bannerCourses[0]) {
        bannerCourseName = bannerCourses[0].courseTitle;
      }
      if (bannerCourseName && bannerCourseName.toLowerCase().includes(searchText)) {
        return true;
      }
    }


    return false;
  });
}
export default SearchResultsClient;
