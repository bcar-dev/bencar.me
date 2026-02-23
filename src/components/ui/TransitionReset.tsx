'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function TransitionReset() {
    const pathname = usePathname();

    useEffect(() => {
        // Reset the transition direction after any navigation
        document.documentElement.removeAttribute('data-direction');
    }, [pathname]);

    return null;
}
