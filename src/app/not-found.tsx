import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="py-16 text-center">
            <h1 className="text-6xl font-bold text-accent mb-4">404</h1>
            <p className="text-xl text-foreground/80 mb-8">This page doesn't exist.</p>
            <Link
                href="/"
                className="text-accent underline decoration-dashed underline-offset-4 hover:decoration-solid"
            >
                Go back home
            </Link>
        </div>
    );
}
