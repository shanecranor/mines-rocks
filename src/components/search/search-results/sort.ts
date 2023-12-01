import {
  CourseAttributes,
  CourseSummaryData,
} from '@/components/course-component/summary-data/new-summary-data';
import { splitCourseCode } from '@/services/data-aggregation';

export function sortCourseList(courseList: any, searchOptions: any) {
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
