'use client';

import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface AnimatedCounterProps {
    value: number;
    suffix?: string;
    durationMs?: number;
}

export function AnimatedCounter({
    value,
    suffix = '',
    durationMs = 1400,
}: AnimatedCounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });
    const motionValue = useMotionValue(0);
    const spring = useSpring(motionValue, {
        duration: durationMs,
        bounce: 0,
    });

    useEffect(() => {
        if (inView) {
            motionValue.set(value);
        }
    }, [inView, motionValue, value]);

    useEffect(() => {
        const unsubscribe = spring.on('change', (latest) => {
            if (ref.current) {
                ref.current.textContent = `${Math.round(latest).toLocaleString()}${suffix}`;
            }
        });
        return unsubscribe;
    }, [spring, suffix]);

    return (
        <span ref={ref} className="tabular-nums">
            0{suffix}
        </span>
    );
}
