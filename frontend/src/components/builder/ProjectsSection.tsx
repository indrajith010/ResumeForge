import { memo } from "react";
import type { Project } from "../../types/resume";
import { Section, RemoveItemButton, EmptyState } from "./Section";
import { Field, FieldTextArea } from "./Field";
import { IconFolder } from "../icons";

interface Props {
  projects: Project[];
  onUpdate: (index: number, field: keyof Project, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export const ProjectsSection = memo(function ProjectsSection({ projects, onUpdate, onAdd, onRemove }: Props) {
  return (
    <Section title="Projects" icon={IconFolder} count={projects.length} onAdd={onAdd} addLabel="Add project entry">
      <div className="space-y-4">
        {projects.map((proj, i) => (
          <div key={i} className="bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-lg p-4 sm:p-5 space-y-4 relative">
            <RemoveItemButton onClick={() => onRemove(i)} label={`Remove project entry ${i + 1}`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
              <Field label="Project Name" value={proj.name} onChange={(v) => onUpdate(i, "name", v)} />
              <Field label="URL" value={proj.url} onChange={(v) => onUpdate(i, "url", v)} />
            </div>
            <FieldTextArea
              label={`Description for ${proj.name || `project entry ${i + 1}`}`}
              value={proj.description}
              onChange={(v) => onUpdate(i, "description", v)}
              rows={2}
              placeholder="Describe the project..."
            />
          </div>
        ))}
        {projects.length === 0 && <EmptyState label="No projects added yet. Click “+ Add” to showcase your work." />}
      </div>
    </Section>
  );
});
