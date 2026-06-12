// Browser-only loader for Pagefind's runtime bundle (generated into /pagefind at
// build time). This is integration-tested via Playwright against a real build;
// it can't run under jsdom, so it's excluded from unit coverage in vitest.config.ts.

export interface PagefindAnchor {
    element: string;
    id: string;
    text?: string;
    location?: number;
}

export interface PagefindSubResult {
    title: string;
    url: string;
    excerpt: string;
    anchor?: PagefindAnchor;
}

export interface PagefindData {
    url: string;
    excerpt: string;
    meta: Record<string, string | undefined>;
    filters: Record<string, string[] | undefined>;
    sub_results: PagefindSubResult[];
}

export interface PagefindResultStub {
    id: string;
    data: () => Promise<PagefindData>;
}

export interface PagefindApi {
    search: (q: string) => Promise<{ results: PagefindResultStub[] }>;
    preload?: (term: string, options?: Record<string, unknown>) => Promise<void>;
    options?: (opts: Record<string, unknown>) => Promise<void>;
}

let pagefindPromise: Promise<PagefindApi> | null = null;

// Routed through `new Function` so Vite's import analysis can't rewrite the
// specifier (which would append `?import` and 500 in dev); the browser then does
// a native dynamic import of the static /pagefind asset in both dev and prod.
const dynamicImport = new Function('path', 'return import(path)') as (
    path: string
) => Promise<PagefindApi>;

export function loadPagefind(): Promise<PagefindApi> {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('pagefind is browser only'));
    }
    if (!pagefindPromise) {
        pagefindPromise = dynamicImport('/pagefind/pagefind.js').then(async (mod) => {
            await mod.options?.({ excerptLength: 30 });
            return mod;
        });
    }
    return pagefindPromise;
}
