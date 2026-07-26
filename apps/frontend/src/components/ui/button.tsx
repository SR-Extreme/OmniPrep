import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-60',
    {
        variants: {
            variant: {
                default:
                    'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-emerald-500/30 active:bg-emerald-800',
                secondary:
                    'border border-zinc-300 bg-white text-zinc-700 shadow-sm hover:border-zinc-400 hover:bg-zinc-50 focus-visible:ring-zinc-400/20 active:bg-zinc-100',
                ghost:
                    'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-zinc-400/20',
                outline:
                    'border border-emerald-600 bg-transparent text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-500/30',
                destructive:
                    'bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:ring-rose-500/30',
            },
            size: {
                default: 'px-4 py-2.5',
                sm: 'px-3 py-2 text-xs',
                lg: 'px-5 py-3 text-base',
                icon: 'h-9 w-9',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    },
);

Button.displayName = 'Button';

export { buttonVariants };