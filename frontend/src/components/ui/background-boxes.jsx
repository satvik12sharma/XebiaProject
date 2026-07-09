import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BoxesCore = ({ className, ...rest }) => {
  // Generate enough rows and cols to cover a 4K screen
  const cols = new Array(40).fill(1); // 40 columns * 96px = 3840px width
  const rows = new Array(30).fill(1); // 30 rows * 96px = 2880px height
  let colors = [
    "#fcd34d", // amber-300
    "#fde047", // yellow-300
    "#f9a8d4", // pink-300
    "#fdba74", // orange-300
    "#fef08a", // yellow-200
    "#fda4af", // rose-300
    "#d8b4fe", // purple-300
    "#7dd3fc", // sky-300
  ];
  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div
      className={cn(
        "absolute inset-0 flex w-full h-full z-0 overflow-hidden", // Removed opacity-30 to let colors pop
        className
      )}
      {...rest}
    >
      {cols.map((_, i) => (
        <div key={`col` + i} className="flex flex-col relative border-l border-orange-200/40">
          {rows.map((_, j) => (
            <motion.div
              whileHover={{
                backgroundColor: getRandomColor(),
                transition: { duration: 0 },
              }}
              animate={{
                transition: { duration: 2 },
              }}
              key={`row` + j}
              className="w-24 h-24 border-b border-orange-200/40 relative"
            >
              {j % 3 === 0 && i % 3 === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="absolute h-6 w-10 -top-[14px] -left-[22px] text-orange-300 stroke-[1px] pointer-events-none"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : null}
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const Boxes = React.memo(BoxesCore);
