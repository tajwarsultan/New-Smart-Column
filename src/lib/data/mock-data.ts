import type { Column } from '../types/column';

export const mockColumns: Column[] = [
	{ id: 'col1', name: 'First Name', type: 'string' },
	{ id: 'col2', name: 'Last Name', type: 'string' },
	{ id: 'col3', name: 'Email', type: 'email' },
	{ id: 'col4', name: 'Phone', type: 'phone' },

	{
		id: 'col5',
		name: 'Contact',
		type: 'group',
		subColumns: [
			{ id: 'col5-1', name: 'Email', type: 'email' },
			{ id: 'col5-2', name: 'Phone', type: 'phone' },
			{ id: 'col5-3', name: 'LinkedIn', type: 'url' },
			{ id: 'col5-4', name: 'Website', type: 'url' }
		]
	},

	{
		id: 'col6',
		name: 'Address',
		type: 'group',
		subColumns: [
			{ id: 'col6-1', name: 'Street', type: 'string' },
			{ id: 'col6-2', name: 'City', type: 'string' },
			{ id: 'col6-3', name: 'State', type: 'string' },
			{ id: 'col6-4', name: 'Country', type: 'string' },
			{ id: 'col6-5', name: 'ZipCode', type: 'string' }
		]
	},

	{
		id: 'col7',
		name: 'Professional',
		type: 'group',
		subColumns: [
			{ id: 'col7-1', name: 'Company', type: 'string' },
			{ id: 'col7-2', name: 'Title', type: 'string' },
			{ id: 'col7-3', name: 'Department', type: 'string' },
			{ id: 'col7-4', name: 'Manager', type: 'string' },
			{ id: 'col7-5', name: 'StartDate', type: 'date' },
			{ id: 'col7-6', name: 'Salary', type: 'number' }
		]
	},

	{
		id: 'col8',
		name: 'Personal',
		type: 'group',
		subColumns: [
			{ id: 'col8-1', name: 'Age', type: 'number' },
			{ id: 'col8-2', name: 'Gender', type: 'string' },
			{ id: 'col8-3', name: 'MaritalStatus', type: 'string' },
			{ id: 'col8-4', name: 'Languages', type: 'string' }
		]
	},

	{
		id: 'col9',
		name: 'Skills',
		type: 'group',
		subColumns: [
			{ id: 'col9-1', name: 'Programming', type: 'string' },
			{ id: 'col9-2', name: 'Frameworks', type: 'string' },
			{ id: 'col9-3', name: 'Tools', type: 'string' },
			{ id: 'col9-4', name: 'Databases', type: 'string' }
		]
	},

	{ id: 'col10', name: 'Company', type: 'string' },
	{ id: 'col11', name: 'Job Title', type: 'string' },
	{ id: 'col12', name: 'City', type: 'string' },
	{ id: 'col13', name: 'State', type: 'string' },
	{ id: 'col14', name: 'Country', type: 'string' },
	{ id: 'col15', name: 'Experience', type: 'string' },
	{ id: 'col16', name: 'Education', type: 'string' },
	{ id: 'col17', name: 'Summary', type: 'text' },
	{ id: 'col18', name: 'LinkedIn Profile URL', type: 'url' },
	{ id: 'col19', name: 'Website', type: 'url' },
	{ id: 'col20', name: 'GitHub', type: 'url' }
];
