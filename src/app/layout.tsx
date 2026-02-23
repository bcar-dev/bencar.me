import type { Metadata } from 'next';
import { ViewTransitions } from 'next-view-transitions';
import { ThemeProvider } from 'next-themes';

import '../styles/globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { TransitionReset } from '@/components/ui/TransitionReset';

import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
    metadataBase: new URL(siteConfig.url),
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    authors: [{ name: siteConfig.author.name }],
    creator: siteConfig.author.name,
    openGraph: {
        title: siteConfig.name,
        description: siteConfig.description,
        url: siteConfig.url,
        siteName: siteConfig.name,
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: siteConfig.name,
        description: siteConfig.description,
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ViewTransitions>
            <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
                <body className="flex min-h-screen flex-col bg-background font-mono text-foreground">
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                        <TransitionReset />
                        <div className="mx-auto w-full max-w-4xl px-4 flex flex-col min-h-screen">
                            <Header />
                            <main className="flex-1 w-full flex flex-col items-center">
                                {children}
                            </main>
                            <Footer />
                        </div>
                    </ThemeProvider>
                </body>
            </html>
        </ViewTransitions>
    );
}
