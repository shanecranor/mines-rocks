import { createClient } from '@supabase/supabase-js';
import { Env } from '.';
const classDataKey = 'https://course_summary_data.dev';

export async function getCourseSummaryData(env: Env) {
	const cache = await caches.open('supabase-course-data');

	let classDataResponse = await cache.match(classDataKey);
	if (!classDataResponse) {
		const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
		const { data, error } = await supabase.from('course_summary_data').select('*');

		if (error) {
			await fetch(`https://feedback.mines.rocks/?site=mines-rocks&message=${encodeURI(`Supabase course fetch error: ${error.message}`)}`);
			throw error;
		}

		const response = new Response(JSON.stringify(data));
		classDataResponse = response;

		response.headers.append('Cache-Control', 's-maxage=172800');

		ctx.waitUntil(cache.put(classDataKey, response.clone()));
		await fetch('https://feedback.mines.rocks/?site=mines-rocks&message=cache_miss');
	} else {
		console.log('cache hit');
	}
	const classData = await classDataResponse.json();
	return classData;
}
