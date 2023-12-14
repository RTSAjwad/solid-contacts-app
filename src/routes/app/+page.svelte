<script lang="ts">
	import ContactsTable from '$lib/components/ContactsTable.svelte';
	import { completeLogin } from '$lib';

	completeLogin();
</script>

<div class="w-full">
	<ContactsTable></ContactsTable>
</div>
