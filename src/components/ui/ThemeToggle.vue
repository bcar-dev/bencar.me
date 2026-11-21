<script setup lang="ts">
import Icon from '@/components/Icon.vue';
import { useTheme } from '@/composables/useTheme';

const { toggleTheme } = useTheme();
</script>

<template>
    <button
        class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md p-2 transition-colors hover:text-accent"
        aria-label="Toggle Theme"
        @click="toggleTheme"
    >
        <Icon name="sun" class="h-5 w-5 dark:hidden" />
        <Icon name="moon" class="hidden h-5 w-5 dark:block" />
    </button>
</template>
