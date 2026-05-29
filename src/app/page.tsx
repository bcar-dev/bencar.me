import { Link } from 'next-view-transitions';
import { FiArrowRight } from 'react-icons/fi';
import { getAllPosts } from '@/lib/posts';
import { siteConfig } from '@/config/site';
import PostListItem from '@/components/ui/PostListItem';

export default function Home() {
    const recentPosts = getAllPosts().slice(0, siteConfig.pagination.recentPostsCount);

    return (
        <div className="py-8 w-full">
            <h1 className="sr-only">{siteConfig.name} - Home</h1>
            <section aria-labelledby="recent-posts-heading" className="pt-8 pb-6">
                <h2 id="recent-posts-heading" className="text-2xl font-bold tracking-wide mb-6">
                    Recent Posts
                </h2>
                {recentPosts.length === 0 ? (
                    <p className="text-foreground/75 italic">No posts yet. Stay tuned!</p>
                ) : (
                    <ul className="space-y-6">
                        {recentPosts.map((post) => (
                            <PostListItem
                                key={post.slug}
                                slug={post.slug}
                                title={post.frontmatter.title}
                                description={post.frontmatter.description}
                                pubDatetime={post.frontmatter.pubDatetime}
                                readingTime={post.readingTime}
                                titleStyle={{ viewTransitionName: `title-${post.slug}` }}
                            />
                        ))}
                    </ul>
                )}

                {recentPosts.length > 0 && (
                    <div className="mt-10 flex justify-center">
                        <Link
                            href="/posts"
                            className="hover:text-accent text-sm flex items-center transition-colors"
                        >
                            All Posts <FiArrowRight className="ml-1 w-4 h-4" />
                        </Link>
                    </div>
                )}
            </section>
        </div>
    );
}
