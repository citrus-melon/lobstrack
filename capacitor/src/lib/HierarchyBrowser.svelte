<script lang="ts">
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  export let selectedId: string | null = null;
  export let onSelect: (item: any) => void;
  export let rootId: string | null = null; // Optionally start from a specific root

  type Item = {
    id: string;
    name: string;
    parent: string | null;
  };

  let loading = false;
  let error: string | null = null;
  let items: Item[] = [];
  let path: Item[] = [];
  let currentParent: string | null = rootId ?? null;

  async function fetchChildren(parent: string | null) {
    loading = true;
    error = null;
    let query = supabase
      .from('items')
      .select('id, name, parent');
    if (parent === null) {
      query = query.is('parent', null);
    } else {
      query = query.eq('parent', parent);
    }
    const { data, error: err } = await query;
    if (err) {
      error = err.message;
      items = [];
    } else {
      items = data;
    }
    loading = false;
  }

  async function goTo(item: Item) {
    // Add to path and fetch children
    path = [...path, item];
    currentParent = item.id;
    await fetchChildren(item.id);
  }

  async function goUp() {
    if (path.length > 0) {
      path = path.slice(0, -1);
      currentParent = path.length > 0 ? path[path.length - 1].id : rootId ?? null;
      await fetchChildren(currentParent);
    }
  }

  function select(item: Item) {
    selectedId = item.id;
    onSelect?.(item);
  }

  onMount(() => {
    fetchChildren(currentParent);
  });
</script>

<div class="hierarchy-browser">
  <div class="path">
    <button on:click={goUp} disabled={path.length === 0}>⬆ Up</button>
    {#each path as p, i}
      <span>{p.name}{#if i < path.length - 1} &nbsp;/&nbsp;{/if}</span>
    {/each}
  </div>
  {#if loading}
    <p>Loading...</p>
  {:else if error}
    <p style="color: red">{error}</p>
  {:else}
    <ul>
      {#each items as item}
        <li>
          <button
            class:selected={item.id === selectedId}
            on:click={() => select(item)}
            style="font-weight: {item.id === selectedId ? 'bold' : 'normal'}"
          >
            {item.name}
          </button>
          <button on:click={() => goTo(item)} title="Browse into">➡</button>
        </li>
      {/each}
      {#if items.length === 0}
        <li><em>No items here.</em></li>
      {/if}
    </ul>
  {/if}
</div>

<style>
.hierarchy-browser {
  border: 1px solid var(--border, #e0e4ea);
  border-radius: 0.5rem;
  padding: 1rem;
  background: var(--card-bg, #fff);
  max-width: 400px;
}
.path {
  margin-bottom: 0.5rem;
  font-size: 0.95em;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.25em;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
li {
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5em;
}
button.selected {
  background: var(--accent, #2a5d8f);
  color: #fff;
}
</style>
