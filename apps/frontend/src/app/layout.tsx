import type { Metadata } from 'next';
import { AuthSessionProvider } from '@/components/auth/AuthSessionProvider';
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
                <AuthSessionProvider>
                    <AppShell>{children}</AppShell>
                    <ToastViewport />
                </AuthSessionProvider>
            </body>
        </html>
    );
}
