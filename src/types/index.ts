export interface PostFrontmatter {
    title: string;
    description: string;
    pubDatetime: string;
    tags: string[];
    draft?: boolean;
    heroImage?: string;
    heroImageAlt?: string;
}

export interface Post {
    slug: string;
    frontmatter: PostFrontmatter;
    content: string;
    readingTime: string;
}

export interface SearchHeading {
    text: string;
    slug: string;
}

export interface SearchMatchGroup {
    heading: SearchHeading | null;
    snippets: string[];
}

export interface SearchResult {
    slug: string;
    title: string;
    date: string;
    readingTime: string;
    tags: string[];
    matches: SearchMatchGroup[];
}

export interface MonthGroup {
    month: string;
    monthNumber: number;
    posts: Post[];
}

export interface YearGroup {
    year: number;
    months: MonthGroup[];
}
