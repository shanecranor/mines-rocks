import {
  GroupStat,
  getAssignmentMean,
  getGroupColor,
  getGroupStatByID,
  getGroupWeight,
} from '@/services/data-aggregation';
import { Course, Assignment } from '@/services/database';
import styles from './assignment-graph.module.scss';
// import { PaletteDemo } from '../../utils/colors';
export default function AssignmentGraph({
  courseData,
  assignments,
  groupStats,
  totalWeight,
}: {
  courseData: Course;
  assignments: Assignment[];
  groupStats: GroupStat[];
  totalWeight: number;
}) {
  // get start and end dates
  let startDateISO = courseData.start_at;
  let endDateISO = courseData.end_at;
  if (startDateISO && endDateISO) {
    const startToEnd =
      new Date(endDateISO).getTime() - new Date(startDateISO).getTime();
    //if the distance between the start and end date is longer than 9 months, use the start and end date of the first and last assignment
    if (startToEnd > 1000 * 60 * 60 * 24 * 30 * 9) {
      startDateISO = null;
      endDateISO = null;
    }
    //or if shorter than 5 weeks, use the start and end date of the first and last assignment
    if (startToEnd < 1000 * 60 * 60 * 24 * 7 * 5) {
      startDateISO = null;
      endDateISO = null;
    }
  }
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
      assignment.score_statistics &&
      typeof assignment.score_statistics?.mean === 'number',
  );
  const assignmentsNoScore = assignments.filter(
    (assignment) =>
      !assignment.score_statistics ||
      typeof assignment.score_statistics.mean !== 'number',
  );
  const assignmentsNoDate = assignments.filter(
    (assignment) =>
      !assignment.due_at &&
      !assignment.created_at &&
      assignment.score_statistics &&
      typeof assignment.score_statistics?.mean === 'number',
  );
  //todo: think about separating assignments that use due date from assignments that use created_at lol
  //TODO calculate overall assignment weight and sort by weight so that the larger assignments are sent to the back
  // maybe add transparency too?
  let possibleErrorRange = 0;
  let totalPointsWeighted = 0;
  function getGroupWeightByID(groupStats: GroupStat[], id: number | null) {
    if (typeof id !== 'number') return 0;
    for (const group of groupStats) {
      if (group?.group?.id === id) {
        const weight = getGroupWeight(group, totalWeight);
        if (weight !== 'N/A') {
          return weight;
        } else {
          return 0;
        }
      }
    }
    return 0;
  }
  for (const assignment of assignments) {
    totalPointsWeighted +=
      ((assignment.points_possible || 0) *
        getGroupWeightByID(groupStats, assignment.assignment_group_id)) /
      100;
  }
  for (const assignment of assignmentsNoScore) {
    possibleErrorRange +=
      ((assignment.points_possible || 0) *
        getGroupWeightByID(groupStats, assignment.assignment_group_id)) /
      100;
  }
  const bubbleSize = 10;
  return (
    <>
      <div className={styles['assignment-graph']}>
        {/* <PaletteDemo /> */}
        <div className={styles['graph-title']}>
          Individual Canvas Assignments
        </div>
        {assignmentsFiltered.length !== 0 && (
          <div className={styles['assignment-graph-content']}>
            <div className={styles['max-label']}>100%</div>
            <div className={styles['min-label']}>0%</div>
            <div className={styles['eos-label']}>end of semester</div>

            {assignmentsFiltered.map((assignment) => {
              // ((assignment.points_possible || 0) / totalPointsWeighted) * 100;
              // thinking about some kind of histogram display for assignments by grade percentage
              // might be better in table or text form
              // ie there are 5 assignments that are worth 2% of your grade 2 assignments worth 10% and 1 assignment worth 70% of your grade
              // this is probably better for individual course pages?
              // this could potentially replace the assignment mean vs time graph
              // feels a bit more useful for people who aren't in the class
              // vs the old graph where it is super specific with individual assignments and doesn't do super well with assignments that haven't been graded?
              // TODO: check out the grading policies for HASS200 or HASS498 and see if they show how many get dropped.
              // could put that data, along with number of assignments next to the average for each group
              let groupColor: any = '#000';
              if (assignment.assignment_group_id !== null) {
                groupColor = getGroupColor(
                  getGroupStatByID(groupStats, assignment.assignment_group_id)
                    .group,
                  groupStats.length,
                );
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
                    className={styles['assignment-name-overlay']}
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
            <div className={styles['assignment-graph-content-no-stats']}>
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
                  groupColor = getGroupColor(
                    getGroupStatByID(groupStats, assignment.assignment_group_id)
                      .group,
                    groupStats.length,
                  );
                }
                return (
                  <div
                    key={assignment.id}
                    className={styles['data-point']}
                    style={{
                      background: groupColor,
                      top: `0%`,
                      left: `${assignmentDatePercentage}%`,
                      width: `${bubbleSize}px`,
                      height: `${bubbleSize}px`,
                    }}
                  >
                    <div
                      className={styles['assignment-name-overlay']}
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
      {/* {possibleErrorRange / totalPointsWeighted}
      {assignmentsNoScore.map((assignment) => (
        <div>
          {assignment.name} {assignment.points_possible}
        </div>
      ))} */}
    </>
  );
}
