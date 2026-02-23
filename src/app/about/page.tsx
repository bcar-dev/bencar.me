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
                    Hi, I'm {siteConfig.author.pseudonym}. I'm a backend developer with a passion
                    for building scalable and robust systems.
                </p>
                <p className="mb-4">
                    Over the years, my interests have grown beyond code. This site is a collection
                    of my thoughts on softwaredevelopment, artificial intelligence, biking, and life
                    in general.
                </p>
            </div>
        </div>
    );
}
