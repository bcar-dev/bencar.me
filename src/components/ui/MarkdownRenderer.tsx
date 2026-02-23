import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import React from 'react';
import Image from 'next/image';

function HeadingWithAnchor({
    level,
    id,
    children,
}: {
    level: 2 | 3;
    id?: string;
    children?: React.ReactNode;
}) {
    const Tag = `h${level}` as const;
    return (
        <Tag id={id} className="group relative scroll-mt-20">
            {children}
            {id && (
                <a
                    href={`#${id}`}
                    className="ml-2 inline-block align-middle opacity-0 group-hover:opacity-100 transition-opacity text-accent hover:text-accent/80 no-underline font-bold"
                    aria-label={`Link to section`}
                >
                    #
                </a>
            )}
        </Tag>
    );
}

export const markdownComponents: Components = {
    h2: ({ id, children }) => (
        <HeadingWithAnchor level={2} id={id}>
            {children}
        </HeadingWithAnchor>
    ),
    h3: ({ id, children }) => (
        <HeadingWithAnchor level={3} id={id}>
            {children}
        </HeadingWithAnchor>
    ),
    img: (image) => {
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
};

export default function MarkdownRenderer({ content }: { content: string }) {
    return (
        <div className="prose prose-lg dark:prose-invert max-w-none markdown-content">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
                components={markdownComponents}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
