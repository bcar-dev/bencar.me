<script setup lang="ts">
// Single source for the tag pill, used in .astro pages and the Vue islands.
defineProps<{ tag: string }>();

const BASE_CLASS =
    'text-xs px-3 py-1 bg-foreground/10 text-foreground/80 font-medium rounded-full transition-colors hover:bg-foreground/20 hover:text-accent relative z-10';
</script>

<template>
    <a :href="`/tags?tag=${tag}`" :class="BASE_CLASS">#{{ tag }}</a>
</template>
