#!/usr/bin/env node
/**
 * Build the Pagefind search index for the blog.
 *
 * Reads markdown posts from src/content/blog, renders them to HTML, and feeds
 * them into Pagefind's Node API. The resulting chunked index is written to
 * public/pagefind/ so Next.js serves it as a static asset.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
const OUTPUT_DIR = path.join(ROOT, 'public/pagefind');

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
    const pubDatetime = data.pubDatetime ?? '';
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const readingTime = readingTimeFn(content).text;

    const bodyHtml = String(await processor.process(content));
    const tagFilters = tags.map((t) => `<meta data-pagefind-filter="tag" content="${escapeHtml(t)}">`).join('');
    const tagMeta = tags.map((t) => `<meta data-pagefind-meta="tag[]" content="${escapeHtml(t)}">`).join('');

    const html = `<!doctype html>
<html lang="en">
<head>
    <title>${escapeHtml(title)}</title>
    <meta data-pagefind-meta="title" content="${escapeHtml(title)}">
    <meta data-pagefind-meta="slug" content="${escapeHtml(slug)}">
    <meta data-pagefind-meta="description" content="${escapeHtml(description)}">
    <meta data-pagefind-meta="date" content="${escapeHtml(pubDatetime)}">
    <meta data-pagefind-meta="readingTime" content="${escapeHtml(readingTime)}">
    ${tagMeta}
    ${tagFilters}
</head>
<body>
    <main data-pagefind-body>
        <h1>${escapeHtml(title)}</h1>
        ${description ? `<p>${escapeHtml(description)}</p>` : ''}
        ${bodyHtml}
    </main>
</body>
</html>`;

    return { url: `/posts/${slug}`, content: html };
}

async function main() {
    await fs.rm(OUTPUT_DIR, { recursive: true, force: true });

    const { index, errors: createErrors } = await pagefind.createIndex({
        rootSelector: 'main',
        excludeSelectors: ['nav', 'footer'],
        forceLanguage: 'en',
    });
    if (createErrors?.length) {
        console.error('pagefind createIndex errors:', createErrors);
        process.exit(1);
    }

    let count = 0;
    for await (const filePath of walkMarkdown(CONTENT_DIR)) {
        const doc = await renderPost(filePath);
        if (!doc) continue;
        const { errors } = await index.addHTMLFile(doc);
        if (errors?.length) {
            console.error(`pagefind addHTMLFile errors for ${doc.url}:`, errors);
            process.exit(1);
        }
        count++;
    }

    const { errors: writeErrors } = await index.writeFiles({ outputPath: OUTPUT_DIR });
    if (writeErrors?.length) {
        console.error('pagefind writeFiles errors:', writeErrors);
        process.exit(1);
    }
    await pagefind.close();

    console.log(`Indexed ${count} posts -> ${path.relative(ROOT, OUTPUT_DIR)}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
