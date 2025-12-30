<input type="file" name="template" accept=".svg,image/svg+xml" bind:files={templateFiles}>
<button onclick={generate} disabled={!templateFiles}>Generate QR Codes</button>
<iframe srcdoc={iframeContent} bind:this={iframe} sandbox="allow-modals" width="100%" height="500px" title="print"></iframe>

<script lang="ts">
    import QRCode from "qrcode";

    let templateFiles: FileList | null = null;

    let iframeContent: string = "";

    let iframe: HTMLIFrameElement;

    async function populateTemplate(templateString: string) {
        const parser = new DOMParser();
        const svgDocument = parser.parseFromString(templateString, "image/svg+xml");

        const items = [];

        for (const itemElement in svgDocument.querySelectorAll("[inkscape\\:label='")) {
            items.push({
                itemElement,
            })
        }
    }

    async function generate() {
        const templateString = await templateFiles?.[0].text();
        if (!templateString) throw new Error("No template file selected");

        // iframeContent = await populateTemplate(templateString);
        iframe.contentWindow?.print();
    }
</script>