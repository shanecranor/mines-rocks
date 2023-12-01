import { ExecutionContext } from '@cloudflare/workers-types';
import { Env } from '..';
import { aggregateGroupStats, getStatsPerGroup } from '../data-processing/aggregation/assignment-aggregation';
import { getGroupIds } from '../data-processing/aggregation/assignment-util';
import { getAssignmentData, getAssignmentGroups } from '../db-caching';

export async function doAssignmentAggregation(request: Request, env: Env, ctx: ExecutionContext) {
	const url = new URL(request.url);
	const { searchParams } = url;
	const courseId = searchParams.get('courseId');
	if (!courseId) {
		throw new Error('No course ID specified');
	}
	const assignments = await getAssignmentData(courseId, env, ctx);
	const groupIds = getGroupIds(assignments);
	//only fetch group ids in the assignment data
	const assignmentGroups = await getAssignmentGroups(groupIds, env, ctx);
	const stats = getStatsPerGroup(assignments, assignmentGroups);
	const aggregatedData = aggregateGroupStats(stats);
	const out = {
		groupStats: stats,
		overallStats: aggregatedData,
	};
	return new Response(JSON.stringify(out), {
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
	});
}
