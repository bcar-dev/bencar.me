/**
 * Format a date string into a human-readable format.
 * e.g. "2026-02-14" → "14 Feb, 2026"
 */
export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}
