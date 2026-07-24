import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";
import { Field, Input } from "../components/common/Input";
// Imported needed icons for form and feature list
import { Box, Eye, EyeOff, BarChart3, Zap, ShieldCheck, ArrowRight } from "lucide-react";

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

  const featureCards = [
    { icon: BarChart3, text: "Real-time analytics" },
    { icon: Zap, text: "Instant search & sort" },
    { icon: ShieldCheck, text: "Enterprise security" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Left Pane - Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between bg-white px-8 py-10 md:px-36 md:py-16">
        <div className="max-w-md mx-auto lg:ml-0 lg:mr-auto w-full">
          {/* Brand/Logo Section */}
          <div className="flex items-center gap-4 mb-20">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-950 shadow-sm border border-neutral-800">
              <Box className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-neutral-950">Feelvie</h1>
              <p className="text-xs uppercase tracking-wider text-neutral-500">Enterprise CRM</p>
            </div>
          </div>

          {/* Intro Text */}
          <h2 className="text-5xl font-bold tracking-tight text-neutral-950 mb-4">Welcome back</h2>
          <p className="text-base text-neutral-600 mb-12 max-w-sm">
            Sign in to your admin console to manage users, subscriptions and content.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Field components are assumed to handle label placement */}
            <Field label="Work email" required>
              <Input
                type="email"
                required
                autoFocus
                placeholder="you@feelvie.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                // Standardizing input look from image
                className="h-12 text-sm border-neutral-200 placeholder:text-neutral-400"
              />
            </Field>

            <Field 
              label="Password" 
              required
              // Assuming Field can take an extra component for right-aligned label side content
              labelRight={<a href="#" className="text-sm text-neutral-600 hover:text-neutral-950">Forgot?</a>}
            >
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  // Standardizing input look from image and creating space for icon
                  className="h-12 text-sm border-neutral-200 pr-10 placeholder:text-neutral-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-800"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </Field>

            {authError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-100">
                {authError}
              </p>
            )}

            <Button
              type="submit"
              // Adjusting button classes for height, size, and adding arrow icon
              className="w-full h-12 text-sm font-semibold !bg-neutral-950 !text-white hover:!bg-neutral-800 flex items-center justify-center gap-2 group"
              loading={isAuthenticating}
            >
              Sign in <ArrowRight className="h-4 w-4 text-white group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </div>

        {/* Support Link */}
        <div className="text-center text-sm text-neutral-600 mt-16 max-w-md mx-auto w-full lg:ml-0">
          Trouble accessing your account?{" "}
          <a href="#" className="font-medium text-neutral-950 hover:underline">
            Contact IT support
          </a>
        </div>
      </div>

      {/* Right Pane - Feature/Branding Section */}
      <div className="relative hidden lg:flex w-1/2 flex-col justify-between  px-36 text-white" 
           style={{
             background: 'radial-gradient(circle at top right, #332014 0%, #151515 45%), #151515', 
             fontFamily: 'Inter, sans-serif'
           }}>
        
        {/* Subtle grid pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        
        <div className="relative z-10 max-w-xl self-center mt-16">
          {/* Label */}
          <div className="text-xs uppercase tracking-widest text-white/50 mb-6 font-medium">Built for scale</div>

          {/* Heading with highlighted text */}
          <h1 className="text-5xl font-bold tracking-tight mb-8 leading-[1.1]">
            The command center for your <span className="text-[#E27625]">entire business.</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg text-white/60 mb-16 leading-relaxed max-w-lg">
            Manage users, revenue, content and support—unified in one blazing-fast console designed for enterprise teams.
          </p>

          {/* Feature Cards/Tags */}
          <div className="flex items-center gap-3">
            {featureCards.map((card, index) => (
              <div key={index} className="flex-1 px-5 py-6 rounded-xl border border-white/10 bg-white/[0.03] flex flex-col gap-4">
                <card.icon className="h-6 w-6 text-[#E27625]" />
                <p className="text-sm font-medium text-white/90">{card.text}</p>
              </div>
            ))}
          </div>
          {/* Footer */}
        <div className="relative z-10 text-sm text-white/40 flex items-center justify-center gap-8 self-center mt-12">
          <span>© Feelvie · 2026</span>
          <span className="opacity-20">•</span>
          <span>SOC 2 Type II</span>
          <span className="opacity-20">•</span>
          <span>ISO 27001</span>
        </div>
        </div>

        
      </div>
    </div>
  );
}