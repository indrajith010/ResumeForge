import { memo } from "react";
import type { Resume } from "../../types/resume";
import { Section } from "./Section";
import { Field } from "./Field";
import { IconUser } from "../icons";

type PersonalField = "full_name" | "job_title" | "email" | "phone" | "location" | "website" | "linkedin";

interface Props {
  resume: Pick<Resume, PersonalField>;
  onChange: (field: PersonalField, value: string) => void;
}

export const PersonalInfoSection = memo(function PersonalInfoSection({ resume, onChange }: Props) {
  return (
    <Section title="Personal Information" icon={IconUser}>
      <div className="space-y-4">
        <Field label="Full Name" value={resume.full_name} onChange={(v) => onChange("full_name", v)} />
        <Field label="Job Title" value={resume.job_title} onChange={(v) => onChange("job_title", v)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email" value={resume.email} onChange={(v) => onChange("email", v)} />
          <Field label="Phone" value={resume.phone} onChange={(v) => onChange("phone", v)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Location" value={resume.location} onChange={(v) => onChange("location", v)} />
          <Field label="Website" value={resume.website} onChange={(v) => onChange("website", v)} />
        </div>
        <Field label="LinkedIn" value={resume.linkedin} onChange={(v) => onChange("linkedin", v)} />
      </div>
    </Section>
  );
});
