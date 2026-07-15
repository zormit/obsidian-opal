import { SearchResult, OpenAlephClient } from './openaleph';
import { Model, defaultModel } from '@opensanctions/followthemoney';

export default class FakeClient implements OpenAlephClient {
	async search(_query: string): Promise<SearchResult> {
		const model = new Model(defaultModel);
		return new Promise((resolve) => {
			resolve({
				status: 'ok',
				results: [
					model.getEntity({
						caption: 'Mr James Colin Moriarty',
						schema: 'Person',
						id: 'gb-coh-psc-SC618974-u9ffdocvkfhzdsmx1-v1x6fbnyu.4bc2fa11f98c693aaf4d9b27548c201fa962b368',
					}),
					model.getEntity({
						caption: 'MICHAEL JAMES MORIARTY',
						schema: 'Person',
						id: 'us-npi-1518447499.6bc3ff871054bac37403bcbfa5ed070d9c4cf702',
					}),
				],
			});
		});
	}
	async instanceStatus(): Promise<string> {
		return '<fake status>';
	}
}
