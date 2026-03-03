import { Link } from 'next-view-transitions';
import React from 'react';

interface PostTitleProps {
    href: string;
    children?: React.ReactNode;
    className?: string; // Opt-in extra classes
    style?: React.CSSProperties;
}

export default function PostTitle({ href, children, className = '', style }: PostTitleProps) {
    const baseClasses =
        'inline-block text-xl sm:text-2xl font-medium text-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0 hover:scale-[1.02] transition-transform duration-200 ease-out';

    return (
        <Link href={href} className={`${baseClasses} ${className}`.trim()} style={style}>
            {children}
        </Link>
    );
}
