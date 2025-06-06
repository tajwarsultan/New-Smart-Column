import { mockColumns } from '../data/mock-data';
import type { Column } from '../types/column';

export async function mockFetchColumns(): Promise<Column[]> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(mockColumns);
		}, 500);
	});
}
