"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Code2, Lock, Mail, User, Loader2, AlertCircle, CheckCircle2, Sparkles, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/context/AuthContext";

const DISALLOWED_DUMMY_DOMAINS = [
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "test.org",
  "fake.com",
  "tempmail.com",
  "mailinator.com",
  "college.edu",
  "sample.com",
  "demo.com",
];

const COMMON_TYPOS: Record<string, string> = {
  "gamil.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "hotmial.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "yaho.com": "yahoo.com",
};

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please provide a valid active email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string().min(6, "Please confirm your password."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [needsConfirmationNotice, setNeedsConfirmationNotice] = useState(false);

  const handleDemoSignIn = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("codepath_token", "demo-student-supabase-token");
    }
    router.push("/dashboard");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);
    setNeedsConfirmationNotice(false);

    // Validate with Zod
    const validation = registerSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Email deliverability guard: reject dummy test domains that trigger bounces
    const domain = email.split("@")[1]?.toLowerCase() || "";
    if (DISALLOWED_DUMMY_DOMAINS.includes(domain)) {
      setErrors({
        email: `Dummy domain "@${domain}" is restricted to prevent email bounces. Please use a real email address, or click "Instant Demo Access" below.`,
      });
      return;
    }

    if (COMMON_TYPOS[domain]) {
      setErrors({
        email: `Did you mean @${COMMON_TYPOS[domain]}? Please double check your email domain to prevent delivery bounce.`,
      });
      return;
    }

    setLoading(true);
    const result = await signUp(fullName, email, password);

    if (result.error) {
      setServerError(result.error);
      setLoading(false);
    } else if (result.needsEmailConfirmation) {
      setNeedsConfirmationNotice(true);
      setSuccessMessage("Account created! Please check your email inbox to confirm your registration.");
      setLoading(false);
    } else {
      setSuccessMessage("Account created successfully! Redirecting to onboarding...");
      setTimeout(() => {
        router.push("/onboarding");
      }, 1000);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-slate-800 bg-slate-900/90 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Code2 className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Create Student Account</CardTitle>
          <CardDescription className="text-xs">
            Start your AI-guided journey from beginner to career-ready.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4 text-xs">
            {serverError && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 flex items-start space-x-2 text-xs">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 flex items-start space-x-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {needsConfirmationNotice && (
              <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/60 text-blue-300 flex items-start space-x-2 text-xs">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-blue-200">Email Confirmation Required</p>
                  <p className="text-slate-300">
                    A confirmation link was sent to your email. If you are developing locally, you can disable <em>&apos;Confirm Email&apos;</em> in your Supabase Auth Settings to log in immediately without sending transactional emails.
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="text-slate-400 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Sharma"
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              {errors.fullName && <p className="text-red-400 text-[11px] mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Active Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@youruniversity.edu"
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              {errors.email && <p className="text-red-400 text-[11px] mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              {errors.password && <p className="text-red-400 text-[11px] mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-[11px] mt-1">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 h-10 text-xs font-semibold">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign Up & Begin Onboarding"}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-slate-900 px-2 text-slate-500">Or Demo Directly</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleDemoSignIn}
              className="w-full border-slate-700 text-slate-200 hover:bg-slate-800 h-10 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
              Instant Demo Access (Skip Real Email)
            </Button>
          </CardContent>

          <CardFooter className="justify-center border-t border-slate-800 pt-4 text-xs text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 font-semibold ml-1 hover:underline">
              Sign In
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
