import { requestUrl } from 'obsidian';

// TODO: Eventually replace these types with FtM types
// from https://www.npmjs.com/package/@alephdata/followthemoney ?
//
// Right now that packages seems outdated.
export interface Entity {
	id: string;
	schema: string;
	caption: string;
}
export interface SearchResult {
	status: string;
	results: Entity[];
}
export interface OpenAlephClient {
	search(query: string): Promise<SearchResult>;
	instanceStatus(): Promise<string>;
}

export default class HttpClient implements OpenAlephClient {
	REST_API = '/api/2/';
	METADATA_ENDPOINT = 'metadata';
	instanceUrl: string;
	apiKey: string;

	constructor(instanceUrl: string, apiKey: string) {
		this.instanceUrl = instanceUrl;
		this.apiKey = apiKey;
	}

	async search(_query: string): Promise<SearchResult> {
		return Promise.reject(new Error('Not implemented'));
	}

	metadataUrl(): string {
		// TODO: fix hacky way of stitching the URL together
		return `${this.instanceUrl}/${this.REST_API}/${this.METADATA_ENDPOINT}`;
	}

	async instanceStatus(): Promise<string> {
		const headers = { 'User-Agent': 'alephclient' };
		let request = {
			url: this.metadataUrl(),
			headers,
		};
		return requestUrl(request)
			.then((response) =>
				response.status === 200 ? 'available' : 'bad status',
			)
			.catch((err) => {
				console.error(err);
				return 'connection failed';
			});
	}
}
