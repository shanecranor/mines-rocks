/* eslint-disable import/no-anonymous-default-export */

import { getCourseSummaryData } from './db-caching';

export interface Env {
	SUPABASE_URL: string;
	SUPABASE_KEY: string;
}
const DEFAULT_PAGE_SIZE = 10;
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		//get url params from the request
		const url = new URL(request.url);
		const { searchParams } = url;

		const per_page = Number(searchParams.get('per_page') || DEFAULT_PAGE_SIZE);
		const page = Number(searchParams.get('page') || 0);

		const classData = (await getCourseSummaryData(env)) as any[];

		const results = classData.slice(page * per_page, (page + 1) * per_page);
		return new Response(JSON.stringify(results), {
			headers: {
				'Content-Type': 'application/json',
			},
		});
	},
};
