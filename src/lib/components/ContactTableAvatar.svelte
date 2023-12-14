<script lang="ts">
    export let imageUrl: string;
    export let name: string;
    let words = name.split(" ");
    let initials = "";
    words.forEach(word => {
        initials = initials + word.charAt(0);
    });
</script>

{#if imageUrl == null}
<div class="avatar placeholder">
    <div class="bg-neutral text-neutral-content rounded-xl w-12 h-12">
        <span>{initials}</span>
    </div>
</div>
{:else}
<div class="avatar">
    <div class="rounded-xl w-12 h-12">
        <img src={imageUrl} alt="Avatar Tailwind CSS Component" />
    </div>
</div>
{/if}

