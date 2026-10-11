// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const createIndex = vi.fn();
const close = vi.fn();
vi.mock('pagefind', () => ({ createIndex: () => createIndex(), close: () => close() }));

/** A pagefind index stub whose three failure points can each be armed in turn. */
function indexStub({
    addErrors = [],
    writeErrors = [],
}: { addErrors?: string[]; writeErrors?: string[] } = {}) {
    return {
        addHTMLFile: vi.fn(async () => ({ errors: addErrors })),
        writeFiles: vi.fn(async () => ({ errors: writeErrors })),
    };
}

async function load() {
    return import('../build-search-index.mjs');
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe('buildSearchIndex error handling', () => {
    it('throws when pagefind cannot create the index', async () => {
        createIndex.mockResolvedValue({ index: null, errors: ['bad config'] });
        const { buildSearchIndex } = await load();
        await expect(buildSearchIndex('/tmp/unused')).rejects.toThrow(
            'pagefind createIndex errors: bad config'
        );
    });

    it('throws when a document cannot be added, naming the document', async () => {
        createIndex.mockResolvedValue({
            index: indexStub({ addErrors: ['parse failed'] }),
            errors: [],
        });
        const { buildSearchIndex } = await load();
        await expect(buildSearchIndex('/tmp/unused')).rejects.toThrow(/parse failed/);
    });

    it('throws when the index cannot be written to disk', async () => {
        createIndex.mockResolvedValue({
            index: indexStub({ writeErrors: ['disk full'] }),
            errors: [],
        });
        const { buildSearchIndex } = await load();
        await expect(buildSearchIndex('/tmp/unused')).rejects.toThrow(
            'pagefind writeFiles errors: disk full'
        );
    });
});
