import { createClient } from '@supabase/supabase-js';
import { Env } from '.';

export async function getCourseSummaryData(env: Env, ctx: ExecutionContext) {
	return await cacheSupabaseDB('course_summary_data', env, ctx);
}

export async function getBannerData(env: Env, ctx: ExecutionContext) {
	return await cacheSupabaseDB('banner_course_data', env, ctx);
}

async function cacheSupabaseDB(dbName: string, env: Env, ctx: ExecutionContext) {
	const cache = await caches.open('supabase-data');
	const cacheKey = `https://${dbName}.dev`;

	let dbDataResponse = await cache.match(cacheKey);
	if (!dbDataResponse) {
		const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
		const { data, error } = await supabase.from(dbName).select('*');

		if (error) {
			await fetch(
				`https://feedback.mines.rocks/?site=mines-rocks&message=${encodeURI(`Supabase ${dbName} fetch error: ${error.message}`)}`
			);
			throw error;
		}

		const response = new Response(JSON.stringify(data));
		dbDataResponse = response;

		response.headers.append('Cache-Control', 's-maxage=172800');

		ctx.waitUntil(cache.put(cacheKey, response.clone()));
		await fetch(`https://feedback.mines.rocks/?site=mines-rocks&message=cache_miss_${dbName}`);
	} else {
		console.log('cache hit');
	}
	return await dbDataResponse.json();
}
