/* eslint-disable import/no-anonymous-default-export */

import { getCached } from './compute-caching';
import { aggregateCourseData } from './data-processing/aggregation/aggregate-course-data';
import { filterCourseList } from './data-processing/filtering';
import { getBannerData, getCourseSummaryData } from './db-caching';

export interface Env {
	SUPABASE_URL: string;
	SUPABASE_KEY: string;
}
const DEFAULT_PAGE_SIZE = 20;
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		//get url params from the request
		const url = new URL(request.url);
		const { searchParams } = url;
		const per_page = Number(searchParams.get('per_page') || DEFAULT_PAGE_SIZE);
		const page = Number(searchParams.get('page') || 0);
		const search = searchParams.get('search');
		const showPartialClasses = false;

		const classData = (await getCourseSummaryData(env, ctx)) as any[];
		const bannerData = (await getBannerData(env, ctx)) as any[];
		//splice the banner data into the class data
		const courses = await getCached('aggregatedCourses', () => aggregateCourseData(classData, bannerData), ctx);

		const searchResults = filterCourseList(courses, {
			searchText: search || '',
			showPartialClasses,
			semester: { spring: true, summer: true, fall: true },
		});

		const results = searchResults.slice(page * per_page, (page + 1) * per_page);
		const resultsLite = results.map((course) => ({
			name: course.name,
			id: course.id,
		}));
		return new Response(JSON.stringify(resultsLite), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
			},
		});
	},
};
