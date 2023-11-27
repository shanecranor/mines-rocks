import { Assignment, AssignmentGroup, GradeStatistics, STAT_KEYS } from '../../types/types';
import { buildAssignmentMap } from './assignment-util';

export type GroupStat = {
	group: AssignmentGroup;
	stats: GradeStatistics;
	numAssignments?: number;
	isWeighted: boolean;
};

type GetStatsPerGroup = (assignments: Assignment[], assignmentGroups: AssignmentGroup[]) => GroupStat[];
/**
 * Calculates the statistics per group based on the given assignments and assignment groups.
 * @param assignments - The list of assignments.
 * @param assignmentGroups - The list of assignment groups.
 * @returns Arrray of GroupStat objects containing stats, number of assignments, and weightenness for each group.
 */
export const getStatsPerGroup: GetStatsPerGroup = (assignments, assignmentGroups) => {
	//check if any of the groups have a weight to determine if the course is weighted
	const isWeighted = assignmentGroups.some((group: AssignmentGroup) => group.group_weight != 0 && group.group_weight != null);
	//calculate the stats for each group
	const assignmentMap = buildAssignmentMap(assignments);
	const statsList = assignmentGroups.map((group: AssignmentGroup) => {
		const groupAssignments = assignmentMap.get(group.id);
		return getGroupStat(group, groupAssignments || [], isWeighted);
	});
	return statsList;
};

/**
 * Calculates the group statistics for a given assignment group's assignments.
 *
 * @param group - The assignment group.
 * @param groupAssignments - The assignments associated with the group.
 * @param isWeighted - Indicates whether the group is weighted.
 * @returns The group statistics including average grade for each stat type, the modified group object, the number of assignments, and the weighted status.
 */
function getGroupStat(group: AssignmentGroup, groupAssignments: Assignment[], isWeighted: boolean): GroupStat {
	//get all assignments associated with the group
	const numAssignments = groupAssignments.length;
	//calculate averageStatistic for each stat type
	const out = {} as GradeStatistics;
	for (const statKey of STAT_KEYS) {
		const statValue = aggregateAssignmentStat(groupAssignments, statKey)?.grade;
		if (statValue != undefined) out[statKey] = statValue;
	}
	// if the weights are not set, set the group weight to the total possible points
	const meanStat = aggregateAssignmentStat(groupAssignments, 'mean');
	if (!isWeighted && meanStat) {
		const newGroup = structuredClone(group);
		newGroup.group_weight = meanStat.totalPossible;
		group = newGroup;
	}
	return { stats: out, group, numAssignments, isWeighted };
}

type AggregateAssignmentStats = (
	assignmentList: Assignment[] | undefined,
	scoreStatistic: string
) => { grade: number; totalPossible: number } | undefined;

/**
 * Aggregates the value of a specified score statistic for a list of assignments.
 * @param assignmentList - The list of assignments.
 * @param scoreStatistic - The specific stat (mean, min, etc) to aggregate
 * @returns An object containing the grade and total possible points.
 */
export const aggregateAssignmentStat: AggregateAssignmentStats = (assignmentList, scoreStatistic) => {
	if (!assignmentList) return;

	//get the possible points and actual points for each assignment
	const pointsList = assignmentList.map((assignment) => {
		if (!assignment) return;
		if (!assignment['points_possible']) return;
		const stats = assignment['score_statistics'];
		if (!stats) return;
		//check if scoreStatistic is one of the keys in stats
		if (!Object.keys(stats).includes(scoreStatistic)) {
			throw new Error(`${scoreStatistic} not in assignment ${assignment.id}`);
		}
		return {
			actual: stats[scoreStatistic],
			possible: assignment['points_possible'],
		};
	});
	if (!pointsList || !pointsList.length) return;
	//remove undefined values
	const filteredScores = pointsList.filter(
		(points) => points && typeof points.possible === 'number' && typeof points.actual === 'number'
	) as { actual: number; possible: number }[];
	//sum up the actual and possible points
	const totalPossible = filteredScores.reduce((prev, curr) => prev + curr.possible, 0);
	const totalActual = filteredScores.reduce((prev, curr) => prev + curr.actual, 0);
	return { grade: (totalActual / totalPossible) * 100, totalPossible };
};

/**
 * Creates a weighted average of an array of GroupStats
 * @param stats An array of GroupStat objects representing the statistics for each group.
 * @returns An object containing the average grade statistics and the total weight.
 */
export const aggregateGroupStats = (stats: GroupStat[]) => {
	let totalWeight = 0;
	for (const stat of stats) {
		if (stat.group.group_weight && !Number.isNaN(stat.stats.mean)) totalWeight += stat.group.group_weight;
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

/**
 * Calculates the weight of a group based on the provided statistics and total weight.
 * If the group is not weighted or the group weight is not available, returns 'N/A'.
 * Otherwise, calculates the group weight as a percentage of the total weight.
 *
 * @param stat - The group statistics.
 * @param totalWeight - The total weight of all groups.
 * @returns The weight of the group as a percentage of the total weight, or 'N/A' if not applicable.
 */
export const getGroupWeight = (stat: GroupStat, totalWeight: number) => {
	if (stat.isWeighted || !stat.group.group_weight) {
		return stat.group.group_weight ?? 'N/A';
	}
	//group weights from canvas are by default multiplied by 100 so do that here as well
	return (stat.group.group_weight / totalWeight) * 100;
};

// /**
//  * Retrieves the group statistic object from an array of group statistics based on the provided ID.
//  * @param groupStats - The array of group statistics.
//  * @param id - The ID of the group to search for.
//  * @returns The group statistic object with the matching ID, or undefined if not found.
//  */
// export function getGroupStatByID(groupStats: GroupStat[], id: number) {
// 	return groupStats.filter((group) => id === group.group.id)[0];
// }

/**
 * Calculates the mean score of an assignment.
 *
 * @param assignment - The assignment object.
 * @returns The mean score as a ratio of the points possible, or NaN if the necessary data is missing.
 */
export function getAssignmentMean(assignment: Assignment) {
	if (assignment.score_statistics?.mean && assignment.points_possible) {
		return assignment.score_statistics?.mean / assignment?.points_possible;
	}
	return NaN;
}
