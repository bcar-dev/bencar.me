import type { MonthGroup, Post, PostFrontmatter, YearGroup } from '@/types';

type PostOverrides = Partial<Omit<Post, 'frontmatter'>> & {
    slug: string;
    frontmatter?: Partial<PostFrontmatter>;
};

/**
 * Build a `Post` fixture. Pass only the fields a test actually asserts on;
 * everything else gets a stable, obviously-fake default.
 */
export function makePost({ frontmatter, ...overrides }: PostOverrides): Post {
    return {
        content: '',
        readingTime: '1 min read',
        headings: [],
        formattedDate: 'Jan 1, 2026',
        ...overrides,
        frontmatter: {
            title: `Post ${overrides.slug}`,
            description: `Description for ${overrides.slug}`,
            pubDatetime: '2026-01-01',
            tags: [],
            ...frontmatter,
        },
    };
}

/** Build a single-month `YearGroup` fixture from a list of posts. */
export function makeYearGroup(
    year: number,
    month: string,
    posts: Post[],
    monthNumber = 1
): YearGroup {
    const months: MonthGroup[] = [{ month, monthNumber, posts }];
    return { year, months };
}
