'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { FiMenu, FiX, FiSearch } from 'react-icons/fi';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { siteConfig } from '@/config/site';

export default function Navigation() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    return (
        <nav className="flex w-full flex-col items-center sm:ml-2 sm:flex-row sm:justify-end sm:space-x-4 sm:py-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="self-end p-2 sm:hidden hover:text-accent transition-colors"
                aria-label="Toggle Menu"
            >
                {isOpen ? <FiX /> : <FiMenu />}
            </button>
            <ul
                className={`absolute top-full right-0 z-50 bg-background border border-border/50 p-4 shadow-lg rounded-b-lg sm:static sm:z-auto sm:border-none sm:bg-transparent sm:p-0 sm:shadow-none sm:rounded-none mt-4 grid w-full max-w-[200px] grid-cols-2 place-content-center gap-2 [&>li>a]:block [&>li>a]:px-4 [&>li>a]:py-3 [&>li>a]:text-center [&>li>a]:font-medium [&>li>a]:text-lg [&>li>a:hover]:text-accent sm:[&>li>a]:px-2 sm:[&>li>a]:py-1 sm:[&>li>a]:text-lg sm:mt-0 sm:ml-0 sm:flex sm:items-center sm:max-w-none sm:w-auto sm:gap-x-4 sm:gap-y-0 sm:-mr-2 ${
                    isOpen ? 'flex' : 'hidden sm:flex'
                }`}
            >
                {siteConfig.nav.map((item) => (
                    <li key={item.href} className="col-span-2 sm:col-span-1 flex items-center">
                        <Link
                            href={item.href}
                            className={
                                isActive(item.href)
                                    ? 'underline decoration-double decoration-2 underline-offset-4'
                                    : ''
                            }
                        >
                            {item.title}
                        </Link>
                    </li>
                ))}
                <li className="col-span-1 flex items-center justify-center">
                    <Link href="/search" className="p-2 hover:text-accent" aria-label="Search">
                        <FiSearch size={20} />
                    </Link>
                </li>
                <li className="col-span-1 flex items-center justify-center">
                    <ThemeToggle />
                </li>
            </ul>
        </nav>
    );
}
