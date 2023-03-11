import { unstable_dev } from 'wrangler';
import { describe, expect, it, beforeAll, afterAll } from 'vitest';

describe('Worker', () => {
	let worker;
	beforeAll(async () => {
		worker = await unstable_dev('index.ts', {}, { disableExperimentalWarning: true });
	});

	afterAll(async () => {
		await worker.stop();
	});

	it('no route', async () => {
		const resp = await worker.fetch('/');
		if (resp) {
			const text = await resp.text();
			expect(text).toMatchInlineSnapshot(
				`"ERROR: No route"`
			);
		}
	});
	it('invalid route', async () => {
		const resp = await worker.fetch('/?route=invalid');
		if (resp) {
			const text = await resp.text();
			expect(text).toMatchInlineSnapshot(
				`"ERROR: Invalid route"`
			);
		}
	});
	it('valid route but no auth', async () => {
		const resp = await worker.fetch('/?route=getCourses');
		if (resp) {
			const text = await resp.text();
			expect(text).toMatchInlineSnapshot(
				`"ERROR: No auth token"`
			);
		}
	});
	it('test getCourses url', async () => {
		const resp = await worker.fetch('/?route=getCourses&bearer=123&test=true');
		if (resp) {
			const text = await resp.text();
			expect(text).toMatchInlineSnapshot(
				`"https://elearning.mines.edu/api/v1/courses?per_page=1000"`
			);
		}
	});
	// it('test getCourseData', async () => {
	// 	const resp = await worker.fetch('/?route=getCourseData&bearer=123&courseId=123');
	// 	if (resp) {
	// 		const text = await resp.text();
	// 		expect(text).toMatchInlineSnapshot(
	// 			`"ERROR: No auth token"`
	// 		);
	// 	}
	// });


	// it('should return status 200 and encoded response', async () => {
	// 	const resp = await worker.fetch('/example/hello');
	// 	if (resp) {
	// 		const text = await resp.text();
	// 		expect(text).toContain('aGVsbG8');
	// 		expect(resp.status).toBe(200);
	// 	}
	// });

	// it('should return 200 and reponse object', async () => {
	// 	const init = {
	// 		body: { abc: 'def' },
	// 		method: 'POST',
	// 	};
	// 	const resp = await worker.fetch('/post', init);
	// 	const json = await resp.json();
	// 	if (resp) {
	// 		expect(json).toEqual({ asn: 395747, colo: 'DFW' });
	// 		expect(resp.status).toBe(200);
	// 	}
	// });

	// it('should return 404 for undefined routes', async () => {
	// 	const resp = await worker.fetch('/foobar');
	// 	if (resp) {
	// 		expect(resp.status).toBe(404);
	// 	}
	// });
});
