<script lang="ts">
	import SmartTextInput from '$lib/components/SmartTextInput.svelte';
	import { mockFetchColumns } from '$lib/services/api-service';

	const currentRow = $state({
		'LinkedIn Profile URL': 'https://www.linkedin.com/in/johndoe',
		'LinkedIn Profile': 'John Doe',
		'First Name': 'John',
		'Last Name': 'Doe',
		Email: 'john.doe@example.com',
		Phone: '+1-555-123-4567',
		Company: 'Tech Corp',
		'Job Title': 'Software Engineer',
		City: 'San Francisco',
		State: 'California',
		Country: 'United States',
		Address: '123 Main St',
		Skills: 'JavaScript, TypeScript, Svelte, React',
		Experience: '5+ years in software development',
		Education: 'BS Computer Science',
		Summary: 'Experienced software developer with expertise in web technologies',

		'Contact.Email': 'john.doe@example.com',
		'Contact.Phone': '+1-555-123-4567',
		'Contact.LinkedIn': 'https://linkedin.com/in/johndoe',
		'Contact.Website': 'https://johndoe.dev',

		'Address.Street': '123 Main St',
		'Address.City': 'San Francisco',
		'Address.State': 'California',
		'Address.Country': 'United States',
		'Address.ZipCode': '94102',

		'Professional.Company': 'Tech Corp',
		'Professional.Title': 'Software Engineer',
		'Professional.Department': 'Engineering',
		'Professional.Manager': 'Jane Smith',
		'Professional.StartDate': '2020-01-15',
		'Professional.Salary': '$120,000',

		'Personal.Age': '28',
		'Personal.Gender': 'Male',
		'Personal.MaritalStatus': 'Single',
		'Personal.Languages': 'English, Spanish',

		'Skills.Programming': 'JavaScript, TypeScript, Python',
		'Skills.Frameworks': 'React, Svelte, Vue',
		'Skills.Tools': 'Git, Docker, AWS',
		'Skills.Databases': 'PostgreSQL, MongoDB'
	});
</script>

<main class="min-h-screen bg-[#EBFFD8]/10">
	<div class="container mx-auto px-4 py-8">
		<div class="mx-auto max-w-4xl">
			<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
				<div class="bg-[#8DBCC7] px-6 py-4">
					<h2 class="text-xl font-semibold text-white">New Smart Column</h2>
				</div>

				<div class="p-6">
					<div class="mb-6">
						<label class="mb-2 block text-sm font-medium text-gray-700" for="columnName"
							>Column Name</label
						>
						<input
							id="columnName"
							type="text"
							value="AI Column"
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-[#8DBCC7] focus:outline-none"
						/>
					</div>

					<div>
						<label class="mb-2 block text-sm font-medium text-gray-700" for="prompt">Prompt</label>
						<SmartTextInput
							fetchColumns={mockFetchColumns}
							{currentRow}
							placeholder="Here we can add normal text, then we can inject the columns:"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</main>
