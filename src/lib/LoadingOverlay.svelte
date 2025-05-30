<script lang="ts">
    import { quadOut } from "svelte/easing";
    import { fade } from "svelte/transition";
</script>

<div class="overlay" transition:fade={{duration: 200, easing: quadOut}}>
    <span class="spinner"></span>
</div>

<style>
    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.8);
        display: grid;
        place-items: center;
    }

    .spinner {
        border: 5px solid var(--accent);
        border-bottom-color: transparent;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>