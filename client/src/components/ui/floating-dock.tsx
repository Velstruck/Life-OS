import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

import { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const FloatingDock = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
}) => {
  const navigate = useNavigate();
  let mouseX = useMotionValue(Infinity);
  
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto flex h-16 items-end gap-2 sm:gap-3 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg px-3 sm:px-4 pb-3 shadow-soft-lg border border-slate-200 dark:border-slate-700",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer 
          mouseX={mouseX} 
          key={item.title} 
          {...item} 
          onClick={() => navigate(item.href)}
        />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  onClick,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
  onClick?: () => void;
}) {
  let ref = useRef<HTMLDivElement>(null);
  const location = useLocation();

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

    return val - bounds.x - bounds.width / 2;
  });

  // Responsive sizes - smaller on mobile, larger on desktop
  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 60, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 60, 40]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 30, 20]);
  let heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 30, 20],
  );

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);
  
  const isActive = href === '/' 
    ? location.pathname === '/' 
    : location.pathname.startsWith(href);

  return (
    <button onClick={onClick} className="cursor-pointer">
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "relative flex aspect-square items-center justify-center rounded-full transition-colors duration-200",
          isActive 
            ? "bg-primary-100 dark:bg-primary-900/50 ring-2 ring-primary-300 dark:ring-primary-700" 
            : "bg-slate-100 dark:bg-slate-700 hover:bg-primary-50 dark:hover:bg-primary-900/30"
        )}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-10 left-1/2 w-fit rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm px-3 py-1.5 text-xs font-medium whitespace-pre text-slate-700 dark:text-slate-300 shadow-md"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className={cn(
            "flex items-center justify-center transition-colors duration-200",
            isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
          )}
        >
          {icon}
        </motion.div>
      </motion.div>
    </button>
  );
}
