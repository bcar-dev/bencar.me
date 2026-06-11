// Shared class string for post-title links, used by the static PostTitle.astro
// and by the Vue islands (TagFilter, Search) so the styling lives in one place.
export const POST_TITLE_LINK_CLASS =
    'inline-block text-xl sm:text-2xl font-medium text-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0 hover:scale-[1.02] transition-transform duration-200 ease-out';
