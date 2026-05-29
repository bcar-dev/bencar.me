/**
 * Format a date string into a human-readable format.
 * e.g. "2026-02-14" -> "Feb 14, 2026"
 */
export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

type ClassValue = string | number | false | null | undefined;

/**
 * Concatenate class strings, dropping falsy values and collapsing whitespace.
 */
export function cn(...classes: ClassValue[]): string {
    return classes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Escape regex metacharacters for safe use inside a `RegExp` source.
 */
export function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

