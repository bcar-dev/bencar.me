<script setup lang="ts">
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<template>
    <button
        class="text-sm text-accent hover:text-accent/80 transition-colors flex items-center cursor-pointer bg-transparent border-none p-0"
        aria-label="Back to top"
        @click="scrollToTop"
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                :stroke-width="2"
                d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
        </svg>
        Back to Top
    </button>
</template>
