<input type="file" name="template" accept=".svg,image/svg+xml" bind:files={templateFiles}>
<button onclick={generate} disabled={!templateFiles}>Generate QR Codes</button>
<iframe srcdoc={iframeContent} bind:this={iframe} sandbox="allow-modals" width="100%" height="500px" title="print"></iframe>

<script lang="ts">
    import QRCode from "qrcode";
    import { sqids } from '$lib/sqids';

    let templateFiles: FileList | null = null;

    let iframeContent: string = "";

    let iframe: HTMLIFrameElement;

    type Template = {
        templateDocument: Document;
        itemCount: number;
    }

    async function parseTemplate(templateString: string): Promise<Template> {
        const templateDocument = new DOMParser().parseFromString(templateString, "image/svg+xml");

        const itemElements = templateDocument.querySelectorAll("[*|label='item']");

        if (itemElements.length === 0) {
            templateDocument.documentElement.setAttribute("label", "item");

            if (templateDocument.querySelectorAll("[*|label='qr']").length > 1) {
                throw new Error("Multiple QR code placeholders found in a single-item template");
            }

            return { templateDocument, itemCount: 1 };
        } else {
            for (const itemElement of itemElements) {
                if (itemElement.querySelector("[*|label='item']")) {
                    throw new Error("Nested item groups are not allowed");
                }
            }

            return { templateDocument, itemCount: itemElements.length };
        }
    }

    function generateUrl(sqid: string) {
        return `${location.origin}/qr/${sqid}`;
    }

    async function populateTemplate(template: Template, itemSqids: string[]) {
        const svgDocument = template.templateDocument.cloneNode(true) as Document;
        const itemElements = svgDocument.querySelectorAll("[*|label='item']");

        if (itemElements.length !== itemSqids.length) {
            throw new Error("Item count does not match the number of provided item sqids");
        }

        for (const itemElement of itemElements) {
            const itemSqid = itemSqids.shift()!;

            const qrPlaceholders = itemElement.querySelectorAll("[*|label='qr']");
            for (const qrPlaceholder of qrPlaceholders) {
                if (qrPlaceholder instanceof SVGElement === false) {
                    throw new Error("QR code placeholder is not an SVG element");
                }
                const x = qrPlaceholder.getAttribute("x");
                const y = qrPlaceholder.getAttribute("y");
                const width = qrPlaceholder.getAttribute("width");
                const height = qrPlaceholder.getAttribute("height");
                const stroke = qrPlaceholder.style.stroke.match(/\d+/g)?.map(v => Number(v).toString(16).padStart(2, "0")).join("");

                // generate QR code image
                const qrCodeSvg = await QRCode.toString(generateUrl(itemSqid), { 
                    type: "svg",
                    margin: 0,
                    color: {
                        dark: stroke || undefined,
                        light: "#00000000" // transparent background
                    }
                });

                const qrCodeElement = new DOMParser().parseFromString(qrCodeSvg, "image/svg+xml").documentElement;

                if (x) qrCodeElement.setAttribute("x", x);
                if (y) qrCodeElement.setAttribute("y", y);
                if (width) qrCodeElement.setAttribute("width", width);
                if (height) qrCodeElement.setAttribute("height", height);
                
                // replace rectangle with QR code image

                qrPlaceholder.replaceWith(qrCodeElement);
            }
            
            const textElements = itemElement.querySelectorAll("text");
            for (const textElement of textElements) {
                textElement.innerHTML = textElement.innerHTML.replace("{url}", generateUrl(itemSqid));
                textElement.innerHTML = textElement.innerHTML.replace("{code}", itemSqid);
            }
        }

        return svgDocument.documentElement.outerHTML;
    }

    async function generate() {
        try {
            const templateString = await templateFiles?.[0].text();
            if (!templateString) throw new Error("No template file selected");
    
            const template = await parseTemplate(templateString);
    
            const itemSqids: string[] = [];
            for (let i = 0; i < template.itemCount; i++) {
                itemSqids.push(sqids.encode([i]));
            }
            const populatedTemplate = await populateTemplate(template, itemSqids);
    
            iframeContent = populatedTemplate;
    
            // iframeContent = await populateTemplate(templateString);
            iframe.contentWindow?.print();
        } catch (e: any) {
            alert(e.message || "Failed to generate QR codes.");
        }
    }
</script>