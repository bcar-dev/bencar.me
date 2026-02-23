export default function SocialLink({
    href,
    'aria-label': ariaLabel,
    className,
    children,
}: {
    href: string;
    'aria-label': string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ariaLabel}
            className={`hover:text-accent transition-all duration-500 ease-in-out inline-block hover:rotate-15 ${className || ''}`}
        >
            {children}
        </a>
    );
}
