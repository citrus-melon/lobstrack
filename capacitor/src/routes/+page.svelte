<script>
  import Card from '$lib/Card.svelte';
  import '$lib/global.css';

  // Placeholder data
  let recents = [
    { id: 1, name: 'Widget A', location: 'Warehouse > Shelf 1' },
    { id: 2, name: 'Gadget B', location: 'Warehouse > Shelf 2' }
  ];
</script>

<main>
  <h1>Lobstrack</h1>

  <Card title="Recents">
    <ul>
      {#each recents as item}
        <li>
          <strong>{item.name}</strong> <span style="color: #888; font-size: 0.95em;">({item.location})</span>
        </li>
      {/each}
    </ul>
  </Card>

  <Card title="Actions">
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      <button>Browse</button>
      <button>Scan Multiple</button>
      <button>Print Labels</button>
    </div>
  </Card>

  <div class="action-bar">
    <input type="text" placeholder="Search..." style="flex:1;">
    <button>Scan QR</button>
  </div>
</main>