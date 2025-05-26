<script lang="ts">
  import Card from '$lib/Card.svelte';
  import '$lib/global.css';
  import { supabase } from '$lib/supabase';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  type Item = {
    id: string;
    name: string;
    parent: string | null;
  };

  let item: Item | null = null;
  let loading = true;
  let error: string | null = null;
  let locationHierarchy: Item[] = [];

  // Fetch item by id from supabase
  onMount(async () => {
    loading = true;
    error = null;
    const id = $page.params.id;
    const { data, error: err } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();
    if (err) {
      error = err.message;
      item = null;
      locationHierarchy = [];
    } else {
      item = data;
      // Optimized: fetch full hierarchy from supabase function
      const { data: hierarchy, error: hierErr } = await supabase.rpc('get_item_hierarchy', { item_id: id });
      if (hierErr || !hierarchy) {
        locationHierarchy = [];
      } else {
        // hierarchy is from leaf to root, so reverse for breadcrumbs
        locationHierarchy = hierarchy.reverse();
      }
    }
    loading = false;
  });
</script>

<main>
  {#if loading}
    <p>Loading...</p>
  {:else if error}
    <p style="color: red">{error}</p>
  {:else if item}
    <h1>{item.name}</h1>
    <Card title="Location">
      <nav aria-label="breadcrumb">
        <ol style="display: flex; gap: 0.5em; list-style: none; padding: 0; margin: 0;">
          {#each locationHierarchy as loc, i (loc.id)}
            <li>
              {#if i < locationHierarchy.length - 1}
                {loc.name} &gt;
              {:else}
                <strong>{loc.name}</strong>
              {/if}
            </li>
          {/each}
        </ol>
      </nav>
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