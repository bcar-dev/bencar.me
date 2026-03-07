'use client';

import { useEffect, useState } from 'react';

export default function ReadingProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const documentHeight = document.documentElement.scrollHeight;
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;

            const scrollableHeight = documentHeight - windowHeight;

            if (scrollableHeight <= 0) {
                setProgress(0);
                return;
            }

            const percentage = (scrollPosition / scrollableHeight) * 100;
            setProgress(Math.min(100, Math.max(0, percentage)));
        };

        window.addEventListener('scroll', updateProgress, { passive: true });

        // Initial setup
        updateProgress();

        return () => window.removeEventListener('scroll', updateProgress);
    }, []);

    return (
        <div
            className="fixed top-0 left-0 h-2 bg-accent z-50 transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
        />
    );
}
