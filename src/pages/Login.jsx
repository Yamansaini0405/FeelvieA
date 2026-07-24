import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";
import { Field, Input } from "../components/common/Input";

export default function Login() {
  const { login, isAuthenticating, authError, isAuthenticated } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={location.state?.from || "/"} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl2 bg-brand-500 shadow-pop">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Feelvie</h1>
          <p className="mt-1 text-sm text-white/40">Admin console sign in</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl2 bg-white p-6 shadow-pop"
        >
          <Field label="Email" required>
            <Input
              type="email"
              required
              autoFocus
              placeholder="you@feelvie.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field label="Password" required>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-800/40 hover:text-ink-800"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </Field>

          {authError && (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {authError}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={isAuthenticating}
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
