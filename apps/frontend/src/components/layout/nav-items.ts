export const NAV_ITEMS = [
    { href: '/', label: 'Home' },
    { href: '/problems', label: 'DSA' },
    { href: '/system-design', label: 'System Design' },
    { href: '/behavioral', label: 'Behavioral' },
    { href: '/mock-interview', label: 'Mock Interview' },
] as const;

export const FOOTER_QUICK_LINKS = NAV_ITEMS;

export const FOOTER_SUPPORT_LINKS = [
    { href: '/#contact', label: 'Contact Us' },
    { href: '/#privacy', label: 'Privacy Policy' },
    { href: '/#terms', label: 'Terms & Conditions' },
    { href: '/#faq', label: 'FAQ' },
] as const;
