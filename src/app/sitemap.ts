import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { getAllPosts } from '@/lib/posts';

export default function sitemap(): MetadataRoute.Sitemap {
    const posts = getAllPosts();

    // Core static routes
    const routes = ['', '/about', '/posts', '/tags', '/search'].map((route) => ({
        url: `${siteConfig.url}${route}`,
        lastModified: new Date().toISOString().split('T')[0],
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic blog posts
    const postRoutes = posts.map((post) => ({
        url: `${siteConfig.url}/posts/${post.slug}`,
        lastModified: new Date(post.frontmatter.pubDatetime).toISOString().split('T')[0],
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));

    return [...routes, ...postRoutes];
}
