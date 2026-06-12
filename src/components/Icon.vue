<script setup lang="ts">
import { ICONS, type IconName } from '@/lib/icons';

withDefaults(
    defineProps<{
        name: IconName;
        size?: number | string;
    }>(),
    { size: '1em' }
);
</script>

<template>
    <component :is="ICONS[name]" :width="size" :height="size" aria-hidden="true" />
</template>
