"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/context/AuthContext";

const DISALLOWED_DUMMY_DOMAINS = [
  "example.com",
  "example.org",
  "test.com",
  "fake.com",
  "college.edu",
  "sample.com",
];

export default function ForgotPasswordPage() {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const trimmed = email.trim();
    if (!trimmed) return;

    const domain = trimmed.split("@")[1]?.toLowerCase() || "";
    if (DISALLOWED_DUMMY_DOMAINS.includes(domain)) {
      setErrorMsg(`Dummy domain "@${domain}" cannot receive transactional emails. Please enter your real active email address.`);
      return;
    }

    setLoading(true);
    const res = await resetPasswordForEmail(trimmed);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-slate-800 bg-slate-900/90 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-white">Reset Password</CardTitle>
          <CardDescription className="text-xs">
            Enter your college email address to receive secure reset instructions.
          </CardDescription>
        </CardHeader>

        {submitted ? (
          <CardContent className="space-y-4 text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <p className="text-xs text-slate-300">
              If an account matches <strong className="text-white">{email}</strong>, a password reset email has been dispatched with reset instructions.
            </p>
            <Link href="/login">
              <Button variant="outline" size="sm" className="mt-2 text-xs">
                Back to Sign In
              </Button>
            </Link>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 flex items-start space-x-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="text-slate-400 block mb-1">Email Address</label>
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
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 h-10 text-xs font-semibold">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
              </Button>
            </CardContent>

            <CardFooter className="justify-center border-t border-slate-800 pt-4 text-xs text-slate-400">
              <Link href="/login" className="flex items-center hover:text-white">
                <ArrowLeft className="w-3 h-3 mr-1" /> Back to Sign In
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
