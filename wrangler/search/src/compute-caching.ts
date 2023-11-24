export async function getCached(cacheKey: string, onMiss: () => any, ctx: ExecutionContext, maxAge = 172800) {
	const key = `https://compute-cache.mines.rocks/${cacheKey}`;
	const cache = await caches.open('compute-cache');

	let cachedResponse = await cache.match(key);
	if (!cachedResponse) {
		await fetch(`https://feedback.mines.rocks/?site=mines-rocks&message=compute_cache_miss_${cacheKey}`);
		const data = await onMiss();
		const response = new Response(JSON.stringify(data));
		response.headers.append('Cache-Control', `s-maxage=${maxAge}`);

		ctx.waitUntil(cache.put(key, response.clone()));

		return data;
	} else {
		return await cachedResponse.json(); // Return the cached data
	}
}
