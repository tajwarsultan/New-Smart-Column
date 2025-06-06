export interface Column {
	id: string;
	name: string;
	type: string;
	icon?: string;
}

export interface ChipData {
	id: string;
	column: Column;
	value: string;
}
