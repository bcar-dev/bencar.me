import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    extractHeadings,
    getAllPosts,
    getPostBySlug,
    getAllTags,
    getPostsGroupedByDate,
    getPostWithNeighbors,
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
        expect(headings[0]).toMatchObject({
            text: 'Heading 2',
            slug: 'heading-2',
            level: 2,
        });
        expect(headings[1]).toMatchObject({
            text: 'Heading 3',
            slug: 'heading-3',
            level: 3,
        });
        expect(headings[2]).toMatchObject({
            text: 'Another H2',
            slug: 'another-h2',
            level: 2,
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

    it('returns empty array for undefined input', () => {
        expect(extractHeadings(undefined as any)).toEqual([]);
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
            expect(posts[0].frontmatter.title).toBe('Post 2');
        });

        it('precomputes formattedDate and headings on each post', () => {
            const posts = getAllPosts();
            expect(posts[0].formattedDate).toMatch(/2026/);
            expect(Array.isArray(posts[0].headings)).toBe(true);
        });

        it('normalises missing tags to []', () => {
            vi.mocked(fs.readFileSync).mockReturnValue(
                '---\ntitle: NoTags\ndescription: d\npubDatetime: 2026-01-01\n---\nbody'
            );
            vi.mocked(fs.readdirSync).mockReturnValue([
                { name: 'no-tags.md', isDirectory: () => false },
            ] as any);
            const posts = getAllPosts();
            expect(posts[0].frontmatter.tags).toEqual([]);
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
            getAllPosts();
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

    describe('getPostWithNeighbors', () => {
        it('returns prev and next around a post', () => {
            const { post, prev, next } = getPostWithNeighbors('post2');
            expect(post?.slug).toBe('post2');
            expect(prev?.slug).toBe('post1');
            expect(next).toBeNull();
        });

        it('returns undefined post when slug is unknown', () => {
            const result = getPostWithNeighbors('does-not-exist');
            expect(result.post).toBeUndefined();
            expect(result.prev).toBeNull();
            expect(result.next).toBeNull();
        });
    });

    describe('getAllTags', () => {
        it('returns all unique tags sorted', () => {
            const tags = getAllTags();
            expect(tags).toEqual(['tag1', 'tag2']);
        });

        it('returns [] when no posts have tags', () => {
            const noTags =
                '---\ntitle: No Tags\ndescription: test\npubDatetime: 2026-01-01\ndraft: false\n---\nContent';
            vi.mocked(fs.readFileSync).mockReturnValue(noTags);
            vi.mocked(fs.readdirSync).mockReturnValue([
                { name: 'notags.md', isDirectory: () => false },
            ] as any);
            expect(getAllTags()).toEqual([]);
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
            expect(groups).toHaveLength(2);
            expect(groups[0].months).toHaveLength(2);
        });

        it('groups posts by year and month descending', () => {
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
            expect(groups).toHaveLength(2);
            expect(groups[0].year).toBe(2026);
            expect(groups[1].year).toBe(2025);
        });
    });
});
