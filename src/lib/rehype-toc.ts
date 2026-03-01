import { visit } from 'unist-util-visit';
import GithubSlugger from 'github-slugger';
import type { Plugin } from 'unified';
import type { Element, Root, Text } from 'hast';

export interface TocEntry {
    text: string;
    slug: string;
    level: number;
}

/**
 * A rehype plugin to extract h2 and h3 headings and inject a custom
 * `<table-of-contents>` element right before the first h2.
 */
const rehypeToc: Plugin<[], Root> = () => {
    return (tree) => {
        const headings: TocEntry[] = [];
        let firstH2Index = -1;
        let firstH2Parent: Element | Root | null = null;
        const slugger = new GithubSlugger();

        // 1. Walk the tree to find all headings and the first h2's insertion point
        visit(
            tree,
            'element',
            (node: Element, index: number | undefined, parent: Element | Root | undefined) => {
                if (node.tagName === 'h2' || node.tagName === 'h3') {
                    // Extract text content of the heading
                    let text = '';
                    visit(node, 'text', (textNode: Text) => {
                        text += textNode.value;
                    });

                    text = text.trim();

                    let slug: string;
                    if (node.properties && typeof node.properties.id === 'string') {
                        slug = node.properties.id;
                    } else {
                        slug = slugger.slug(text);
                    }

                    const level = node.tagName === 'h2' ? 2 : 3;
                    headings.push({ text, slug, level });

                    // Find insertion point (index before the first h2)
                    if (
                        level === 2 &&
                        firstH2Index === -1 &&
                        index !== undefined &&
                        parent !== undefined
                    ) {
                        firstH2Index = index;
                        firstH2Parent = parent as Element | Root;
                    }
                }
            }
        );

        // 2. Inject the custom element if headings exist and we found an h2
        if (headings.length > 0 && firstH2Index !== -1 && firstH2Parent) {
            const tocElement: Element = {
                type: 'element',
                tagName: 'table-of-contents',
                properties: {
                    dataHeadings: JSON.stringify(headings),
                },
                children: [],
            };

            // Insert it just before the first h2
            (firstH2Parent as Element).children.splice(firstH2Index, 0, tocElement);
        }
    };
};

export default rehypeToc;
