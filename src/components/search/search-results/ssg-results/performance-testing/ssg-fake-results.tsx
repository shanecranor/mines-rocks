import styles from '../ssg-results.module.scss';
import SsgSearchResultsClient from '../ssg-results-client';
import { CourseSummaryData } from '@/components/course-component/summary-data/new-summary-data';
import { Course, getNumAssignments } from '@/services/database';
import { generateFakeDbResponse } from './course-generation';
import SsgDummySearchResultsClient, {
  DummyAssignmentGraph,
} from './ssg-dummy-results-client';
import { generateAssignment } from './assignment-generator';
import { faker } from '@faker-js/faker';

/**
 * Fetches all courses from the cloudflare worker and passes them to the client search results component.
 * @returns A JSX element that wraps the client search results component
 */
export const SsgFakeResults = async ({
  numCourses,
}: {
  numCourses: number;
}) => {
  // fetch all courses from the cloudflare worker
  const courses = generateFakeDbResponse(numCourses);
  const filteredCourses = courses.filter(
    (c: CourseSummaryData & { numAssignments: number }) => {
      return c.numAssignments > 0;
    },
  );
  const assignmentCourses = filteredCourses.map((c) => {
    return {
      ...c,
      graph: (
        <DummyAssignmentGraph
          assignments={Array.from({ length: 55 }, () =>
            generateAssignment(faker.date.past(), faker.date.future()),
          )}
        />
      ),
    };
  });
  return (
    <div className={styles['results']}>
      <SsgDummySearchResultsClient courses={assignmentCourses} />
    </div>
  );
};
