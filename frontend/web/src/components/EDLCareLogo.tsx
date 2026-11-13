import React from "react";

interface EDLCareLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
}

export const EDLCareLogo: React.FC<EDLCareLogoProps> = ({
  className = "",
  size = "md",
  showSubtitle = true,
}) => {
  const isLarge = size === "lg";
  const isSmall = size === "sm";

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="flex items-center gap-1.5 leading-none">
        {/* EDL with Solar Wheel in D */}
        <span
          className={`font-black tracking-tight text-[#6c002c] dark:text-[#f87171] ${
            isLarge ? "text-4xl sm:text-5xl" : isSmall ? "text-xl" : "text-2xl sm:text-3xl"
          }`}
          style={{ fontFamily: "'Manrope', 'Lato', sans-serif" }}
        >
          E
          <span className="relative inline-block">
            D
            <span
              className="absolute top-1/2 left-[48%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#F8BB15] flex items-center justify-center"
              style={{
                width: isLarge ? "18px" : isSmall ? "10px" : "13px",
                height: isLarge ? "18px" : isSmall ? "10px" : "13px",
                backgroundColor: "#F8BB15",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6c002c"
                strokeWidth="3"
                className="w-full h-full p-0.5"
              >
                <circle cx="12" cy="12" r="3" fill="#6c002c" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1l2.1-2.1M17 7l2.1-2.1" />
              </svg>
            </span>
          </span>
          L
        </span>

        {/* Care */}
        <span
          className={`font-light tracking-tight text-[#6c002c] dark:text-[#fca5a5] ${
            isLarge ? "text-4xl sm:text-5xl" : isSmall ? "text-xl" : "text-2xl sm:text-3xl"
          }`}
          style={{ fontFamily: "'Lato', sans-serif" }}
        >
          Care
        </span>
      </div>

      {showSubtitle && (
        <span
          className={`font-semibold tracking-wide text-slate-500 dark:text-slate-400 mt-1 ${
            isLarge ? "text-xs sm:text-sm" : isSmall ? "text-[9px]" : "text-[10px] sm:text-xs"
          }`}
        >
          Electricity Distribution Lanka (Pvt) Ltd
        </span>
      )}
    </div>
  );
};
