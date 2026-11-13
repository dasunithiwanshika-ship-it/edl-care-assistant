import React from "react";

interface EDLCareLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
}

export const EDLCareLogo: React.FC<EDLCareLogoProps> = ({
  className = "",
  size = "md",
}) => {
  // Height sizing based on prop
  const heightClasses = {
    sm: "h-9 sm:h-10",
    md: "h-12 sm:h-14",
    lg: "h-16 sm:h-20",
  };

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src="/edlcare-logo.png"
        alt="EDLCare - Electricity Distribution Lanka (Pvt) Ltd"
        className={`${heightClasses[size]} w-auto object-contain dark:bg-white/95 dark:p-1.5 dark:rounded-xl`}
      />
    </div>
  );
};
