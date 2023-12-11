'use client';
import { observer, useObservable } from '@legendapp/state/react';
import { searchOptions$ } from '../../../search-options';
import {
  CourseSummaryData,
  NewSummaryData,
} from '@/components/course-component/summary-data/new-summary-data';
import NewCourseComponent from '@/components/course-component/new-course-component';
import { sortCourseList } from '../../sort';
import { filterCourseList } from '../../filter';
import { NewAssignmentGraph } from '@/components/course-component/assignment-graph/new-assignment-graph';
import { GroupTable } from '@/components/course-component/group-table/group-table';
import styles from '../../../../course-component/course-component.module.scss';
import AssignmentGraph from '@/components/course-component/assignment-graph/assignment-graph';

const NUM_RESULTS = 20;

/**
 * Renders the search results from the staticly fetched data
 * Search and filter options are applied client side
 * @param courses - The array of course summary data.
 * @returns The JSX element that displays the search results.
 */
const SsgDummySearchResultsClient = observer(
  ({
    courses,
  }: {
    courses: (CourseSummaryData & { graph: JSX.Element })[];
  }) => {
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
          .map((c: CourseSummaryData & { graph: JSX.Element }) => {
            return <DummyCourseComponent courseData={c} key={c.id} />;
          })}
      </>
    );
  },
);

export default SsgDummySearchResultsClient;

const DummyCourseComponent = observer(
  ({
    courseData,
  }: {
    courseData: CourseSummaryData & { graph: JSX.Element };
  }) => {
    const courseId = courseData.id;
    const isOpen$ = useObservable<boolean>(false);
    const hasOpen$ = useObservable<boolean>(false); // removes pop-out animation for graphs after first load
    const hoveredGroup$ = useObservable<number | null>(null);
    if (isOpen$.get()) {
      hasOpen$.set(true);
    }
    return (
      <>
        <div
          className={`${styles['course-component']}`}
          onClick={() => isOpen$.set(!isOpen$.peek())}
        >
          <NewSummaryData courseData={courseData} mean={undefined} />
          {/* TY to the goat https://css-tricks.com/author/chriscoyier/ for CSS Grid animations :) */}
          <div
            className={styles['big-view']}
            style={{ gridTemplateRows: isOpen$.get() ? '1fr' : '0fr' }}
          >
            <div
              className={styles['big-content']}
              style={{
                visibility: isOpen$.get() ? 'visible' : 'hidden',
              }}
            >
              <div className={styles['divider']} />
              {/* graphs and stuff go here */}
              {courseData.graph}
            </div>
          </div>
        </div>
      </>
    );
  },
);
import { getAssignmentMean } from '@/services/data-aggregation';
import styles2 from '../../../../course-component/assignment-graph/assignment-graph.module.scss';
import { faker } from '@faker-js/faker';
import { Assignment } from '@/services/database';
import { generateAssignment } from './assignment-generator';
// import { PaletteDemo } from '../../utils/colors';
export function DummyAssignmentGraph({
  assignments,
}: {
  assignments: Assignment[];
}) {
  // get start and end dates
  let startDateISO = null;
  let endDateISO = null;
  let sortedAssignments;
  if (!startDateISO || !endDateISO) {
    // if no start date, use the earliest assignment date
    // sort assignments by date
    const filteredAssignments = assignments.filter(
      (assignment) => assignment.due_at || assignment.created_at,
    );
    sortedAssignments = filteredAssignments.sort((a, b) => {
      if (a.due_at === null && a.created_at === null) return 1;
      if (b.due_at === null && b.created_at === null) return -1;
      const aDate = new Date(
        a.due_at || a.updated_at || a.created_at!,
      ).getTime();
      const bDate = new Date(
        b.due_at || b.updated_at || b.created_at!,
      ).getTime();
      return aDate - bDate;
    });
    //remove assignments with no date

    // get first assignment date
    const firstAssignment = sortedAssignments[0];
    const lastAssignment = sortedAssignments[sortedAssignments.length - 1];
    startDateISO = firstAssignment.due_at || firstAssignment.created_at;
    endDateISO = lastAssignment.due_at || lastAssignment.created_at;
  }
  if (startDateISO === null || endDateISO === null) return <></>;
  const startDate = new Date(startDateISO).getTime();
  const endDate = new Date(endDateISO).getTime() + 1000 * 60 * 60 * 24 * 3;
  function getAssignmentDatePercentage(
    assignment: Assignment,
    startDate: number,
    endDate: number,
  ) {
    const diff = endDate - startDate;
    const assignmentDateISO =
      assignment.due_at || assignment.updated_at || assignment.created_at;
    if (!assignmentDateISO) return 0;
    const assignmentDate = new Date(assignmentDateISO).getTime();
    return ((assignmentDate - startDate) / diff) * 100; //.toFixed(2);
  }
  const assignmentsFiltered = assignments.filter(
    (assignment) =>
      (assignment.due_at || assignment.created_at) &&
      !isNaN(getAssignmentMean(assignment)) &&
      typeof assignment.score_statistics?.mean === 'number',
  );
  const assignmentsNoScore = assignments.filter(
    (assignment) =>
      !assignment.score_statistics ||
      typeof assignment.score_statistics.mean !== 'number' ||
      isNaN(getAssignmentMean(assignment)),
  );
  const bubbleSize = 10;
  return (
    <>
      <div className={styles2['assignment-graph']}>
        {/* <PaletteDemo /> */}
        <div className={styles2['graph-title']}>
          Individual Canvas Assignments
        </div>
        {assignmentsFiltered.length !== 0 && (
          <div className={styles2['assignment-graph-content']}>
            <div className={styles2['max-label']}>100%</div>
            <div className={styles2['min-label']}>0%</div>
            <div className={styles2['eos-label']}>end of semester</div>

            {assignmentsFiltered.map((assignment) => {
              let groupColor: any = '#000';
              if (assignment.assignment_group_id !== null) {
                groupColor = faker.color.human();
              }
              const assignmentDatePercentage = getAssignmentDatePercentage(
                assignment,
                startDate,
                endDate,
              );
              let labelTranslate = 'translate(10px)';
              if (Number(assignmentDatePercentage) > 50) {
                labelTranslate = 'translate(-100%)';
              }
              const mean = getAssignmentMean(assignment);
              return (
                <div
                  key={assignment.id}
                  className={styles['data-point']}
                  style={{
                    background: groupColor,
                    top: `${(100 - (mean || 0) * 100).toFixed(2)}%`,
                    left: `${assignmentDatePercentage}%`,
                    width: `${bubbleSize}px`,
                    height: `${bubbleSize}px`,
                  }}
                >
                  <div
                    className={styles2['assignment-name-overlay']}
                    style={{
                      transform: labelTranslate,
                    }}
                  >
                    {`${mean !== undefined && Math.round(mean * 100)}% - ${
                      assignment.name
                    }`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {assignmentsNoScore.length !== 0 && (
          <>
            Assignments without a score
            <div className={styles2['assignment-graph-content-no-stats']}>
              {assignmentsNoScore.map((assignment) => {
                const assignmentDatePercentage = getAssignmentDatePercentage(
                  assignment,
                  startDate,
                  endDate,
                );
                let labelTranslate = 'translate(10px)';
                if (Number(assignmentDatePercentage) > 50) {
                  labelTranslate = 'translate(-100%)';
                }
                let groupColor: any = '#000';
                if (assignment.assignment_group_id !== null) {
                  groupColor = faker.color.human();
                }
                return (
                  <div
                    key={assignment.id}
                    className={styles2['data-point']}
                    style={{
                      background: groupColor,
                      top: `0%`,
                      left: `${assignmentDatePercentage}%`,
                      width: `${bubbleSize}px`,
                      height: `${bubbleSize}px`,
                    }}
                  >
                    <div
                      className={styles2['assignment-name-overlay']}
                      style={{
                        transform: labelTranslate,
                      }}
                    >
                      {assignment.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}
