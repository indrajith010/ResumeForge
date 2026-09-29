import type { Resume } from "../../types/resume";
import { formatDateRange as formatDate } from "../../lib/resumeFormat";

export default function ModernProfessional({ resume }: { resume: Resume }) {
  return (
    <div className="text-sm leading-relaxed" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header with blue accent background */}
      <div className="bg-blue-50 px-6 py-5">
        {resume.full_name && (
          <h1 className="text-2xl font-bold text-blue-900">{resume.full_name}</h1>
        )}
        {resume.job_title && (
          <p className="text-sm text-blue-600 font-medium mt-0.5">{resume.job_title}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
          {resume.email && <span>{resume.email}</span>}
          {resume.phone && <span>{resume.phone}</span>}
          {resume.location && <span>{resume.location}</span>}
          {resume.website && <span>{resume.website}</span>}
          {resume.linkedin && <span>{resume.linkedin}</span>}
        </div>
      </div>

      <div className="px-6 py-4">
        {/* Summary */}
        {resume.summary && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">
              Professional Summary
            </h2>
            <div className="w-10 h-0.5 bg-blue-600 mb-2" />
            <p className="text-gray-700 whitespace-pre-line">{resume.summary}</p>
          </section>
        )}

        {/* Skills - inline */}
        {resume.skills.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">Skills</h2>
            <div className="w-10 h-0.5 bg-blue-600 mb-2" />
            <p className="text-gray-700 text-xs">
              {resume.skills.join("  \u00b7  ")}
            </p>
          </section>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">Experience</h2>
            <div className="w-10 h-0.5 bg-blue-600 mb-2" />
            {resume.experience.map((exp, i) => (
              <div key={i} className="mb-3">
                <p className="font-bold text-blue-900 text-sm">{exp.position}</p>
                {exp.company && (
                  <p className="italic text-gray-500 text-xs">{exp.company}</p>
                )}
                {exp.start_date && (
                  <p className="text-xs text-blue-600 font-medium">
                    {formatDate(exp.start_date, exp.end_date)}
                  </p>
                )}
                {exp.description && (
                  <p className="mt-1 text-gray-700 text-xs whitespace-pre-line">{exp.description}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">Education</h2>
            <div className="w-10 h-0.5 bg-blue-600 mb-2" />
            {resume.education.map((edu, i) => (
              <div key={i} className="mb-2">
                <p className="font-bold text-blue-900 text-sm">{edu.school}</p>
                {(edu.degree || edu.field) && (
                  <p className="italic text-gray-500 text-xs">
                    {edu.degree}{edu.degree && edu.field ? " in " : ""}{edu.field}
                  </p>
                )}
                {edu.start_date && (
                  <p className="text-xs text-blue-600 font-medium">
                    {formatDate(edu.start_date, edu.end_date)}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">Projects</h2>
            <div className="w-10 h-0.5 bg-blue-600 mb-2" />
            {resume.projects.map((proj, i) => (
              <div key={i} className="mb-2">
                <p className="font-bold text-blue-900 text-sm">{proj.name}</p>
                {proj.url && (
                  <p className="text-xs text-blue-500">{proj.url}</p>
                )}
                {proj.description && (
                  <p className="mt-1 text-gray-700 text-xs whitespace-pre-line">{proj.description}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Certifications */}
        {resume.certifications.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">Certifications</h2>
            <div className="w-10 h-0.5 bg-blue-600 mb-2" />
            {resume.certifications.map((cert, i) => (
              <div key={i} className="mb-1">
                <span className="font-bold text-blue-900 text-sm">{cert.name}</span>
                {cert.issuer && (
                  <span className="italic text-gray-500 text-xs ml-2">{cert.issuer}</span>
                )}
                {cert.date && (
                  <span className="text-xs text-blue-600 ml-2">{cert.date}</span>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Languages */}
        {resume.languages.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">Languages</h2>
            <div className="w-10 h-0.5 bg-blue-600 mb-2" />
            <p className="text-gray-700 text-xs">
              {resume.languages.map((l) => `${l.name} (${l.proficiency})`).join("  \u00b7  ")}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
