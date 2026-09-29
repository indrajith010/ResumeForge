import { memo } from "react";
import type { Language } from "../../types/resume";
import { Section, RemoveItemButton, EmptyState } from "./Section";
import { Field } from "./Field";
import { IconGlobe } from "../icons";

interface Props {
  languages: Language[];
  onUpdate: (index: number, field: keyof Language, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export const LanguagesSection = memo(function LanguagesSection({ languages, onUpdate, onAdd, onRemove }: Props) {
  return (
    <Section title="Languages" icon={IconGlobe} count={languages.length} onAdd={onAdd} addLabel="Add language entry">
      <div className="space-y-4">
        {languages.map((lang, i) => (
          <div key={i} className="bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-lg p-4 sm:p-5 relative">
            <RemoveItemButton onClick={() => onRemove(i)} label={`Remove language entry ${i + 1}`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
              <Field label="Language" value={lang.name} onChange={(v) => onUpdate(i, "name", v)} />
              <Field label="Proficiency" value={lang.proficiency} onChange={(v) => onUpdate(i, "proficiency", v)} />
            </div>
          </div>
        ))}
        {languages.length === 0 && <EmptyState label="No languages added yet." />}
      </div>
    </Section>
  );
});
