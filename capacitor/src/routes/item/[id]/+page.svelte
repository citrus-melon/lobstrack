<script lang="ts">
  import Card from '$lib/Card.svelte';
  import '$lib/global.css';
  import { supabase } from '$lib/supabase';
  import HierarchyBrowser from '$lib/HierarchyBrowser.svelte';
  import { invalidateAll } from '$app/navigation';
  import Sqids from 'sqids';
  import type { Tables } from '$lib/database.types';

  export let data: {
    item: Tables<"items">;
    locationHierarchy: Tables<"items">[];
    children: Tables<"items">[];
  };

  $: item = data.item;
  $: locationHierarchy = data.locationHierarchy;
  $: children = data.children;

  let showMove = false;
  let moveError: string | null = null;
  let moveLoading = false;
  let selectedParentId: string | null = null;

  let showLinkPointer = false;
  let pointerInput = '';
  let linkLoading = false;
  let linkError: string | null = null;

  // --- Move logic ---
  async function handleMove(newParentId: string) {
    moveLoading = true;
    moveError = null;
    // Prevent moving to self or current parent
    if (newParentId === item.id || newParentId === item.parent) {
      moveError = 'Invalid parent selection.';
      moveLoading = false;
      return;
    }
    const { error: updateErr } = await supabase
      .from('items')
      .update({ parent: newParentId })
      .eq('id', item.id);
    if (updateErr) {
      moveError = updateErr.message;
    } else {
      showMove = false;
      await invalidateAll();
    }
    moveLoading = false;
  }

  // --- Link pointer logic ---
  async function handleLinkPointer() {
    linkLoading = true;
    linkError = null;
    try {
      // Extract code from input (allow full URL or just code)
      let code = pointerInput.trim();
      // Accept either a full URL or just the code
      const match = code.match(/([A-Za-z0-9]+)$/);
      if (!match) throw new Error('Invalid code or URL');
      code = match[1];
      const sqids = new Sqids();
      const [pointerId] = sqids.decode(code);
      if (!pointerId) throw new Error('Invalid code');
      // Update pointer to link to this item, and check if pointer exists
      const { error: updateErr, count } = await supabase
        .from('pointers')
        .update({ item: item.id }, { count: 'exact' })
        .eq('id', pointerId);
      if (updateErr) throw new Error(updateErr.message);
      if (count === 0) throw new Error('Pointer not found');
      showLinkPointer = false;
    } catch (e: any) {
      linkError = e.message || 'Failed to link pointer.';
    }
    linkLoading = false;
  }
</script>

<main>
  {#if !item}
    <p>Loading...</p>
  {:else}
    <h1>{item.name}</h1>
    <Card title="Location">
      <nav aria-label="breadcrumb">
        <ol style="display: flex; gap: 0.5em; list-style: none; padding: 0; margin: 0;">
          {#each locationHierarchy as loc, i (loc.id)}
            <li>
              {#if i < locationHierarchy.length - 1}
                <a href={`/item/${loc.id}`}>{loc.name}</a> &gt;
              {:else}
                <strong>{loc.name}</strong>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>
    </Card>
    <Card title="Children">
      {#if children.length > 0}
        <ul>
          {#each children as child}
            <li><a href={`/item/${child.id}`}>{child.name}</a></li>
          {/each}
        </ul>
      {:else}
        <em>No child items.</em>
      {/if}
    </Card>
    <Card title="Comments">
      <ul>
        <li><em>No comments yet.</em></li>
      </ul>
    </Card>
    <div class="action-bar">
      <button on:click={() => showMove = !showMove}>Move</button>
      <button on:click={() => showLinkPointer = !showLinkPointer}>Link QR</button>
      <button>Checkout</button>
    </div>
    {#if showMove}
      <div class="modal">
        <div class="modal-content">
          <h3>Select new parent location</h3>
          <HierarchyBrowser
            onSelect={(item) => selectedParentId = item.id}
            selectedId={selectedParentId}
          />
          <div style="margin-top: 1em; display: flex; gap: 1em;">
            <button on:click={async () => {
              if (selectedParentId) {
                await handleMove(selectedParentId);
              }
            }} disabled={!selectedParentId || moveLoading}>
              {moveLoading ? 'Moving...' : 'Move Here'}
            </button>
            <button on:click={() => showMove = false} disabled={moveLoading}>Cancel</button>
          </div>
          {#if moveError}
            <p style="color: red">{moveError}</p>
          {/if}
        </div>
      </div>
    {/if}
    {#if showLinkPointer}
      <div class="modal">
        <div class="modal-content">
          <h3>Link QR Code / Pointer</h3>
          <input type="text" placeholder="Enter code or URL" bind:value={pointerInput} style="width: 100%; margin-bottom: 1em;" />
          <div style="margin-top: 1em; display: flex; gap: 1em;">
            <button on:click={handleLinkPointer} disabled={linkLoading || !pointerInput}>
              {linkLoading ? 'Linking...' : 'Link'}
            </button>
            <button on:click={() => showLinkPointer = false} disabled={linkLoading}>Cancel</button>
          </div>
          {#if linkError}
            <p style="color: red">{linkError}</p>
          {/if}
        </div>
      </div>
    {/if}
  {/if}
</main>

<style>
</style>