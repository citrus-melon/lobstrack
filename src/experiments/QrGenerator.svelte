<input type="url" bind:value={baseUrl} placeholder="Base URL" />
<input type="number" bind:value={startId} min="0" placeholder="Starting ID" />
<input type="file" name="template" accept=".svg,image/svg+xml" bind:files={templateFiles}>
<button onclick={generate} disabled={!templateFiles}>Generate QR Codes</button>
<iframe srcdoc={iframeContent} bind:this={iframe} sandbox="allow-modals allow-scripts" width="100%" height="500px" title="print"></iframe>

<script lang="ts">
    import { sqids } from '$lib/sqids';
    import { parseTemplate, populateTemplate } from '$lib/qrGenerator';
    import { start } from 'repl';

    let baseUrl: string = location.origin;
    let startId: number = 0;
    let templateFiles: FileList | null = null;
    let iframeContent: string = "";
    let iframe: HTMLIFrameElement;


    async function generate() {
        try {
            const templateString = await templateFiles?.[0].text();
            if (!templateString) throw new Error("No template file selected");
    
            const template = await parseTemplate(templateString);
    
            const itemSqids: string[] = [];
            for (let i = 0; i < template.itemCount; i++) {
                itemSqids.push(sqids.encode([startId + i]));
            }

            const populatedTemplate = await populateTemplate(template, itemSqids, new URL(baseUrl));
    
            iframeContent = populatedTemplate;
            startId += template.itemCount;
            // iframe.contentWindow?.print();
        } catch (e: any) {
            alert(e.message || "Failed to generate QR codes.");
        }
    }
</script>