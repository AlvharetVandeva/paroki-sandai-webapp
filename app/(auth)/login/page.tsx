import { Suspense } from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Memuat...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
