'use client';

import { Link } from 'next-view-transitions';
import React from 'react';

interface DirectionalLinkProps {
    href: string;
    direction: 'prev' | 'next';
    children: React.ReactNode;
    className?: string;
}

export function DirectionalLink({ href, direction, children, className }: DirectionalLinkProps) {
    return (
        <Link
            href={href}
            className={className}
            onClick={() => {
                document.documentElement.dataset.direction = direction;
            }}
        >
            {children}
        </Link>
    );
}
