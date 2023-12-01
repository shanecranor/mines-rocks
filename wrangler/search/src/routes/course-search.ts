import { Env } from '../index';
import { getCached } from '../compute-caching';
import { aggregateCourseData } from '../data-processing/aggregation/aggregate-course-data';
import { filterCourseList } from '../data-processing/filtering';
import { getCourseSummaryData, getBannerData } from '../db-caching';
import { log } from '../logging';
import { ExecutionContext } from '@cloudflare/workers-types';

export async function doCourseSearch(request: Request, env: Env, ctx: ExecutionContext) {
	//get url params from the request
	const url = new URL(request.url);
	const { searchParams } = url;
	const per_page = Number(searchParams.get('per_page')) || 20;
	const page = Number(searchParams.get('page') || 0);
	const search = searchParams.get('search');
	const showPartialClasses = searchParams.get('show_partial') === 'true';
	let semester = { spring: true, summer: true, fall: true };
	if (searchParams.get('filter_semester') === 'true') {
		semester = ['spring', 'summer', 'fall'].reduce((acc, cur) => {
			acc[cur] = searchParams.get(cur) === 'true';
			return acc;
		}, {} as any);
	}

	await log(`search_${search}`);

	//splice the banner data into the class data
	const courses = await getCached(
		'courses',
		async () => {
			const classData = (await getCourseSummaryData(env, ctx)) as any[];
			const bannerData = (await getBannerData(env, ctx)) as any[];
			return aggregateCourseData(classData, bannerData);
		},
		ctx
	);
	const searchResults = filterCourseList(courses, {
		searchText: search || '',
		showPartialClasses,
		semester,
		sortOptions: {
			primarySort: 'Date',
			isPrimarySortReversed: true,
		},
	});

	const results = searchResults.slice(page * per_page, (page + 1) * per_page);
	const resultsLite = results.map((course) => ({
		name: course.name,
		id: course.id,
		attributes: course.attributes,
		upload_date: course.upload_date,
		start_at: course.start_at,
		end_at: course.end_at,
		instructors: course.instructors,
		creditHours: course.creditHours,
		numSections: course.numSections,
		courseTypes: course.courseTypes,
		enrollment: course.enrollment,
	}));
	return new Response(JSON.stringify(resultsLite), {
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
	});
}
