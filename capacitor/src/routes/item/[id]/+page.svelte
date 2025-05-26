<script lang="ts">
  import Card from '$lib/Card.svelte';
  import '$lib/global.css';
  import { supabase } from '$lib/supabase';
  import type { PageLoad } from './$types';

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
      <button>Move</button>
      <button>Checkout</button>
    </div>
  {/if}
</main>