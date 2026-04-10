import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { authApi } from "@/api/auth";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Verify = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }
    authApi.verify(token)
      .then(() => {
        setStatus("success");
        setMessage("Email verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed");
      });
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-md">
        {status === "loading" && (
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
        )}
        {status === "success" && (
          <>
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold">{message}</h1>
            <Button asChild>
              <Link to="/login">Continue to Login</Link>
            </Button>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-20 w-20 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">{message}</h1>
            <Button variant="outline" asChild>
              <Link to="/login">Go to Login</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Verify;
