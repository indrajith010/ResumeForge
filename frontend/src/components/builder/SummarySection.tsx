import { memo } from "react";
import { Section } from "./Section";
import { FieldTextArea } from "./Field";
import { IconAlignLeft } from "../icons";

interface Props {
  summary: string;
  onChange: (value: string) => void;
}

export const SummarySection = memo(function SummarySection({ summary, onChange }: Props) {
  return (
    <Section title="Professional Summary" icon={IconAlignLeft}>
      <FieldTextArea
        label="Professional summary"
        value={summary}
        onChange={onChange}
        rows={4}
        placeholder="Write a brief professional summary — 2 to 4 sentences highlighting your experience and strengths..."
      />
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-right">{summary.length} characters</p>
    </Section>
  );
});
