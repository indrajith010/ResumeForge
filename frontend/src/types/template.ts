export type TemplateId = "classic" | "modern" | "minimal";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  /** Short, punchy tag shown on the preview card to make the style scannable at a glance. */
  tag: string;
  /** Tailwind classes for the card's accent border/badge, distinct per template. */
  accentBorderClass: string;
  accentBadgeClass: string;
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "classic",
    name: "Classic ATS",
    description: "A traditional, single-column layout with serif type — built for maximum ATS compatibility.",
    tag: "Traditional & safe",
    accentBorderClass: "border-t-gray-900 dark:border-t-gray-100",
    accentBadgeClass: "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900",
  },
  {
    id: "modern",
    name: "Modern Professional",
    description: "A blue accent header and clean section dividers for a contemporary, confident look.",
    tag: "Bold & contemporary",
    accentBorderClass: "border-t-blue-600 dark:border-t-blue-500",
    accentBadgeClass: "bg-blue-600 text-white",
  },
  {
    id: "minimal",
    name: "Minimal Clean",
    description: "Simple, elegant typography with generous whitespace — content does the talking.",
    tag: "Understated & elegant",
    accentBorderClass: "border-t-gray-400 dark:border-t-gray-500",
    accentBadgeClass: "bg-gray-500 text-white",
  },
];
