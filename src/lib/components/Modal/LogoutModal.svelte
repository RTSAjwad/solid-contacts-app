<script lang="ts">
	import { startLogout } from '$lib';
	let modal: HTMLDialogElement;
</script>

<button
	class="btn"
	on:click={() => {
		modal.showModal();
	}}
>
	Log out
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
			d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
		/>
	</svg>
</button>
<dialog bind:this={modal} class="modal">
	<div class="modal-box">
		<h3 class="font-bold text-lg">Are you sure you want to logout?</h3>
		<p class="py-4"></p>
		<div class="modal-action">
			<button on:click={() => startLogout('/')} class="btn">Yes</button>
			<form method="dialog">
				<!-- if there is a button in form, it will close the modal -->
				<button class="btn btn-ghost">No</button>
			</form>
		</div>
	</div>
</dialog>
