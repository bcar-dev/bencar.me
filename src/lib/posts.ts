import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { cache } from 'react';
import type {
    Post,
    PostFrontmatter,
    SearchMatchGroup,
    SearchResult,
    MonthGroup,
    YearGroup,
} from '@/types';
import { slugify } from '@/lib/slugify';

const CONTENT_DIR = path.join(process.cwd(), 'src/content/blog');

/**
 * Recursively find all .md files in a directory
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
 * Parse a markdown file into a Post object
 */
function parsePost(filePath: string): Post {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    const frontmatter = data as PostFrontmatter;

    // Derive slug from filename (without .md extension)
    const slug = path.basename(filePath, '.md');

    return {
        slug,
        frontmatter,
        content,
        readingTime: readingTime(content).text,
    };
}

/**
 * Get all published posts, sorted by date (newest first)
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
 * Get a single post by its slug
 */
export function getPostBySlug(slug: string): Post | undefined {
    return getAllPosts().find((post) => post.slug === slug);
}

/**
 * Get all unique tags across published posts
 */
export function getAllTags(): string[] {
    const posts = getAllPosts();
    const tags = new Set<string>();
    for (const post of posts) {
        for (const tag of post.frontmatter.tags ?? []) {
            tags.add(tag);
        }
    }
    return Array.from(tags).sort();
}

/**
 * Extract h2 and h3 headings from markdown content.
 */
export function extractHeadings(content: string): { text: string; slug: string; index: number }[] {
    const headings: { text: string; slug: string; index: number }[] = [];
    const regex = /^#{2,3}\s+(.+)$/gm;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const text = match[1].trim();
        headings.push({ text, slug: slugify(text), index: match.index });
    }
    return headings;
}

/**
 * Clean markdown syntax from a text snippet for display.
 */
export function cleanMarkdown(text: string): string {
    return text
        .replace(/[#*_`~>[\]()!]/g, '')
        .replace(/\n+/g, ' ')
        .trim();
}

/**
 * Extract contextual snippets around ALL occurrences of a query in content.
 */
export function extractAllSnippets(
    content: string,
    query: string
): { text: string; idx: number }[] {
    const lower = content.toLowerCase();
    const q = query.toLowerCase();
    const snippets: { text: string; idx: number }[] = [];
    let searchFrom = 0;
    let lastEnd = -1;

    while (searchFrom < lower.length) {
        const idx = lower.indexOf(q, searchFrom);
        if (idx === -1) break;

        const start = Math.max(0, idx - 60);
        const end = Math.min(content.length, idx + query.length + 90);

        // Skip if this snippet overlaps with the previous one
        if (start <= lastEnd) {
            searchFrom = idx + query.length;
            continue;
        }

        let snippet =
            (start > 0 ? '…' : '') + content.slice(start, end) + (end < content.length ? '…' : '');
        snippet = cleanMarkdown(snippet);
        snippets.push({ text: snippet, idx });

        lastEnd = end;
        searchFrom = idx + query.length;
    }

    // If no content matches, show beginning of content
    if (snippets.length === 0) {
        snippets.push({ text: cleanMarkdown(content.slice(0, 150)), idx: 0 });
    }

    return snippets;
}

/**
 * Search posts by query across title, description, tags, and content.
 * Returns results sorted by relevance.
 */
export function searchPosts(query: string): SearchResult[] {
    if (!query || query.length < 2) return [];

    const posts = getAllPosts();
    const q = query.toLowerCase();

    const scored: { post: Post; score: number }[] = [];

    for (const post of posts) {
        let score = 0;
        const { title, description, tags } = post.frontmatter;

        if (title.toLowerCase().includes(q)) score += 4;
        if (description.toLowerCase().includes(q)) score += 3;
        if (tags?.some((t) => t.toLowerCase().includes(q))) score += 2;
        if (post.content.toLowerCase().includes(q)) score += 1;

        if (score > 0) {
            scored.push({ post, score });
        }
    }

    return scored
        .sort((a, b) => b.score - a.score)
        .map(({ post }) => {
            const allHeadings = extractHeadings(post.content);
            const snippetsWithIdx = extractAllSnippets(post.content, query);

            const matchGroups: SearchMatchGroup[] = [];
            const noneGroup: SearchMatchGroup = { heading: null, snippets: [] };
            const headingGroups = new Map<string, SearchMatchGroup>();

            for (const h of allHeadings) {
                if (h.text.toLowerCase().includes(q)) {
                    headingGroups.set(h.slug, {
                        heading: { text: h.text, slug: h.slug },
                        snippets: [],
                    });
                }
            }

            for (const snip of snippetsWithIdx) {
                let currentHeading: { text: string; slug: string } | null = null;
                for (let i = allHeadings.length - 1; i >= 0; i--) {
                    if (snip.idx >= allHeadings[i].index) {
                        currentHeading = { text: allHeadings[i].text, slug: allHeadings[i].slug };
                        break;
                    }
                }

                if (currentHeading) {
                    if (!headingGroups.has(currentHeading.slug)) {
                        headingGroups.set(currentHeading.slug, {
                            heading: currentHeading,
                            snippets: [],
                        });
                    }
                    headingGroups.get(currentHeading.slug)!.snippets.push(snip.text);
                } else {
                    noneGroup.snippets.push(snip.text);
                }
            }

            if (noneGroup.snippets.length > 0) {
                matchGroups.push(noneGroup);
            }

            for (const h of allHeadings) {
                if (headingGroups.has(h.slug)) {
                    matchGroups.push(headingGroups.get(h.slug)!);
                }
            }

            return {
                slug: post.slug,
                title: post.frontmatter.title,
                date: post.frontmatter.pubDatetime,
                readingTime: post.readingTime,
                tags: post.frontmatter.tags ?? [],
                matches: matchGroups,
            };
        });
}

/**
 * Get all published posts, grouped by year and month.
 */
export function getPostsGroupedByDate(): YearGroup[] {
    const posts = getAllPosts();
    const grouped = new Map<number, Map<number, MonthGroup>>();

    for (const post of posts) {
        const date = new Date(post.frontmatter.pubDatetime);
        const year = date.getFullYear();
        const monthNumber = date.getMonth();
        const monthName = date.toLocaleDateString('en-US', { month: 'long' });

        if (!grouped.has(year)) {
            grouped.set(year, new Map());
        }

        const yearMap = grouped.get(year)!;
        if (!yearMap.has(monthNumber)) {
            yearMap.set(monthNumber, {
                month: monthName,
                monthNumber: monthNumber,
                posts: [],
            });
        }

        yearMap.get(monthNumber)!.posts.push(post);
    }

    const result: YearGroup[] = [];

    // Sort years descending
    const sortedYears = Array.from(grouped.keys()).sort((a, b) => b - a);

    for (const year of sortedYears) {
        const yearMap = grouped.get(year)!;
        // Sort months descending
        const sortedMonths = Array.from(yearMap.values()).sort(
            (a, b) => b.monthNumber - a.monthNumber
        );

        result.push({
            year,
            months: sortedMonths,
        });
    }

    return result;
}
