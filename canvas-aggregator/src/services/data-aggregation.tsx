import { toNamespacedPath } from "path";
import {
  Assignment,
  AssignmentGroup,
  GradeStatistics,
  STAT_KEYS,
  Course,
} from "./database";
import { get } from "http";
import {
  getAssignmentsByGroup,
  getRelevantGroups,
} from "./data-aggregation-utils";

export type GroupStat = {
  group: AssignmentGroup;
  stats: GradeStatistics;
  isWeighted: boolean;
  totalWeight: number;
};

//gets the average statistics for each assignment group
type GetStatsPerGroup = (
  assignments: Assignment[],
  assignmentGroups: AssignmentGroup[]
) => GroupStat[];

export const getStatsPerGroup: GetStatsPerGroup = (
  assignments,
  assignmentGroups
) => {
  // remove assignment groups that aren't relevant to the assignments
  const courseAssignmentGroups = getRelevantGroups(
    assignments,
    assignmentGroups
  );
  const isWeighted = courseAssignmentGroups.some(
    (group) => group.group_weight !== null
  );
  const statsList = courseAssignmentGroups.map((group: AssignmentGroup) => {
    return getGroupStat(group, assignments, isWeighted);
  });
  return statsList;
};

//from a list of assignments and an assignment group, get the average statistics for that group
function getGroupStat(
  group: AssignmentGroup,
  assignments: Assignment[],
  isWeighted: boolean
): GroupStat {
  //get all assignments associated with the group
  const groupAssignments = getAssignmentsByGroup(assignments, group);
  //calculate averageStatistic for each stat type
  const out = {} as GradeStatistics;
  for (const statKey of STAT_KEYS) {
    const statValue = averageStatistic(groupAssignments, statKey)?.grade;
    if (statValue != undefined) out[statKey] = statValue;
  }
  // if the weights are not set, set the group weight to the total possible points
  const meanStat = averageStatistic(groupAssignments, "mean");
  if (!isWeighted && meanStat) {
    const newGroup = structuredClone(group);
    newGroup.group_weight = meanStat.totalPossible;
    group = newGroup;
  }
  return { stats: out, group, isWeighted };
}

export const getAssignmentsByCourse = (
  assignments: Assignment[] | undefined,
  course: Course
) => {
  if (!assignments) return [];
  return assignments.filter((assignment) => assignment.course_id === course.id);
};

type AverageStatistic = (
  assignmentList: Assignment[] | undefined,
  scoreStatistic: string
) => { grade: number; totalPossible: number } | undefined;

export const averageStatistic: AverageStatistic = (
  assignmentList,
  scoreStatistic
) => {
  if (!assignmentList) return;
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
  return { grade: (totalActual / totalPossible) * 100, totalPossible };
};

export const averageCourseStats = (stats: GroupStat[]) => {
  let totalWeight = 0;
  for (const stat of stats) {
    if (stat.group.group_weight && !Number.isNaN(stat.stats.mean))
      totalWeight += stat.group.group_weight;
  }
  //if the weights are set and the total weight is greater than 100, set the total weight to 100
  //this is kinda jank because it doesn't account for classes that are missing weights and have extra credit...
  //but idk how to fix that
  if (stats[0] && stats[0].isWeighted && totalWeight > 100) {
    totalWeight = 100;
  }
  const out = {} as GradeStatistics;
  for (const stat of stats) {
    const weight = stat.group.group_weight || 0;
    for (const statKey of STAT_KEYS) {
      const grade = stat.stats[statKey];
      let prev = out[statKey] || 0;
      if (typeof grade === "number" && !Number.isNaN(grade)) {
        out[statKey] = prev + (grade * weight) / totalWeight;
      }
    }
  }
  return { stats: out, totalWeight };
};
