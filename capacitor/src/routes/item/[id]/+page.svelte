<script>
  import Card from '$lib/Card.svelte';
  import '$lib/global.css';
  import { supabase } from '$lib/supabase';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  let item = null;
  let loading = true;
  let error = null;

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
    } else {
      item = data;
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
          <!-- TODO: Fetch and render location hierarchy -->
          <li>{item.id}</li>
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