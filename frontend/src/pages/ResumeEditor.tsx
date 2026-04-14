import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useWatch, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resumeFormSchema, type ResumeFormInput, type ResumeContent } from "@/types";
import { resumeApi } from "@/api/resumes";
import { Navbar } from "@/components/layout/Navbar";
import { ResumePreview } from "@/components/resume/ResumePreview";
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
import { DatePicker } from "@/components/ui/date-picker";

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
  const [activeTab, setActiveTab] = useState("personal");

  const form = useForm<ResumeFormInput>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: { title: "Untitled Resume", content: defaultContent },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const { register, control, setValue, getValues, reset, watch, formState: { errors, isValid, isDirty } } = form;
  const watchedContent = useWatch({ control, name: "content" }) as ResumeContent;
  const watchedTitle = useWatch({ control, name: "title" });

  const eduArray = useFieldArray({ control, name: "content.education" });
  const expArray = useFieldArray({ control, name: "content.experience" });
  const projArray = useFieldArray({ control, name: "content.projects" });

  // Check if current section has errors
  const hasSectionErrors = (section: string) => {
    switch (section) {
      case "personal":
        return !!(errors.content?.basicInfo || errors.content?.socialLinks);
      case "education":
        return !!errors.content?.education?.length;
      case "experience":
        return !!errors.content?.experience?.length;
      case "projects":
        return !!errors.content?.projects?.length;
      case "skills":
        return !!errors.content?.skills;
      default:
        return false;
    }
  };

  // Handle tab change with validation
  const handleTabChange = (value: string) => {
    // Trigger validation for current section before leaving
    if (activeTab === "personal") {
      form.trigger([
        "content.basicInfo.firstName",
        "content.basicInfo.lastName",
        "content.basicInfo.email",
        "content.basicInfo.phone",
        "content.basicInfo.professionalTitle"
      ]);
    } else if (activeTab === "education") {
      form.trigger("content.education");
    } else if (activeTab === "experience") {
      form.trigger("content.experience");
    } else if (activeTab === "projects") {
      form.trigger("content.projects");
    } else if (activeTab === "skills") {
      form.trigger("content.skills");
    }

    setActiveTab(value);
  };

  useEffect(() => {
    if (!isNew && id) {
      resumeApi.getById(id).then((res) => {
        const r = res.data.resume;
        reset({ title: r.title, content: r.content });
        setResumeId(r.id);
      }).catch((error) => {
        toast.error("Resume not found");
        navigate("/dashboard");
      }).finally(() => setLoadingResume(false));
    }
  }, [id, isNew, navigate, reset]);

  const handleSave = useCallback(async () => {
    // Trigger validation for all fields
    const isFormValid = await form.trigger();

    if (!isFormValid) {
      toast.error("Please fix all validation errors before saving");
      return;
    }

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
      const errorMessage = error.response?.data?.message || error.message || "Failed to save";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [getValues, isNew, resumeId, navigate, form]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const html = getResumeHTML(watchedContent, watchedTitle);
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Please allow pop-ups to download PDF");
        return;
      }
      printWindow.document.write(html);
      printWindow.document.close();
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

  // Check if save button should be disabled
  const isSaveDisabled = saving || Object.keys(errors).length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Top bar */}
      <div className="border-b bg-card sticky top-16 z-40">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 gap-4">
          <div className="flex-1 max-w-xs">
            <Input
              {...register("title")}
              className="font-semibold text-lg border-none shadow-none focus-visible:ring-1"
              placeholder="Resume title"
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="lg:hidden" onClick={() => setShowPreviewMobile(!showPreviewMobile)}>
              {showPreviewMobile ? "Edit" : "Preview"}
            </Button>
            <Button variant="outline" onClick={handleSave} disabled={isSaveDisabled}>
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
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="w-full grid grid-cols-5">
              <TabsTrigger value="personal" className="relative">
                Personal
                {hasSectionErrors("personal") && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </TabsTrigger>
              <TabsTrigger value="education" className="relative">
                Education
                {hasSectionErrors("education") && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </TabsTrigger>
              <TabsTrigger value="experience" className="relative">
                Experience
                {hasSectionErrors("experience") && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </TabsTrigger>
              <TabsTrigger value="projects" className="relative">
                Projects
                {hasSectionErrors("projects") && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </TabsTrigger>
              <TabsTrigger value="skills" className="relative">
                Skills
                {hasSectionErrors("skills") && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Rest of your form sections remain the same */}
            {/* Personal Info */}
            <TabsContent value="personal" className="space-y-4 mt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h3 className="font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input {...register("content.basicInfo.firstName")} />
                      {errors.content?.basicInfo?.firstName && (
                        <p className="text-xs text-red-500">{errors.content.basicInfo.firstName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input {...register("content.basicInfo.lastName")} />
                      {errors.content?.basicInfo?.lastName && (
                        <p className="text-xs text-red-500">{errors.content.basicInfo.lastName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" {...register("content.basicInfo.email")} />
                      {errors.content?.basicInfo?.email && (
                        <p className="text-xs text-red-500">{errors.content.basicInfo.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input {...register("content.basicInfo.phone")} />
                      {errors.content?.basicInfo?.phone && (
                        <p className="text-xs text-red-500">{errors.content.basicInfo.phone.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input {...register("content.basicInfo.location")} />
                      {errors.content?.basicInfo?.location && (
                        <p className="text-xs text-red-500">{errors.content.basicInfo.location.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Professional Title</Label>
                      <Input {...register("content.basicInfo.professionalTitle")} />
                      {errors.content?.basicInfo?.professionalTitle && (
                        <p className="text-xs text-red-500">{errors.content.basicInfo.professionalTitle.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Summary</Label>
                    <Textarea rows={4} {...register("content.basicInfo.summary")} />
                    {errors.content?.basicInfo?.summary && (
                      <p className="text-xs text-red-500">{errors.content.basicInfo.summary.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h3 className="font-semibold">Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>LinkedIn</Label>
                      <Input {...register("content.socialLinks.linkedin")} />
                      {errors.content?.socialLinks?.linkedin && (
                        <p className="text-xs text-red-500">{errors.content.socialLinks.linkedin.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>GitHub</Label>
                      <Input {...register("content.socialLinks.github")} />
                      {errors.content?.socialLinks?.github && (
                        <p className="text-xs text-red-500">{errors.content.socialLinks.github.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input {...register("content.socialLinks.website")} />
                      {errors.content?.socialLinks?.website && (
                        <p className="text-xs text-red-500">{errors.content.socialLinks.website.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Twitter</Label>
                      <Input {...register("content.socialLinks.twitter")} />
                      {errors.content?.socialLinks?.twitter && (
                        <p className="text-xs text-red-500">{errors.content.socialLinks.twitter.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Section Button */}
              <div className="flex justify-end">
                <Button
                  onClick={() => handleTabChange("education")}
                  disabled={hasSectionErrors("personal")}
                >
                  Next: Education →
                </Button>
              </div>
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
                      <div className="space-y-2">
                        <Label>Institution</Label>
                        <Input {...register(`content.education.${i}.institution`)} />
                        {errors.content?.education?.[i]?.institution && (
                          <p className="text-xs text-red-500">{errors.content.education[i].institution.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Degree</Label>
                        <Input {...register(`content.education.${i}.degree`)} />
                        {errors.content?.education?.[i]?.degree && (
                          <p className="text-xs text-red-500">{errors.content.education[i].degree.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Field of Study</Label>
                        <Input {...register(`content.education.${i}.field`)} />
                        {errors.content?.education?.[i]?.field && (
                          <p className="text-xs text-red-500">{errors.content.education[i].field.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Start Date</Label>

                        <Input
                          type="date"
                          {...register(`content.education.${i}.startDate`)}
                        />

                        {errors.content?.education?.[i]?.startDate && (
                          <p className="text-xs text-red-500">
                            {errors.content.education[i].startDate.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label>End Date</Label>

                          <label className="flex items-center gap-1 text-sm">
                            <input
                              type="checkbox"
                              {...register(`content.education.${i}.current`)}
                              onChange={(e) => {
                                setValue(`content.education.${i}.current`, e.target.checked);

                                if (e.target.checked) {
                                  setValue(`content.education.${i}.endDate`, "present");
                                }
                              }}
                            />
                            <span className="text-sm text-muted-foreground">
                              Currently Studying
                            </span>
                          </label>
                        </div>

                        {/* Show End Date only if NOT current */}
                        {!watch(`content.education.${i}.current`) && (
                          <Input
                            type="date"
                            {...register(`content.education.${i}.endDate`)}
                          />
                        )}

                        {/* If current */}
                        {watch(`content.education.${i}.current`) && (
                          <div className="text-sm text-muted-foreground p-2 border rounded-md bg-muted/20">
                            Present • Currently studying here
                          </div>
                        )}

                        {errors.content?.education?.[i]?.endDate && (
                          <p className="text-xs text-red-500">
                            {errors.content.education[i].endDate.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea {...register(`content.education.${i}.description`)} />
                      {errors.content?.education?.[i]?.description && (
                        <p className="text-xs text-red-500">{errors.content.education[i].description.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => handleTabChange("personal")}>
                  ← Previous
                </Button>
                <Button variant="outline" onClick={() => eduArray.append({ institution: "", degree: "", field: "", startDate: "", endDate: "", description: "" })}>
                  <Plus className="mr-2 h-4 w-4" /> Add Education
                </Button>
                <Button
                  onClick={() => handleTabChange("experience")}
                  disabled={hasSectionErrors("education")}
                >
                  Next: Experience →
                </Button>
              </div>
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
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input {...register(`content.experience.${i}.company`)} />
                        {errors.content?.experience?.[i]?.company && (
                          <p className="text-xs text-red-500">{errors.content.experience[i].company.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Position</Label>
                        <Input {...register(`content.experience.${i}.position`)} />
                        {errors.content?.experience?.[i]?.position && (
                          <p className="text-xs text-red-500">{errors.content.experience[i].position.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Start Date</Label>

                        <Input
                          type="date"
                          {...register(`content.experience.${i}.startDate`)}
                        />

                        {errors.content?.experience?.[i]?.startDate && (
                          <p className="text-xs text-red-500">
                            {errors.content.experience[i].startDate.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label>End Date</Label>

                          <label className="flex items-center gap-1 text-sm">
                            <input
                              type="checkbox"
                              {...register(`content.experience.${i}.current`)}
                              onChange={(e) => {
                                setValue(`content.experience.${i}.current`, e.target.checked);

                                if (e.target.checked) {
                                  setValue(`content.experience.${i}.endDate`, "");
                                }
                              }}
                            />
                            <span className="text-sm text-muted-foreground">Current</span>
                          </label>
                        </div>

                        {!watch(`content.experience.${i}.current`) && (
                          <Input
                            type="date"
                            {...register(`content.experience.${i}.endDate`)}
                          />
                        )}

                        {watch(`content.experience.${i}.current`) && (
                          <div className="text-sm text-muted-foreground p-2 border rounded-md bg-muted/20">
                            Present 
                          </div>
                        )}

                        {errors.content?.experience?.[i]?.endDate && (
                          <p className="text-xs text-red-500">
                            {errors.content.experience[i].endDate.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea rows={4} {...register(`content.experience.${i}.description`)} />
                      {errors.content?.experience?.[i]?.description && (
                        <p className="text-xs text-red-500">{errors.content.experience[i].description.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => handleTabChange("education")}>
                  ← Previous
                </Button>
                <Button variant="outline" onClick={() => expArray.append({ company: "", position: "", startDate: "", endDate: "", current: false, description: "" })}>
                  <Plus className="mr-2 h-4 w-4" /> Add Experience
                </Button>
                <Button
                  onClick={() => handleTabChange("projects")}
                  disabled={hasSectionErrors("experience")}
                >
                  Next: Projects →
                </Button>
              </div>
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
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input {...register(`content.projects.${i}.name`)} />
                        {errors.content?.projects?.[i]?.name && (
                          <p className="text-xs text-red-500">{errors.content.projects[i].name.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Link</Label>
                        <Input {...register(`content.projects.${i}.link`)} />
                        {errors.content?.projects?.[i]?.link && (
                          <p className="text-xs text-red-500">{errors.content.projects[i].link.message}</p>
                        )}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Technologies</Label>
                        <Input {...register(`content.projects.${i}.technologies`)} />
                        {errors.content?.projects?.[i]?.technologies && (
                          <p className="text-xs text-red-500">{errors.content.projects[i].technologies.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea {...register(`content.projects.${i}.description`)} />
                      {errors.content?.projects?.[i]?.description && (
                        <p className="text-xs text-red-500">{errors.content.projects[i].description.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => handleTabChange("experience")}>
                  ← Previous
                </Button>
                <Button variant="outline" onClick={() => projArray.append({ name: "", description: "", technologies: "", link: "" })}>
                  <Plus className="mr-2 h-4 w-4" /> Add Project
                </Button>
                <Button
                  onClick={() => handleTabChange("skills")}
                  disabled={hasSectionErrors("projects")}
                >
                  Next: Skills →
                </Button>
              </div>
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
                  {errors.content?.skills && (
                    <p className="text-xs text-red-500">{errors.content.skills.message}</p>
                  )}
                </CardContent>
              </Card>
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={() => handleTabChange("projects")}>
                  ← Previous
                </Button>
              </div>
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