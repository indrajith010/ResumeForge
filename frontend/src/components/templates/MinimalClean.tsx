import type { Resume } from "../../types/resume";
import { formatDateRange as formatDate } from "../../lib/resumeFormat";

export default function MinimalClean({ resume }: { resume: Resume }) {
  return (
    <div className="p-6 text-sm leading-relaxed" style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}>
      {/* Header - minimal */}
      <div className="mb-4">
        {resume.full_name && (
          <h1 className="text-lg font-bold text-gray-900">{resume.full_name}</h1>
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-1">
          {resume.job_title && <span>{resume.job_title}</span>}
          {resume.job_title && resume.email && <span className="text-gray-300">|</span>}
          {resume.email && <span>{resume.email}</span>}
          {resume.phone && <span className="text-gray-300">|</span>}
          {resume.phone && <span>{resume.phone}</span>}
          {resume.location && <span className="text-gray-300">|</span>}
          {resume.location && <span>{resume.location}</span>}
          {resume.website && <span className="text-gray-300">|</span>}
          {resume.website && <span>{resume.website}</span>}
          {resume.linkedin && <span className="text-gray-300">|</span>}
          {resume.linkedin && <span>{resume.linkedin}</span>}
        </div>
      </div>
      <hr className="border-gray-200" />

      {/* Summary */}
      {resume.summary && (
        <section className="mt-3 mb-4">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-900 mb-1">Professional Summary</h2>
          <p className="text-gray-600 text-xs whitespace-pre-line">{resume.summary}</p>
        </section>
      )}

      {/* Skills */}
      {resume.skills.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-900 mb-1">Skills</h2>
          <p className="text-gray-600 text-xs">{resume.skills.join(" - ")}</p>
        </section>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-900 mb-1">Experience</h2>
          {resume.experience.map((exp, i) => (
            <div key={i} className="mb-3">
              <p className="font-bold text-gray-900 text-sm">{exp.position}</p>
              <div className="flex flex-wrap gap-x-2 text-xs text-gray-500">
                {exp.company && <span>{exp.company}</span>}
                {exp.start_date && (
                  <span>{formatDate(exp.start_date, exp.end_date)}</span>
                )}
              </div>
              {exp.description && (
                <p className="mt-1 text-gray-600 text-xs whitespace-pre-line">{exp.description}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-900 mb-1">Education</h2>
          {resume.education.map((edu, i) => (
            <div key={i} className="mb-2">
              <p className="font-bold text-gray-900 text-sm">{edu.school}</p>
              <div className="flex flex-wrap gap-x-2 text-xs text-gray-500">
                {(edu.degree || edu.field) && (
                  <span>{edu.degree}{edu.degree && edu.field ? " in " : ""}{edu.field}</span>
                )}
                {edu.start_date && (
                  <span>{formatDate(edu.start_date, edu.end_date)}</span>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {resume.projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-900 mb-1">Projects</h2>
          {resume.projects.map((proj, i) => (
            <div key={i} className="mb-2">
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900 text-sm">{proj.name}</p>
                {proj.url && (
                  <span className="text-xs text-gray-400">{proj.url}</span>
                )}
              </div>
              {proj.description && (
                <p className="mt-1 text-gray-600 text-xs whitespace-pre-line">{proj.description}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Certifications */}
      {resume.certifications.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-900 mb-1">Certifications</h2>
          {resume.certifications.map((cert, i) => (
            <div key={i} className="mb-1">
              <span className="font-bold text-gray-900 text-sm">{cert.name}</span>
              {cert.issuer && (
                <span className="text-gray-500 text-xs ml-2">{cert.issuer}</span>
              )}
              {cert.date && (
                <span className="text-gray-400 text-xs ml-2">{cert.date}</span>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Languages */}
      {resume.languages.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-900 mb-1">Languages</h2>
          <p className="text-gray-600 text-xs">
            {resume.languages.map((l) => `${l.name} (${l.proficiency})`).join(" - ")}
          </p>
        </section>
      )}
    </div>
  );
}
