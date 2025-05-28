<script lang="ts">
import { onMount } from 'svelte';
import { supabase } from '$lib/supabase';
import Sqids from 'sqids';
import '$lib/global.css';

let count = 20;
let generating = false;
let error: string | null = null;
let pointers: { id: number }[] = [];
let generated = false;

async function generatePointers() {
  generating = true;
  error = null;
  generated = false;
  pointers = [];
  try {
    // Insert new pointers in bulk
    const { data, error: insertErr } = await supabase
      .from('pointers')
      .insert(Array(count).fill({}))
      .select('id');
    if (insertErr) throw new Error(insertErr.message);
    pointers = data;
    generated = true;
  } catch (e) {
    error = e.message || 'Failed to generate QR codes.';
  }
  generating = false;
}

function getQrUrl(id: number) {
  const sqids = new Sqids();
  const code = sqids.encode([id]);
  return `${location.origin}/qr/${code}`;
}
</script>

<main>
  <h1 class="qr-heading">Bulk QR Code Generator</h1>
  <form on:submit|preventDefault={generatePointers} style="margin-bottom: 1.5em;">
    <label>
      Number of QR codes to generate:
      <input type="number" min="1" max="100" bind:value={count} />
    </label>
    <button type="submit" disabled={generating}>{generating ? 'Generating...' : 'Generate'}</button>
  </form>
  {#if error}
    <p style="color: red">{error}</p>
  {/if}
  {#if generated && pointers.length > 0}
  <div class="qr-meta">
    <span>Generated {pointers.length} QR codes on {new Date().toLocaleString()}</span>
  </div>
  <div class="print-controls">
    <button on:click={() => window.print()}>Print</button>
  </div>
    <div class="qr-grid">
      {#each pointers as pointer}
        <div class="qr-cell">
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(getQrUrl(pointer.id))}`} alt="QR code" />
          <div class="qr-label">{getQrUrl(pointer.id)}</div>
        </div>
      {/each}
    </div>
  {/if}
</main>

<style>
.qr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5em;
  margin-top: 2em;
}
.qr-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  page-break-inside: avoid;
  background: #fff;
  border-radius: 1em 0 1em 0;
  padding: 1em;
  border: 3px solid #c40000;
}

.qr-meta {
  text-align: center;
  margin: 1em;
  color: #555;
  font-size: 1.05em;
}

.qr-label {
  margin-top: 0.5em;
  font-size: 0.9em;
  word-break: break-all;
  text-align: center;
}
@media print {
  body { background: #fff; }
  .print-controls, form, .qr-heading { display: none !important; }
  .qr-meta { margin-bottom: 0.5em; }
  .qr-grid { gap: 0.5em; }
}
</style>
