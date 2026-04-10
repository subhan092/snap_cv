// components/resume/ResumeHTML.tsx
import type { ResumeContent } from "@/types";

export const getResumeHTML = (content: ResumeContent, title: string) => {
  
  const { basicInfo, socialLinks, education, experience, projects, skills } = content;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    background: #e2e8f0;
    display: flex;
    justify-content: center;
    padding: 20px;
  }
  .resume {
    max-width: 800px;
    width: 100%;
    background: white;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
    padding: 40px;
  }
  /* Header & sections – same as before */
  .header { text-align: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 16px; }
  .name { font-size: 28px; font-weight: 700; letter-spacing: -0.5px; color: #1e293b; }
  .title { font-size: 15px; color: #3b82f6; font-weight: 600; margin-top: 4px; }
  .contact-row { display: flex; justify-content: center; gap: 16px; margin-top: 8px; font-size: 11px; color: #64748b; flex-wrap: wrap; }
  .section { margin-top: 20px; page-break-inside: avoid; }
  .section-title { font-size: 20px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 12px; }
  .item { margin-bottom: 14px; page-break-inside: avoid; }
  .item-header { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; margin-bottom: 4px; }
  .item-title { font-size: 16px; font-weight: 600; color: #1e293b; }
  .item-date { font-size: 13px; color: #64748b; }
  .item-sub { font-size: 13px; color: #64748b; margin-bottom: 4px; }
  .desc { font-size: 13px; color: #475569; line-height: 1.4; margin-top: 4px; }
  .skills-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .skill-chip { background: #f1f5f9; padding: 4px 10px; border-radius: 4px; font-size: 9px; color: #1e293b; }

  /* PRINT STYLES – A4 & clean layout */
  @media print {
    @page {
      size: A4;
      margin: 1.5cm;
    }
    body {
      background: white;
      padding: 0;
      margin: 0;
    }
    .resume {
      max-width: 100%;
      padding: 0;
      box-shadow: none;
    }
    .contact-row, .skills-row {
      gap: 12px;
    }
    .skill-chip {
      background: #f1f5f9;
      border: none;
    }
  }
</style>
    </head>
    <body>
      <div class="resume">
        <div class="header">
          <div class="name">${basicInfo?.firstName || ''} ${basicInfo?.lastName || ''}</div>
          ${basicInfo?.professionalTitle ? `<div class="title">${basicInfo.professionalTitle}</div>` : ''}
          <div class="contact-row">
            ${basicInfo?.email ? `<span>${basicInfo.email}</span>` : ''}
            ${basicInfo?.phone ? `<span>${basicInfo.phone}</span>` : ''}
            ${basicInfo?.location ? `<span>${basicInfo.location}</span>` : ''}
          </div>
          <div class="contact-row">
            ${socialLinks?.linkedin ? `<span>${socialLinks.linkedin}</span>` : ''}
            ${socialLinks?.github ? `<span>${socialLinks.github}</span>` : ''}
            ${socialLinks?.website ? `<span>${socialLinks.website}</span>` : ''}
          </div>
        </div>

        ${basicInfo?.summary ? `
          <div class="section">
            <div class="section-title">Summary</div>
            <div class="desc">${basicInfo.summary}</div>
          </div>
        ` : ''}

        ${experience?.length ? `
          <div class="section">
            <div class="section-title">Experience</div>
            ${experience.map(exp => `
              <div class="item">
                <div class="item-header">
                  <span class="item-title">${exp.position || ''}</span>
                  <span class="item-date">${exp.startDate || ''}${exp.endDate ? ` – ${exp.endDate}` : exp.current ? ' – Present' : ''}</span>
                </div>
                ${exp.company ? `<div class="item-sub">${exp.company}</div>` : ''}
                ${exp.description ? `<div class="desc">${exp.description}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${education?.length ? `
          <div class="section">
            <div class="section-title">Education</div>
            ${education.map(edu => `
              <div class="item">
                <div class="item-header">
                  <span class="item-title">${edu.degree || ''}${edu.field ? ` in ${edu.field}` : ''}</span>
                  <span class="item-date">${edu.startDate || ''}${edu.endDate ? ` – ${edu.endDate}` : ''}</span>
                </div>
                ${edu.institution ? `<div class="item-sub">${edu.institution}</div>` : ''}
                ${edu.description ? `<div class="desc">${edu.description}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${projects?.length ? `
          <div class="section">
            <div class="section-title">Projects</div>
            ${projects.map(proj => `
              <div class="item">
                <div class="item-header">
                  <span class="item-title">${proj.name || ''}</span>
                </div>
                ${proj.technologies ? `<div class="item-sub" style="color:#3b82f6">${proj.technologies}</div>` : ''}
                ${proj.description ? `<div class="desc">${proj.description}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${skills?.length ? `
          <div class="section">
            <div class="section-title">Skills</div>
            <div class="skills-row">
              ${skills.map(skill => `<span class="skill-chip">${skill}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;
};