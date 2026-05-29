import { Link } from 'next-view-transitions';
import Image from 'next/image';
import { getPostsGroupedByDate } from '@/lib/posts';
import PostListItem from '@/components/ui/PostListItem';
import { siteConfig } from '@/config/site';

export const metadata = {
    title: `All Posts - ${siteConfig.name}`,
    description: `All blog posts on ${siteConfig.name}`,
};

export default function Posts() {
    const groupedPosts = getPostsGroupedByDate();

    return (
        <div className="py-8 w-full">
            <h1 className="my-8 text-2xl font-bold tracking-wider sm:text-4xl">All Posts</h1>

            {groupedPosts.length === 0 ? (
                <p className="text-foreground/75 italic">No posts yet. Stay tuned!</p>
            ) : (
                <div className="space-y-12">
                    {groupedPosts.map((yearGroup) => {
                        const totalPostsInYear = yearGroup.months.reduce(
                            (acc, current) => acc + current.posts.length,
                            0
                        );

                        return (
                            <section key={yearGroup.year} className="relative">
                                <h2 className="text-2xl sm:text-2xl font-extrabold mb-6 relative inline-block">
                                    {yearGroup.year}
                                    <sup className="text-base sm:text-lg font-medium text-foreground/50 ml-1 absolute top-1 -right-6">
                                        {totalPostsInYear}
                                    </sup>
                                </h2>
                                <hr className="w-full border-t-2 border-border/50 mb-8" />

                                <div className="space-y-10">
                                    {yearGroup.months.map((monthGroup) => (
                                        <div key={monthGroup.month}>
                                            <h3 className="text-2xl font-bold mb-6 text-foreground/80 flex items-center">
                                                {monthGroup.month}
                                                <sup className="text-sm font-medium text-foreground/50 ml-1">
                                                    {monthGroup.posts.length}
                                                </sup>
                                            </h3>

                                            <ul className="space-y-10">
                                                {monthGroup.posts.map((post) => (
                                                    <PostListItem
                                                        key={post.slug}
                                                        slug={post.slug}
                                                        title={post.frontmatter.title}
                                                        pubDatetime={post.frontmatter.pubDatetime}
                                                        readingTime={post.readingTime}
                                                        tags={post.frontmatter.tags}
                                                        titleClassName="mb-2 w-fit"
                                                        titleStyle={{
                                                            viewTransitionName: `title-${post.slug}`,
                                                        }}
                                                    >
                                                        <div className="flex flex-col sm:flex-row gap-6 items-start mt-4">
                                                            {post.frontmatter.heroImage && (
                                                                <div className="hidden sm:block shrink-0 pt-1">
                                                                    <Link
                                                                        href={`/posts/${post.slug}`}
                                                                        className="block overflow-hidden rounded-lg border border-accent/20 group-hover:border-accent/50 transition-colors bg-foreground/5"
                                                                    >
                                                                        <Image
                                                                            src={
                                                                                post.frontmatter
                                                                                    .heroImage
                                                                            }
                                                                            alt={
                                                                                post.frontmatter
                                                                                    .heroImageAlt ||
                                                                                post.frontmatter
                                                                                    .title
                                                                            }
                                                                            width={168}
                                                                            height={112}
                                                                            className="w-42 h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                                                                        />
                                                                    </Link>
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-lg text-foreground/80 leading-relaxed line-clamp-3">
                                                                    {post.frontmatter.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </PostListItem>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
