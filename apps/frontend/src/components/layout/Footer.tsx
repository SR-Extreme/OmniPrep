import { Github, Linkedin, Mail } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/layout/Logo';
import {
    FOOTER_QUICK_LINKS,
    FOOTER_SUPPORT_LINKS,
} from '@/components/layout/nav-items';

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
        href: 'mailto:support@omniprep.app',
        label: 'Email',
        icon: Mail,
    },
] as const;

export function Footer() {
    return (
        <footer className="w-full border-t border-zinc-200 bg-white">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
                <div className="space-y-4">
                    <Logo size="footer" />
                    <p className="max-w-xs text-sm leading-relaxed text-zinc-500">
                        OmniPrep helps you practice DSA, system design, and behavioral
                        interviews—then run a full mock with AI evaluation and clear
                        next steps.
                    </p>
                </div>

                <div>
                    <h2 className="text-sm font-semibold text-zinc-900">Quick Links</h2>
                    <ul className="mt-4 space-y-2.5">
                        {FOOTER_QUICK_LINKS.map((link) => (
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
                    <h2 className="text-sm font-semibold text-zinc-900">Support</h2>
                    <ul className="mt-4 space-y-2.5">
                        {FOOTER_SUPPORT_LINKS.map((link) => (
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
                    <h2 className="text-sm font-semibold text-zinc-900">Social Links</h2>
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
                    <p>All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}
