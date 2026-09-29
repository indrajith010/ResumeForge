import { type TemplateId, TEMPLATES } from "../types/template";

export default function TemplateSelector({
  selected,
  onSelect,
}: {
  selected: TemplateId;
  onSelect: (id: TemplateId) => void;
}) {
  return (
    <div className="flex gap-2">
      {TEMPLATES.map((t) => (
        <button
          key={t.id}
          type="button"
          aria-pressed={selected === t.id}
          title={t.description}
          onClick={() => onSelect(t.id)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            selected === t.id
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          {t.name}
        </button>
      ))}
    </div>
  );
}
