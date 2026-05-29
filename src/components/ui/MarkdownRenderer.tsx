import type { HTMLAttributes, ClassAttributes, ImgHTMLAttributes } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import Image from 'next/image';
import TableOfContents from '@/components/ui/TableOfContents';
import type { PostHeading } from '@/types';

type HeadingProps = ClassAttributes<HTMLHeadingElement> &
    HTMLAttributes<HTMLHeadingElement> & { node?: unknown };

const headingRenderer = (Tag: 'h2' | 'h3') => {
    const Component = ({ node: _node, ...props }: HeadingProps) => (
        <Tag className="group relative scroll-mt-20" {...props} />
    );
    Component.displayName = `MarkdownHeading(${Tag})`;
    return Component;
};

export const markdownComponents: Components = {
    h2: headingRenderer('h2'),
    h3: headingRenderer('h3'),
    img: (image: ImgHTMLAttributes<HTMLImageElement> & { node?: unknown }) => {
        if (!image.src || typeof image.src !== 'string') return null;
        return (
            <span className="block w-full my-4 overflow-hidden rounded-lg">
                <Image
                    src={image.src}
                    alt={image.alt || 'Markdown Image'}
                    width={0}
                    height={0}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ width: '100%', height: 'auto' }}
                    className="!m-0"
                />
            </span>
        );
    },
};

interface MarkdownRendererProps {
    content: string;
    headings?: PostHeading[];
}

export default function MarkdownRenderer({ content, headings }: MarkdownRendererProps) {
    const tocEntries =
        headings?.map(({ text, slug, level }) => ({ text, slug, level })) ?? [];

    return (
        <div className="prose prose-lg dark:prose-invert max-w-none markdown-content">
            {tocEntries.length > 0 && <TableOfContents headings={tocEntries} />}
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[
                    rehypeSlug,
                    [
                        rehypeAutolinkHeadings,
                        {
                            behavior: 'append',
                            properties: {
                                className: ['heading-anchor'],
                                'aria-label': 'Link to section',
                            },
                            content: { type: 'text', value: '#' },
                        },
                    ],
                ]}
                components={markdownComponents}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
