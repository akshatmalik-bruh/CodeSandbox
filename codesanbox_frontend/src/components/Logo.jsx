import React from "react";

export const Logo = ({ className = "h-8 w-8", showText = false, textClassName = "" }) => {
  return (
    <div className="flex items-center space-x-2.5 select-none">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} transition-all duration-300 hover:scale-105`}
      >
        {/* outer coding brackets */}
        <path
          d="M30 25L10 50L30 75"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-zinc-600 dark:text-zinc-400"
        />
        <path
          d="M70 25L90 50L70 75"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-zinc-600 dark:text-zinc-400"
        />
        
        {/* inner core sandbox cube with futuristic glowing accents */}
        <path
          d="M50 32L72 43L72 65L50 76L28 65L28 43L50 32Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-indigo-600 dark:text-indigo-400"
        />
        
        {/* cube inside line dividers */}
        <path
          d="M50 32V54M50 54L28 43M50 54L72 43"
          stroke="currentColor"
          strokeWidth="4"
          className="text-indigo-600/70 dark:text-indigo-400/70"
        />
        
        {/* glowing floating node at the center of the sandbox */}
        <circle cx="50" cy="54" r="5" className="fill-indigo-500 animate-pulse" />
      </svg>
      {showText && (
        <span className={`font-mono font-bold tracking-tight text-zinc-900 dark:text-zinc-50 ${textClassName}`}>
          Code<span className="text-indigo-500">Sandbox</span>
        </span>
      )}
    </div>
  );
};
