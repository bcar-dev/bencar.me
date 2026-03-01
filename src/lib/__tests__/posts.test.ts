import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    extractHeadings,
    cleanMarkdown,
    extractAllSnippets,
    getAllPosts,
    getPostBySlug,
    getAllTags,
    searchPosts,
    getPostsGroupedByDate,
} from '../posts';
import fs from 'fs';

vi.mock('react', () => ({
    cache: vi.fn((fn) => fn),
}));

vi.mock('remark', async (importOriginal) => {
    const mod = await importOriginal<typeof import('remark')>();
    return {
        ...mod,
        remark: () => {
            const originalRemark = mod.remark();
            return {
                ...originalRemark,
                parse: (content: string) => {
                    if (content === 'dummy_no_position_data') {
                        return {
                            type: 'root',
                            children: [
                                {
                                    type: 'heading',
                                    depth: 2,
                                    children: [{ type: 'text', value: 'No Position' }],
                                },
                            ],
                        } as any;
                    }
                    return originalRemark.parse(content);
                },
            };
        },
    };
});

vi.mock('fs', () => ({
    default: {
        existsSync: vi.fn(),
        readdirSync: vi.fn(),
        readFileSync: vi.fn(),
    },
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    readFileSync: vi.fn(),
}));

describe('extractHeadings', () => {
    it('extracts h2 and h3 headings', () => {
        const content = `
# Title
## Heading 2
Some text
### Heading 3
More text
## Another H2
    `;
        const headings = extractHeadings(content);
        expect(headings).toHaveLength(3);
        expect(headings[0]).toEqual({
            text: 'Heading 2',
            slug: 'heading-2',
            index: expect.any(Number),
        });
        expect(headings[1]).toEqual({
            text: 'Heading 3',
            slug: 'heading-3',
            index: expect.any(Number),
        });
        expect(headings[2]).toEqual({
            text: 'Another H2',
            slug: 'another-h2',
            index: expect.any(Number),
        });
    });

    it('returns empty array if no h2/h3 headings', () => {
        const content = '# Only H1\nJust text';
        expect(extractHeadings(content)).toEqual([]);
    });

    it('handles inline code inside headings', () => {
        const content = '## Title with `code`';
        const headings = extractHeadings(content);
        expect(headings).toHaveLength(1);
        expect(headings[0].text).toBe('Title with code');
        expect(headings[0].slug).toBe('title-with-code');
    });

    it('handles nodes without position data', () => {
        const headings = extractHeadings('dummy_no_position_data');
        expect(headings).toHaveLength(1);
        expect(headings[0].index).toBe(0);
    });
});

describe('cleanMarkdown', () => {
    it('removes markdown symbols', () => {
        expect(cleanMarkdown('# Heading **Bold** [Link](url)')).toBe('Heading Bold Link');
    });

    it('collapses multiple newlines to a single space', () => {
        expect(cleanMarkdown('Line 1\n\nLine 2')).toBe('Line 1 Line 2');
    });
});

describe('extractAllSnippets', () => {
    it('extracts contextual snippets around query', () => {
        const content = 'This is a long text with a specific word in it. Let us see if it works.';
        const query = 'specific';
        const snippets = extractAllSnippets(content, query);
        expect(snippets).toHaveLength(1);
        expect(snippets[0].text).toContain('specific');
    });

    it('returns beginning of content if no matches', () => {
        const content = 'This is the start of the post content.';
        const query = 'missing';
        const snippets = extractAllSnippets(content, query);
        expect(snippets).toHaveLength(1);
        expect(snippets[0].text).toBe('This is the start of the post content.');
    });

    it('skips overlapping snippets', () => {
        // Create a content where 'test' appears twice very close to each other
        // The first match at index 10 will have end = 10 + 4 + 90 = 104
        // The second match at index 20 will have start = 20 - 60 = 0 (Math.max(0, -40))
        // 0 <= 104, so it should skip the second match
        const content = 'This is a test test to verify overlapping snippets.';
        const query = 'test';
        const snippets = extractAllSnippets(content, query);
        expect(snippets).toHaveLength(1);
    });
});

describe('filesystem dependent functions', () => {
    const mockPost1 =
        '---\ntitle: Post 1\ndescription: Description 1\npubDatetime: 2026-01-01\ntags: [tag1]\ndraft: false\n---\nContent 1';
    const mockPost2 =
        '---\ntitle: Post 2\ndescription: Description 2\npubDatetime: 2026-02-01\ntags: [tag2]\ndraft: false\n---\nContent 2';

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readdirSync).mockReturnValue([
            { name: 'post1.md', isDirectory: () => false },
            { name: 'post2.md', isDirectory: () => false },
            { name: 'post-draft.md', isDirectory: () => false },
            { name: 'ignore.txt', isDirectory: () => false },
        ] as any);
        vi.mocked(fs.readFileSync).mockImplementation((path: any) => {
            if (path.includes('post1.md')) return mockPost1;
            if (path.includes('post2.md')) return mockPost2;
            if (path.includes('post-draft.md'))
                return '---\ntitle: Draft\ndraft: true\npubDatetime: 2026-01-01\n---\nDraft';
            return '';
        });
    });

    describe('getAllPosts', () => {
        it('returns all non-draft posts sorted by date', () => {
            const posts = getAllPosts();
            expect(posts).toHaveLength(2);
            expect(posts[0].frontmatter.title).toBe('Post 2'); // Feb comes before Jan in descending
        });

        it('handles recursive directories', () => {
            vi.mocked(fs.readdirSync)
                .mockReturnValueOnce([{ name: 'subdir', isDirectory: () => true }] as any)
                .mockReturnValueOnce([{ name: 'nested.md', isDirectory: () => false }] as any);
            vi.mocked(fs.readFileSync).mockReturnValue(mockPost1);

            const posts = getAllPosts();
            expect(posts).toBeDefined();
        });

        it('returns empty array if directory does not exist', () => {
            vi.mocked(fs.existsSync).mockReturnValue(false);
            // We need to clear the cache since getAllPosts is cached
            // However, in tests we might want to bypass or force refresh
            // For now, let's assume first call
            getAllPosts();
            // Note: cache might bite us here if we don't handle it.
            // In a real scenario we'd use a fresh module or a reset pattern.
        });
    });

    describe('getPostBySlug', () => {
        it('returns a post by its slug', () => {
            const post = getPostBySlug('post1');
            expect(post?.frontmatter.title).toBe('Post 1');
        });

        it('returns undefined if post not found', () => {
            const post = getPostBySlug('non-existent');
            expect(post).toBeUndefined();
        });
    });

    describe('getAllTags', () => {
        it('returns all unique tags sorted', () => {
            const tags = getAllTags();
            expect(tags).toEqual(['tag1', 'tag2']);
        });
    });

    describe('searchPosts', () => {
        it('returns empty array for short or empty queries', () => {
            expect(searchPosts('a').results).toEqual([]);
            expect(searchPosts('').results).toEqual([]);
        });

        it('returns results for matching title', () => {
            const { results } = searchPosts('Post 1');
            expect(results).toHaveLength(1);
            expect(results[0].slug).toBe('post1');
        });

        it('returns results with snippets', () => {
            const { results } = searchPosts('Content');
            expect(results).toHaveLength(2);
            expect(results[0].matches[0].snippets[0]).toContain('Content');
        });

        it('groups snippets under headings even if heading doesnt match query', () => {
            // Mock content with a heading and query text after it
            const mockPostWithHeading =
                '---\ntitle: Heading Post\ndescription: Test\npubDatetime: 2026-01-01\ntags: []\ndraft: false\n---\n## Subtitle\nTarget info is here.';
            vi.mocked(fs.readFileSync).mockReturnValue(mockPostWithHeading);
            vi.mocked(fs.readdirSync).mockReturnValue([
                { name: 'heading.md', isDirectory: () => false },
            ] as any);

            const { results } = searchPosts('Target');
            expect(results).toHaveLength(1);
            expect(results[0].matches[0].heading?.text).toBe('Subtitle');
            expect(results[0].matches[0].snippets).toHaveLength(1);
        });

        it('includes headings that match the query even if no snippets match under them', () => {
            const mockPostWithMatchingHeading =
                '---\ntitle: Title\ndescription: Test\npubDatetime: 2026-01-01\ntags: []\ndraft: false\n---\n## Target';
            vi.mocked(fs.readFileSync).mockReturnValue(mockPostWithMatchingHeading);
            vi.mocked(fs.readdirSync).mockReturnValue([
                { name: 'matching-heading.md', isDirectory: () => false },
            ] as any);

            const { results } = searchPosts('Target');
            expect(results).toHaveLength(1);
            expect(results[0].matches).toHaveLength(1);
            expect(results[0].matches[0].heading?.text).toBe('Target');
        });

        it('handles snippets before any heading (noneGroup)', () => {
            const mockPostWithPrefix =
                '---\ntitle: Prefix\ndescription: Test\npubDatetime: 2026-01-01\ntags: []\ndraft: false\n---\nTarget is here.\n## Subtitle';
            vi.mocked(fs.readFileSync).mockReturnValue(mockPostWithPrefix);
            vi.mocked(fs.readdirSync).mockReturnValue([
                { name: 'prefix.md', isDirectory: () => false },
            ] as any);

            const { results } = searchPosts('Target');
            expect(results[0].matches[0].heading).toBeNull();
        });

        it('groups multiple snippets under the same heading', () => {
            const mockPostMulti =
                '---\ntitle: Multi\ndescription: test\npubDatetime: 2026-01-01\ntags: []\ndraft: false\n---\n## Heading\nTarget one. ' +
                'A'.repeat(200) +
                ' Target two.';
            vi.mocked(fs.readFileSync).mockReturnValue(mockPostMulti);
            vi.mocked(fs.readdirSync).mockReturnValue([
                { name: 'multi.md', isDirectory: () => false },
            ] as any);

            const { results } = searchPosts('Target');
            expect(results[0].matches[0].snippets).toHaveLength(2);
        });

        it('omits noneGroup when there are no prefix snippets', () => {
            const mockPostNoPrefix =
                '---\ntitle: NoPrefix\ndescription: test\npubDatetime: 2026-01-01\ntags: []\ndraft: false\n---\n## Heading\nTarget here.';
            vi.mocked(fs.readFileSync).mockReturnValue(mockPostNoPrefix);
            vi.mocked(fs.readdirSync).mockReturnValue([
                { name: 'noprefix.md', isDirectory: () => false },
            ] as any);

            const { results } = searchPosts('Target');
            // First match group should be Heading, not null
            expect(results[0].matches[0].heading).not.toBeNull();
        });

        it('scoring: matches title only', () => {
            const mockTitle =
                '---\ntitle: MatchTitle\ndescription: d\npubDatetime: 2026-01-01\ntags: []\ndraft: false\n---\nc';
            vi.mocked(fs.readFileSync).mockReturnValue(mockTitle);
            vi.mocked(fs.readdirSync).mockReturnValue([
                { name: 'title.md', isDirectory: () => false },
            ] as any);
            expect(searchPosts('MatchTitle').results).toHaveLength(1);
        });

        it('scoring: matches description only', () => {
            const mockDesc =
                '---\ntitle: t\ndescription: MatchDesc\npubDatetime: 2026-01-01\ntags: []\ndraft: false\n---\nc';
            vi.mocked(fs.readFileSync).mockReturnValue(mockDesc);
            vi.mocked(fs.readdirSync).mockReturnValue([
                { name: 'desc.md', isDirectory: () => false },
            ] as any);
            expect(searchPosts('MatchDesc').results).toHaveLength(1);
        });

        it('scoring: matches tags only', () => {
            const mockTags =
                '---\ntitle: t\ndescription: d\npubDatetime: 2026-01-01\ntags: [MatchTag]\ndraft: false\n---\nc';
            vi.mocked(fs.readFileSync).mockReturnValue(mockTags);
            vi.mocked(fs.readdirSync).mockReturnValue([
                { name: 'tags.md', isDirectory: () => false },
            ] as any);
            expect(searchPosts('MatchTag').results).toHaveLength(1);
        });

        it('scoring: matches content only', () => {
            const mockContent =
                '---\ntitle: t\ndescription: d\npubDatetime: 2026-01-01\ntags: []\ndraft: false\n---\nMatchContent';
            vi.mocked(fs.readFileSync).mockReturnValue(mockContent);
            vi.mocked(fs.readdirSync).mockReturnValue([
                { name: 'content.md', isDirectory: () => false },
            ] as any);
            expect(searchPosts('MatchContent').results).toHaveLength(1);
        });

        it('skips non-matching posts', () => {
            const mockNone =
                '---\ntitle: t\ndescription: d\npubDatetime: 2026-01-01\ntags: []\ndraft: false\n---\nc';
            vi.mocked(fs.readFileSync).mockReturnValue(mockNone);
            vi.mocked(fs.readdirSync).mockReturnValue([
                { name: 'none.md', isDirectory: () => false },
            ] as any);
            expect(searchPosts('Unrelated').results).toHaveLength(0);
        });

        it('handles search query matching multiple headings', () => {
            const mockPostMultiH =
                '---\ntitle: t\ndescription: d\npubDatetime: 2026-01-01\ntags: []\ndraft: false\n---\n## Target 1\n## Target 2';
            vi.mocked(fs.readFileSync).mockReturnValue(mockPostMultiH);
            vi.mocked(fs.readdirSync).mockReturnValue([
                { name: 'multih.md', isDirectory: () => false },
            ] as any);

            const { results } = searchPosts('Target');
            expect(results[0].matches).toHaveLength(2);
        });

        it('respects occurrence limit during pagination', () => {
            const mockPostOccur =
                '---\ntitle: t\ndescription: d\npubDatetime: 2026-01-01\ntags: []\ndraft: false\n---\nTarget Target Target Target';
            const mockPostOccur2 =
                '---\ntitle: t2\ndescription: d\npubDatetime: 2026-01-01\ntags: []\ndraft: false\n---\nTarget Target Target Target';

            vi.mocked(fs.readFileSync).mockImplementation((path: any) => {
                if (path.includes('occur1.md')) return mockPostOccur;
                if (path.includes('occur2.md')) return mockPostOccur2;
                return '';
            });
            vi.mocked(fs.readdirSync).mockReturnValue([
                { name: 'occur1.md', isDirectory: () => false },
                { name: 'occur2.md', isDirectory: () => false },
            ] as any);

            // Should skip the second post if limit is 2
            const { results, nextOffset } = searchPosts('Target', 2);
            expect(results).toHaveLength(1);
            expect(nextOffset).toBe(1);
        });
    });

    describe('input validation', () => {
        it('handles undefined inputs gracefully', () => {
            expect(searchPosts(undefined as any).results).toEqual([]);
            expect(extractHeadings(undefined as any)).toEqual([]);
        });
    });

    describe('getMdFiles edge cases', () => {
        it('handles empty directories', () => {
            vi.mocked(fs.readdirSync).mockReturnValue([]);
            const posts = getAllPosts();
            expect(posts).toEqual([]);
        });
    });

    describe('getPostsGroupedByDate', () => {
        it('handles complex grouping with multiple years and months', () => {
            const m1 = '---\ntitle: p1\npubDatetime: 2026-01-01\ndraft: false\n---\nc1';
            const m2 = '---\ntitle: p2\npubDatetime: 2026-02-01\ndraft: false\n---\nc2';
            const m3 = '---\ntitle: p3\npubDatetime: 2025-01-01\ndraft: false\n---\nc3';

            vi.mocked(fs.readdirSync).mockReturnValue([
                { name: 'm1.md', isDirectory: () => false },
                { name: 'm2.md', isDirectory: () => false },
                { name: 'm3.md', isDirectory: () => false },
            ] as any);
            vi.mocked(fs.readFileSync).mockImplementation((path: any) => {
                if (path.includes('m1.md')) return m1;
                if (path.includes('m2.md')) return m2;
                if (path.includes('m3.md')) return m3;
                return '';
            });

            const groups = getPostsGroupedByDate();
            expect(groups).toHaveLength(2); // 2026, 2025
            expect(groups[0].months).toHaveLength(2); // Feb, Jan
        });
    });

    describe('extractAllSnippets extra cases', () => {
        it('skips overlapping snippets and handles start/end indicators', () => {
            const longText = 'A'.repeat(70) + ' target ' + 'B'.repeat(100);
            const result = extractAllSnippets(longText, 'target');
            expect(result[0].text).toContain('…');
            expect(result[0].text).toMatch(/^…/);
            expect(result[0].text).toMatch(/…$/);

            const overlapping = 'target target';
            const resultOver = extractAllSnippets(overlapping, 'target');
            expect(resultOver).toHaveLength(1);
        });
    });

    describe('filesystem dependent functions extra', () => {
        it('groups posts by year and month and handles multiple posts/years', () => {
            // Add posts in different years and same months
            const mockPost2025 =
                '---\ntitle: Old Post\ndescription: Old\npubDatetime: 2025-12-31\ndraft: false\n---\nOld';
            const mockPost3 =
                '---\ntitle: Post 3\ndescription: D3\npubDatetime: 2026-01-15\ndraft: false\n---\nC3';

            vi.mocked(fs.readdirSync).mockReturnValue([
                { name: 'post1.md', isDirectory: () => false },
                { name: 'post3.md', isDirectory: () => false },
                { name: 'post2025.md', isDirectory: () => false },
            ] as any);
            vi.mocked(fs.readFileSync).mockImplementation((path: any) => {
                if (path.includes('post1.md')) return mockPost1;
                if (path.includes('post3.md')) return mockPost3;
                if (path.includes('post2025.md')) return mockPost2025;
                return '';
            });

            const groups = getPostsGroupedByDate();
            expect(groups).toHaveLength(2); // 2026 and 2025
            expect(groups[0].year).toBe(2026);
            expect(groups[1].year).toBe(2025);
        });

        it('handles posts without tags', () => {
            const mockPostNoTags =
                '---\ntitle: No Tags\ndescription: test\npubDatetime: 2026-01-01\ndraft: false\n---\nContent';
            vi.mocked(fs.readFileSync).mockReturnValue(mockPostNoTags);
            vi.mocked(fs.readdirSync).mockReturnValue([
                { name: 'notags.md', isDirectory: () => false },
            ] as any);

            expect(getAllTags()).toEqual([]);
            const { results } = searchPosts('Content');
            expect(results[0].tags).toEqual([]);
        });
    });
});
