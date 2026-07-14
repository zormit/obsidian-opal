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

export async function search(_query: string): Promise<SearchResult> {
	return Promise.reject(new Error('Not implemented'));
}
