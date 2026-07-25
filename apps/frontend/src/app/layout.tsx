import type { Metadata } from 'next';
import { ToastViewport } from '@/components/ui/Toast';
import './globals.css';

export const metadata: Metadata = {
    title: 'OmniPrep',
    description: 'AI Interview Preparation Platform',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                {children}
                <ToastViewport />
            </body>
        </html>
    );
}