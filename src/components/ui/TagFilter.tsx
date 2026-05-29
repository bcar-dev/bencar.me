'use client';

import type { Post } from '@/types';
import { FiX } from 'react-icons/fi';
import PostListItem from '@/components/ui/PostListItem';
import { useTagFilter } from '@/hooks/useTagFilter';

export default function TagFilter({ allTags, allPosts }: { allTags: string[]; allPosts: Post[] }) {
    const { selectedTags, toggleTag, clearTags, tagCounts, sortedTags, filteredPosts } =
        useTagFilter(allTags, allPosts);

    return (
        <div className="w-full">
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold tracking-wide">Tags</h2>
                    {selectedTags.length > 0 && (
                        <button
                            onClick={clearTags}
                            className="text-sm font-medium hover:text-accent transition-colors flex items-center gap-1"
                        >
                            <FiX className="w-4 h-4" />
                            Clear all
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    {sortedTags.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                            <button
                                key={`tag-${tag}`}
                                onClick={() => toggleTag(tag)}
                                className={`px-3 py-1 text-sm rounded-md transition-all cursor-pointer flex items-center gap-1.5 border
                                    ${
                                        isSelected
                                            ? 'bg-accent/10 border-accent text-foreground font-medium'
                                            : 'bg-transparent border-border text-foreground/80 hover:border-accent/60 hover:text-foreground'
                                    }`}
                            >
                                {tag}
                                <span className="font-bold text-accent">{tagCounts[tag]}</span>
                                {isSelected && (
                                    <FiX className="w-3 h-3 opacity-60 hover:opacity-100" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <hr className="border-border opacity-50 my-8" />

            <div>
                <h2 className="text-2xl font-bold tracking-wide mb-6">
                    Posts
                    <span className="text-sm font-normal text-foreground/60 ml-2">
                        ({filteredPosts.length})
                    </span>
                </h2>

                {filteredPosts.length === 0 ? (
                    <p className="text-foreground/75 italic">
                        No posts perfectly match this combination of tags.
                    </p>
                ) : (
                    <ul className="space-y-6">
                        {filteredPosts.map((post) => (
                            <PostListItem
                                key={post.slug}
                                slug={post.slug}
                                title={post.frontmatter.title}
                                description={post.frontmatter.description}
                                pubDatetime={post.frontmatter.pubDatetime}
                                readingTime={post.readingTime}
                                tags={post.frontmatter.tags}
                                titleClassName="text-xl sm:text-2xl"
                            />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
