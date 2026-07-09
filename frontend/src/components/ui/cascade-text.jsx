import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const TextReveal = ({ text, className }) => {
  return (
    <motion.div
      initial="initial"
      whileHover="hovered"
      className={cn("relative block overflow-hidden whitespace-nowrap", className)}
    >
      <div>
        {text.split('').map((char, i) => (
          <motion.span
            variants={{
              initial: { y: 0 },
              hovered: { y: "-100%" }
            }}
            transition={{
              duration: 0.25,
              ease: "easeInOut",
              delay: 0.025 * i,
            }}
            key={i}
            className="inline-block"
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </div>
      <div className="absolute inset-0">
        {text.split('').map((char, i) => (
          <motion.span
            variants={{
              initial: { y: "100%" },
              hovered: { y: 0 }
            }}
            transition={{
              duration: 0.25,
              ease: "easeInOut",
              delay: 0.025 * i,
            }}
            key={i}
            className="inline-block"
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};
