<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import Icon from '@/components/Icon.vue';

/** Article body images. One inside a link keeps following its link instead of zooming. */
const ARTICLE_IMAGES = '.markdown-content img';
const ZOOM_TIMING = { duration: 300, easing: 'cubic-bezier(0.2, 0, 0, 1)' };

const dialog = ref<HTMLDialogElement>();
const zoomedImage = ref<HTMLImageElement>();
const closeButton = ref<HTMLButtonElement>();
const zoomed = ref<{ src: string; alt: string }>();
let opener: HTMLImageElement | undefined;
let running: Animation[] = [];
let closing = false;

function zoomable(target: EventTarget | null): target is HTMLImageElement {
    return (
        target instanceof HTMLImageElement && target.matches(ARTICLE_IMAGES) && !target.closest('a')
    );
}

function reducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Zooms the image between its place in the article and the centre of the screen, fading the dark background and
 * the close button with it. `reverse` plays it back into the article.
 */
function playZoom(direction: 'normal' | 'reverse'): Animation[] {
    // Measure without a half-played zoom still moving the image.
    for (const animation of running) animation.cancel();
    if (!opener || !zoomedImage.value || !dialog.value || !closeButton.value) return [];
    const from = opener.getBoundingClientRect();
    const to = zoomedImage.value.getBoundingClientRect();
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    const shade = getComputedStyle(dialog.value).backgroundColor;
    // Closing holds its last frame until the dialog is gone.
    const options: KeyframeAnimationOptions = {
        ...ZOOM_TIMING,
        direction,
        fill: direction === 'reverse' ? 'forwards' : 'none',
    };
    running = [
        zoomedImage.value.animate(
            [
                { transform: `translate(${dx}px, ${dy}px) scale(${from.width / to.width})` },
                { transform: 'none' },
            ],
            options
        ),
        dialog.value.animate(
            [{ backgroundColor: 'transparent' }, { backgroundColor: shade }],
            options
        ),
        closeButton.value.animate([{ opacity: 0 }, { opacity: 1 }], options),
    ];
    return running;
}

async function open(img: HTMLImageElement): Promise<void> {
    opener = img;
    // Article images ship one original-size file, so the zoom reuses it without a new download.
    zoomed.value = { src: img.currentSrc || img.src, alt: img.alt };
    await nextTick();
    // The zoom measures the image, so wait until it has its size before showing the dialog.
    await zoomedImage.value?.decode().catch(() => undefined);
    dialog.value?.showModal();
    if (!reducedMotion()) playZoom('normal');
}

function close(): void {
    if (closing) return;
    if (reducedMotion()) {
        dialog.value?.close();
        return;
    }
    closing = true;
    const zoom = playZoom('reverse');
    void Promise.all(zoom.map((animation) => animation.finished)).then(() => {
        dialog.value?.close();
        for (const animation of zoom) animation.cancel();
    });
}

/** Esc: play the same zoom back instead of the browser's instant close. */
function onCancel(event: Event): void {
    event.preventDefault();
    close();
}

function onClose(): void {
    closing = false;
    // The page did not scroll while the dialog was open, so the image is still where the reader left it.
    opener?.focus({ preventScroll: true });
}

function onClick(event: MouseEvent): void {
    if (zoomable(event.target)) void open(event.target);
}

function onKeydown(event: KeyboardEvent): void {
    if (!zoomable(event.target) || (event.key !== 'Enter' && event.key !== ' ')) return;
    // Otherwise Space scrolls the page, and either key can go on to press the Close button that takes focus when
    // the dialog opens, shutting it at once.
    event.preventDefault();
    void open(event.target);
}

onMounted(() => {
    for (const img of document.querySelectorAll(ARTICLE_IMAGES)) {
        if (!zoomable(img)) continue;
        img.tabIndex = 0;
        img.setAttribute('role', 'button');
        img.setAttribute('aria-label', `Enlarge image: ${img.alt}`);
    }
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
    document.removeEventListener('click', onClick);
    document.removeEventListener('keydown', onKeydown);
});
</script>

<template>
    <!-- Native modal dialog: Esc and focus containment come from the browser. The dark shade sits on the dialog,
         not ::backdrop, so the zoom can fade it in every browser. open:flex, never plain flex, or the closed dialog
         would show. Sizes are relative to the dialog, which tracks the visible viewport. -->
    <dialog
        ref="dialog"
        :aria-label="zoomed?.alt || 'Zoomed image'"
        class="m-0 size-full max-h-none max-w-none cursor-zoom-out items-center justify-center bg-black/85 p-0 open:flex backdrop:bg-transparent"
        @click="close"
        @cancel="onCancel"
        @close="onClose"
    >
        <img
            v-if="zoomed"
            ref="zoomedImage"
            :src="zoomed.src"
            :alt="zoomed.alt"
            class="max-h-[95%] max-w-[95%] rounded-lg object-contain"
        />
        <button
            ref="closeButton"
            type="button"
            aria-label="Close"
            class="absolute top-4 right-4 cursor-pointer rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
        >
            <Icon name="x" :size="24" />
        </button>
    </dialog>
</template>
