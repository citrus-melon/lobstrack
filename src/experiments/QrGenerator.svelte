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

        // replace {url} in text nodes with url
        const textNodes = svgDocument.querySelectorAll("text");
        textNodes.forEach(node => {
            node.innerHTML = node.innerHTML || "";
            node.innerHTML = node.innerHTML.replace("{url}", "https://example.com");
            node.innerHTML = node.innerHTML.replace("{code}", "asdf");
        });

        // generate QR code and replace rectangles containing <title> contain "qr" with the QR code image
        const potentialQrRectangles = svgDocument.querySelectorAll("rect:has(> title)")
        for (const rectangle of potentialQrRectangles) {
            if (rectangle.textContent?.includes("qr")) {
                const x = rectangle.getAttribute("x");
                const y = rectangle.getAttribute("y");
                const width = rectangle.getAttribute("width");
                const height = rectangle.getAttribute("height");
                const fill = rectangle.getAttribute("fill");

                // generate QR code image
                const qrCodeSvg = await QRCode.toString("https://example.com", { 
                    type: "svg",
                    margin: 0,
                    color: {
                        dark: fill || undefined,
                        light: "#00000000" // transparent background
                    }
                });

                const qrCodeElement = parser.parseFromString(qrCodeSvg, "image/svg+xml").documentElement;

                qrCodeElement.setAttribute("x", x || "");
                qrCodeElement.setAttribute("y", y || "");
                qrCodeElement.setAttribute("width", width || "");
                qrCodeElement.setAttribute("height", height || "");
                
                // replace rectangle with QR code image

                rectangle.replaceWith(qrCodeElement);
            }
        }

        return svgDocument.documentElement.outerHTML;
    }

    async function generate() {
        const templateString = await templateFiles?.[0].text();
        if (!templateString) throw new Error("No template file selected");

        iframeContent = await populateTemplate(templateString);
        iframe.contentWindow?.print();
    }
</script>