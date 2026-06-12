import type { ImageMetadata } from 'astro';

/**
 * Resolve a frontmatter `heroImage` string (e.g. "/assets/img/2026/foo/bar.png")
 * to an optimizable `ImageMetadata` object for Astro's `<Image>` component.
 *
 * Images live in `src/assets/img/**`; frontmatter keeps the old `/assets/...`
 * path so `src/lib/posts.ts` (which parses frontmatter with fs/gray-matter) stays
 * framework-agnostic. The `/src` prefix maps the public-style path onto the glob keys.
 */
const images = import.meta.glob<{ default: ImageMetadata }>(
    '/src/assets/img/**/*.{png,jpg,jpeg,webp,avif,gif}',
    { eager: true }
);

export function getHeroImage(heroImage?: string): ImageMetadata | undefined {
    if (!heroImage) return undefined;
    return images[`/src${heroImage}`]?.default;
}
