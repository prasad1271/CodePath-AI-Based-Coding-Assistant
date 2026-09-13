"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { api } from "@/services/api";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (fullName: string, email: string, password: string) => Promise<{ error?: string; session?: Session | null; needsEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error?: string }>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: currentSession }, error: sessionError }) => {
      if (!mounted) return;
      if (sessionError) {
        console.warn("Error fetching Supabase session:", sessionError.message);
      }
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("codepath_token", currentSession.access_token);
        }
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.access_token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("codepath_token", newSession.access_token);
        }
        // Sync user to FastAPI PostgreSQL database
        try {
          await api.syncUser();
        } catch (e) {
          // Dev fallback sync warning ignored
        }
      } else {
        if (typeof window !== "undefined") {
          // Keep demo token if user was on demo mode, otherwise clear
          if (localStorage.getItem("codepath_token") !== "demo-student-supabase-token") {
            localStorage.removeItem("codepath_token");
          }
        }
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithPassword = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authErr) {
        console.error(authErr.message);
        setError(authErr.message);
        setLoading(false);
        return { error: authErr.message };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("codepath_token", data.session.access_token);
        }
        try {
          await api.syncUser();
        } catch (e) {
          // Ignore sync failure in mock/offline mode
        }
      }

      setLoading(false);
      return {};
    } catch (err: any) {
      const msg = err.message || "An unexpected error occurred during login.";
      console.error(msg);
      setError(msg);
      setLoading(false);
      return { error: msg };
    }
  };

  const signUp = async (fullName: string, email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      // Basic signup - student registration strictly defaults to student role
      // Passwords are never stored manually; handled purely by Supabase Auth
      const { data, error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: "student",
          },
        },
      });

      if (authErr) {
        console.error(authErr.message);
        setError(authErr.message);
        setLoading(false);
        return { error: authErr.message };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("codepath_token", data.session.access_token);
        }
        try {
          await api.syncUser();
        } catch (e) {
          // Ignore sync in mock mode
        }
        setLoading(false);
        return { session: data.session, needsEmailConfirmation: false };
      }

      // If user is created but session is null, Supabase has email confirmation enabled
      setLoading(false);
      return { session: null, needsEmailConfirmation: true };
    } catch (err: any) {
      const msg = err.message || "An unexpected error occurred during registration.";
      console.error(msg);
      setError(msg);
      setLoading(false);
      return { error: msg };
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error: authErr } = await supabase.auth.signOut();
      if (authErr) {
        console.error(authErr.message);
      }
    } catch (err: any) {
      console.error(err?.message || "Sign out error");
    } finally {
      setUser(null);
      setSession(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("codepath_token");
      }
      setLoading(false);
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    setError(null);
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
      });
      if (resetErr) {
        setError(resetErr.message);
        return { error: resetErr.message };
      }
      return {};
    } catch (err: any) {
      const msg = err.message || "Failed to send reset email.";
      setError(msg);
      return { error: msg };
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        error,
        signInWithPassword,
        signUp,
        signOut,
        resetPasswordForEmail,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
