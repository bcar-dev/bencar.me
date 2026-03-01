'use client';

import { FiList } from 'react-icons/fi';
import { type TocEntry } from '@/lib/rehype-toc';

export interface TableOfContentsProps {
    headings: ReadonlyArray<TocEntry>;
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
    if (!headings || headings.length === 0) return null;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
        e.preventDefault();
        const elem = document.getElementById(slug);

        if (elem) {
            elem.scrollIntoView({ behavior: 'smooth' });
            // update URL hash without triggering Next.js scroll jumps
            window.history.pushState(null, '', `#${slug}`);
        } else {
            window.location.hash = slug;
        }
    };

    return (
        <aside className="not-prose my-10 p-5 rounded-lg border border-border bg-surface dark:bg-surface-alt/50 shadow-sm text-text-muted mb-12">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-text">
                <span className="text-accent">
                    <FiList className="w-4 h-4" />
                </span>
                Contents
            </h2>
            <nav>
                <ul className="space-y-2">
                    {headings.map((heading, index) => {
                        const h2Number = headings
                            .slice(0, index + 1)
                            .filter((h) => h.level === 2).length;
                        const prefix = heading.level === 2 ? `${h2Number}. ` : '';

                        return (
                            <li
                                key={heading.slug}
                                style={{ paddingLeft: heading.level === 3 ? '1.5rem' : '0' }}
                            >
                                <a
                                    href={`#${heading.slug}`}
                                    onClick={(e) => handleClick(e, heading.slug)}
                                    className="hover:text-accent transition-colors block text-sm sm:text-base leading-snug"
                                >
                                    <span className="text-text-muted mr-1.5 opacity-70 font-medium">
                                        {prefix}
                                    </span>
                                    {heading.text}
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}
