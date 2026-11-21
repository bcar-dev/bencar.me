<script setup lang="ts">
import { useActiveHeading } from '@/composables/useActiveHeading';

export interface TocEntry {
    text: string;
    slug: string;
    level: number;
}

const props = defineProps<{ headings: ReadonlyArray<TocEntry> }>();

const activeSlug = useActiveHeading(() => props.headings.map((heading) => heading.slug));

function handleClick(event: MouseEvent, slug: string) {
    event.preventDefault();
    const elem = document.getElementById(slug);
    if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `#${slug}`);
    } else {
        window.location.hash = slug;
    }
}
</script>

<template>
    <!-- The list's left border is the track. The current link's own border
         overlaps it (-ml-[2px]) to mark where the reader is. -->
    <nav v-if="headings.length > 0" aria-label="Table of contents">
        <ul class="space-y-3 border-l-2 border-border">
            <li v-for="heading in headings" :key="heading.slug">
                <a
                    :href="`#${heading.slug}`"
                    :aria-current="heading.slug === activeSlug ? 'location' : undefined"
                    class="-ml-[2px] block border-l-2 text-sm leading-5 transition-colors"
                    :class="[
                        heading.level === 3 ? 'pl-7' : 'pl-4',
                        heading.slug === activeSlug
                            ? 'border-accent text-foreground'
                            : 'border-transparent text-foreground/60 hover:text-accent',
                    ]"
                    @click="handleClick($event, heading.slug)"
                >
                    {{ heading.text }}
                </a>
            </li>
        </ul>
    </nav>
</template>
