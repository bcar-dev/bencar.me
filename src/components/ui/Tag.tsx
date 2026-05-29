import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TagProps {
    tag: string;
    className?: string;
}

const BASE_CLASSES =
    'text-xs px-3 py-1 bg-foreground/10 text-foreground/80 font-medium rounded-full transition-colors hover:bg-foreground/20 hover:text-accent relative z-10';

export default function Tag({ tag, className }: TagProps) {
    return (
        <Link href={`/tags?tag=${tag}`} className={cn(BASE_CLASSES, className)}>
            #{tag}
        </Link>
    );
}
