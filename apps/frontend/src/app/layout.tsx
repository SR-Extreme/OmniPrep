import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';
import { ToastViewport } from '@/components/ui/Toast';
import './globals.css';

export const metadata: Metadata = {
    title: 'OmniPrep',
    description: 'AI Interview Preparation Platform',
    icons: {
        icon: '/logo.png',
        shortcut: '/logo.png',
        apple: '/logo.png',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="overflow-x-hidden">
                <AppShell>{children}</AppShell>
                <ToastViewport />
            </body>
        </html>
    );
}
