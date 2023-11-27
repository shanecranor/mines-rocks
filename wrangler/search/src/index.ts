/* eslint-disable import/no-anonymous-default-export */

import { log } from './logging';
import { getCached } from './compute-caching';
import { aggregateCourseData } from './data-processing/aggregation/aggregate-course-data';
import { filterCourseList } from './data-processing/filtering';
import { getBannerData, getCourseSummaryData } from './db-caching';
import { doCourseSearch } from './routes/course-search';
import { doAssignmentAggregation } from './routes/assignment-aggregation';
import path from 'path';

export interface Env {
	SUPABASE_URL: string;
	SUPABASE_KEY: string;
}
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		try {
			const url = new URL(request.url);
			const { searchParams } = url;
			const search = searchParams.get('search');
			if (search != null) return await doCourseSearch(request, env, ctx);
			const courseId = searchParams.get('courseId');
			const pathName = url.pathname;
			if (pathName === '/stats/' && courseId) {
				return await doAssignmentAggregation(request, env, ctx);
			}
			return new Response('No route specified', {
				headers: {
					'Content-Type': 'text/plain',
					'Access-Control-Allow-Origin': '*',
				},
			});
		} catch (e) {
			await log(`error_${(e as Error).message}`);
			return new Response((e as Error).stack, {
				headers: {
					'Content-Type': 'text/plain',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}
	},
};
