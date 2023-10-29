import styles from "./search-results.module.scss";
import {
  Assignment,
  AssignmentGroup,
  BannerCourse,
  Course,
} from "@/services/database";
import CourseComponent from "@/components/course-component/course-component";
import SearchResultsClient from "./search-results-client";
import {
  CourseAttributes,
  getAssignmentsByCourse,
  getCourseAttributes,
  getStatsPerGroup,
} from "@/services/data-aggregation";

const SearchResults = ({
  courses,
  assignments,
  assignmentGroups,
  bannerData,
}: {
  courses: Course[];
  assignments: Assignment[];
  assignmentGroups: AssignmentGroup[];
  bannerData: BannerCourse[];
}) => {
  // console.log(courses);
  const courseComponentList = courses.map((course: Course) => {
    const courseAssignments = getAssignmentsByCourse(assignments, course);
    const stats = getStatsPerGroup(courseAssignments, assignmentGroups);
    const bannerCourses = getMatchingBannerCourses(course, bannerData);
    return {
      course: course,
      bannerCourses,
      courseComponent: (
        <CourseComponent
          courseData={course}
          bannerCourses={bannerCourses}
          key={course.id}
          assignments={courseAssignments}
          groupStats={stats}
        />
      ),
    };
  });
  return <SearchResultsClient {...{ courseComponentList }} />;
};
export default SearchResults;
function getMatchingBannerCourses(course: Course, bannerData: BannerCourse[]) {
  return bannerData.filter((bannerCourse) => {
    const bannerAtribs = getBannerCourseAttributes(bannerCourse);
    const canvasAtribs = getCourseAttributes(course);
    return (
      bannerAtribs.courseCode.localeCompare(canvasAtribs.courseCode, undefined, { sensitivity: 'base' }) === 0 &&
      bannerAtribs.semester.localeCompare(canvasAtribs.semester, undefined, { sensitivity: 'base' }) === 0 &&
      bannerAtribs.courseYear.localeCompare(canvasAtribs.courseYear, undefined, { sensitivity: 'base' }) === 0
    );
  });
}

function getBannerCourseAttributes(
  bannerCourse: BannerCourse
): CourseAttributes {
  const searchInput = bannerCourse.searchInput;
  const courseCode = bannerCourse.subjectCourse;
  if (!courseCode) throw new Error(`No course code found for ${searchInput}`);
  const termDesc = bannerCourse.termDesc;
  const courseYear = termDesc?.split(" ")[1];
  if (!courseYear)
    throw new Error(`No year found in ${termDesc} for ${courseCode}`);
  const semester = termDesc?.split(" ")[0];
  if (!semester) throw new Error(`No semester found for ${courseCode}`);
  const courseName = bannerCourse.courseTitle;
  if (!courseName) throw new Error(`No course name found for ${courseCode}`);
  return { semester, courseCode, courseYear, courseName };
}
