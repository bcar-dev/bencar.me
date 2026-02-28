import { siteConfig } from '@/config/site';

export const metadata = {
    title: `About - ${siteConfig.name}`,
    description: siteConfig.description,
};

export default function About() {
    return (
        <div className="py-8 w-full">
            <h1 className="my-8 text-2xl font-bold tracking-wider sm:text-4xl">About Me</h1>
            <div className="prose dark:prose-invert prose-lg text-foreground/80 leading-relaxed font-mono mt-4">
                <p className="mb-4">
                    Hi, I'm {siteConfig.author.pseudonym}. I'm a software engineer-that's my thing.
                    But above all, I like to understand how things work. I enjoy peeling back the layers of the onion and understanding how things really work below the surface.
                    Whether it's something completely out of our hands like a solar system or something carefully crafted like a piece of software, I always enjoy taking the journey to feed my curiosity.
                </p>
                <p className="mb-4">
                    For many years, my interests have grown beyond code and software engineering. This site is a collection
                    of my thoughts on software development, artificial intelligence, and many other topics I find interesting.
                </p>
                <p className="mb-4">
                    I'm not a writer, and I'm not a designer. I don’t believe in absolute truths; instead, I'm guided by the practical findings and empirical lessons I’ve gathered through my own experiences, just like you.
                    This blog is where I share those findings. Not as rigid rules, but as a collection of what I’ve seen, learned, and experienced.
                </p>
            </div>
        </div>
    );
}
