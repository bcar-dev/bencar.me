<script setup lang="ts">
import Icon from '@/components/Icon.vue';
import { useTheme } from '@/composables/useTheme';

const { isAnimating, toggleTheme } = useTheme();
</script>

<template>
    <button
        :aria-disabled="isAnimating"
        :class="[
            'relative p-2 transition-colors flex items-center justify-center w-9 h-9 rounded-md overflow-hidden',
            isAnimating ? 'cursor-default opacity-80' : 'cursor-pointer hover:text-accent',
        ]"
        aria-label="Toggle Theme"
        @click="toggleTheme"
    >
        <Icon
            name="sun"
            class="absolute h-[20px] w-[20px] rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0"
        />
        <Icon
            name="moon"
            class="absolute h-[20px] w-[20px] rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100"
        />
    </button>
</template>
