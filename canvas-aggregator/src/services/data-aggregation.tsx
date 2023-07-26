import {
  Assignment,
  AssignmentGroup,
  GradeStatistics,
  STAT_KEYS,
  Course,
} from "./database";

//gets the average statistics for each assignment group
export const getStatsByGroup: (
  assignments: Assignment[],
  assignmentGroups: AssignmentGroup[]
) => { stats: GradeStatistics; group: AssignmentGroup }[] = (
  assignments,
  assignmentGroups
) => {
  // remove assignment groups that aren't relevant to the assignments
  const filteredAssignmentGroups = assignmentGroups.filter((group) =>
    assignments.some((a) => a.assignment_group_id === group.id)
  );
  const statsList = filteredAssignmentGroups.map((group: AssignmentGroup) => {
    //get all assignments associated with the group
    const groupAssignments = assignments.filter(
      (a) => a.assignment_group_id === group.id
    );
    //calculate averageStatistic for each stat type
    const out = STAT_KEYS.reduce(
      (prev, curr) => {
        return {
          ...prev,
          [curr]: averageStatistic(groupAssignments, curr),
        };
      },
      {} //initial value is empty object
    ) as GradeStatistics | any;
    return { stats: out, group };
  });
  return statsList;
};

export const getAssignmentGroupsFromAssignments: (
  assignmentGroupList: AssignmentGroup[] | undefined,
  courseAssignments: Assignment[]
) => AssignmentGroup[] | [] = (assignmentGroupList, courseAssignments) => {
  if (!assignmentGroupList || !courseAssignments) return [];
  return assignmentGroupList?.filter((assignmentGroup: AssignmentGroup) =>
    courseAssignments.some((a) => a.assignment_group_id === assignmentGroup.id)
  );
};

export const getAssignmentsByCourse = (
  assignments: Assignment[] | undefined,
  course: Course
) => {
  if (!assignments) return [];
  return assignments.filter((assignment) => assignment.course_id === course.id);
};

export const averageStatistic: (
  assignmentList: Assignment[] | undefined,
  scoreStatistic: string
) => number | undefined = (assignmentList, scoreStatistic) => {
  //TODO: if a class has no weights, then generate weights
  if (!assignmentList) return 0;
  const pointsList = assignmentList.map((assignment) => {
    if (!assignment) return;
    if (!assignment["points_possible"]) return;
    const stats = assignment["score_statistics"];
    if (!stats) return;
    //check if scoreStatistic is one of the keys in stats
    if (!Object.keys(stats).includes(scoreStatistic)) {
      console.error(`${scoreStatistic} not in assignment ${assignment.id}`);
      return;
    }
    return {
      actual: stats[scoreStatistic],
      possible: assignment["points_possible"],
    };
  });
  if (!pointsList || !pointsList.length) return;
  //remove undefined values
  const filteredScores = pointsList.filter(
    (points) =>
      points &&
      typeof points.possible === "number" &&
      typeof points.actual === "number"
  ) as { actual: number; possible: number }[];
  const totalPossible = filteredScores.reduce(
    (prev, curr) => prev + curr.possible,
    0
  );
  const totalActual = filteredScores.reduce(
    (prev, curr) => prev + curr.actual,
    0
  );
  return (totalActual / totalPossible) * 100;
};
