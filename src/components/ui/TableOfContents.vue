<script setup lang="ts">
import Icon from '@/components/Icon.vue';

export interface TocEntry {
    text: string;
    slug: string;
    level: number;
}

const props = defineProps<{ headings: ReadonlyArray<TocEntry> }>();

function prefixFor(index: number, level: number): string {
    if (level !== 2) return '';
    const h2Number = props.headings.slice(0, index + 1).filter((h) => h.level === 2).length;
    return `${h2Number}. `;
}

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
    <aside
        v-if="headings.length > 0"
        class="not-prose my-10 p-5 rounded-lg border border-border bg-muted dark:bg-foreground/5 shadow-sm text-foreground/75 mb-12"
    >
        <h2 class="text-lg font-bold mt-0 mb-3 flex items-center gap-2 text-foreground">
            <span class="text-accent">
                <Icon name="list" class="w-4 h-4" />
            </span>
            Contents
        </h2>
        <nav>
            <ul class="space-y-2">
                <li
                    v-for="(heading, index) in headings"
                    :key="heading.slug"
                    :style="{ paddingLeft: heading.level === 3 ? '1.5rem' : '0' }"
                >
                    <a
                        :href="`#${heading.slug}`"
                        class="hover:text-accent transition-all duration-200 ease-out inline-block hover:scale-[1.02] origin-left text-sm sm:text-base leading-snug"
                        @click="handleClick($event, heading.slug)"
                    >
                        <span class="text-foreground/60 mr-1.5 opacity-70 font-medium">
                            {{ prefixFor(index, heading.level) }}
                        </span>
                        {{ heading.text }}
                    </a>
                </li>
            </ul>
        </nav>
    </aside>
</template>
