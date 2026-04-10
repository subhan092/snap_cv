// components/resume/ResumePreview.tsx

import { getResumeHTML } from "./ResumePDF";
import type { Resume } from "@/types";

export const Resumethumbnail = ({ resume }: { resume: Resume }) => {
  const html = getResumeHTML(resume.content, resume.title);

  return (
    <div className="w-full h-[350px] overflow-hidden border rounded-lg bg-white">
      <div className="scale-[0.5] origin-top-left w-[200%] h-[200%]">
        <iframe
          srcDoc={html}
          title="resume-preview"
          className="w-full h-full border-none"
        />
      </div>
    </div>
  );
};