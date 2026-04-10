import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useWatch, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pdf } from "@react-pdf/renderer";
import { resumeFormSchema, type ResumeFormInput, type ResumeContent } from "@/types";
import { resumeApi } from "@/api/resumes";
import { Navbar } from "@/components/layout/Navbar";
import { ResumePreview } from "@/components/resume/ResumePreview";
// import { ResumePDF } from "@/components/resume/ResumePDF";
import { getResumeHTML } from "@/components/resume/ResumePDF";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, Download, Plus, Trash2, Loader2, X } from "lucide-react";
import { toast } from "sonner";

const defaultContent: ResumeContent = {
  basicInfo: { firstName: "", lastName: "", email: "", phone: "", location: "", professionalTitle: "", summary: "" },
  socialLinks: { linkedin: "", github: "", website: "", twitter: "" },
  education: [],
  experience: [],
  projects: [],
  skills: [],
};

const ResumeEditor = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loadingResume, setLoadingResume] = useState(!isNew);
  const [resumeId, setResumeId] = useState(id || "");
  const [skillInput, setSkillInput] = useState("");
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);

  const form = useForm<ResumeFormInput>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: { title: "Untitled Resume", content: defaultContent },
  });

  const { register, control, setValue, getValues, reset } = form;
  const watchedContent = useWatch({ control, name: "content" }) as ResumeContent;
  const watchedTitle = useWatch({ control, name: "title" });

  const eduArray = useFieldArray({ control, name: "content.education" });
  const expArray = useFieldArray({ control, name: "content.experience" });
  const projArray = useFieldArray({ control, name: "content.projects" });

  useEffect(() => {
    if (!isNew && id) {
      resumeApi.getById(id).then((res) => {
        console.log("resumeid in edit", id)
        const r = res.data.resume;
        console.log("resume in edit", res)
        reset({ title: r.title, content: r.content });
        setResumeId(r.id);

      }).catch((error) => {
        toast.error("Resume not found");
        console.log("error in edit resume", error)
        navigate("/dashboard");
      }).finally(() => setLoadingResume(false));
    }
  }, [id, isNew, navigate, reset]);

  const handleSave = useCallback(async () => {
    const values = getValues();
    if (!values.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    try {
      if (isNew && !resumeId) {
        const res = await resumeApi.create({
          title: values.title,
          content: values.content
        });

        console.log("Full response:", res);
        console.log("res.data:", res.data);
        console.log("res.data.resume:", res.data.resume);
        console.log("resume id:", res.data.resume?.id);

        // ✅ CORRECT - access nested resume object
        const newResumeId = res.data.resume.id;

        if (!newResumeId) {
          throw new Error("No resume ID returned");
        }

        setResumeId(newResumeId);
        toast.success("Resume created!");
        navigate('/dashboard');

      } else {
        await resumeApi.update(resumeId, {
          title: values.title,
          content: values.content
        });
        toast.success("Resume saved!");
                navigate('/dashboard');

      }
    } catch (error: any) {
      console.log("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      const errorMessage = error.response?.data?.message || error.message || "Failed to save";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [getValues, isNew, resumeId, navigate]);

// In ResumeEditor.tsx - replace the handleDownload function

const handleDownload = async () => {
  setDownloading(true);
  try {
    // Generate HTML string
    const html = getResumeHTML(watchedContent, watchedTitle);
    
    // Create a new window and write HTML
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow pop-ups to download PDF");
      return;
    }
    
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for fonts to load then trigger print
    printWindow.onload = () => {
      printWindow.print();
      toast.success("PDF ready! Save using print dialog.");
    };
    
  } catch (error) {
    console.error("PDF Generation Error:", error);
    toast.error("Failed to generate PDF. Please try again.");
  } finally {
    setDownloading(false);
  }
};

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    const current = getValues("content.skills") || [];
    if (!current.includes(s)) {
      setValue("content.skills", [...current, s]);
    }
    setSkillInput("");
  };

  const removeSkill = (index: number) => {
    const current = getValues("content.skills") || [];
    setValue("content.skills", current.filter((_, i) => i !== index));
  };

  if (loadingResume) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Top bar */}
      <div className="border-b bg-card sticky top-16 z-40">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 gap-4">
          <Input
            {...register("title")}
            className="max-w-xs font-semibold text-lg border-none shadow-none focus-visible:ring-1"
            placeholder="Resume title"
          />
          <div className="flex gap-2">
            <Button variant="outline" className="lg:hidden" onClick={() => setShowPreviewMobile(!showPreviewMobile)}>
              {showPreviewMobile ? "Edit" : "Preview"}
            </Button>
            <Button variant="outline" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
            <Button onClick={handleDownload} disabled={downloading}>
              {downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="container mx-auto flex flex-1 gap-6 px-4 py-6">
        {/* Left: Form */}
        <div className={`w-full lg:w-1/2 space-y-4 ${showPreviewMobile ? "hidden lg:block" : ""}`}>
          <Tabs defaultValue="personal">
            <TabsList className="w-full grid grid-cols-5">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
            </TabsList>

            {/* Personal Info */}
            <TabsContent value="personal" className="space-y-4 mt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h3 className="font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>First Name</Label><Input {...register("content.basicInfo.firstName")} /></div>
                    <div className="space-y-2"><Label>Last Name</Label><Input {...register("content.basicInfo.lastName")} /></div>
                    <div className="space-y-2"><Label>Email</Label><Input type="email" {...register("content.basicInfo.email")} /></div>
                    <div className="space-y-2"><Label>Phone</Label><Input {...register("content.basicInfo.phone")} /></div>
                    <div className="space-y-2"><Label>Location</Label><Input {...register("content.basicInfo.location")} /></div>
                    <div className="space-y-2"><Label>Professional Title</Label><Input {...register("content.basicInfo.professionalTitle")} /></div>
                  </div>
                  <div className="space-y-2"><Label>Summary</Label><Textarea rows={4} {...register("content.basicInfo.summary")} /></div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h3 className="font-semibold">Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>LinkedIn</Label><Input {...register("content.socialLinks.linkedin")} /></div>
                    <div className="space-y-2"><Label>GitHub</Label><Input {...register("content.socialLinks.github")} /></div>
                    <div className="space-y-2"><Label>Website</Label><Input {...register("content.socialLinks.website")} /></div>
                    <div className="space-y-2"><Label>Twitter</Label><Input {...register("content.socialLinks.twitter")} /></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Education */}
            <TabsContent value="education" className="space-y-4 mt-4">
              {eduArray.fields.map((field, i) => (
                <Card key={field.id}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Education {i + 1}</h3>
                      <Button variant="ghost" size="icon" onClick={() => eduArray.remove(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Institution</Label><Input {...register(`content.education.${i}.institution`)} /></div>
                      <div className="space-y-2"><Label>Degree</Label><Input {...register(`content.education.${i}.degree`)} /></div>
                      <div className="space-y-2"><Label>Field of Study</Label><Input {...register(`content.education.${i}.field`)} /></div>
                      <div className="space-y-2"><Label>Start Date</Label><Input placeholder="e.g. Sep 2018" {...register(`content.education.${i}.startDate`)} /></div>
                      <div className="space-y-2"><Label>End Date</Label><Input placeholder="e.g. Jun 2022" {...register(`content.education.${i}.endDate`)} /></div>
                    </div>
                    <div className="space-y-2"><Label>Description</Label><Textarea {...register(`content.education.${i}.description`)} /></div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={() => eduArray.append({ institution: "", degree: "", field: "", startDate: "", endDate: "", description: "" })}>
                <Plus className="mr-2 h-4 w-4" /> Add Education
              </Button>
            </TabsContent>

            {/* Experience */}
            <TabsContent value="experience" className="space-y-4 mt-4">
              {expArray.fields.map((field, i) => (
                <Card key={field.id}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Experience {i + 1}</h3>
                      <Button variant="ghost" size="icon" onClick={() => expArray.remove(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Company</Label><Input {...register(`content.experience.${i}.company`)} /></div>
                      <div className="space-y-2"><Label>Position</Label><Input {...register(`content.experience.${i}.position`)} /></div>
                      <div className="space-y-2"><Label>Start Date</Label><Input placeholder="e.g. Jan 2020" {...register(`content.experience.${i}.startDate`)} /></div>
                      <div className="space-y-2"><Label>End Date</Label><Input placeholder="e.g. Dec 2023" {...register(`content.experience.${i}.endDate`)} /></div>
                    </div>
                    <div className="space-y-2"><Label>Description</Label><Textarea rows={4} {...register(`content.experience.${i}.description`)} /></div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={() => expArray.append({ company: "", position: "", startDate: "", endDate: "", current: false, description: "" })}>
                <Plus className="mr-2 h-4 w-4" /> Add Experience
              </Button>
            </TabsContent>

            {/* Projects */}
            <TabsContent value="projects" className="space-y-4 mt-4">
              {projArray.fields.map((field, i) => (
                <Card key={field.id}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Project {i + 1}</h3>
                      <Button variant="ghost" size="icon" onClick={() => projArray.remove(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Name</Label><Input {...register(`content.projects.${i}.name`)} /></div>
                      <div className="space-y-2"><Label>Link</Label><Input {...register(`content.projects.${i}.link`)} /></div>
                      <div className="space-y-2 md:col-span-2"><Label>Technologies</Label><Input {...register(`content.projects.${i}.technologies`)} /></div>
                    </div>
                    <div className="space-y-2"><Label>Description</Label><Textarea {...register(`content.projects.${i}.description`)} /></div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={() => projArray.append({ name: "", description: "", technologies: "", link: "" })}>
                <Plus className="mr-2 h-4 w-4" /> Add Project
              </Button>
            </TabsContent>

            {/* Skills */}
            <TabsContent value="skills" className="mt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h3 className="font-semibold">Skills</h3>
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Type a skill and press Add"
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                    />
                    <Button type="button" onClick={addSkill}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(watchedContent.skills || []).map((skill, i) => (
                      <Badge key={i} variant="secondary" className="gap-1 pr-1">
                        {skill}
                        <button type="button" onClick={() => removeSkill(i)} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Preview */}
        <div className={`w-full lg:w-1/2 ${showPreviewMobile ? "" : "hidden lg:block"}`}>
          <div className="lg:sticky lg:top-32">
            <div className="overflow-auto max-h-[calc(100vh-10rem)] border rounded-lg bg-secondary/30 p-4">
              <ResumePreview content={watchedContent} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeEditor;
