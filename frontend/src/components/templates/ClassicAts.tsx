import type { Resume } from "../../types/resume";
import { formatDateRange as formatDate } from "../../lib/resumeFormat";

export default function ClassicAts({ resume }: { resume: Resume }) {
  return (
    <div className="p-6 text-sm leading-relaxed" style={{ fontFamily: "Georgia, serif" }}>
      {/* Header */}
      <div className="mb-3">
        {resume.full_name && (
          <h1 className="text-xl font-bold text-gray-900">{resume.full_name}</h1>
        )}
        {resume.job_title && (
          <p className="text-sm text-gray-500">{resume.job_title}</p>
        )}
        <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-gray-500">
          {resume.email && <span>{resume.email}</span>}
          {resume.phone && <span>{resume.phone}</span>}
          {resume.location && <span>{resume.location}</span>}
          {resume.website && <span>{resume.website}</span>}
          {resume.linkedin && <span>{resume.linkedin}</span>}
        </div>
      </div>
      <hr className="border-gray-300 my-3" />

      {/* Summary */}
      {resume.summary && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-1">Professional Summary</h2>
          <hr className="border-gray-300 mb-2" />
          <p className="text-gray-700 whitespace-pre-line">{resume.summary}</p>
        </section>
      )}

      {/* Skills */}
      {resume.skills.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-1">Skills</h2>
          <hr className="border-gray-300 mb-2" />
          <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-700">
            {resume.skills.map((s, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-2">-</span>{s}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-1">Experience</h2>
          <hr className="border-gray-300 mb-2" />
          {resume.experience.map((exp, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{exp.position}</p>
                  <p className="italic text-gray-600 text-xs">{exp.company}</p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                  {formatDate(exp.start_date, exp.end_date)}
                </span>
              </div>
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-1">Education</h2>
          <hr className="border-gray-300 mb-2" />
          {resume.education.map((edu, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between items-start">
                <p className="font-bold text-gray-900 text-sm">{edu.school}</p>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                  {formatDate(edu.start_date, edu.end_date)}
                </span>
              </div>
              {(edu.degree || edu.field) && (
                <p className="italic text-gray-600 text-xs">
                  {edu.degree}{edu.degree && edu.field ? " in " : ""}{edu.field}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {resume.projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-1">Projects</h2>
          <hr className="border-gray-300 mb-2" />
          {resume.projects.map((proj, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between items-start">
                <p className="font-bold text-gray-900 text-sm">{proj.name}</p>
                {proj.url && (
                  <span className="text-xs text-blue-600 ml-2">{proj.url}</span>
                )}
              </div>
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-1">Certifications</h2>
          <hr className="border-gray-300 mb-2" />
          {resume.certifications.map((cert, i) => (
            <div key={i} className="mb-1">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-gray-900 text-sm">{cert.name}</span>
                  {cert.issuer && (
                    <span className="italic text-gray-600 text-xs ml-2">{cert.issuer}</span>
                  )}
                </div>
                {cert.date && (
                  <span className="text-xs text-gray-500 ml-2">{cert.date}</span>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Languages */}
      {resume.languages.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-1">Languages</h2>
          <hr className="border-gray-300 mb-2" />
          <ul className="text-gray-700 text-xs">
            {resume.languages.map((lang, i) => (
              <li key={i}>- {lang.name} ({lang.proficiency})</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
