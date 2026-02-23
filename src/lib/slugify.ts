/**
 * Convert heading text to a URL-friendly slug.
 * Matches rehype-slug's algorithm for consistent IDs.
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}
