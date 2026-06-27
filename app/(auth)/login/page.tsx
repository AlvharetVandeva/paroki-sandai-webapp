import { Suspense } from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">Login Admin</h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Masuk ke dashboard Paroki Sandai
        </p>
        <Suspense fallback={<div className="text-center text-sm text-gray-500">Memuat...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
