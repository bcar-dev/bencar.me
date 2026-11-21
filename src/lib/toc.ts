/** A heading's slug and the distance from the viewport top to the heading, in px. */
export interface HeadingPosition {
    slug: string;
    top: number;
}

/**
 * Pick the heading the reader is currently in: the last one whose top has
 * scrolled past `offset`. Before any heading gets there, that is the first
 * heading. At the bottom of the page the last heading wins, because a short
 * final section may never scroll far enough to reach the offset.
 *
 * `positions` must be in document order.
 */
export function findActiveSlug(
    positions: readonly HeadingPosition[],
    offset: number,
    atPageBottom: boolean
): string | null {
    if (positions.length === 0) return null;
    if (atPageBottom) return positions[positions.length - 1].slug;

    let active = positions[0].slug;
    for (const { slug, top } of positions) {
        if (top > offset) break;
        active = slug;
    }
    return active;
}
