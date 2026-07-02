import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");

export function HyperText({
  text,
  duration = 800,
  framerProps = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 3 },
  },
  className,
  animateOnLoad = false,
}) {
  const [displayText, setDisplayText] = useState(text.split(""));
  const [trigger, setTrigger] = useState(animateOnLoad);
  const iterations = useRef(0);
  const isFirstRender = useRef(true);

  const triggerAnimation = () => {
    iterations.current = 0;
    setTrigger(true);
  };

  useEffect(() => {
    if (isFirstRender.current && !animateOnLoad) {
      isFirstRender.current = false;
      return;
    }
    
    // Auto-trigger on hover if we set trigger to true
    if (!trigger) return;

    const interval = setInterval(() => {
      if (iterations.current < text.length) {
        setDisplayText((t) =>
          t.map((l, i) =>
            l === " "
              ? l
              : i <= iterations.current
                ? text[i]
                : alphabets[Math.floor(Math.random() * alphabets.length)]
          )
        );
        iterations.current = iterations.current + 0.3;
      } else {
        setTrigger(false);
        clearInterval(interval);
      }
    }, duration / (text.length * 10));
    
    return () => clearInterval(interval);
  }, [text, duration, trigger, animateOnLoad]);

  return (
    <div
      className="flex items-center overflow-hidden"
      onMouseEnter={triggerAnimation}
    >
      {displayText.map((letter, i) => (
        <motion.span
          key={i}
          className={cn(className, letter === " " ? "w-1" : "")}
          {...framerProps}
        >
          {letter}
        </motion.span>
      ))}
    </div>
  );
}
