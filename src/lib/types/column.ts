export interface Column {
	id: string;
	name: string;
	type: string;
	subColumns?: Column[];
}

export interface ChipData {
	id: string;
	column: Column;
	subColumn?: Column;
	value: string;
	path: string;
}
