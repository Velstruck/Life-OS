import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export const NameFlip = ({ name }: { name: string }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShow(false);
      setTimeout(() => setShow(true), 500);
    }, 3000); // Flip every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-[3rem] flex items-center">
      <AnimatePresence mode="wait">
        {show && (
          <motion.h1
            key="name"
            initial={{ y: -40, opacity: 0, filter: "blur(10px)" }}
            animate={{
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
            }}
            exit={{ y: 40, opacity: 0, filter: "blur(10px)" }}
            transition={{
              duration: 0.4,
              ease: "easeInOut",
            }}
            className="text-4xl font-bold bg-gradient-to-r from-primary-600 via-purple-600 to-indigo-600 dark:from-primary-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent inline-block"
          >
            {name}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};
