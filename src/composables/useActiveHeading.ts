import { ref, toValue, onMounted, onUnmounted, type MaybeRefOrGetter, type Ref } from 'vue';
import { findActiveSlug } from '@/lib/toc';

/**
 * A heading becomes current once its top is this close to the viewport top.
 * It sits a little below the 5rem `scroll-margin-top` on headings, so a heading
 * reached by clicking a contents link counts as current.
 */
const ACTIVATION_OFFSET_PX = 100;

/** Slack for sub-pixel rounding when checking whether the page is scrolled to the end. */
const PAGE_BOTTOM_TOLERANCE_PX = 2;

/**
 * Scroll-spy: tracks the slug of the heading the reader is currently in.
 * Recomputes at most once per animation frame on scroll and resize.
 */
export function useActiveHeading(
    slugs: MaybeRefOrGetter<readonly string[]>
): Readonly<Ref<string | null>> {
    const activeSlug = ref<string | null>(null);
    let ticking = false;
    let frame = 0;

    function update() {
        ticking = false;
        const positions = toValue(slugs).flatMap((slug) => {
            const heading = document.getElementById(slug);
            return heading ? [{ slug, top: heading.getBoundingClientRect().top }] : [];
        });
        const atPageBottom =
            window.innerHeight + window.scrollY >=
            document.documentElement.scrollHeight - PAGE_BOTTOM_TOLERANCE_PX;
        activeSlug.value = findActiveSlug(positions, ACTIVATION_OFFSET_PX, atPageBottom);
    }

    function scheduleUpdate() {
        if (ticking) return;
        ticking = true;
        frame = window.requestAnimationFrame(update);
    }

    onMounted(() => {
        window.addEventListener('scroll', scheduleUpdate, { passive: true });
        window.addEventListener('resize', scheduleUpdate, { passive: true });
        update();
    });

    onUnmounted(() => {
        window.removeEventListener('scroll', scheduleUpdate);
        window.removeEventListener('resize', scheduleUpdate);
        window.cancelAnimationFrame(frame);
    });

    return activeSlug;
}
