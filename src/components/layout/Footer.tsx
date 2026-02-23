import Link from 'next/link';
import { BsLinkedin, BsTags } from 'react-icons/bs';
import { FiGithub } from 'react-icons/fi';
import { siteConfig } from '@/config/site';
import SocialLink from '@/components/ui/SocialLink';

export default function Footer() {
    return (
        <footer className="mt-auto">
            <hr className="border-border/50" />
            <div className="py-8 flex flex-col sm:flex-row items-center justify-between text-sm text-foreground/75">
                <div className="mb-4 sm:mb-0 flex items-center space-x-2">
                    <span>© {new Date().getFullYear()}</span>
                    <span>•</span>
                    <Link href="/" className="hover:text-accent font-medium">
                        {siteConfig.author.name}
                    </Link>
                </div>
                <div className="flex space-x-4">
                    <Link
                        href="/tags"
                        aria-label="Tags"
                        className="flex items-center gap-1.5 hover:text-accent transition-colors"
                    >
                        <BsTags size={20} />
                        <span className="text-sm">Tags</span>
                    </Link>
                    <SocialLink href={siteConfig.links.github} aria-label="GitHub">
                        <FiGithub size={20} />
                    </SocialLink>
                    <SocialLink href={siteConfig.links.linkedin} aria-label="LinkedIn">
                        <BsLinkedin size={20} />
                    </SocialLink>
                </div>
            </div>
        </footer>
    );
}
