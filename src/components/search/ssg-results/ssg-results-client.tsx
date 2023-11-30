'use client';
import { observer } from '@legendapp/state/react';
import { splitCourseCode } from '@/services/data-aggregation';
import { searchOptions$ } from '../search-options';
import {
  CourseSummaryData,
  CourseAttributes,
} from '@/components/course-component/summary-data/new-summary-data';
import NewCourseComponent from '@/components/course-component/new-course-component';
const NUM_RESULTS = 20;
const SsgSearchResultsClient = observer(
  ({ courses }: { courses: CourseSummaryData[] }) => {
    const searchOptions = searchOptions$.get();
    const courseList = filterCourseList(courses, searchOptions);
    return (
      <>
        <div>
          Showing {Math.min(NUM_RESULTS, courseList.length)} out of{' '}
          {courseList.length} courses.
        </div>
        {sortCourseList(courseList, searchOptions)
          .splice(0, NUM_RESULTS)
          .map((c: CourseSummaryData) => {
            return <NewCourseComponent courseData={c} key={c.id} />;
          })}
      </>
    );
  },
);
function getCourseDate(course: CourseSummaryData) {
  if (course.start_at !== null) return new Date(course.start_at);
  if (course.end_at !== null) return new Date(course.end_at);
  // if (course.created_at !== null) return new Date(course.created_at);
  return new Date(0);
}

function sortCourseList(courseList: any, searchOptions: any) {
  const sortDirection = searchOptions.sortOptions.isPrimarySortReversed
    ? -1
    : 1;
  return courseList.sort((a: CourseSummaryData, b: CourseSummaryData) => {
    const sortValue = searchOptions.sortOptions.primarySort;
    switch (sortValue) {
      case 'Date':
        return compareSemesters(a.attributes, b.attributes) * sortDirection;
      case 'Course Number':
        const { deptCode: a_, courseNumber: aCourseNum } = splitCourseCode(
          a.attributes.courseCode,
        );
        const { deptCode: b_, courseNumber: bCourseNum } = splitCourseCode(
          b.attributes.courseCode,
        );
        return (Number(bCourseNum) - Number(aCourseNum)) * sortDirection;
      case 'Course Name':
        if (a.name === null) return 1 * sortDirection;
        if (b.name === null) return -1 * sortDirection;
        return (
          b.name.localeCompare(a.name, undefined, {
            sensitivity: 'base',
          }) * sortDirection
        );
      //cases that need banner data, probably should refactor but this works for now
      case 'Total Sections':
      case 'Total Enrollment':
        // if (a.bannerCourses.length === 0) return 1 * sortDirection;
        // if (b.bannerCourses.length === 0) return -1 * sortDirection;
        if (sortValue === 'Total Sections') {
          return ((b.numSections || 0) - (a.numSections || 0)) * sortDirection;
        } else if (sortValue === 'Total Enrollment') {
          return ((b.enrollment || 0) - (a.enrollment || 0)) * sortDirection;
        }
    }
  });
}
function getSemesterEndDate(course: CourseAttributes): Date {
  const { semester, courseYear } = course;

  switch (semester) {
    case 'Spring':
      // Spring semester ends around May 16
      return new Date(parseInt(courseYear), 4, 16);
    case 'Summer':
      // Summer semester ends around August 21
      return new Date(parseInt(courseYear), 7, 21);
    case 'Fall':
      // Fall semester ends around December 21
      return new Date(parseInt(courseYear), 11, 21);
    default:
      throw new Error('Invalid semester');
  }
}

function filterCourseList(courseList: CourseSummaryData[], searchOptions: any) {
  const searchText = searchOptions.searchText.toLowerCase();
  return courseList.filter((course: CourseSummaryData) => {
    if (!searchOptions.showPartialClasses) {
      const uploadDate = !course.upload_date
        ? new Date('2023-11-01') //if upload date is null its bc the cf worker broke so we'll assume 2023
        : new Date(course.upload_date);
      if (!course.end_at)
        course.end_at = getSemesterEndDate(course.attributes).toISOString();
      if (course.end_at && new Date(course.end_at) > new Date(uploadDate))
        return false;
    }

    const attributes = course.attributes;
    const semesterKeys = Object.keys(searchOptions.semester);
    const semesterValues = Object.values(searchOptions.semester);
    const isSemesterMatch = semesterKeys.some((key, index) => {
      if (semesterValues[index]) {
        if (attributes && attributes.semester.toLowerCase().includes(key)) {
          return true;
        }
      }
    });
    if (!isSemesterMatch) {
      return false;
    }
    const searchString = `${course.attributes.courseCode} | ${
      course.name
    } | ${course?.instructors?.join(' , ')}`.toLowerCase();
    if (searchString && searchString.includes(searchText)) return true;
    return false;
  });
}

function compareSemesters(a: CourseAttributes, b: CourseAttributes): number {
  const semesterOrder = {
    Spring: 1,
    Summer: 2,
    Fall: 3,
  };

  if (a.courseYear !== b.courseYear) {
    return parseInt(b.courseYear) - parseInt(a.courseYear);
  }
  return semesterOrder[b.semester] - semesterOrder[a.semester];
}

export default SsgSearchResultsClient;
