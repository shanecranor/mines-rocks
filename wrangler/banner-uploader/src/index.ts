import { getCourseSearchResults, getTermCode, setTerm } from "./banner";
import { isSeason } from "./types";

/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler deploy src/index.ts --name my-worker` to deploy your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
}




// eslint-disable-next-line import/no-anonymous-default-export
export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		try {
			const url = new URL(request.url);
			const year = url.searchParams.get("year");
			const season = url.searchParams.get("season")?.toLowerCase();
			const subject = url.searchParams.get("subject");
			const courseNumber = url.searchParams.get("courseNumber");

			if (!year || !season) {
				throw new Error("Missing year or season");
			}
			if (!isSeason(season)) {
				throw new Error(`Invalid season ${season}`);
			}
			if (subject === null || courseNumber === null) {
				throw new Error("Missing subject or courseNumber");
			}
			//check if season matches the type of Season
			const termCode = await getTermCode(season, year)
			const { data: _, cookies } = await setTerm(termCode);
			const courseData = await getCourseSearchResults({ termCode, subject, courseNumber }, cookies)
			return new Response(JSON.stringify(courseData));
		} catch (e: any) {
			return new Response(e.message, { status: 500 });
		}
		//if the data contains multiple courses, we'll upsert them all
	},
};
