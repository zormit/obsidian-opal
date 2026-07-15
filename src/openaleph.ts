import { requestUrl } from 'obsidian';
import { Entity } from '@opensanctions/followthemoney';

// TODO: Use OpenAleph API Spec + openapi-typescript instead?
// seems this could also build us a client:
// https://openapi-ts.dev/openapi-fetch/
export interface SearchResult {
	status: string;
	results: Entity[];
	total: number;
}
export interface OpenAlephClient {
	search(query: string): Promise<SearchResult>;
	instanceStatus(): Promise<string>;
}

export default class HttpClient implements OpenAlephClient {
	REST_API = '/api/2/';
	METADATA_ENDPOINT = 'metadata';
	SEARCH_ENDPOINT = 'search';

	instanceUrl: string;
	apiKey: string;

	constructor(instanceUrl: string, apiKey: string) {
		this.instanceUrl = instanceUrl;
		this.apiKey = apiKey;
	}

	searchUrl(query: string): URL {
		let url = new URL(
			`${this.REST_API}/${this.SEARCH_ENDPOINT}`,
			this.instanceUrl,
		);
		url.searchParams.append('q', query);
		return url;
	}

	async search(query: string): Promise<SearchResult> {
		console.log(query);
		const headers = {
			'User-Agent': 'alephclient',
			Authorization: this.apiKey,
		};
		let request = {
			url: this.searchUrl(query).toString(),
			headers,
		};
		console.log(request);
		// TODO: actually verify this somehow? The idea of using
		// openapi-ts above would help, but maybe we don't need
		// this level of verification for the prototype.
		return (await requestUrl(request)).json as SearchResult;
	}

	metadataUrl(): URL {
		return new URL(
			`${this.REST_API}/${this.METADATA_ENDPOINT}`,
			this.instanceUrl,
		);
	}

	async instanceStatus(): Promise<string> {
		const headers = { 'User-Agent': 'alephclient' };
		let request = {
			url: this.metadataUrl().toString(),
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
