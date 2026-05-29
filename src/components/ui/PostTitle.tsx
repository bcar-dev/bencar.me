import { Link } from 'next-view-transitions';
import React from 'react';
import { cn } from '@/lib/utils';

interface PostTitleProps {
    href: string;
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

const BASE_CLASSES =
    'inline-block text-xl sm:text-2xl font-medium text-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0 hover:scale-[1.02] transition-transform duration-200 ease-out';

export default function PostTitle({ href, children, className, style }: PostTitleProps) {
    return (
        <Link href={href} className={cn(BASE_CLASSES, className)} style={style}>
            {children}
        </Link>
    );
}
