import { Github, Linkedin, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ADMIN_FOOTER_QUICK_LINKS } from '@/components/admin/admin-nav-items';

const SOCIAL_LINKS = [
    {
        href: 'https://github.com',
        label: 'GitHub',
        icon: Github,
    },
    {
        href: 'https://linkedin.com',
        label: 'LinkedIn',
        icon: Linkedin,
    },
    {
        href: 'mailto:omniprep2004@gmail.com',
        label: 'Email',
        icon: Mail,
    },
] as const;

export function AdminFooter() {
    return (
        <footer className="w-full border-t border-zinc-200 bg-white">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
                <div className="space-y-4 lg:col-span-2">
                    <Link
                        href="/admin"
                        className="inline-flex shrink-0 items-center transition-opacity hover:opacity-90"
                        aria-label="OmniPrep Admin home"
                    >
                        <Image
                            src="/logo.png"
                            alt="OmniPrep"
                            width={220}
                            height={64}
                            className="h-11 w-auto max-w-[min(55vw,220px)] object-contain object-left sm:h-12"
                        />
                    </Link>
                    <p className="max-w-xs text-sm leading-relaxed text-zinc-500">
                        OmniPrep Admin Portal for managing the interview preparation platform.
                    </p>
                </div>

                <div>
                    <h2 className="text-sm font-semibold text-zinc-900">Quick Links</h2>
                    <ul className="mt-4 space-y-2.5">
                        {ADMIN_FOOTER_QUICK_LINKS.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="text-sm text-zinc-500 transition hover:text-emerald-600"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h2 className="text-sm font-semibold text-zinc-900">Stay Connected</h2>
                    <ul className="mt-4 space-y-2.5">
                        {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                            <li key={label}>
                                <a
                                    href={href}
                                    target={href.startsWith('mailto:') ? undefined : '_blank'}
                                    rel={
                                        href.startsWith('mailto:')
                                            ? undefined
                                            : 'noopener noreferrer'
                                    }
                                    className="inline-flex items-center gap-2.5 text-sm text-zinc-500 transition hover:text-emerald-600"
                                >
                                    <Icon className="h-4 w-4" aria-hidden="true" />
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="border-t border-zinc-100">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs text-zinc-400 sm:flex-row sm:px-6 sm:text-left lg:px-8">
                    <p>© 2026 OmniPrep</p>
                    <p>Admin Dashboard</p>
                    <p>All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}
