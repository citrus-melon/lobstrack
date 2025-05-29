<script lang="ts">
  import Card from '$lib/Card.svelte';
  import '$lib/global.css';
  import { supabase } from '$lib/supabase';
  import HierarchyBrowser from '$lib/HierarchyBrowser.svelte';
  import { invalidateAll } from '$app/navigation';
  import Sqids from 'sqids';
  import { BarcodeFormat, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
  import type { PageProps } from './$types';
    import { sqids } from '$lib/sqids';

  let { data }: PageProps = $props();

  let showMove = $state(false);
  let moveError: string | null = $state(null);
  let moveLoading = $state(false);
  let selectedParentId: string | null = $state(null);

  let showLinkPointer = $state(false);
  let pointerInput = $state('');
  let linkLoading = $state(false);
  let linkError: string | null = $state(null);

  // --- Move logic ---
  async function handleMove(newParentId: string) {
    moveLoading = true;
    moveError = null;
    // Prevent moving to self or current parent
    if (newParentId === data.item.id || newParentId === data.item.parent) {
      moveError = 'Invalid parent selection.';
      moveLoading = false;
      return;
    }
    const { error: updateErr } = await supabase
      .from('items')
      .update({ parent: newParentId })
      .eq('id', data.item.id);
    if (updateErr) {
      moveError = updateErr.message;
    } else {
      showMove = false;
      await invalidateAll();
    }
    moveLoading = false;
  }

  // --- Scan Move logic ---
  async function handleScanMove() {
    showMove = true;
    moveLoading = true;
    moveError = null;
    try {
      const result = await BarcodeScanner.scan({formats: [BarcodeFormat.QrCode]});
      const qr = result.barcodes[0];
      if (!qr?.rawValue) throw new Error('No QR code detected.');
      // Try to extract a /qr/[code] or just the code
      const match = qr.rawValue.match(/qr\/([A-Za-z0-9]+)$/) || qr.rawValue.match(/([A-Za-z0-9]+)$/);
      if (!match) throw new Error('Unrecognized QR code format.');
      const [pointerId] = sqids.decode(match[1]);
      if (!pointerId) throw new Error('Invalid QR code');
      // Lookup pointer to get parent item id
      const { data: pointer, error: pointerErr } = await supabase
        .from('pointers')
        .select('item')
        .eq('id', pointerId)
        .single();
      if (pointerErr || !pointer || !pointer.item) throw new Error('Pointer not found or not linked to an item');
      // Move this item under the scanned parent
      await handleMove(pointer.item);
    } catch (e: any) {
      moveError = e.message || 'Failed to scan QR code.';
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
        .update({ item: data.item.id }, { count: 'exact' })
        .eq('id', pointerId);
      if (updateErr) throw new Error(updateErr.message);
      if (count === 0) throw new Error('Pointer not found');
      showLinkPointer = false;
    } catch (e: any) {
      linkError = e.message || 'Failed to link pointer.';
    }
    linkLoading = false;
  }

  async function handleScanToLinkPointer() {
    showLinkPointer = true;
    linkError = null;
    try {
      const result = await BarcodeScanner.scan({formats: [BarcodeFormat.QrCode]});
      const qr = result.barcodes[0];
      if (!qr?.rawValue) throw new Error('No QR code detected.');
      // Try to extract a /qr/[code] or just the code
      const match = qr.rawValue.match(/qr\/([A-Za-z0-9]+)$/) || qr.rawValue.match(/([A-Za-z0-9]+)$/);
      if (!match) throw new Error('Unrecognized QR code format.');
      pointerInput = match[1];
      handleLinkPointer();
    } catch (e: any) {
      linkError = e.message || 'Failed to scan QR code.';
    }
  }
</script>

<main>
  {#if !data.item}
    <p>Loading...</p>
  {:else}
    <h1>{data.item.name}</h1>
    <Card title="Location">
      <nav aria-label="breadcrumb">
        <ol style="display: flex; gap: 0.5em; list-style: none; padding: 0; margin: 0;">
          {#each data.locationHierarchy as loc, i (loc.id)}
            <li>
              {#if i < data.locationHierarchy.length - 1}
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
      {#if data.children.length > 0}
        <ul>
          {#each data.children as child}
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
      <button onclick={handleScanMove}>Scan to Move</button>
      <button onclick={() => showMove = !showMove}>Move</button>
      <button onclick={() => showLinkPointer = !showLinkPointer}>Link QR</button>
      <button>Checkout</button>
    </div>
    {#if showMove}
      <div class="modal">
        <div class="modal-content">
          <h3 style="margin-bottom: 1rem;">Select new parent location</h3>
          <HierarchyBrowser
            onSelect={(item) => selectedParentId = item.id}
            selectedId={selectedParentId}
          />
          <div style="margin-top: 1em; display: flex; gap: 1em;">
            <button onclick={async () => {
              if (selectedParentId) {
                await handleMove(selectedParentId);
              }
            }} disabled={!selectedParentId || moveLoading}>
              {moveLoading ? 'Moving...' : 'Move Here'}
            </button>
            <button onclick={() => showMove = false} disabled={moveLoading}>Cancel</button>
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
          <h3 style="margin-bottom: 1em">Link QR Code / Pointer</h3>
          <div style="text-align: center">
            <button onclick={handleScanToLinkPointer} style="margin-bottom: .5rem">Scan</button>
            <p style="margin-bottom: .5rem">or</p>
          </div>
          <input type="text" placeholder="Enter code or URL" bind:value={pointerInput} style="width: 100%; margin-bottom: 1em;" />
          <div style="display: flex; gap: 1em;">
            <button onclick={handleLinkPointer} disabled={linkLoading || !pointerInput}>
              {linkLoading ? 'Linking...' : 'Link'}
            </button>
            <button onclick={() => showLinkPointer = false} disabled={linkLoading}>Cancel</button>
          </div>
          {#if linkError}
            <p style="color: red">{linkError}</p>
          {/if}
        </div>
      </div>
    {/if}
  {/if}
</main>