#!/usr/bin/env node
/**
 * Build the Pagefind search index for the blog.
 *
 * Reads markdown posts from src/content/blog, renders them to HTML, and feeds
 * them into Pagefind's Node API. Exposes `buildSearchIndex(outputDir)` so the
 * Astro build can write the index straight into `dist/pagefind` (via the
 * astro:build:done hook in astro.config.mjs), and runs as a CLI writing to
 * `public/pagefind` for the dev server (`pnpm run build:search`).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import matter from 'gray-matter';
import readingTimeFn from 'reading-time';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import * as pagefind from 'pagefind';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'src/content/blog');
const DEFAULT_OUTPUT_DIR = path.join(ROOT, 'public/pagefind');

const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeStringify);

async function* walkMarkdown(dir) {
    let entries;
    try {
        entries = await fs.readdir(dir, { withFileTypes: true });
    } catch (err) {
        if (err.code === 'ENOENT') return;
        throw err;
    }
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            yield* walkMarkdown(full);
        } else if (entry.name.endsWith('.md')) {
            yield full;
        }
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function renderPost(filePath) {
    const raw = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(raw);
    if (data.draft) return null;

    const slug = path.basename(filePath, '.md');
    const title = data.title ?? slug;
    const description = data.description ?? '';
    // gray-matter parses YAML timestamps into Date objects; serialise to ISO 8601
    // so the browser's Date constructor accepts it on the client.
    const pubDatetime =
        data.pubDatetime instanceof Date
            ? data.pubDatetime.toISOString()
            : String(data.pubDatetime ?? '');
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const readingTime = readingTimeFn(content).text;

    const bodyHtml = String(await processor.process(content));
    // Pagefind only reads data-pagefind-meta / data-pagefind-filter from
    // elements inside the indexed body, so emit them as hidden spans there.
    const metaSpans = [
        `<span hidden data-pagefind-meta="title:${escapeHtml(title)}"></span>`,
        `<span hidden data-pagefind-meta="slug:${escapeHtml(slug)}"></span>`,
        `<span hidden data-pagefind-meta="description:${escapeHtml(description)}"></span>`,
        `<span hidden data-pagefind-meta="date:${escapeHtml(pubDatetime)}"></span>`,
        `<span hidden data-pagefind-meta="readingTime:${escapeHtml(readingTime)}"></span>`,
        ...tags.map((t) => `<span hidden data-pagefind-filter="tag:${escapeHtml(t)}"></span>`),
    ].join('');

    const html = `<!doctype html>
<html lang="en">
<head>
    <title>${escapeHtml(title)}</title>
</head>
<body>
    <main data-pagefind-body>
        ${metaSpans}
        <h1>${escapeHtml(title)}</h1>
        ${description ? `<p>${escapeHtml(description)}</p>` : ''}
        ${bodyHtml}
    </main>
</body>
</html>`;

    return { url: `/posts/${slug}`, content: html };
}

/**
 * Build the Pagefind index and write its chunked output to `outputDir`.
 */
export async function buildSearchIndex(outputDir = DEFAULT_OUTPUT_DIR) {
    await fs.rm(outputDir, { recursive: true, force: true });

    const { index, errors: createErrors } = await pagefind.createIndex({
        rootSelector: 'main',
        excludeSelectors: ['nav', 'footer'],
        forceLanguage: 'en',
    });
    if (createErrors?.length) {
        throw new Error(`pagefind createIndex errors: ${createErrors.join(', ')}`);
    }

    let count = 0;
    for await (const filePath of walkMarkdown(CONTENT_DIR)) {
        const doc = await renderPost(filePath);
        if (!doc) continue;
        const { errors } = await index.addHTMLFile(doc);
        if (errors?.length) {
            throw new Error(`pagefind addHTMLFile errors for ${doc.url}: ${errors.join(', ')}`);
        }
        count++;
    }

    const { errors: writeErrors } = await index.writeFiles({ outputPath: outputDir });
    if (writeErrors?.length) {
        throw new Error(`pagefind writeFiles errors: ${writeErrors.join(', ')}`);
    }
    await pagefind.close();

    return { count, outputDir };
}

// Run as a CLI (writes to public/pagefind for the dev server).
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    buildSearchIndex()
        .then(({ count, outputDir }) => {
            console.log(`Indexed ${count} posts -> ${path.relative(ROOT, outputDir)}`);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
