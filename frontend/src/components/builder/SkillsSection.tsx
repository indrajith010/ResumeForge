import { memo, useId, useState } from "react";
import { Section, EmptyState } from "./Section";
import { IconList } from "../icons";

interface Props {
  skills: string[];
  onAdd: (skill: string) => void;
  onRemove: (index: number) => void;
}

export const SkillsSection = memo(function SkillsSection({ skills, onAdd, onRemove }: Props) {
  const inputId = useId();
  const [skillInput, setSkillInput] = useState("");

  function submit() {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setSkillInput("");
  }

  return (
    <Section title="Skills" icon={IconList} count={skills.length}>
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((skill, i) => (
            <span key={i} className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 pl-3 pr-2 py-1 rounded-full text-sm flex items-center gap-1.5">
              {skill}
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label={`Remove skill ${skill}`}
                className="flex items-center justify-center w-4 h-4 text-blue-400 dark:text-blue-500 hover:text-white hover:bg-blue-500 dark:hover:bg-blue-500 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div className="mb-4">
          <EmptyState label="No skills added yet — add the ones most relevant to the job you're targeting." />
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-2">
        <label htmlFor={inputId} className="sr-only">Add a skill</label>
        <input
          id={inputId}
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submit())}
          className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Add a skill..."
        />
        <button
          type="button"
          onClick={submit}
          className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Add
        </button>
      </div>
    </Section>
  );
});
