export interface PostFrontmatter {
    title: string;
    description: string;
    pubDatetime: string;
    tags: string[];
    draft?: boolean;
    heroImage?: string;
    heroImageAlt?: string;
}

export interface PostHeading {
    text: string;
    slug: string;
    index: number;
    level: 2 | 3;
}

export interface Post {
    slug: string;
    frontmatter: PostFrontmatter;
    content: string;
    readingTime: string;
    headings: PostHeading[];
    formattedDate: string;
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

/** A cover image already optimized by `getImage`, ready for a plain <img> in an island. */
export interface OptimizedImage {
    src: string;
    srcset: string;
    width: number;
    height: number;
}

/** One post in the landing page slider. */
export interface FeaturedSlide {
    slug: string;
    title: string;
    description: string;
    pubDatetime: string;
    readingTime: string;
    image?: OptimizedImage;
}
