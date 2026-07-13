export async function search(query: string): Promise<Object> {
	return new Promise((resolve) => {
		resolve({ foo: 'bar', query });
	});
}
