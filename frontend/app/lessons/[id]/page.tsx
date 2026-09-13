"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LessonDirectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      // Default to foundational track or route to the specific lesson
      router.replace(`/learn/python-fundamentals/${id}`);
    }
  }, [id, router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      <p className="text-xs text-slate-400">Loading lesson workspace...</p>
    </div>
  );
}
