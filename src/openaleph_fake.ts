import { SearchResult } from './openaleph';

export async function search(_query: string): Promise<SearchResult> {
	return new Promise((resolve) => {
		resolve({
			status: 'ok',
			results: [
				{
					caption: 'Mr James Colin Moriarty',
					schema: 'Person',
					id: 'gb-coh-psc-SC618974-u9ffdocvkfhzdsmx1-v1x6fbnyu.4bc2fa11f98c693aaf4d9b27548c201fa962b368',
				},
				{
					caption: 'MICHAEL JAMES MORIARTY',
					schema: 'Person',
					id: 'us-npi-1518447499.6bc3ff871054bac37403bcbfa5ed070d9c4cf702',
				},
			],
		});
	});
}
