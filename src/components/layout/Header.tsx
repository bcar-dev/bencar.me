import Link from 'next/link';
import { FiGithub } from 'react-icons/fi';
import { BsLinkedin } from 'react-icons/bs';
import { siteConfig } from '@/config/site';
import Image from 'next/image';
import SocialLink from '@/components/ui/SocialLink';
import Navigation from '@/components/layout/Navigation';

export default function Header() {
    return (
        <header>
            <div className="w-full">
                <div className="flex flex-col border-b border-border/50">
                    <div className="relative flex w-full items-center justify-between bg-background py-4 sm:pt-6 sm:pb-4">
                        <div className="py-1 whitespace-nowrap flex items-center gap-3 w-fit">
                            <Link
                                href="/"
                                className="text-2xl leading-7 font-bold hover:text-accent transition-colors"
                            >
                                {siteConfig.name}
                            </Link>
                            <Link href="/about" className="flex-shrink-0">
                                <Image
                                    src={siteConfig.author.avatar}
                                    alt={siteConfig.author.name}
                                    width={32}
                                    height={32}
                                    className="rounded-full object-cover hover:opacity-80 transition-opacity"
                                    priority
                                />
                            </Link>
                        </div>
                        <Navigation />
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <div className="flex w-full items-center justify-between pt-3 pb-4 sm:pb-3">
                    <p className="text-foreground/80 font-mono text-sm leading-tight whitespace-pre-line">
                        {siteConfig.author.bio}
                    </p>
                    <div className="flex gap-2 items-center text-foreground/75 shrink-0 sm:-mr-2">
                        <SocialLink
                            href={siteConfig.links.github}
                            aria-label="GitHub"
                            className="p-2"
                        >
                            <FiGithub className="w-5 h-5" />
                        </SocialLink>
                        <SocialLink
                            href={siteConfig.links.linkedin}
                            aria-label="LinkedIn"
                            className="p-2"
                        >
                            <BsLinkedin className="w-5 h-5" />
                        </SocialLink>
                    </div>
                </div>
            </div>
        </header>
    );
}
