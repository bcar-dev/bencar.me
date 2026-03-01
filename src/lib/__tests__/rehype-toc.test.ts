import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeToc from '../rehype-toc';

describe('rehypeToc', () => {
    it('injects table-of-contents before the first h2', async () => {
        const processor = unified()
            .use(remarkParse)
            .use(remarkRehype)
            .use(rehypeToc)
            .use(rehypeStringify);

        const markdown = `
# Title
Some text.
## Section 1
More text.
### Subsection
Even more text.
## Section 2
`;

        const result = await processor.process(markdown);
        const html = String(result);

        expect(html).toContain(
            '&#x22;text&#x22;:&#x22;Section 1&#x22;,&#x22;slug&#x22;:&#x22;section-1&#x22;,&#x22;level&#x22;:2'
        );
        expect(html.indexOf('<table-of-contents')).toBeLessThan(html.indexOf('<h2'));
    });

    it('handles headings without pre-generated IDs by falling back to slugify', async () => {
        const processor = unified()
            .use(remarkParse)
            .use(remarkRehype) // Output here does not have IDs by default, unlike rehype-slug
            .use(rehypeToc)
            .use(rehypeStringify);

        const markdown = `
## A Complex Heading With Symbols !?
`;

        const result = await processor.process(markdown);
        const html = String(result);

        expect(html).toContain('&#x22;slug&#x22;:&#x22;a-complex-heading-with-symbols-&#x22;');
    });
});
