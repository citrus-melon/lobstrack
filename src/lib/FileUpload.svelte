<!-- WIP, copied from other project -->
<script lang="ts">
  import { fade } from "svelte/transition";
  import { quadOut } from "svelte/easing";

  let { files = $bindable() }: {files: FileList | undefined} = $props();

  let dragging = $state(false);
  let lastDropTarget: EventTarget | null = null;

  const handleDragEnter = (e: DragEvent) => {
    if (e.dataTransfer?.types.includes("Files")) {
      lastDropTarget = e.target;
      dragging = true;
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: DragEvent) => {
    if (e.target === lastDropTarget || e.target === document) {
      dragging = false;
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    dragging = false;
    files = e.dataTransfer?.files;
  };
</script>
  
<div class="box">
  <h2>Drop your PDF here!</h2>
  <input type="file" accept=".pdf" class="visually-hidden" id="file" bind:files>
  <label class="button" for="file">Or Browse</label>
</div>

<svelte:window
  ondragenter={handleDragEnter}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
/>

{#if dragging}
  <div class="drop-overlay" transition:fade={{duration: 200, easing: quadOut}}>
    <h1>Drop anywhere!</h1>
  </div>
{/if}

<style>
  .box {
    border: 2px dashed var(--gray);
    border-radius: 1rem;
    text-align: center;
    padding: 3rem;
  }

  .drop-overlay {
    display: grid;
    place-content: center;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    background: var(--accent);
    color: white;
    opacity: 80%;
  }

  input:focus + label {
    outline-color: var(--accent);
    color: var(--accent);
  }
</style>
