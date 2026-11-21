// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { getAllPosts } from '@/lib/posts';
import { getHeroImage } from '@/lib/heroImages';

// Checks the real articles, so a broken image reference fails the test suite
// instead of silently showing an empty cover or failing the deploy build.

const BLOG_DIR = path.resolve('src/content/blog');

function markdownFiles(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return markdownFiles(full);
        return entry.name.endsWith('.md') ? [full] : [];
    });
}

const posts = getAllPosts();
const files = markdownFiles(BLOG_DIR);

describe('blog content', () => {
    it('finds the articles', () => {
        expect(posts.length).toBeGreaterThan(0);
        expect(files.length).toBeGreaterThanOrEqual(posts.length);
    });

    it.each(posts.map((post) => [post.slug, post] as const))(
        '%s: its cover image exists and has alt text',
        (_, post) => {
            if (!post.frontmatter.heroImage) return;
            expect(getHeroImage(post.frontmatter.heroImage)).toBeDefined();
            expect(post.frontmatter.heroImageAlt?.trim()).toBeTruthy();
        }
    );

    it.each(files.map((file) => [path.relative(BLOG_DIR, file), file] as const))(
        '%s: every image in the text exists and has alt text',
        (_, file) => {
            const images = [
                ...fs.readFileSync(file, 'utf-8').matchAll(/!\[([^\]]*)\]\(([^)\s]+)\)/g),
            ];
            for (const [, alt, src] of images) {
                if (URL.canParse(src)) continue;
                const target = path.resolve(path.dirname(file), decodeURI(src));
                expect(fs.existsSync(target), `missing image: ${src}`).toBe(true);
                expect(alt.trim(), `image without alt text: ${src}`).toBeTruthy();
            }
        }
    );
});
