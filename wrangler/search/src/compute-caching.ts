const logURL = 'https://feedback.shanecranor.workers.dev/?site=mines-rocks&message=';
export async function getCached(cacheKey: string, onMiss: () => any, ctx: ExecutionContext, maxAge = 172800) {
	const key = `https://cache.rocks/${cacheKey}`;
	const cache = await caches.open('compute-cache');
	let cachedResponse = await cache.match(key);
	const t = await fetch(`${logURL}test_${cacheKey}`);
	if (!cachedResponse) {
		await fetch(`${logURL}compute_cache_miss_${cacheKey}`);
		const data = await onMiss();
		const response = new Response(JSON.stringify(data));
		response.headers.append('Cache-Control', `s-maxage=${maxAge}`);
		ctx.waitUntil(cache.put(key, response));
		return data;
	} else {
		return await cachedResponse.json(); // Return the cached data
	}
}
