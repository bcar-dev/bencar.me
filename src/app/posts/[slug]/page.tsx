import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug } from '@/lib/posts';
import Tag from '@/components/ui/Tag';
import PostMeta from '@/components/ui/PostMeta';
import BackToTop from '@/components/ui/BackToTop';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import PostNavigation from '@/components/ui/PostNavigation';
import { siteConfig } from '@/config/site';

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getPostBySlug(slug);
    if (!post) return {};

    return {
        title: `${post.frontmatter.title} - ${siteConfig.name}`,
        description: post.frontmatter.description,
    };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const allPosts = getAllPosts();
    const postIndex = allPosts.findIndex((p) => p.slug === slug);
    const post = allPosts[postIndex];

    if (!post) {
        notFound();
    }

    const prevPost = postIndex < allPosts.length - 1 ? allPosts[postIndex + 1] : null;
    const nextPost = postIndex > 0 ? allPosts[postIndex - 1] : null;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.frontmatter.title,
        description: post.frontmatter.description,
        image: post.frontmatter.heroImage
            ? `${siteConfig.url}${post.frontmatter.heroImage}`
            : `${siteConfig.url}/profile.jpg`,
        datePublished: new Date(post.frontmatter.pubDatetime).toISOString(),
        author: {
            '@type': 'Person',
            name: siteConfig.author.name,
            url: siteConfig.url,
        },
    };

    return (
        <article className="py-8 w-full" style={{ viewTransitionName: 'post-content' }}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <header className="mb-8" id="top">
                <h1
                    className="text-3xl font-bold tracking-tight sm:text-4xl text-accent w-fit"
                    style={{ viewTransitionName: `title-${post.slug}` }}
                >
                    {post.frontmatter.title}
                </h1>
                <div className="mt-3 flex items-center space-x-2 text-sm text-foreground/75 opacity-80">
                    <PostMeta
                        pubDatetime={post.frontmatter.pubDatetime}
                        readingTime={post.readingTime}
                    />
                </div>
                {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {post.frontmatter.tags.map((tag) => (
                            <Tag key={tag} tag={tag} />
                        ))}
                    </div>
                )}

                {post.frontmatter.heroImage && (
                    <div className="mt-6 overflow-hidden rounded-lg border-2 border-accent/30">
                        <Image
                            src={post.frontmatter.heroImage}
                            alt={post.frontmatter.heroImageAlt ?? post.frontmatter.title}
                            width={768}
                            height={432}
                            className="w-full h-auto"
                            priority
                        />
                    </div>
                )}
            </header>

            <hr className="border-border opacity-50 mb-8" />

            <MarkdownRenderer content={post.content} />

            <div className="mt-12 flex flex-col space-y-8">
                <div className="flex justify-center">
                    <BackToTop />
                </div>

                <hr className="border-border opacity-50" />

                <PostNavigation prevPost={prevPost} nextPost={nextPost} />
            </div>
        </article>
    );
}
