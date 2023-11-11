/* eslint-disable import/no-anonymous-default-export */

export interface Env {
	MINES_ROCKS_WEBHOOK: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		//get url params from the request
		const url = new URL(request.url);
		const { searchParams } = url;
		//check if searchParams has the "site" param
		const site = searchParams.get('site');
		const message = searchParams.get('message');
		if (!site) {
			return new Response('ERROR: No site');
		}
		if (!message) {
			return new Response('ERROR: No message');
		}
		if (site === 'mines-rocks') {
			//pull the webhook from the env
			const webhook = env.MINES_ROCKS_WEBHOOK;
			const discordResponse = await sendToDiscordWebhook(webhook, message);
			return new Response('Message sent: ' + discordResponse);
		}
		return new Response('Hello World!');
	},
};

async function sendToDiscordWebhook(webhookUrl: string, message: string) {
	const payload = JSON.stringify({ content: message });

	const response = await fetch(webhookUrl, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			content: message,
		}),
	});

	if (!response.ok) {
		throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
	}

	return `Successfully sent with status: ${response.status}`;
}
