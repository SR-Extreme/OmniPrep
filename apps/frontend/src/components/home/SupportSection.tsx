'use client';

import { motion } from 'framer-motion';

const SUPPORT_ITEMS = [
    {
        id: 'contact',
        title: 'Contact',
        body: 'Reach us at support@omniprep.app for product questions, billing help, or feedback.',
    },
    {
        id: 'privacy',
        title: 'Privacy Policy',
        body: 'We protect your account data and only use interview content to power your practice experience.',
    },
    {
        id: 'terms',
        title: 'Terms',
        body: 'By using OmniPrep you agree to use the platform for personal interview preparation and respect fair-use limits.',
    },
    {
        id: 'faq',
        title: 'FAQ',
        body: 'Start with DSA or system design for free practice. Full mock interviews require Premium and include AI reports.',
    },
] as const;

export function SupportSection() {
    return (
        <section className="border-t border-zinc-200/80 bg-white py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-10 max-w-2xl text-center">
                    <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                        Support
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-500 sm:text-base">
                        Quick answers and ways to get help when you need them.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {SUPPORT_ITEMS.map((item, index) => (
                        <motion.article
                            key={item.id}
                            id={item.id}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.35, delay: index * 0.05 }}
                            className="scroll-mt-28 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6 shadow-soft"
                        >
                            <h3 className="text-base font-semibold text-zinc-900">
                                {item.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                                {item.body}
                            </p>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
