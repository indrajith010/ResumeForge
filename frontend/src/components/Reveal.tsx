import type { ReactNode } from "react";
import { useInView } from "../lib/useInView";

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section";
}

/** Fades and slides content up once it scrolls into view. */
export function Reveal({ children, delay = 0, className = "", as = "div" }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const Tag = as;
  return (
    <Tag
      ref={ref as never}
      className={`${inView ? "rf-animate-in" : "opacity-0"} ${className}`}
      style={inView ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
