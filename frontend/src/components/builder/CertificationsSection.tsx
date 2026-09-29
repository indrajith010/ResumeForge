import { memo } from "react";
import type { Certification } from "../../types/resume";
import { Section, RemoveItemButton, EmptyState } from "./Section";
import { Field } from "./Field";
import { IconAward } from "../icons";

interface Props {
  certifications: Certification[];
  onUpdate: (index: number, field: keyof Certification, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export const CertificationsSection = memo(function CertificationsSection({
  certifications,
  onUpdate,
  onAdd,
  onRemove,
}: Props) {
  return (
    <Section title="Certifications" icon={IconAward} count={certifications.length} onAdd={onAdd} addLabel="Add certification entry">
      <div className="space-y-4">
        {certifications.map((cert, i) => (
          <div key={i} className="bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-lg p-4 sm:p-5 space-y-4 relative">
            <RemoveItemButton onClick={() => onRemove(i)} label={`Remove certification entry ${i + 1}`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
              <Field label="Certification Name" value={cert.name} onChange={(v) => onUpdate(i, "name", v)} />
              <Field label="Issuer" value={cert.issuer} onChange={(v) => onUpdate(i, "issuer", v)} />
            </div>
            <Field label="Date" value={cert.date} onChange={(v) => onUpdate(i, "date", v)} />
          </div>
        ))}
        {certifications.length === 0 && <EmptyState label="No certifications added yet." />}
      </div>
    </Section>
  );
});
