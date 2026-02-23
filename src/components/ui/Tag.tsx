import Link from 'next/link';

interface TagProps {
    tag: string;
    className?: string;
}

export default function Tag({ tag, className = '' }: TagProps) {
    return (
        <Link
            href={`/tags?tag=${tag}`}
            className={`text-xs px-3 py-1 bg-foreground/10 text-foreground/80 font-medium rounded-full transition-colors hover:bg-foreground/20 hover:text-accent relative z-10 ${className}`.trim()}
        >
            #{tag}
        </Link>
    );
}
