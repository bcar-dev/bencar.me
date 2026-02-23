'use client';

import { useEffect } from 'react';

// global-error must include its own HTML/Body tags as it wraps the entire app layout failure
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Global Error Layout caught:', error);
    }, [error]);

    return (
        <html lang="en">
            <body>
                <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
                    <h2>Critical Application Error</h2>
                    <p style={{ color: '#666' }}>
                        A fatal error occurred at the root layout level.
                    </p>
                    <button
                        onClick={() => reset()}
                        style={{
                            marginTop: '1rem',
                            padding: '0.75rem 1.5rem',
                            background: '#000',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
