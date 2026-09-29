import { memo } from "react";
import type { Education } from "../../types/resume";
import { Section, RemoveItemButton, EmptyState } from "./Section";
import { Field } from "./Field";
import { IconGraduationCap } from "../icons";

interface Props {
  education: Education[];
  onUpdate: (index: number, field: keyof Education, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export const EducationSection = memo(function EducationSection({ education, onUpdate, onAdd, onRemove }: Props) {
  return (
    <Section title="Education" icon={IconGraduationCap} count={education.length} onAdd={onAdd} addLabel="Add education entry">
      <div className="space-y-4">
        {education.map((edu, i) => (
          <div key={i} className="bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-lg p-4 sm:p-5 space-y-4 relative">
            <RemoveItemButton onClick={() => onRemove(i)} label={`Remove education entry ${i + 1}`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
              <Field label="School" value={edu.school} onChange={(v) => onUpdate(i, "school", v)} />
              <Field label="Degree" value={edu.degree} onChange={(v) => onUpdate(i, "degree", v)} />
            </div>
            <Field label="Field of Study" value={edu.field} onChange={(v) => onUpdate(i, "field", v)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Start Date" value={edu.start_date} onChange={(v) => onUpdate(i, "start_date", v)} />
              <Field label="End Date" value={edu.end_date} onChange={(v) => onUpdate(i, "end_date", v)} />
            </div>
          </div>
        ))}
        {education.length === 0 && <EmptyState label="No education added yet. Click “+ Add” to add a school." />}
      </div>
    </Section>
  );
});
