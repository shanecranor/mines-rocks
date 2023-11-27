import {
  Assignment,
  AssignmentGroup,
  GradeStatistics,
  STAT_KEYS,
  Course,
  isSeason,
} from './database';

import {
  getAssignmentsByGroup,
  getRelevantGroups,
} from './data-aggregation-utils';
import { IBM_COLORS, IBM_EXPANDED_COLORS } from '@/utils/colors';

export type GroupStat = {
  group: AssignmentGroup;
  stats: GradeStatistics;
  numAssignments?: number;
  isWeighted: boolean;
};

//gets the average statistics for each assignment group
type GetStatsPerGroup = (
  assignments: Assignment[],
  assignmentGroups: AssignmentGroup[],
) => GroupStat[];

export const getStatsPerGroup: GetStatsPerGroup = (
  assignments,
  assignmentGroups,
) => {
  // remove assignment groups that aren't relevant to the assignments
  const courseAssignmentGroups = getRelevantGroups(
    assignments,
    assignmentGroups,
  );
  const isWeighted = courseAssignmentGroups.some(
    (group) => group.group_weight != 0 && group.group_weight != null,
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
  isWeighted: boolean,
): GroupStat {
  //get all assignments associated with the group
  const groupAssignments = getAssignmentsByGroup(assignments, group);
  const numAssignments = groupAssignments.length;
  //calculate averageStatistic for each stat type
  const out = {} as GradeStatistics;
  for (const statKey of STAT_KEYS) {
    const statValue = averageStatistic(groupAssignments, statKey)?.grade;
    if (statValue != undefined) out[statKey] = statValue;
  }
  // if the weights are not set, set the group weight to the total possible points
  const meanStat = averageStatistic(groupAssignments, 'mean');
  if (!isWeighted && meanStat) {
    const newGroup = structuredClone(group);
    newGroup.group_weight = meanStat.totalPossible;
    group = newGroup;
  }
  return { stats: out, group, numAssignments, isWeighted };
}

export const getAssignmentsByCourse = (
  assignments: Assignment[] | undefined,
  course: Course,
) => {
  if (!assignments) return [];
  return assignments.filter((assignment) => assignment.course_id === course.id);
};

type AverageStatistic = (
  assignmentList: Assignment[] | undefined,
  scoreStatistic: string,
) => { grade: number; totalPossible: number } | undefined;

export const averageStatistic: AverageStatistic = (
  assignmentList,
  scoreStatistic,
) => {
  if (!assignmentList) return;
  const pointsList = assignmentList.map((assignment) => {
    if (!assignment) return;
    if (!assignment['points_possible']) return;
    const stats = assignment['score_statistics'];
    if (!stats) return;
    //check if scoreStatistic is one of the keys in stats
    if (!Object.keys(stats).includes(scoreStatistic)) {
      console.error(`${scoreStatistic} not in assignment ${assignment.id}`);
      return;
    }
    return {
      actual: stats[scoreStatistic],
      possible: assignment['points_possible'],
    };
  });
  if (!pointsList || !pointsList.length) return;
  //remove undefined values
  const filteredScores = pointsList.filter(
    (points) =>
      points &&
      typeof points.possible === 'number' &&
      typeof points.actual === 'number',
  ) as { actual: number; possible: number }[];
  const totalPossible = filteredScores.reduce(
    (prev, curr) => prev + curr.possible,
    0,
  );
  const totalActual = filteredScores.reduce(
    (prev, curr) => prev + curr.actual,
    0,
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
      if (typeof grade === 'number' && !Number.isNaN(grade)) {
        out[statKey] = prev + (grade * weight) / totalWeight;
      }
    }
  }
  return { stats: out, totalWeight };
};

export const getGroupWeight = (stat: GroupStat, totalWeight: number) => {
  if (stat.isWeighted || !stat.group.group_weight) {
    return stat.group.group_weight ?? 'N/A';
  }
  //group weights from canvas are by default multiplied by 100 so do that here as well
  return (stat.group.group_weight / totalWeight) * 100;
};

export function getGroupStatByID(groupStats: GroupStat[], id: number) {
  return groupStats.filter((group) => id === group.group.id)[0];
}

export function getGroupColor(
  group: any,
  numGroups?: number,
): import('csstype').Property.Background<string | number> | undefined {
  const id = group.position;
  let palette = IBM_COLORS;
  if (numGroups && numGroups > palette.length) {
    palette = IBM_EXPANDED_COLORS;
  }
  return palette[id % palette.length];
  // return `HSL(${hue}, 50%, 60%)`;
}

export function getAssignmentMean(assignment: Assignment) {
  if (assignment.score_statistics?.mean && assignment.points_possible) {
    return assignment.score_statistics?.mean / assignment?.points_possible;
  }
  return NaN;
}

export type CourseAttributes = {
  semester: string;
  courseCode: string;
  courseYear: string;
  courseName: string;
};

export const getCourseAttributes = (course: Course): CourseAttributes => {
  const dataString = course.course_code || '';
  // split on both . and space
  const dataList = dataString.split(/\.|\s/);
  const semester = dataList[0]
    .replace('Sprg', 'Spring')
    .replace('Smr', 'Summer');
  const courseYear = dataList[1];
  // find the first 3 digit number, then remove everything after it
  const courseCode = dataList[2].replace(/(\d{3}).*/, '$1');
  if (!isSeason(semester.toLowerCase()))
    throw new Error(`Invalid semester: ${semester} from ${dataString}`);
  //if this code lives long enough, we'll have to update this to support 5 digit years
  if (!courseYear.match(/\d{4}/))
    throw new Error(`Invalid year: ${courseYear} from ${dataString}`);

  return {
    semester,
    courseCode,
    courseYear,
    courseName: course.name || '',
  };
};

export const splitCourseCode = (code: string) => {
  const courseNumber = code.slice(-3);
  const deptCode = code.slice(0, -3);
  return { deptCode, courseNumber };
};
