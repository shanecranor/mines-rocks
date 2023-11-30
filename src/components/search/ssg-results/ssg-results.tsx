import styles from './ssg-results.module.scss';
import SsgSearchResultsClient from './ssg-results-client';
import { CourseSummaryData } from '@/components/course-component/summary-data/new-summary-data';
import { getNumAssignments } from '@/services/database';

/**
 * Fetches all courses from the cloudflare worker and passes them to the client search results component.
 * @returns The component that displays the search results.
 */
export const SsgResults = async () => {
  // fetch all courses from the cloudflare worker
  const response = await fetch(
    `https://search.mines.rocks/?search=&per_page=10000&show_partial=true`,
  );
  const courses = await response.json();
  // get number of assignments for each course
  for (const course of courses) {
    const numAssignments = await getNumAssignments(course.id);
    course.numAssignments = numAssignments;
  }
  const filteredCourses = courses.filter(
    (c: CourseSummaryData & { numAssignments: number }) => {
      return c.numAssignments > 0;
    },
  );
  return (
    <div className={styles['results']}>
      <SsgSearchResultsClient courses={filteredCourses} />
    </div>
  );
};
