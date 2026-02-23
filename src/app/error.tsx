'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FiAlertTriangle } from 'react-icons/fi';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
            <FiAlertTriangle className="w-16 h-16 text-red-500 mb-6 opacity-80" />
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-foreground">
                Something went wrong!
            </h2>
            <p className="text-foreground/70 mb-8 max-w-md mx-auto">
                We apologize for the inconvenience. An unexpected error occurred while loading this
                page.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => reset()}
                    className="px-6 py-2.5 bg-accent text-white font-medium rounded-md hover:bg-accent/90 transition-colors w-fit"
                >
                    Try again
                </button>
                <Link
                    href="/"
                    className="px-6 py-2.5 bg-background border border-border text-foreground font-medium rounded-md hover:border-accent hover:text-accent transition-colors w-fit"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
}
