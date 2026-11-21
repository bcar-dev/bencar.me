<script setup lang="ts">
import { computed, ref } from 'vue';
import Icon from '@/components/Icon.vue';
import PostMeta from '@/components/ui/PostMeta.vue';
import type { FeaturedSlide } from '@/types';

const props = defineProps<{ slides: ReadonlyArray<FeaturedSlide> }>();

const currentIndex = ref(0);
const current = computed(() => props.slides[currentIndex.value]);

/** Move by `offset` slides, wrapping around at either end. */
function step(offset: number) {
    const count = props.slides.length;
    currentIndex.value = (currentIndex.value + offset + count) % count;
}

function twoDigits(n: number): string {
    return String(n).padStart(2, '0');
}
</script>

<template>
    <section
        v-if="current"
        aria-roledescription="carousel"
        aria-label="Latest posts"
        class="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-4"
    >
        <div class="flex flex-col pt-8 md:pt-12">
            <div aria-live="polite">
                <PostMeta
                    :pub-datetime="current.pubDatetime"
                    :reading-time="current.readingTime"
                    class="text-sm text-foreground/60"
                />
                <h2 class="mt-4 text-2xl leading-tight font-bold">
                    <a :href="`/posts/${current.slug}`" class="underline-offset-4 hover:underline">
                        {{ current.title }}
                    </a>
                </h2>
                <p class="mt-6 line-clamp-4 leading-relaxed text-foreground/75">
                    {{ current.description }}
                </p>
                <a
                    :href="`/posts/${current.slug}`"
                    class="mt-8 inline-flex items-center gap-2 rounded-lg border border-border bg-foreground/5 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/10"
                >
                    Read more
                    <Icon name="arrow-right" class="h-4 w-4" />
                </a>
            </div>

            <div v-if="slides.length > 1" class="mt-10 flex items-center gap-6 md:mt-auto md:pt-10">
                <button
                    type="button"
                    aria-label="Previous post"
                    class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border transition-colors hover:bg-foreground/5"
                    @click="step(-1)"
                >
                    <Icon name="arrow-left" class="h-5 w-5" />
                </button>
                <span class="font-mono text-sm text-foreground/60" aria-hidden="true">
                    {{ twoDigits(currentIndex + 1) }} / {{ twoDigits(slides.length) }}
                </span>
                <button
                    type="button"
                    aria-label="Next post"
                    class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border transition-colors hover:bg-foreground/5"
                    @click="step(1)"
                >
                    <Icon name="arrow-right" class="h-5 w-5" />
                </button>
            </div>
        </div>

        <!-- Same destination as the title link, so it's hidden from keyboard and
             screen readers to avoid announcing the post twice. -->
        <a
            :href="`/posts/${current.slug}`"
            tabindex="-1"
            aria-hidden="true"
            class="order-first block aspect-video overflow-hidden rounded-lg border border-border bg-foreground/5 md:order-none"
        >
            <img
                v-if="current.image"
                :key="current.slug"
                :src="current.image.src"
                :srcset="current.image.srcset"
                sizes="(min-width: 1232px) 795px, (min-width: 768px) 66vw, 100vw"
                :width="current.image.width"
                :height="current.image.height"
                alt=""
                class="h-full w-full object-cover"
            />
        </a>
    </section>
</template>
