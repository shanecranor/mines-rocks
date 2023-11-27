import { createClient } from '@supabase/supabase-js';
import { Env } from '.';
import { BannerCourse, Course } from './types/types';
import { log } from './logging';
import { get } from 'http';
import { getCached } from './compute-caching';

export async function getCourseSummaryData(env: Env, ctx: ExecutionContext) {
	return (await cacheSupabaseDB('course_summary_data', env, ctx)) as Course[];
}

export async function getBannerData(env: Env, ctx: ExecutionContext) {
	return (await cacheSupabaseDB('banner_course_data', env, ctx)) as BannerCourse[];
}

export async function getAssignmentData(courseId: string, env: Env, ctx: ExecutionContext) {
	return await getCached(`assignment_data_${courseId}`, () => getAssignmentDataUncached(courseId, env, ctx), ctx);
}
export async function getAssignmentGroups(groupIds: string[], env: Env, ctx: ExecutionContext) {
	return await getCached(`assignment_group_data${JSON.stringify(groupIds)}`, () => getAssignmentGroupsUncached(groupIds, env, ctx), ctx);
}
async function getAssignmentGroupsUncached(groupIds: string[], env: Env, ctx: ExecutionContext) {
	const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
	const { data, error } = await supabase.from('assignment_group_data').select('*').in('id', groupIds);
	if (error) {
		await log(`supabase_assignment_group_data_fetch_error_${error.message}`);
		throw error;
	}
	return data;
}

async function getAssignmentDataUncached(courseId: string, env: Env, ctx: ExecutionContext) {
	const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
	//TODO: select less than *, we don't need assignment descriptions etc lmao
	const { data, error } = await supabase.from('assignment_data').select('*').eq('course_id', courseId);
	if (error) {
		await log(`supabase_assignment_data_fetch_error_${error.message}`);
		throw error;
	}
	return data;
}

async function cacheSupabaseDB(dbName: string, env: Env, ctx: ExecutionContext) {
	const cache = await caches.open('supabase-data');
	const cacheKey = `https://${dbName}.dev`;

	let dbDataResponse = await cache.match(cacheKey);
	if (!dbDataResponse) {
		const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

		const { data, error } = await supabase.from(dbName).select('*');

		if (error) {
			await log(`supabase_${dbName}_fetch_error_${error.message}`);
			throw error;
		}

		const response = new Response(JSON.stringify(data));
		dbDataResponse = response;

		response.headers.append('Cache-Control', 's-maxage=172800');

		ctx.waitUntil(cache.put(cacheKey, response.clone()));
		await log(`supabase_${dbName}_cache_miss`);
	} else {
		console.log('cache hit');
	}
	return await dbDataResponse.json();
}
