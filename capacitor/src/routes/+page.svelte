<script lang="ts">
  import Card from '$lib/Card.svelte';
  import '$lib/global.css';
  import { BarcodeFormat, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
  import { goto } from '$app/navigation';

  // Placeholder data
  let recents = [
    { id: 1, name: 'Widget A', location: 'Warehouse > Shelf 1' },
    { id: 2, name: 'Gadget B', location: 'Warehouse > Shelf 2' }
  ];

  let scanning = false;
  let scanError = '';

  async function startScan() {
    scanError = '';
    scanning = true;
    try {
      const result = await BarcodeScanner.scan({formats: [BarcodeFormat.QrCode]});
      scanning = false;
      if (result.barcodes.length > 0) {
        // Find a QR code (format: "QR_CODE")
        const qr = result.barcodes[0];
        if (qr && qr.rawValue) {
          const match = qr.rawValue.match(/qr\/([A-Za-z0-9]+)$/) || qr.rawValue.match(/([A-Za-z0-9]+)$/);
          if (match) {
            goto(`/qr/${match[1]}`);
          } else {
            scanError = 'Unrecognized QR code format.';
          }
        } else {
          scanError = 'No QR code detected.';
        }
      } else {
        scanError = 'No QR code detected.';
      }
    } catch (e: any) {
      scanning = false;
      scanError = e.message || 'Failed to scan QR code.';
    }
  }
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
    <button on:click={startScan} disabled={scanning}>Scan QR</button>
  </div>
  {#if scanError}
    <div class="scan-error">{scanError}</div>
  {/if}
</main>

<style>
  .scan-error {
    color: #c40000;
    margin-top: 1em;
    text-align: center;
  }
</style>