<script setup lang="ts">
import { onMounted } from 'vue';
import type { Post } from '@/types';
import Icon from '@/components/Icon.vue';
import PostMeta from '@/components/ui/PostMeta.vue';
import Tag from '@/components/ui/Tag.vue';
import { POST_TITLE_LINK_CLASS } from '@/lib/ui';
import { useTagFilter } from '@/composables/useTagFilter';

const props = defineProps<{ allTags: string[]; allPosts: Post[] }>();

// Start unfiltered so the server-rendered list matches first client paint, then
// apply ?tag= after hydration (query params aren't available at static build time).
const { selectedTags, toggleTag, clearTags, tagCounts, sortedTags, filteredPosts } = useTagFilter(
    props.allTags,
    props.allPosts
);

onMounted(() => {
    const tag = new URLSearchParams(window.location.search).get('tag');
    if (tag && props.allTags.includes(tag) && !selectedTags.value.includes(tag)) {
        toggleTag(tag);
    }
});
</script>

<template>
    <div class="w-full">
        <div class="mb-10">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-bold tracking-wide">Tags</h2>
                <button
                    v-if="selectedTags.length > 0"
                    class="text-sm font-medium hover:text-accent transition-colors flex items-center gap-1"
                    @click="clearTags"
                >
                    <Icon name="x" class="w-4 h-4" />
                    Clear all
                </button>
            </div>

            <div class="flex flex-wrap gap-2">
                <button
                    v-for="tag in sortedTags"
                    :key="`tag-${tag}`"
                    :class="[
                        'px-3 py-1 text-sm rounded-md transition-all cursor-pointer flex items-center gap-1.5 border',
                        selectedTags.includes(tag)
                            ? 'bg-accent/10 border-accent text-foreground font-medium'
                            : 'bg-transparent border-border text-foreground/80 hover:border-accent/60 hover:text-foreground',
                    ]"
                    @click="toggleTag(tag)"
                >
                    {{ tag }}
                    <span class="font-bold text-accent">{{ tagCounts[tag] }}</span>
                    <Icon
                        v-if="selectedTags.includes(tag)"
                        name="x"
                        class="w-3 h-3 opacity-60 hover:opacity-100"
                    />
                </button>
            </div>
        </div>

        <hr class="border-border opacity-50 my-8" />

        <div>
            <h2 class="text-2xl font-bold tracking-wide mb-6">
                Posts
                <span class="text-sm font-normal text-foreground/60 ml-2">
                    ({{ filteredPosts.length }})
                </span>
            </h2>

            <p v-if="filteredPosts.length === 0" class="text-foreground/75 italic">
                No posts perfectly match this combination of tags.
            </p>
            <ul v-else class="space-y-6">
                <li v-for="post in filteredPosts" :key="post.slug" class="group">
                    <a
                        :href="`/posts/${post.slug}`"
                        :style="{ viewTransitionName: `title-${post.slug}` }"
                        :class="POST_TITLE_LINK_CLASS"
                    >
                        {{ post.frontmatter.title }}
                    </a>
                    <div
                        class="mt-1 flex flex-wrap gap-x-2 gap-y-2 items-center text-sm text-foreground/75 opacity-80"
                    >
                        <PostMeta
                            :pub-datetime="post.frontmatter.pubDatetime"
                            :reading-time="post.readingTime"
                            class="mr-1"
                        />
                        <div
                            v-if="post.frontmatter.tags.length > 0"
                            class="flex flex-wrap gap-2 items-center"
                        >
                            <Tag v-for="tag in post.frontmatter.tags" :key="tag" :tag="tag" />
                        </div>
                    </div>
                    <p
                        v-if="post.frontmatter.description"
                        class="mt-3 text-foreground/80 leading-relaxed italic"
                    >
                        {{ post.frontmatter.description }}
                    </p>
                </li>
            </ul>
        </div>
    </div>
</template>
