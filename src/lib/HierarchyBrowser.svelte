<script lang="ts">
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  import type { Tables } from './database.types';
  interface Props {
    selectedId?: string | null;
    onSelect: (item: Tables<"items">) => void;
    rootId?: string | null; // Optionally start from a specific root
  }

  let { selectedId = $bindable(null), onSelect, rootId = null }: Props = $props();

  let loading = $state(false);
  let error: string | null = $state(null);
  let items: Tables<"items">[] = $state([]);
  let path: Tables<"items">[] = $state([]);
  let currentParent: string | null = rootId ?? null;

  async function fetchChildren(parent: string | null) {
    loading = true;
    error = null;
    let query = supabase
      .from('items')
      .select('*');
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

  async function goTo(item: Tables<'items'>) {
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

  function select(item: Tables<'items'>) {
    selectedId = item.id;
    onSelect?.(item);
  }

  onMount(() => {
    fetchChildren(currentParent);
  });
</script>

<div class="hierarchy-browser">
  <div class="path">
    <button onclick={goUp} disabled={path.length === 0}>⬆ Up</button>
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
            onclick={() => select(item)}
            style="font-weight: {item.id === selectedId ? 'bold' : 'normal'}"
          >
            {item.name}
          </button>
          <button onclick={() => goTo(item)} title="Browse into">➡</button>
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
