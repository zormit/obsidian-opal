import { requestUrl } from 'obsidian';
import { Entity, Model, defaultModel } from '@opensanctions/followthemoney';

// TODO: Use OpenAleph API Spec + openapi-typescript instead?
// seems this could also build us a client:
// https://openapi-ts.dev/openapi-fetch/
export interface SearchResult {
	status: string;
	results: Entity[];
	total: number;
	next: URL;
}

export interface FederatedSearchResults {
	resultsForInstance: { [id: string]: SearchResult };
	total: number;
}

export interface Paginated<T> {
	next(): Promise<Paginated<T>>;
}

export interface OpenAlephPluginSettings {
	importFolder: string;
	instances: OpenAlephInstanceSettings[];
}

export interface OpenAlephInstanceSettings {
	id: string;
	name: string;
	instanceUrl: string;
	apiKey: string;
	enabled: boolean;
	connectionValid: boolean;
}

export interface OpenAlephClient {
	// request(url: URL): Promise<any>;
	search(query: string): Promise<FederatedSearchResults>;
	searchPerson(query: string): Promise<FederatedSearchResults>;
	// instanceStatus(): Promise<string>;
	settingsById: { [id: string]: OpenAlephInstanceSettings };
}

// export class PaginatedSearchResult implements Paginated<SearchResult> {
// 	client: OpenAlephClient;
// 	result: SearchResult;
//
// 	constructor(client: OpenAlephClient, result: SearchResult) {
// 		this.client = client;
// 		this.result = result;
// 	}
//
// 	async next(): Promise<PaginatedSearchResult> {
// 		return new PaginatedSearchResult(
// 			this.client,
// 			(await this.client.request(this.result.next)) as SearchResult,
// 		);
// 	}
// }

class HttpClient implements OpenAlephClient {
	REST_API = '/api/2/';
	METADATA_ENDPOINT = 'metadata';
	SEARCH_ENDPOINT = 'search';

	settingsById: { [id: string]: OpenAlephInstanceSettings };

	constructor(settings: OpenAlephPluginSettings) {
		this.settingsById = {};
		for (const instance of settings.instances) {
			this.settingsById[instance.id] = instance;
		}
	}

	async request(url: URL, instanceId: string): Promise<any> {
		const settings = this.settingsById[instanceId];
		if (settings === undefined) {
			return Promise.reject(
				Error(`Settings for ${instanceId} not properly configured`),
			);
		}
		const headers = {
			'User-Agent': 'alephclient',
			Authorization: settings.apiKey,
		};
		const request = {
			url: url.toString(),
			headers,
		};
		return (await requestUrl(request)).json;
	}

	searchUrl(query: string, instanceId: string): URL {
		const settings = this.settingsById[instanceId];
		if (settings === undefined) {
			// TODO: how to recover from this better?
			return new URL('https://example.com');
		}
		let url = new URL(
			`${this.REST_API}/${this.SEARCH_ENDPOINT}`,
			settings.instanceUrl,
		);
		url.searchParams.append('q', query);
		return url;
	}

	searchSchemaUrl(query: string, schema: string, instanceId: string): URL {
		let url = this.searchUrl(query, instanceId);
		url.searchParams.append('filter:schema', schema);
		return url;
	}

	async instanceSearch(
		query: string,
		instanceId: string,
	): Promise<SearchResult> {
		// TODO: actually verify this somehow? The idea of using
		// openapi-ts above would help, but maybe we don't need
		// this level of verification for the prototype.
		return (await this.request(
			this.searchUrl(query, instanceId),
			instanceId,
		)) as SearchResult;
	}

	async instanceSearchPerson(
		query: string,
		instanceId: string,
	): Promise<SearchResult> {
		return (await this.request(
			this.searchSchemaUrl(query, 'Person', instanceId),
			instanceId,
		)) as SearchResult;
	}

	async search(query: string): Promise<FederatedSearchResults> {
		let total = 0;
		let resultsForInstance: { [id: string]: SearchResult } = {};

		for (let [instanceId, settings] of Object.entries(this.settingsById)) {
			if (settings.enabled) {
				const results = await this.instanceSearch(query, instanceId);
				total += results.total;
				resultsForInstance[instanceId] = results;
			}
		}
		return {
			total,
			resultsForInstance,
		};
	}

	async searchPerson(query: string): Promise<FederatedSearchResults> {
		// TODO
		return this.search(query);
	}

	// metadataUrl(instanceId): URL {
	// 	return new URL(
	// 		`${this.REST_API}/${this.METADATA_ENDPOINT}`,
	// 		this.instanceUrl,
	// 	);
	// }
	//
	// async instanceStatus(): Promise<string> {
	// 	const headers = { 'User-Agent': 'alephclient' };
	// 	let request = {
	// 		url: this.metadataUrl().toString(),
	// 		headers,
	// 	};
	// 	return requestUrl(request)
	// 		.then((response) =>
	// 			response.status === 200 ? 'available' : 'bad status',
	// 		)
	// 		.catch((err) => {
	// 			console.error(err);
	// 			return 'connection failed';
	// 		});
	// }
}

class FakeClient implements OpenAlephClient {
	settingsById: { [id: string]: OpenAlephInstanceSettings };

	// TODO: find a way without repeating this code?
	constructor(settings: OpenAlephPluginSettings) {
		this.settingsById = {};
		for (const instance of settings.instances) {
			this.settingsById[instance.id] = instance;
		}
	}

	async instanceSearch(): Promise<SearchResult> {
		const model = new Model(defaultModel);
		return new Promise((resolve) => {
			resolve({
				status: 'ok',
				total: 2,
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
				next: new URL(
					'https://search.openaleph.org/api/2/entities?offset=2&limit=2&q=James+Moriarty',
				),
			});
		});
	}

	// TODO: how to not repeat this?
	async search(query: string): Promise<FederatedSearchResults> {
		let total = 0;
		let resultsForInstance: { [id: string]: SearchResult } = {};

		for (let [instanceId, settings] of Object.entries(this.settingsById)) {
			if (settings.enabled) {
				const results = await this.instanceSearch();
				total += results.total;
				resultsForInstance[instanceId] = results;
			}
		}
		return {
			total,
			resultsForInstance,
		};
	}

	async searchPerson(query: string): Promise<FederatedSearchResults> {
		return this.search(query);
	}
}

// Configures whether we want a fake static result for development or the real thing
// Defaults to false in development unless you set FAKE_API=false in the environment.
//
// Provided by esbuild.config.mjs
declare const USE_FAKE_API: boolean;

export interface OpenAlephConstructor {
	new (settings: OpenAlephPluginSettings): OpenAlephClient;
}

export default function openAlephClientFactory(): OpenAlephConstructor {
	if (USE_FAKE_API) {
		console.info('using FAKE API');
	}
	return USE_FAKE_API ? FakeClient : HttpClient;
}
