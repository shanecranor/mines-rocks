const logURL = 'https://feedback.shanecranor.workers.dev/?site=mines-rocks&message=';

export async function log(message: string) {
	await fetch(`${logURL}${encodeURI(message)}`);
}
