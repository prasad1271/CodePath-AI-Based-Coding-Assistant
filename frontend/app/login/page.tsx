"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Code2, ArrowRight, Lock, Mail, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithPassword, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const result = await signInWithPassword(email, password);
    if (result.error) {
      setErrorMsg(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleDemoSignIn = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("codepath_token", "demo-student-supabase-token");
    }
    router.push("/dashboard");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-slate-800 bg-slate-900/90 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Code2 className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Welcome to CodePath</CardTitle>
          <CardDescription className="text-xs">
            Sign in to resume your engineering learning track & practice streak.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 flex items-start space-x-2 text-xs">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            <div>
              <label className="text-slate-400 block mb-1">College / Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400">Password</label>
                <Link href="/forgot-password" className="text-[11px] text-blue-400 hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 h-10 text-xs font-semibold">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In to CodePath"}
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
              Instant Demo Access (Student Role)
            </Button>
          </CardContent>

          <CardFooter className="justify-center border-t border-slate-800 pt-4 text-xs text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-400 font-semibold ml-1 hover:underline">
              Create one
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
