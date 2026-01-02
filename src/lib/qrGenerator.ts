import QRCode from "qrcode";

type Template = {
    templateDocument: Document;
    itemCount: number;
}

export async function parseTemplate(templateString: string): Promise<Template> {
    const templateDocument = new DOMParser().parseFromString(templateString, "image/svg+xml");

    const itemElements = templateDocument.querySelectorAll("[*|label='item']");

    if (itemElements.length === 0) {
        templateDocument.documentElement.setAttribute("label", "item");

        if (templateDocument.querySelectorAll("rect[*|label='qr']").length > 1) {
            throw new Error("Invalid template: Single-item template (no groups representing items) cannot contain multiple QR code placeholders");
        }

        return { templateDocument, itemCount: 1 };
    } else {
        for (const itemElement of itemElements) {
            if (itemElement.querySelector("[*|label='item']")) {
                throw new Error("Invalid template: groups representing items cannot be nested");
            }
        }

        return { templateDocument, itemCount: itemElements.length };
    }
}

function generateUrl(sqid: string, base: URL) {
    return `${base.origin}/qr/${sqid}`;
}

function rgbToHex(rgb: string) {
    return rgb
        .match(/\d+/g)
        ?.map(v => Number(v).toString(16).padStart(2, "0"))
        .join("");
}

export async function populateTemplate(template: Template, itemSqids: string[], baseURL: URL) {
    const svgDocument = template.templateDocument.cloneNode(true) as Document;
    const itemElements = svgDocument.querySelectorAll("[*|label='item']");

    if (itemElements.length !== itemSqids.length) {
        throw new Error("Template item count does not match generated item count");
    }

    for (const itemElement of itemElements) {
        const itemSqid = itemSqids.shift()!;

        const qrPlaceholders = itemElement.querySelectorAll("rect[*|label='qr']");
        for (const qrPlaceholder of qrPlaceholders) {
            // Extract attributes from placeholder
            if (qrPlaceholder instanceof SVGElement === false) throw new Error("QR code placeholder is not an SVG element");
            const x = qrPlaceholder.getAttribute("x");
            const y = qrPlaceholder.getAttribute("y");
            const width = qrPlaceholder.getAttribute("width");
            const height = qrPlaceholder.getAttribute("height");
            const strokeHex = rgbToHex(qrPlaceholder.style.stroke);

            // generate QR code image
            const qrCodeSvg = await QRCode.toString(generateUrl(itemSqid, baseURL), { 
                type: "svg",
                margin: 0,
                color: {
                    dark: strokeHex || undefined,
                    light: "#00000000" // transparent background
                }
            });

            const qrCodeElement = new DOMParser().parseFromString(qrCodeSvg, "image/svg+xml").documentElement;

            if (x) qrCodeElement.setAttribute("x", x);
            if (y) qrCodeElement.setAttribute("y", y);
            if (width) qrCodeElement.setAttribute("width", width);
            if (height) qrCodeElement.setAttribute("height", height);

            qrPlaceholder.replaceWith(qrCodeElement);
        }
        
        const textElements = itemElement.querySelectorAll("text");
        for (const textElement of textElements) {
            textElement.innerHTML = textElement.innerHTML.replace("{url}", generateUrl(itemSqid, baseURL));
            textElement.innerHTML = textElement.innerHTML.replace("{code}", itemSqid);
        }
    }

    return svgDocument.documentElement;
}