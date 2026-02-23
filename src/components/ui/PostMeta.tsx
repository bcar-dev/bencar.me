import { FiCalendar } from 'react-icons/fi';
import { formatDate } from '@/lib/utils';

interface PostMetaProps {
    pubDatetime: string;
    readingTime: string;
    className?: string;
}

export default function PostMeta({ pubDatetime, readingTime, className = '' }: PostMetaProps) {
    return (
        <div className={`flex items-center space-x-2 italic ${className}`.trim()}>
            <FiCalendar className="w-4 h-4 mr-1 not-italic" />
            <time dateTime={pubDatetime} className="whitespace-nowrap">
                {formatDate(pubDatetime)}
            </time>
            <span>•</span>
            <span className="whitespace-nowrap">{readingTime}</span>
        </div>
    );
}
