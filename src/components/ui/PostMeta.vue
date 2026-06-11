<script setup lang="ts">
import Icon from '@/components/Icon.vue';
import { formatDate } from '@/lib/utils';

// Single source for the post meta row (date + reading time). Rendered statically
// inside .astro pages and inside the Vue islands (TagFilter, Search). Extra
// classes from the parent merge onto the root via attribute fallthrough.
defineProps<{ pubDatetime: string; readingTime: string }>();
</script>

<template>
    <div class="flex items-center space-x-2 italic">
        <Icon name="calendar" class="w-4 h-4 mr-1 not-italic" />
        <time :datetime="pubDatetime" class="whitespace-nowrap">
            {{ formatDate(pubDatetime) }}
        </time>
        <span>•</span>
        <span class="whitespace-nowrap">{{ readingTime }}</span>
    </div>
</template>
