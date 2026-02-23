import { Suspense } from 'react';
import { getAllPosts, getAllTags } from '@/lib/posts';
import TagFilter from '@/components/ui/TagFilter';
import { siteConfig } from '@/config/site';

export const metadata = {
    title: `Tags - ${siteConfig.name}`,
    description: 'Filter blog posts by tags',
};

export default function TagsPage() {
    const posts = getAllPosts();
    const tags = getAllTags();

    return (
        <div className="py-8 w-full">
            <h1 className="my-8 text-3xl font-bold tracking-wider sm:text-4xl">Tags</h1>

            <Suspense>
                <TagFilter allTags={tags} allPosts={posts} />
            </Suspense>
        </div>
    );
}
