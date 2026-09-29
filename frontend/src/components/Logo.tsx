interface Props {
  className?: string;
  showWordmark?: boolean;
  size?: number;
}

/**
 * ResumeForge brand mark: a document silhouette with a folded corner and an
 * upward "career growth" chevron/spark cut into it, in the brand blue.
 */
export function Logo({ className = "", showWordmark = true, size = 28 }: Props) {
  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect x="1" y="1" width="30" height="30" rx="8" className="fill-blue-600 dark:fill-blue-500" />
        <path
          d="M10 8.5C10 7.67157 10.6716 7 11.5 7H18L23 12V23.5C23 24.3284 22.3284 25 21.5 25H11.5C10.6716 25 10 24.3284 10 23.5V8.5Z"
          fill="white"
          fillOpacity="0.95"
        />
        <path d="M18 7L23 12H19C18.4477 12 18 11.5523 18 11V7Z" fill="white" fillOpacity="0.6" />
        <path
          d="M12.75 20L15.25 16.5L17.25 18.75L20.25 14.5"
          stroke="#2563eb"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showWordmark && (
        <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
          Resume<span className="text-blue-600 dark:text-blue-400">Forge</span>
        </span>
      )}
    </span>
  );
}
