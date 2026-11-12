'use client';

import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

type Direction = 'up' | 'left' | 'right';

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  className,
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
}) {
  const offset = direction === 'left' ? 34 : direction === 'right' ? -34 : 0;
  const variants: Variants = {
    hidden: { opacity: 0, y: direction === 'up' ? 28 : 0, x: offset, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.68, delay, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12, margin: '0px 0px -48px 0px' }}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
}
