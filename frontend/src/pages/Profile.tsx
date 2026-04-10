import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/auth";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/types";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, LogOut, MoveLeft } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  console.log("user",user)

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: { name: user?.name || "" },
  });

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  const onSubmit = async (data: ProfileUpdateInput) => {
    setLoading(true);
    try {
      const clean: ProfileUpdateInput = {};
      if (data.name && data.name !== user?.name) clean.name = data.name;
      if (data.password) clean.password = data.password;
      if (Object.keys(clean).length === 0) {
        toast.info("No changes to save");
        setLoading(false);
        return;
      }
      const res = await authApi.updateProfile(clean);
      setUser(res.data.user);
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { authApi } = await import("@/api/auth");
      await authApi.logout();
    } catch {}
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <MoveLeft 
        size={50}
        onClick={()=>navigate('/dashboard')}/>
        <Card>
          <CardHeader className="items-center text-center">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{user?.name}</CardTitle>
            <p className="text-muted-foreground">{user?.email}</p>
            {user?.createdAt && (
              <p className="text-sm text-muted-foreground">
                Joined {format(new Date(user.createdAt), "MMMM yyyy")}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input id="password" type="password" placeholder="Leave blank to keep current" {...register("password")} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
