import path from 'node:path';
import type { Element, Root } from 'hast';
import sharp from 'sharp';
import { visit } from 'unist-util-visit';

/** EXIF orientations 5 to 8 store the image rotated a quarter turn: width and height swap. */
const QUARTER_TURN_ORIENTATIONS = new Set([5, 6, 7, 8]);

/** Width / height of the image at `file`, as displayed (after EXIF rotation). */
export async function displayedRatio(file: string): Promise<number> {
    const { width, height, orientation } = await sharp(file).metadata();
    if (!width || !height) throw new Error(`Cannot read the size of ${file}`);
    const ratio = QUARTER_TURN_ORIENTATIONS.has(orientation ?? 1) ? height / width : width / height;
    return Number(ratio.toFixed(4));
}

/**
 * Give every local markdown image a `--ratio` CSS variable (width / height),
 * read from the image file, and a `landscape` class when it is wider than tall.
 * markdown.css uses the ratio to cap the image height while the browser still
 * reserves the image's exact size before it loads, and the class to pick the
 * tile shape of image rows.
 *
 * Runs before Astro's own image step, which carries `style` and `class`
 * through to the final <img>.
 */
export function rehypeImageRatio() {
    return async (tree: Root, file: { path?: string }) => {
        const markdownFile = file.path;
        if (!markdownFile) return;

        const images: Element[] = [];
        visit(tree, 'element', (node: Element) => {
            const src = node.properties.src;
            if (node.tagName === 'img' && typeof src === 'string' && !URL.canParse(src)) {
                images.push(node);
            }
        });

        await Promise.all(
            images.map(async (img) => {
                const src = decodeURI(img.properties.src as string);
                const ratio = await displayedRatio(path.resolve(path.dirname(markdownFile), src));
                img.properties.style = `--ratio: ${ratio}`;
                if (ratio > 1) {
                    const classes = Array.isArray(img.properties.className)
                        ? img.properties.className
                        : [];
                    img.properties.className = [...classes, 'landscape'];
                }
            })
        );
    };
}
