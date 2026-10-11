// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { buildSearchIndex, escapeHtml, renderPost, walkMarkdown } from '../build-search-index.mjs';

const execFileAsync = promisify(execFile);

let tmp: string;
beforeAll(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'search-index-'));
});
afterAll(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
});

/** `renderPost` returns null only for drafts; these tests always expect a document. */
async function renderDoc(filePath: string) {
    const doc = await renderPost(filePath);
    if (!doc) throw new Error(`expected ${filePath} to render, got null`);
    return doc;
}

async function writePost(name: string, body: string) {
    const file = path.join(tmp, name);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, body, 'utf-8');
    return file;
}

describe('escapeHtml', () => {
    it('escapes the five HTML-significant characters', () => {
        expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
    });

    it('escapes ampersands before the entities it introduces', () => {
        expect(escapeHtml('a & <b>')).toBe('a &amp; &lt;b&gt;');
    });

    it('coerces non-string values', () => {
        expect(escapeHtml(42)).toBe('42');
        expect(escapeHtml(null)).toBe('null');
    });
});

describe('walkMarkdown', () => {
    it('yields markdown files recursively and ignores other extensions', async () => {
        const dir = path.join(tmp, 'walk');
        await writePost('walk/a.md', '# a');
        await writePost('walk/nested/b.md', '# b');
        await writePost('walk/notes.txt', 'ignore me');

        const found: string[] = [];
        for await (const file of walkMarkdown(dir)) found.push(path.basename(file));
        expect(found.sort()).toEqual(['a.md', 'b.md']);
    });

    it('yields nothing when the directory does not exist', async () => {
        const found: string[] = [];
        for await (const file of walkMarkdown(path.join(tmp, 'missing'))) found.push(file);
        expect(found).toEqual([]);
    });

    it('surfaces errors other than a missing directory', async () => {
        const notADirectory = await writePost('walk/a-file.md', '# a');
        await expect(async () => {
            for await (const file of walkMarkdown(notADirectory)) void file;
        }).rejects.toThrow(/ENOTDIR/);
    });
});

describe('renderPost', () => {
    it('returns null for a draft so it stays out of the index', async () => {
        const file = await writePost(
            'draft.md',
            ['---', 'title: Draft', 'draft: true', '---', 'body'].join('\n')
        );
        expect(await renderPost(file)).toBeNull();
    });

    it('derives the url and slug from the filename', async () => {
        const file = await writePost(
            'hello-world.md',
            ['---', 'title: Hello', '---', 'Some body text.'].join('\n')
        );
        const doc = await renderDoc(file);
        expect(doc.url).toBe('/posts/hello-world');
        expect(doc.content).toContain('data-pagefind-meta="slug:hello-world"');
    });

    it('falls back to the slug when the title is missing', async () => {
        const file = await writePost('untitled.md', 'Just a body.');
        const doc = await renderDoc(file);
        expect(doc.content).toContain('data-pagefind-meta="title:untitled"');
    });

    it('serialises a YAML date to an ISO 8601 string', async () => {
        const file = await writePost(
            'dated.md',
            ['---', 'title: Dated', 'pubDatetime: 2026-02-21', '---', 'body'].join('\n')
        );
        const doc = await renderDoc(file);
        expect(doc.content).toContain('data-pagefind-meta="date:2026-02-21T00:00:00.000Z"');
    });

    it('emits an empty date when the field is absent', async () => {
        const file = await writePost(
            'undated.md',
            ['---', 'title: Undated', '---', 'b'].join('\n')
        );
        const doc = await renderDoc(file);
        expect(doc.content).toContain('data-pagefind-meta="date:"');
    });

    it('emits one filter span per tag and none when tags are missing', async () => {
        const tagged = await writePost(
            'tagged.md',
            ['---', 'title: Tagged', 'tags: [dev, astro]', '---', 'body'].join('\n')
        );
        expect((await renderDoc(tagged)).content).toContain('data-pagefind-filter="tag:dev"');
        expect((await renderDoc(tagged)).content).toContain('data-pagefind-filter="tag:astro"');

        const untagged = await writePost('untagged.md', ['---', 'title: T', '---', 'b'].join('\n'));
        expect((await renderDoc(untagged)).content).not.toContain('data-pagefind-filter');
    });

    it('escapes frontmatter so a crafted title cannot break out of the markup', async () => {
        const file = await writePost(
            'xss.md',
            ['---', "title: 'Evil \" <script>'", '---', 'body'].join('\n')
        );
        const doc = await renderDoc(file);
        expect(doc.content).not.toContain('<script>');
        expect(doc.content).toContain('&lt;script&gt;');
    });

    it('renders the markdown body to HTML with slugged headings', async () => {
        const file = await writePost(
            'body.md',
            ['---', 'title: Body', '---', '## A Heading', '', 'Some **bold** text.'].join('\n')
        );
        const doc = await renderDoc(file);
        expect(doc.content).toContain('<h2 id="a-heading">A Heading</h2>');
        expect(doc.content).toContain('<strong>bold</strong>');
    });

    it('includes a description paragraph only when one is present', async () => {
        const described = await writePost(
            'described.md',
            ['---', 'title: D', 'description: A summary', '---', 'body'].join('\n')
        );
        expect((await renderDoc(described)).content).toContain('<p>A summary</p>');

        const plain = await writePost('plain.md', ['---', 'title: P', '---', 'body'].join('\n'));
        expect((await renderDoc(plain)).content).toContain('data-pagefind-meta="description:"');
    });

    it('computes a reading time from the body', async () => {
        const file = await writePost(
            'reading.md',
            ['---', 'title: R', '---', 'word '.repeat(500)].join('\n')
        );
        const doc = await renderDoc(file);
        expect(doc.content).toMatch(/data-pagefind-meta="readingTime:\d+ min read"/);
    });
});

describe('buildSearchIndex', () => {
    it('indexes the blog content and writes a pagefind bundle', async () => {
        const out = path.join(tmp, 'pagefind-out');
        const { count, outputDir } = await buildSearchIndex(out);

        expect(outputDir).toBe(out);
        expect(count).toBeGreaterThan(0);
        const written = await fs.readdir(out);
        expect(written).toContain('pagefind.js');
    }, 60_000);
});

describe('build-search-index CLI', () => {
    it('reports the indexed post count when run as a script', async () => {
        const script = fileURLToPath(new URL('../build-search-index.mjs', import.meta.url));
        const { stdout } = await execFileAsync(process.execPath, [script]);
        expect(stdout).toMatch(/Indexed \d+ posts -> public\/pagefind/);
    }, 60_000);
});
