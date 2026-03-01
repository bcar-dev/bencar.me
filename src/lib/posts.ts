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
import removeMd from 'remove-markdown';
import GithubSlugger from 'github-slugger';
import { remark } from 'remark';
import { visit } from 'unist-util-visit';
import type { Heading, Text } from 'mdast';

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
    const slugger = new GithubSlugger();
    const ast = remark().parse(content);

    visit(ast, 'heading', (node: Heading) => {
        if (node.depth === 2 || node.depth === 3) {
            let text = '';
            visit(node, 'text', (textNode: Text) => {
                text += textNode.value;
            });
            visit(node, 'inlineCode', (codeNode: { value: string }) => {
                text += codeNode.value;
            });

            text = text.trim();
            const index = node.position?.start.offset ?? 0;

            headings.push({ text, slug: slugger.slug(text), index });
        }
    });

    return headings;
}

/**
 * Clean markdown syntax from a text snippet for display.
 */
export function cleanMarkdown(text: string): string {
    return removeMd(text).replace(/\n+/g, ' ').trim();
}

/**
 * Extract contextual snippets around ALL occurrences of a query in content.
 */
export function extractAllSnippets(
    content: string,
    query: string
): { text: string; idx: number }[] {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedQuery}`, 'gi');
    const snippets: { text: string; idx: number }[] = [];
    let lastEnd = -1;

    let match;
    while ((match = regex.exec(content)) !== null) {
        const idx = match.index;
        const start = Math.max(0, idx - 60);
        const end = Math.min(content.length, idx + query.length + 90);

        // Skip if this snippet overlaps with the previous one
        if (start <= lastEnd) {
            continue;
        }

        let snippet =
            (start > 0 ? '…' : '') + content.slice(start, end) + (end < content.length ? '…' : '');
        snippet = cleanMarkdown(snippet);
        snippets.push({ text: snippet, idx });

        lastEnd = end;
    }

    // If no content matches, show beginning of content
    if (snippets.length === 0) {
        snippets.push({ text: cleanMarkdown(content.slice(0, 150)), idx: 0 });
    }

    return snippets;
}

/**
 * Search posts by query across title, description, tags, and content.
 * Returns results sorted by relevance, with occurrence-based pagination support.
 */
export function searchPosts(
    query: string,
    occurrenceLimit: number = 100,
    articleOffset: number = 0
): {
    results: SearchResult[];
    totalOccurrences: number;
    totalArticles: number;
    nextOffset: number;
} {
    if (!query || query.length < 2) {
        return { results: [], totalOccurrences: 0, totalArticles: 0, nextOffset: 0 };
    }

    const posts = getAllPosts();
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexGi = new RegExp(`\\b${escapedQuery}`, 'gi');

    const scored: { post: Post; score: number; occurrences: number }[] = [];
    let globalTotalOccurrences = 0;

    for (const post of posts) {
        const { title, description, tags } = post.frontmatter;

        // Calculate occurrences for the global count and per-post count
        const titleOccurrences = (title.match(regexGi) || []).length;
        const descOccurrences = (description.match(regexGi) || []).length;
        const tagOccurrences =
            tags?.reduce((acc, t) => acc + (t.match(regexGi) || []).length, 0) ?? 0;
        const contentOccurrences = (post.content.match(regexGi) || []).length;

        const postOccurrences =
            titleOccurrences + descOccurrences + tagOccurrences + contentOccurrences;
        globalTotalOccurrences += postOccurrences;

        if (postOccurrences > 0) {
            // Calculate relevance score
            let score = 0;
            if (titleOccurrences > 0) score += 4;
            if (descOccurrences > 0) score += 3;
            if (tagOccurrences > 0) score += 2;
            if (contentOccurrences > 0) score += 1;

            scored.push({ post, score, occurrences: postOccurrences });
        }
    }

    const sortedScored = scored.sort((a, b) => b.score - a.score);
    const totalArticles = sortedScored.length;

    // Apply occurrence-based pagination
    const paginatedScored: { post: Post; score: number; occurrences: number }[] = [];
    let currentBatchOccurrences = 0;
    let nextOffset = articleOffset;

    for (let i = articleOffset; i < sortedScored.length; i++) {
        const item = sortedScored[i];
        paginatedScored.push(item);
        currentBatchOccurrences += item.occurrences;
        nextOffset = i + 1;

        if (currentBatchOccurrences >= occurrenceLimit) {
            break;
        }
    }

    // If we've reached the end of all articles, set nextOffset to -1 or similar (or just check against totalArticles)
    if (nextOffset >= sortedScored.length) {
        nextOffset = -1; // Indicates no more results
    }

    const results = paginatedScored.map(({ post }) => {
        const allHeadings = extractHeadings(post.content);
        const snippetsWithIdx = extractAllSnippets(post.content, query);

        const matchGroups: SearchMatchGroup[] = [];
        const noneGroup: SearchMatchGroup = { heading: null, snippets: [] };
        const headingGroups = new Map<string, SearchMatchGroup>();

        for (const h of allHeadings) {
            regexGi.lastIndex = 0;
            if (regexGi.test(h.text)) {
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

    return {
        results,
        totalOccurrences: globalTotalOccurrences,
        totalArticles,
        nextOffset,
    };
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
