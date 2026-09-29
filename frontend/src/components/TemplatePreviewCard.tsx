import type { TemplateMeta } from "../types/template";
import type { Resume } from "../types/resume";
import ClassicAts from "./templates/ClassicAts";
import ModernProfessional from "./templates/ModernProfessional";
import MinimalClean from "./templates/MinimalClean";

const COMPONENTS = { classic: ClassicAts, modern: ModernProfessional, minimal: MinimalClean };

// One shared, fixed-height "page window" (PREVIEW_HEIGHT_CLASSES below) is
// used for every template, with no per-template branching: each resume is
// rendered at its natural width, shrunk by PREVIEW_SCALE, and anchored to
// the top-left of that window. Giving it a percentage width of
// 100/PREVIEW_SCALE means the scaled-down result always fills exactly 100%
// of the window's width, regardless of the window's actual pixel width, so
// this never depends on guessing a fixed page width.
//
// Because the window height is fixed and identical for all three templates,
// a shorter template (e.g. Minimal Clean) simply leaves neutral space below
// its content inside that same window — it never changes the window's size,
// so the title/badge/description/button block below it (a separate flex
// sibling) never shifts. A longer template is cropped by the window's
// overflow-hidden instead, softened by the bottom fade.
// Minimal Clean's real design is intentionally more compact than the other
// two (no section dividers, single-line skills/languages, tighter entry
// rows), so it renders shorter at any shared height. The window height is
// picked to hug that shortest template closely rather than the tallest, so
// no template is left with a large empty tail; Classic ATS and Modern
// Professional simply crop a little more, softened by the fade below.
const PREVIEW_HEIGHT_CLASSES = "h-56 sm:h-64 lg:h-72";
const PREVIEW_SCALE = 0.46;
const PREVIEW_INNER_WIDTH_PERCENT = 100 / PREVIEW_SCALE;

interface Props {
  template: TemplateMeta;
  resume: Resume;
  onUse: () => void;
  busy?: boolean;
}

export function TemplatePreviewCard({ template, resume, onUse, busy }: Props) {
  const TemplateComponent = COMPONENTS[template.id];

  return (
    <div
      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 border-t-4 ${template.accentBorderClass} rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full`}
    >
      {/* Decorative thumbnail: the template name/description text beside it already
          conveys the same information to assistive tech, so the rendered miniature
          (which duplicates an <h1> per template) is hidden from the a11y tree. */}
      <div
        className={`relative w-full ${PREVIEW_HEIGHT_CLASSES} overflow-hidden bg-gray-100 dark:bg-gray-800`}
        aria-hidden="true"
      >
        <div
          className="absolute top-0 left-0 origin-top-left bg-white shadow-md text-black"
          style={{ width: `${PREVIEW_INNER_WIDTH_PERCENT}%`, transform: `scale(${PREVIEW_SCALE})` }}
        >
          <TemplateComponent resume={resume} />
        </div>
        {/* Subtle fade so a longer template's crop reads as an intentional peek
            rather than a hard cut-off. Harmless no-op over a shorter template's
            neutral space, since the gradient starts and ends on the same gray. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-linear-to-t from-gray-100 dark:from-gray-800 to-transparent" />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
        </div>
        <span className={`self-start text-[11px] font-medium px-2 py-0.5 rounded-full mb-3 ${template.accentBadgeClass}`}>
          {template.tag}
        </span>
        <p className="text-sm text-gray-500 dark:text-gray-400 flex-1">{template.description}</p>
        <button
          type="button"
          onClick={onUse}
          disabled={busy}
          className="mt-5 w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {busy ? "Creating..." : "Use this template"}
        </button>
      </div>
    </div>
  );
}
