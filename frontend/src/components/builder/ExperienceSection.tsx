import { memo } from "react";
import type { Experience } from "../../types/resume";
import { Section, RemoveItemButton, EmptyState } from "./Section";
import { Field, FieldTextArea } from "./Field";
import { IconBriefcase } from "../icons";

interface Props {
  experience: Experience[];
  onUpdate: (index: number, field: keyof Experience, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export const ExperienceSection = memo(function ExperienceSection({ experience, onUpdate, onAdd, onRemove }: Props) {
  return (
    <Section title="Experience" icon={IconBriefcase} count={experience.length} onAdd={onAdd} addLabel="Add experience entry">
      <div className="space-y-4">
        {experience.map((exp, i) => (
          <div key={i} className="bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-lg p-4 sm:p-5 space-y-4 relative">
            <RemoveItemButton onClick={() => onRemove(i)} label={`Remove experience entry ${i + 1}`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
              <Field label="Company" value={exp.company} onChange={(v) => onUpdate(i, "company", v)} />
              <Field label="Position" value={exp.position} onChange={(v) => onUpdate(i, "position", v)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Start Date" value={exp.start_date} onChange={(v) => onUpdate(i, "start_date", v)} />
              <Field label="End Date" value={exp.end_date} onChange={(v) => onUpdate(i, "end_date", v)} />
            </div>
            <FieldTextArea
              label={`Description for ${exp.position || `experience entry ${i + 1}`}`}
              value={exp.description}
              onChange={(v) => onUpdate(i, "description", v)}
              rows={3}
              placeholder="Describe your role and achievements..."
            />
          </div>
        ))}
        {experience.length === 0 && <EmptyState label="No experience added yet. Click “+ Add” to add your first role." />}
      </div>
    </Section>
  );
});
