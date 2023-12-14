<script lang="ts">
	// Import the login function to attach to the login button
	import { startLogin } from '$lib';
	// Create a string to bind to the login input, giving it a default value that is in the box by default
	let oidcIssuer: string = 'http://localhost:3000';
</script>

<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-sm">
		<img
			class="mx-auto h-10 w-auto"
			src="https://solidproject.org/assets/img/solid-emblem.svg"
			alt="Solid Logo"
		/>
		<h1 class="text-5xl text-center font-bold">Connect to your Solid Pod</h1>
	</div>

	<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
		<form class="space-y-6">
			<div class="form-control w-full">
				<label class="label" for="provider">
					<span class="label-text">Solid Provider</span>
				</label>
				<!-- Bind the html text field to the oidc string so it can be accessed in code-->
				<input
					bind:value={oidcIssuer}
					id="provider"
					name="provider"
					type="text"
					placeholder="https://"
					class="input input-bordered focus:input-primary w-full"
				/>
			</div>

			<div>
				<!-- Bind login function to button, passing the user chosen provider and the app route to redirect to -->
				<button on:click={() => startLogin(oidcIssuer, '/app')} class="btn btn-primary w-full"
					>Sign in with Solid</button
				>
			</div>
		</form>

		<p class="mt-10 text-center text-sm">
			Not got a WebID?
			<a href="https://solidcommunity.net/register" class="link link-primary"
				>Sign up with Solid Community</a
			>
		</p>
	</div>
</div>
