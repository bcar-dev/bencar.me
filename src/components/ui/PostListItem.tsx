import type { CSSProperties, ReactNode } from 'react';
import PostMeta from '@/components/ui/PostMeta';
import PostTitle from '@/components/ui/PostTitle';
import Tag from '@/components/ui/Tag';

interface PostListItemProps {
    slug: string;
    title: string;
    description?: string;
    pubDatetime: string;
    readingTime: string;
    tags?: string[];
    titleStyle?: CSSProperties;
    titleClassName?: string;
    /** Optional content rendered after the meta row (e.g. hero image + description). */
    children?: ReactNode;
}

export default function PostListItem({
    slug,
    title,
    description,
    pubDatetime,
    readingTime,
    tags = [],
    titleStyle,
    titleClassName = 'w-fit',
    children,
}: PostListItemProps) {
    return (
        <li className="group">
            <PostTitle
                href={`/posts/${slug}`}
                className={titleClassName}
                style={titleStyle}
            >
                {title}
            </PostTitle>
            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-2 items-center text-sm text-foreground/75 opacity-80">
                <PostMeta pubDatetime={pubDatetime} readingTime={readingTime} className="mr-1" />
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                        {tags.map((tag) => (
                            <Tag key={tag} tag={tag} />
                        ))}
                    </div>
                )}
            </div>
            {children ? (
                children
            ) : description ? (
                <p className="mt-3 text-foreground/80 leading-relaxed italic">{description}</p>
            ) : null}
        </li>
    );
}
