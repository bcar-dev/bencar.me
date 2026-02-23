import { DirectionalLink } from './DirectionalLink';

import type { Post } from '@/types';

interface PostNavigationProps {
    prevPost: Post | null;
    nextPost: Post | null;
}

export default function PostNavigation({ prevPost, nextPost }: PostNavigationProps) {
    if (!prevPost && !nextPost) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {prevPost ? (
                <DirectionalLink
                    href={`/posts/${prevPost.slug}`}
                    direction="prev"
                    className="group flex flex-col justify-center rounded-2xl border border-transparent p-4 transition-colors hover:border-accent/50 hover:bg-accent/5 overflow-hidden min-w-0 h-full"
                >
                    <span className="text-xs text-foreground/50 mb-1 flex items-center gap-1 uppercase tracking-wider font-semibold shrink-0">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-4 transition-transform group-hover:-translate-x-1"
                        >
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                        Previous Post
                    </span>
                    <span
                        className="text-accent text-lg font-bold group-hover:underline transition-all break-words max-w-full"
                        style={{ wordBreak: 'break-word' }}
                    >
                        {prevPost.frontmatter.title}
                    </span>
                </DirectionalLink>
            ) : (
                <div />
            )}

            {nextPost ? (
                <DirectionalLink
                    href={`/posts/${nextPost.slug}`}
                    direction="next"
                    className="group flex flex-col justify-center items-end text-right rounded-2xl border border-transparent p-4 transition-colors hover:border-accent/50 hover:bg-accent/5 overflow-hidden min-w-0 h-full"
                >
                    <span className="text-xs text-foreground/50 mb-1 flex items-center gap-1 uppercase tracking-wider font-semibold shrink-0">
                        Next Post
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-4 transition-transform group-hover:translate-x-1"
                        >
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                    </span>
                    <span
                        className="text-accent text-lg font-bold group-hover:underline transition-all break-words max-w-full"
                        style={{ wordBreak: 'break-word' }}
                    >
                        {nextPost.frontmatter.title}
                    </span>
                </DirectionalLink>
            ) : (
                <div />
            )}
        </div>
    );
}
