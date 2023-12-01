import {
  CourseAttributes,
  CourseSummaryData,
} from '@/components/course-component/summary-data/new-summary-data';

export function filterCourseList(
  courseList: CourseSummaryData[],
  searchOptions: any,
) {
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

export function getSemesterEndDate(course: CourseAttributes): Date {
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
