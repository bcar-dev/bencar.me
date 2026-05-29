import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { cache } from 'react';
import type { Post, PostFrontmatter, PostHeading, MonthGroup, YearGroup } from '@/types';
import GithubSlugger from 'github-slugger';
import { remark } from 'remark';
import { visit } from 'unist-util-visit';
import type { Heading, Text } from 'mdast';
import { formatDate } from '@/lib/utils';

const CONTENT_DIR = path.join(process.cwd(), 'src/content/blog');

/**
 * Recursively find all .md files in a directory.
 */
function getMdFiles(dir: string): string[] {
    if (!fs.existsSync(dir)) return [];

    const files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...getMdFiles(fullPath));
        } else if (entry.name.endsWith('.md')) {
            files.push(fullPath);
        }
    }

    return files;
}

/**
 * Extract h2 and h3 headings from markdown content with stable slugs and offsets.
 */
export function extractHeadings(content: string): PostHeading[] {
    if (!content) return [];

    const headings: PostHeading[] = [];
    const slugger = new GithubSlugger();
    const ast = remark().parse(content);

    visit(ast, 'heading', (node: Heading) => {
        if (node.depth !== 2 && node.depth !== 3) return;

        let text = '';
        visit(node, 'text', (textNode: Text) => {
            text += textNode.value;
        });
        visit(node, 'inlineCode', (codeNode: { value: string }) => {
            text += codeNode.value;
        });

        text = text.trim();
        headings.push({
            text,
            slug: slugger.slug(text),
            index: node.position?.start.offset ?? 0,
            level: node.depth as 2 | 3,
        });
    });

    return headings;
}

/**
 * Parse a markdown file into a Post with tags normalised and headings precomputed.
 */
function parsePost(filePath: string): Post {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    const rawFrontmatter = data as Partial<PostFrontmatter>;
    const frontmatter: PostFrontmatter = {
        title: rawFrontmatter.title ?? '',
        description: rawFrontmatter.description ?? '',
        pubDatetime: rawFrontmatter.pubDatetime ?? '',
        tags: rawFrontmatter.tags ?? [],
        draft: rawFrontmatter.draft,
        heroImage: rawFrontmatter.heroImage,
        heroImageAlt: rawFrontmatter.heroImageAlt,
    };

    return {
        slug: path.basename(filePath, '.md'),
        frontmatter,
        content,
        readingTime: readingTime(content).text,
        headings: extractHeadings(content),
        formattedDate: frontmatter.pubDatetime ? formatDate(frontmatter.pubDatetime) : '',
    };
}

/**
 * Get all published posts, sorted by date (newest first).
 */
export const getAllPosts = cache((): Post[] => {
    const files = getMdFiles(CONTENT_DIR);

    return files
        .map(parsePost)
        .filter((post) => !post.frontmatter.draft)
        .sort(
            (a, b) =>
                new Date(b.frontmatter.pubDatetime).getTime() -
                new Date(a.frontmatter.pubDatetime).getTime()
        );
});

/**
 * Get a single post by its slug.
 */
export function getPostBySlug(slug: string): Post | undefined {
    return getAllPosts().find((post) => post.slug === slug);
}

/**
 * Get a post along with its previous and next neighbours (newer/older).
 */
export function getPostWithNeighbors(slug: string): {
    post: Post | undefined;
    prev: Post | null;
    next: Post | null;
} {
    const posts = getAllPosts();
    const index = posts.findIndex((p) => p.slug === slug);
    if (index === -1) {
        return { post: undefined, prev: null, next: null };
    }
    return {
        post: posts[index],
        prev: index < posts.length - 1 ? posts[index + 1] : null,
        next: index > 0 ? posts[index - 1] : null,
    };
}

/**
 * Get all unique tags across published posts.
 */
export function getAllTags(): string[] {
    const tags = new Set<string>();
    for (const post of getAllPosts()) {
        for (const tag of post.frontmatter.tags) {
            tags.add(tag);
        }
    }
    return Array.from(tags).sort();
}

/**
 * Get all published posts grouped by year and month, both sorted descending.
 */
export function getPostsGroupedByDate(): YearGroup[] {
    const grouped = new Map<number, Map<number, MonthGroup>>();

    for (const post of getAllPosts()) {
        const date = new Date(post.frontmatter.pubDatetime);
        const year = date.getFullYear();
        const monthNumber = date.getMonth();

        let yearMap = grouped.get(year);
        if (!yearMap) {
            yearMap = new Map();
            grouped.set(year, yearMap);
        }

        let monthGroup = yearMap.get(monthNumber);
        if (!monthGroup) {
            monthGroup = {
                month: date.toLocaleDateString('en-US', { month: 'long' }),
                monthNumber,
                posts: [],
            };
            yearMap.set(monthNumber, monthGroup);
        }

        monthGroup.posts.push(post);
    }

    return Array.from(grouped.keys())
        .sort((a, b) => b - a)
        .map((year) => ({
            year,
            months: Array.from(grouped.get(year)!.values()).sort(
                (a, b) => b.monthNumber - a.monthNumber
            ),
        }));
}
