import { useState, useRef } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "motion/react";
import { cn } from "@/lib/utils";

interface MemberTooltipProps {
  members: {
    id: string;
    name: string;
    email?: string;
  }[];
  maxVisible?: number;
}

export const MemberTooltip = ({ members, maxVisible = 5 }: MemberTooltipProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<string | null>(null);
  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);
  const animationFrameRef = useRef<number | null>(null);

  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig,
  );
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig,
  );

  const handleMouseMove = (event: any) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const halfWidth = event.target.offsetWidth / 2;
      x.set(event.nativeEvent.offsetX - halfWidth);
    });
  };

  const visibleMembers = members.slice(0, maxVisible);
  const remainingCount = members.length - maxVisible;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getColorForUser = (id: string) => {
    const colors = [
      'bg-primary-600',
      'bg-success-600',
      'bg-purple-600',
      'bg-pink-600',
      'bg-orange-600',
      'bg-teal-600',
      'bg-indigo-600',
      'bg-rose-600',
    ];
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div className="flex items-center">
      {visibleMembers.map((member) => (
        <div
          className="group relative -mr-3"
          key={member.id}
          onMouseEnter={() => setHoveredIndex(member.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === member.id && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: "nowrap",
                }}
                className="absolute -top-14 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-100 px-4 py-2 shadow-xl border border-slate-700 dark:border-slate-300"
              >
                <div className="absolute inset-x-10 -bottom-px z-30 h-px w-[20%] bg-gradient-to-r from-transparent via-primary-500 to-transparent" />
                <div className="absolute -bottom-px left-10 z-30 h-px w-[40%] bg-gradient-to-r from-transparent via-success-500 to-transparent" />
                <div className="relative z-30 text-sm font-bold text-white dark:text-slate-900">
                  {member.name}
                </div>
                {member.email && (
                  <div className="text-xs text-slate-300 dark:text-slate-600">{member.email}</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div
            onMouseMove={handleMouseMove}
            className={cn(
              "relative h-12 w-12 rounded-full border-2 border-white dark:border-slate-800 text-white flex items-center justify-center font-semibold text-sm transition duration-300 group-hover:z-30 group-hover:scale-110 shadow-md cursor-pointer",
              getColorForUser(member.id)
            )}
          >
            {getInitials(member.name)}
          </div>
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div className="relative -mr-3 h-12 w-12 rounded-full border-2 border-white dark:border-slate-800 bg-slate-600 dark:bg-slate-700 text-white flex items-center justify-center font-semibold text-sm shadow-md">
          +{remainingCount}
        </div>
      )}
    </div>
  );
};
