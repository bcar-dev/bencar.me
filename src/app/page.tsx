import { Link } from 'next-view-transitions';
import { FiArrowRight } from 'react-icons/fi';
import { getAllPosts } from '@/lib/posts';
import { siteConfig } from '@/config/site';
import PostMeta from '@/components/ui/PostMeta';
import PostTitle from '@/components/ui/PostTitle';

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
                            <li key={post.slug} className="group">
                                <PostTitle
                                    href={`/posts/${post.slug}`}
                                    className="w-fit"
                                    style={{ viewTransitionName: `title-${post.slug}` }}
                                >
                                    {post.frontmatter.title}
                                </PostTitle>
                                <div className="mt-1 flex flex-wrap gap-x-2 gap-y-2 items-center text-sm text-foreground/75 opacity-80">
                                    <PostMeta
                                        pubDatetime={post.frontmatter.pubDatetime}
                                        readingTime={post.readingTime}
                                        className="mr-1"
                                    />
                                </div>
                                <p className="mt-3 text-foreground/80 leading-relaxed italic">
                                    {post.frontmatter.description}
                                </p>
                            </li>
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
