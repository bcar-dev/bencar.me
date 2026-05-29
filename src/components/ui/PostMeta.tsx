import { FiCalendar } from 'react-icons/fi';
import { cn, formatDate } from '@/lib/utils';

interface PostMetaProps {
    pubDatetime: string;
    readingTime: string;
    className?: string;
}

export default function PostMeta({ pubDatetime, readingTime, className }: PostMetaProps) {
    return (
        <div className={cn('flex items-center space-x-2 italic', className)}>
            <FiCalendar className="w-4 h-4 mr-1 not-italic" />
            <time dateTime={pubDatetime} className="whitespace-nowrap">
                {formatDate(pubDatetime)}
            </time>
            <span>•</span>
            <span className="whitespace-nowrap">{readingTime}</span>
        </div>
    );
}
