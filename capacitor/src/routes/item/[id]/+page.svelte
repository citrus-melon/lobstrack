<script>
  import Card from '$lib/Card.svelte';
  import '$lib/global.css';

  // Placeholder data
  let item = {
    name: 'Widget A',
    location: ['Warehouse', 'Shelf 1', 'Bin 3'],
    comments: [
      { author: 'Alice', text: 'Checked in, all good.' },
      { author: 'Bob', text: 'Moved from Shelf 2.' }
    ]
  };
</script>

<main>
  <h1>{item.name}</h1>

  <Card title="Location">
    <nav aria-label="breadcrumb">
      <ol style="display: flex; gap: 0.5em; list-style: none; padding: 0; margin: 0;">
        {#each item.location as loc, i}
          <li>{loc}{#if i < item.location.length - 1} &gt; {/if}</li>
        {/each}
      </ol>
    </nav>
  </Card>

  <Card title="Comments">
    <ul>
      {#each item.comments as c}
        <li><strong>{c.author}:</strong> {c.text}</li>
      {/each}
    </ul>
  </Card>

  <div class="action-bar">
    <button>Move</button>
    <button>Checkout</button>
  </div>
</main>