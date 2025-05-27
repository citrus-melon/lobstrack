<script lang="ts">
  import Card from '$lib/Card.svelte';
  import '$lib/global.css';
  import { supabase } from '$lib/supabase';
  import type { PageLoad } from './$types';
  import HierarchyBrowser from '$lib/HierarchyBrowser.svelte';
    import { invalidateAll } from '$app/navigation';

  type Item = {
    id: string;
    name: string;
    parent: string | null;
  };

  export let data: { item: Item | null; locationHierarchy: Item[]; error: string | null; children: Item[] };

  $: item = data.item;
  $: locationHierarchy = data.locationHierarchy;
  $: error = data.error;
  $: children = data.children;

  let showMove = false;
  let moveError: string | null = null;
  let moveLoading = false;
  let selectedParentId: string | null = null;

  async function handleMove(newParent: Item) {
    moveLoading = true;
    moveError = null;
    // Prevent moving to self or current parent
    if (!item || newParent.id === item.id || newParent.id === item.parent) {
      moveError = 'Invalid parent selection.';
      moveLoading = false;
      return;
    }
    const { error: updateErr } = await supabase
      .from('items')
      .update({ parent: newParent.id })
      .eq('id', item.id);
    if (updateErr) {
      moveError = updateErr.message;
    } else {
        invalidateAll();
        showMove = false;
    }
    moveLoading = false;
  }
</script>

<main>
  {#if !item && !error}
    <p>Loading...</p>
  {:else if error}
    <p style="color: red">{error}</p>
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
      <button>Checkout</button>
    </div>
    {#if showMove}
      <div class="move-modal">
        <div class="modal-content">
          <h3>Select new parent location</h3>
          <HierarchyBrowser
            onSelect={(item) => selectedParentId = item.id}
            selectedId={selectedParentId}
          />
          <div style="margin-top: 1em; display: flex; gap: 1em;">
            <button on:click={async () => {
              if (selectedParentId) {
                const parentItem = { id: selectedParentId };
                await handleMove(parentItem);
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
  {/if}
</main>

<style>
.move-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  border-radius: 0.75rem;
  padding: 2rem;
  min-width: 350px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
}
</style>