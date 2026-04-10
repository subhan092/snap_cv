import type { ResumeContent } from "@/types";
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";

interface Props {
  content: ResumeContent;
}

export const ResumePreview = ({ content }: Props) => {
  const { basicInfo, socialLinks, education, experience, projects, skills } = content;
  const hasName = basicInfo.firstName || basicInfo.lastName;

  return (
    <div className="bg-card p-8 shadow-sm rounded-lg text-sm leading-relaxed max-w-[680px] mx-auto">
      {/* Header */}
      <header className="text-center mb-6 border-b pb-5">
        {hasName && (
          <h1 className="text-2xl font-bold tracking-tight">
            {basicInfo.firstName} {basicInfo.lastName}
          </h1>
        )}
        {basicInfo.professionalTitle && (
          <p className="text-primary font-medium mt-1">{basicInfo.professionalTitle}</p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-muted-foreground text-xs">
          {basicInfo.email && (
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{basicInfo.email}</span>
          )}
          {basicInfo.phone && (
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{basicInfo.phone}</span>
          )}
          {basicInfo.location && (
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{basicInfo.location}</span>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-muted-foreground text-xs">
          {socialLinks.linkedin && (
            <span className="flex items-center gap-1"><Linkedin className="h-3 w-3" />{socialLinks.linkedin}</span>
          )}
          {socialLinks.github && (
            <span className="flex items-center gap-1"><Github className="h-3 w-3" />{socialLinks.github}</span>
          )}
          {socialLinks.website && (
            <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{socialLinks.website}</span>
          )}
        </div>
      </header>

      {/* Summary */}
      {basicInfo.summary && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 border-b pb-1">Summary</h2>
          <p className="text-muted-foreground">{basicInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 border-b pb-1">Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold">{exp.position}</h3>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : exp.current ? " – Present" : ""}
                </span>
              </div>
              {exp.company && <p className="text-muted-foreground text-xs">{exp.company}</p>}
              {exp.description && <p className="mt-1 text-muted-foreground whitespace-pre-line">{exp.description}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 border-b pb-1">Education</h2>
          {education.map((edu, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold">{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</h3>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ""}
                </span>
              </div>
              {edu.institution && <p className="text-muted-foreground text-xs">{edu.institution}</p>}
              {edu.description && <p className="mt-1 text-muted-foreground">{edu.description}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 border-b pb-1">Projects</h2>
          {projects.map((proj, i) => (
            <div key={i} className="mb-3">
              <h3 className="font-semibold">
                {proj.name}
                {proj.link && <span className="text-xs text-muted-foreground font-normal ml-2">{proj.link}</span>}
              </h3>
              {proj.technologies && <p className="text-xs text-primary">{proj.technologies}</p>}
              {proj.description && <p className="mt-1 text-muted-foreground">{proj.description}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 border-b pb-1">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span key={i} className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {!hasName && experience.length === 0 && education.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">Start filling in your details to see a live preview</p>
        </div>
      )}
    </div>
  );
};
