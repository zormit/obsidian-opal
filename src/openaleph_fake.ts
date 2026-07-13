export async function searchOpenAleph(query: string): Promise<Object> {
	return new Promise((resolve) => {
		resolve({ foo: 'bar', query });
	});
}
