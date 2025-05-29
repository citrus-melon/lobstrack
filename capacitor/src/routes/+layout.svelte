<script lang="ts">
    import { navigating } from "$app/state";
    import LoadingOverlay from "$lib/LoadingOverlay.svelte";

    const { children } = $props();
</script>

{@render children()}

{#if navigating.to}
    <LoadingOverlay />
{/if}