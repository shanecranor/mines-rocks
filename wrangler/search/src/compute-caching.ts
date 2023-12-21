import { ExecutionContext } from '@cloudflare/workers-types';
import { log } from './logging';

export async function getCached(cacheKey: string, onMiss: () => any, ctx: ExecutionContext, maxAge = 86400) {
	const key = `https://cache.rocks/${encodeURI(cacheKey)}`;
	const cache = await caches.open('compute-cache-0'); //increment to create new cache for testing
	let cachedResponse = await cache.match(key);
	if (!cachedResponse) {
		await log(`compute_cache_miss_${cacheKey}`);
		const data = await onMiss();
		const response = new Response(JSON.stringify(data));
		response.headers.append('Cache-Control', `s-maxage=${maxAge}`);
		ctx.waitUntil(cache.put(key, response));
		return data;
	} else {
		return await cachedResponse.json(); // Return the cached data
	}
}
