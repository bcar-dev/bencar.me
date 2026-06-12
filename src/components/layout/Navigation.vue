<script setup lang="ts">
import { ref } from 'vue';
import { siteConfig } from '@/config/site';
import Icon from '@/components/Icon.vue';
import ThemeToggle from '@/components/ui/ThemeToggle.vue';

const props = defineProps<{ currentPath: string }>();

const isOpen = ref(false);

function isActive(path: string) {
    return props.currentPath === path || props.currentPath.startsWith(`${path}/`);
}
</script>

<template>
    <nav
        class="flex w-full flex-col items-center sm:ml-2 sm:flex-row sm:justify-end sm:space-x-4 sm:py-0"
    >
        <button
            class="self-end p-2 sm:hidden hover:text-accent transition-colors"
            aria-label="Toggle Menu"
            @click="isOpen = !isOpen"
        >
            <Icon :name="isOpen ? 'x' : 'menu'" />
        </button>
        <ul
            :class="[
                'absolute top-full right-0 z-50 bg-background border border-border/50 p-4 shadow-lg rounded-b-lg sm:static sm:z-auto sm:border-none sm:bg-transparent sm:p-0 sm:shadow-none sm:rounded-none mt-4 grid w-full max-w-[200px] grid-cols-2 place-content-center gap-2 [&>li>a]:block [&>li>a]:px-4 [&>li>a]:py-3 [&>li>a]:text-center [&>li>a]:font-medium [&>li>a]:text-lg [&>li>a:hover]:text-accent sm:[&>li>a]:px-2 sm:[&>li>a]:py-1 sm:[&>li>a]:text-lg sm:mt-0 sm:ml-0 sm:flex sm:items-center sm:max-w-none sm:w-auto sm:gap-x-4 sm:gap-y-0 sm:-mr-2',
                isOpen ? 'flex' : 'hidden sm:flex',
            ]"
        >
            <li
                v-for="item in siteConfig.nav"
                :key="item.href"
                class="col-span-2 sm:col-span-1 flex items-center"
            >
                <a
                    :href="item.href"
                    :class="
                        isActive(item.href)
                            ? 'underline decoration-double decoration-2 underline-offset-4'
                            : ''
                    "
                >
                    {{ item.title }}
                </a>
            </li>
            <li class="col-span-1 flex items-center justify-center">
                <a href="/search" class="p-2 hover:text-accent" aria-label="Search">
                    <Icon name="search" :size="20" />
                </a>
            </li>
            <li class="col-span-1 flex items-center justify-center">
                <ThemeToggle />
            </li>
        </ul>
    </nav>
</template>
