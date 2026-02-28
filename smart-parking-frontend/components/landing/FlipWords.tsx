"use client";
import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const FlipWords = ({
  words,
  duration = 1700,
  className,
  style,
}: {
  words: string[];
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const [currentWord, setCurrentWord] = useState(words[0]);

  const startAnimation = useCallback(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i === words.length) {
        i = 0;
      }
      setCurrentWord(words[i]);
    }, duration);
    return () => clearInterval(interval);
  }, [words, duration]);

  useEffect(() => {
    const unmount = startAnimation();
    return () => unmount();
  }, [startAnimation]);

  // Find the longest word to maintain container width
  const longestWord = words.reduce((a, b) => (a.length > b.length ? a : b), "");

  return (
    <div className={cn("relative inline-block text-left", className)} style={style}>
      {/* Invisible placeholder maintains the width of the longest word */}
      <span className="opacity-0 px-2 select-none pointer-events-none">{longestWord}</span>

      {/* Absolute container handles the flip animation without shifting layout */}
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-start">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentWord}
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -10,
              x: 40,
              filter: "blur(8px)",
              scale: 2,
            }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 10,
            }}
            className="inline-block relative z-10 px-2"
          >
        {currentWord.split("").map((letter, index) => (
          <motion.span
            key={currentWord + index}
            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              delay: index * 0.08,
              duration: 0.4,
            }}
            className="inline-block"
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
