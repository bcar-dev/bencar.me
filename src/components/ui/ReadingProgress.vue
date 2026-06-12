<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const barRef = ref<HTMLDivElement | null>(null);
let ticking = false;
let onScroll: (() => void) | null = null;

function apply() {
    ticking = false;
    const bar = barRef.value;
    if (!bar) return;

    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const scrollableHeight = documentHeight - windowHeight;
    const raw = scrollableHeight <= 0 ? 0 : (window.scrollY / scrollableHeight) * 100;
    const percentage = Math.min(100, Math.max(0, raw));

    bar.style.width = `${percentage}%`;
    bar.setAttribute('aria-valuenow', String(Math.round(percentage)));
}

onMounted(() => {
    onScroll = () => {
        if (ticking) return;
        ticking = true;
        const raf =
            typeof window.requestAnimationFrame === 'function'
                ? window.requestAnimationFrame
                : (cb: FrameRequestCallback) => window.setTimeout(() => cb(0), 16);
        raf(apply);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    apply();
});

onUnmounted(() => {
    if (onScroll) window.removeEventListener('scroll', onScroll);
});
</script>

<template>
    <div
        ref="barRef"
        class="fixed top-0 left-0 h-2 bg-accent z-50 transition-[width] duration-150 ease-out"
        style="width: 0%"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="0"
    />
</template>
