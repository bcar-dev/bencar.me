// @vitest-environment node
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import type { Element, Root } from 'hast';
import sharp from 'sharp';
import { displayedRatio, rehypeImageRatio } from '../rehypeImageRatio';

const POST = path.resolve('src/content/blog/2026/put-a-date-on-it.md');

function img(src: string): Element {
    return { type: 'element', tagName: 'img', properties: { src, alt: '' }, children: [] };
}

async function run(images: Element[], file: { path?: string } = { path: POST }) {
    const tree: Root = {
        type: 'root',
        children: [{ type: 'element', tagName: 'p', properties: {}, children: images }],
    };
    await rehypeImageRatio()(tree, file);
    return images.map((image) => image.properties.style);
}

describe('rehypeImageRatio', () => {
    it("sets each local image's width / height ratio, resolved from the markdown file", async () => {
        const [portrait, landscape] = await run([
            img('../../../assets/img/2026/put-a-date-on-it/ventoux-summit-riders.jpeg'),
            img('../../../assets/img/2026/put-a-date-on-it/ventoux-summit-view.jpeg'),
        ]);
        expect(portrait).toBe('--ratio: 0.75');
        expect(landscape).toBe('--ratio: 1.3333');
    });

    it('marks landscape images, and only those', async () => {
        const portrait = img(
            '../../../assets/img/2026/put-a-date-on-it/ventoux-summit-riders.jpeg'
        );
        const landscape = img('../../../assets/img/2026/put-a-date-on-it/ventoux-summit-view.jpeg');
        await run([portrait, landscape]);
        expect(portrait.properties.className).toBeUndefined();
        expect(landscape.properties.className).toEqual(['landscape']);
    });

    it('uses the displayed shape of a photo stored rotated by its camera', async () => {
        // Phones often save a portrait shot as a landscape file plus an EXIF
        // "rotate 90°" flag (orientation 6); browsers show it as portrait.
        const dir = mkdtempSync(path.join(tmpdir(), 'image-ratio-'));
        const file = path.join(dir, 'rotated.jpg');
        try {
            await sharp({ create: { width: 40, height: 20, channels: 3, background: '#fff' } })
                .jpeg()
                .withMetadata({ orientation: 6 })
                .toFile(file);
            expect(await displayedRatio(file)).toBe(0.5);
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });

    it('leaves remote images alone', async () => {
        expect(await run([img('https://example.com/photo.jpg')])).toEqual([undefined]);
    });

    it('does nothing without a markdown file path to resolve against', async () => {
        const image = img('../../../assets/img/2026/put-a-date-on-it/ventoux-summit-riders.jpeg');
        expect(await run([image], {})).toEqual([undefined]);
    });

    it('fails loudly when an image file is missing', async () => {
        await expect(run([img('../../../assets/img/2026/nope/missing.jpeg')])).rejects.toThrow();
    });
});
