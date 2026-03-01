import type { HTMLAttributes, ClassAttributes, ImgHTMLAttributes } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import Image from 'next/image';
import TableOfContents from '@/components/ui/TableOfContents';
import rehypeToc from '@/lib/rehype-toc';

export const markdownComponents: Components = {
    h2: ({
        node: _node,
        ...props
    }: ClassAttributes<HTMLHeadingElement> &
        HTMLAttributes<HTMLHeadingElement> & { node?: unknown }) => (
        <h2 className="group relative scroll-mt-20" {...props} />
    ),
    h3: ({
        node: _node,
        ...props
    }: ClassAttributes<HTMLHeadingElement> &
        HTMLAttributes<HTMLHeadingElement> & { node?: unknown }) => (
        <h3 className="group relative scroll-mt-20" {...props} />
    ),
    img: (image: ImgHTMLAttributes<HTMLImageElement> & { node?: unknown }) => {
        if (!image.src || typeof image.src !== 'string') return null;
        return (
            <span className="relative block w-full aspect-video my-8 overflow-hidden rounded-lg bg-muted/20">
                <Image
                    src={image.src}
                    alt={image.alt || 'Markdown Image'}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain"
                />
            </span>
        );
    },
    // @ts-expect-error custom tag injected by rehype-toc
    'table-of-contents': (props: { 'data-headings'?: string; node?: unknown }) => {
        try {
            const headings = JSON.parse(props['data-headings'] || '[]');
            return <TableOfContents headings={headings} />;
        } catch (e) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Failed to parse table-of-contents data:', e);
            }
            return null;
        }
    },
};

export default function MarkdownRenderer({ content }: { content: string }) {
    return (
        <div className="prose prose-lg dark:prose-invert max-w-none markdown-content">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[
                    rehypeSlug,
                    rehypeToc as import('unified').Plugin,
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
