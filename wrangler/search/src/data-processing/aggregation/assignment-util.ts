import { Assignment } from '../../types/types';

/**
 * Returns a list of unique assignment group IDs from the given array of assignments.
 *
 * @param assignments - The array of assignments.
 * @returns An array of unique assignment group IDs.
 */
export const getGroupIds = (assignments: Assignment[]) => {
	return Array.from(new Set(assignments.map((assignment) => String(assignment.assignment_group_id))));
};

/**
 * Builds a map of assignment group IDs to a list of matching assignments.
 *
 * @param assignments - The array of assignments.
 * @returns The assignment map.
 */
export const buildAssignmentMap = (assignments: Assignment[]) => {
	//map assignment group id to a list of matching assignments
	const assignmentMap = new Map<number, Assignment[]>();
	for (const assignment of assignments) {
		const groupId = assignment.assignment_group_id;
		if (!groupId) continue; //skip assignments that don't have a group (they all should have groups, typescript is wrong)
		if (!assignmentMap.has(groupId)) {
			assignmentMap.set(groupId, []);
		}
		assignmentMap.get(groupId)?.push(assignment);
	}
	return assignmentMap;
};
