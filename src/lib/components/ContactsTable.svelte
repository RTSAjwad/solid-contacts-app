<script lang="ts">
	import type { Writable, Readable } from 'svelte/store';
	import { createTable, createRender, Subscribe, Render } from 'svelte-headless-table';
	import { addSelectedRows } from 'svelte-headless-table/plugins';
	import SelectIndicator from './SelectIndicator.svelte';
	import ContactTableAvatar from './ContactTableAvatar.svelte';
	import { contacts, refreshContactsState } from '$lib';
	import CreateModal from './Modal/CreateModal.svelte';
	import EditModal from './Modal/EditModal.svelte';
	import RemoveModal from './Modal/RemoveModal.svelte';
	import LogoutModal from './Modal/LogoutModal.svelte';

	const table = createTable(contacts, {
		select: addSelectedRows()
	});

	const columns = table.createColumns([
		table.display({
			id: 'selected',
			header: '',
			cell: ({ row }, { pluginStates }) => {
				const { isSelected } = pluginStates.select.getRowState(row);
				return createRender(SelectIndicator, {
					isSelected
				});
			}
		}),
		table.display({
			id: 'avatar',
			header: 'Avatar',
			cell: ({ row }) => {
				return createRender(ContactTableAvatar, {
					imageUrl: row.original.imageUrl,
					name: row.original.name
				});
			}
		}),
		table.column({
			header: 'Name',
			accessor: 'name'
		}),
		table.column({
			header: 'Phone number',
			accessor: 'phoneNumber'
		}),
		table.column({
			header: 'Email',
			accessor: 'email'
		}),
		table.column({
			header: 'Company',
			accessor: 'company'
		}),
		table.column({
			header: 'Job title',
			accessor: 'jobTitle'
		})
	]);

	const { headerRows, rows, tableAttrs, tableBodyAttrs, pluginStates } =
		table.createViewModel(columns);

	const selectedDataIds: Writable<Record<string, boolean>> = pluginStates.select.selectedDataIds;
	const someRowsSelected: Readable<boolean> = pluginStates.select.someRowsSelected;
</script>

<div class="navbar bg-base-100">
	<div class="flex-1 gap-2">
		<CreateModal></CreateModal>
		<EditModal {selectedDataIds}></EditModal>
		<RemoveModal {selectedDataIds} {someRowsSelected}></RemoveModal>
		<button on:click={refreshContactsState} class="btn">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-6 h-6"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
				/>
			</svg>

			Refresh
		</button>
	</div>
	<div class="flex-none">
		<LogoutModal></LogoutModal>
	</div>
</div>

<table class="table" {...$tableAttrs}>
	<thead>
		{#each $headerRows as headerRow (headerRow.id)}
			<Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
				<tr {...rowAttrs}>
					{#each headerRow.cells as cell (cell.id)}
						<Subscribe attrs={cell.attrs()} let:attrs>
							<th {...attrs}>
								{#if cell.id == 'selected'}
									<SelectIndicator bind:isSelected={pluginStates.select.allRowsSelected}
									></SelectIndicator>
								{:else}
									<Render of={cell.render()} />
								{/if}
							</th>
						</Subscribe>
					{/each}
				</tr>
			</Subscribe>
		{/each}
	</thead>
	<tbody>
		{#each $rows as row (row.id)}
			<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
				<tr {...rowAttrs}>
					<!--class="hover hover:cursor-pointer"-->
					{#each row.cells as cell (cell.id)}
						<Subscribe attrs={cell.attrs()} let:attrs>
							<td {...attrs}>
								<Render of={cell.render()} />
							</td>
						</Subscribe>
					{/each}
				</tr>
			</Subscribe>
		{/each}
	</tbody>
</table>
