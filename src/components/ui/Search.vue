<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import type { SearchResult } from '@/types';
import Icon from '@/components/Icon.vue';
import PostMeta from '@/components/ui/PostMeta.vue';
import Tag from '@/components/ui/Tag.vue';
import { escapeRegex } from '@/lib/utils';
import { POST_TITLE_LINK_CLASS } from '@/lib/ui';
import { useDebounce } from '@/composables/useDebounce';
import { loadPagefind, type PagefindData, type PagefindResultStub } from '@/lib/pagefind';

const MIN_QUERY_LENGTH = 2;
const PAGE_SIZE = 10;

function adaptResult(data: PagefindData): SearchResult {
    const meta = data.meta ?? {};
    const tags = data.filters?.tag ?? [];
    const slug = meta.slug ?? data.url.split('/').filter(Boolean).pop() ?? '';

    const matches = data.sub_results.map((sub) => ({
        heading: sub.anchor ? { text: sub.title, slug: sub.anchor.id } : null,
        snippets: [sub.excerpt],
    }));

    return {
        slug,
        title: meta.title ?? slug,
        date: meta.date ?? '',
        readingTime: meta.readingTime ?? '',
        tags,
        matches,
    };
}

async function materializeBatch(stubs: PagefindResultStub[]): Promise<SearchResult[]> {
    const datas = await Promise.all(stubs.map((s) => s.data()));
    return datas.map(adaptResult);
}

type SearchStatus = 'idle' | 'loading' | 'loadingMore' | 'ready' | 'error';
interface SearchState {
    status: SearchStatus;
    results: SearchResult[];
    count: number;
    pending: PagefindResultStub[];
}
const INITIAL_STATE: SearchState = { status: 'idle', results: [], count: 0, pending: [] };

const query = ref('');
const debouncedQuery = useDebounce(query, 300);
const state = ref<SearchState>({ ...INITIAL_STATE });
let requestIdCounter = 0;

async function runSearch(q: string) {
    const requestId = ++requestIdCounter;
    if (q.length < MIN_QUERY_LENGTH) {
        state.value = { ...INITIAL_STATE };
        return;
    }

    state.value = { status: 'loading', results: [], count: 0, pending: [] };

    try {
        const pagefind = await loadPagefind();
        const { results } = await pagefind.search(q);
        if (requestId !== requestIdCounter) return;

        const initial = results.slice(0, PAGE_SIZE);
        const pending = results.slice(PAGE_SIZE);
        const materialised = await materializeBatch(initial);
        if (requestId !== requestIdCounter) return;

        state.value = { status: 'ready', results: materialised, count: results.length, pending };
    } catch (err) {
        if (requestId !== requestIdCounter) return;
        console.error('search failed', err);
        state.value = { status: 'error', results: [], count: 0, pending: [] };
    }
}

async function handleLoadMore() {
    if (state.value.pending.length === 0 || state.value.status === 'loadingMore') return;
    const requestId = ++requestIdCounter;
    const nextStubs = state.value.pending.slice(0, PAGE_SIZE);
    const rest = state.value.pending.slice(PAGE_SIZE);

    state.value = { ...state.value, status: 'loadingMore' };
    try {
        const more = await materializeBatch(nextStubs);
        if (requestId !== requestIdCounter) return;
        state.value = {
            status: 'ready',
            results: [...state.value.results, ...more],
            count: state.value.count,
            pending: rest,
        };
    } catch (err) {
        if (requestId !== requestIdCounter) return;
        console.error('load more failed', err);
        state.value = { ...state.value, status: 'ready' };
    }
}

function handleClear() {
    query.value = '';
    state.value = { ...INITIAL_STATE };
}

onMounted(() => {
    query.value = new URLSearchParams(window.location.search).get('q') ?? '';
    // Warm Pagefind (dynamic import + WASM + meta) so the first search is fast.
    loadPagefind().catch((err) => console.warn('pagefind warm failed', err));
});

// Pre-fetch index chunks for the in-progress query before the debounce fires.
watch(query, (q) => {
    if (q.length < MIN_QUERY_LENGTH) return;
    loadPagefind()
        .then((pf) => pf.preload?.(q))
        .catch(() => {});
});

watch(debouncedQuery, (q) => {
    runSearch(q);
    const target = q.length >= MIN_QUERY_LENGTH ? `/search?q=${encodeURIComponent(q)}` : '/search';
    window.history.replaceState(null, '', target);
});

const isLoading = computed(() => state.value.status === 'loading');
const isLoadingMore = computed(() => state.value.status === 'loadingMore');
const showResults = computed(
    () => state.value.status === 'ready' || state.value.status === 'loadingMore'
);
const showEmpty = computed(
    () =>
        state.value.status === 'ready' &&
        state.value.results.length === 0 &&
        debouncedQuery.value.length >= MIN_QUERY_LENGTH
);

function highlightParts(text: string, q: string) {
    // Only ever called while results are shown, i.e. q.length >= MIN_QUERY_LENGTH.
    return text
        .split(new RegExp(`(${escapeRegex(q)})`, 'gi'))
        .map((part, i) => ({ text: part, mark: i % 2 === 1 }));
}

function excerptParts(excerpt: string) {
    return excerpt.split(/<\/?mark>/).map((part, i) => ({ text: part, mark: i % 2 === 1 }));
}
</script>

<template>
    <div class="py-8 w-full">
        <h1 class="my-8 text-3xl font-bold tracking-wider sm:text-4xl">Search</h1>
        <p class="mb-6 italic text-foreground/80">Search any article ...</p>

        <div class="relative w-full mb-8">
            <label class="sr-only" for="search-input">Search input</label>
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-foreground/60">
                <Icon name="search" :size="20" />
            </span>
            <input
                id="search-input"
                v-model="query"
                class="block w-full rounded-md border border-border bg-background py-3 pl-10 pr-10 outline-hidden focus:border-accent focus:ring-1 focus:ring-accent"
                placeholder="Search for anything..."
                type="text"
                autocomplete="off"
                autofocus
            />
            <button
                v-if="query"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground/60 hover:text-foreground transition-colors"
                aria-label="Clear search"
                @click="handleClear"
            >
                <Icon name="x" :size="20" />
            </button>
        </div>

        <div v-if="showResults" class="mb-6 pb-4 border-b border-border text-sm text-foreground/75">
            {{ state.count }} {{ state.count === 1 ? 'result' : 'results' }} for
            <span class="font-semibold text-foreground">{{ debouncedQuery }}</span>
        </div>

        <div v-if="isLoading" class="text-sm italic text-foreground/60">Searching...</div>

        <p v-if="showEmpty" class="text-foreground/75 italic">No results found.</p>

        <p v-if="state.status === 'error'" class="text-foreground/75 italic">
            Search is unavailable. Try again in a moment.
        </p>

        <ul v-if="showResults && state.results.length > 0" class="space-y-6">
            <li
                v-for="result in state.results"
                :key="result.slug"
                class="group pb-6 border-b border-border/50 last:border-b-0"
            >
                <a
                    :href="`/posts/${result.slug}`"
                    :style="{ viewTransitionName: `title-${result.slug}` }"
                    :class="POST_TITLE_LINK_CLASS"
                >
                    <template
                        v-for="(p, i) in highlightParts(result.title, debouncedQuery)"
                        :key="i"
                    >
                        <mark v-if="p.mark">{{ p.text }}</mark
                        ><span v-else>{{ p.text }}</span>
                    </template>
                </a>
                <div
                    class="mt-1 flex flex-wrap gap-x-2 gap-y-2 items-center text-sm text-foreground/75 opacity-80"
                >
                    <PostMeta
                        :pub-datetime="result.date"
                        :reading-time="result.readingTime"
                        class="mr-1"
                    />
                    <div v-if="result.tags.length > 0" class="flex flex-wrap gap-2 items-center">
                        <Tag v-for="tag in result.tags" :key="tag" :tag="tag" />
                    </div>
                </div>
                <div class="mt-3 space-y-4">
                    <div v-for="(match, i) in result.matches" :key="i" class="space-y-2">
                        <a
                            v-if="match.heading"
                            :href="`/posts/${result.slug}#${match.heading.slug}`"
                            class="inline-flex items-center gap-2 text-sm text-accent hover:underline decoration-dashed underline-offset-4 mb-1"
                        >
                            <span class="text-foreground/40">↪</span>
                            <span>
                                <template
                                    v-for="(p, j) in highlightParts(
                                        match.heading.text,
                                        debouncedQuery
                                    )"
                                    :key="j"
                                >
                                    <mark v-if="p.mark">{{ p.text }}</mark
                                    ><span v-else>{{ p.text }}</span>
                                </template>
                            </span>
                        </a>
                        <p
                            v-for="(snippet, j) in match.snippets"
                            :key="j"
                            class="text-foreground/80 leading-relaxed text-sm [&_mark]:bg-yellow-200 [&_mark]:dark:bg-yellow-700/60 [&_mark]:px-0.5 [&_mark]:rounded-sm"
                        >
                            <template v-for="(p, k) in excerptParts(snippet)" :key="k">
                                <mark v-if="p.mark">{{ p.text }}</mark
                                ><span v-else>{{ p.text }}</span>
                            </template>
                        </p>
                    </div>
                </div>
            </li>
        </ul>

        <div v-if="showResults && state.pending.length > 0" class="mt-12 flex justify-center">
            <button
                :disabled="isLoadingMore"
                class="px-6 py-2 rounded-md border border-border bg-background hover:bg-foreground/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                @click="handleLoadMore"
            >
                {{ isLoadingMore ? 'Loading...' : 'Load more results' }}
            </button>
        </div>
    </div>
</template>
