import { mockColumns } from '../data/mock-data';
import type { Column } from '../types/column';

export async function mockFetchColumns(): Promise<Column[]> {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			if (Math.random() > 0.95) {
				reject(new Error('API Error: Failed to fetch columns'));
			} else {
				resolve(mockColumns);
			}
		}, 500);
	});
}
