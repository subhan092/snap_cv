import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { resumeApi } from "@/api/resumes";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Resume } from "@/types";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { Resumethumbnail } from "@/components/resume/ResumeThumbnail";

const Dashboard = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResumes = async () => {
    try {
      const res = await resumeApi.list();
      console.log("my resumes------------", res)
      setResumes(res.data.resumes || []);
    } catch {
      toast.error("Failed to load resumes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResumes(); }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this resume?")) return;
    try {
      await resumeApi.delete(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      toast.success("Resume deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="hero-gradient py-20 px-4">
        <div className="container mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground">
            Build Professional, ATS-Friendly Resumes
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
            One beautiful template. Unlimited resumes.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/resumes/new")}
            className="mt-4 bg-card text-foreground hover:bg-card/90 font-semibold"
          >
            <Plus className="mr-2 h-5 w-5" /> Create New Resume
          </Button>
        </div>
      </section>

      {/* Resumes */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">My Resumes</h2>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-40" />
            <p className="text-lg">No resumes yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <Card
                key={resume.id}
                className="group cursor-pointer transition-shadow hover:shadow-lg"
                onClick={() => navigate(`/resumes/${resume.id}/edit`)}
              >
                <CardContent className="p-3">
                  <Resumethumbnail resume={resume} />

                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-sm font-medium truncate">{resume.title}</p>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/resumes/${resume.id}/edit`);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={(e) => handleDelete(e, resume.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
