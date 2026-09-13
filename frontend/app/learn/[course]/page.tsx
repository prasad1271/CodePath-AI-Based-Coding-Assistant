"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BookOpen, CheckCircle2, Circle, ArrowRight, ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";

export default function CourseDetailPage() {
  const params = useParams();
  const courseSlug = params.course as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseSlug) {
      api.getCourseDetail(courseSlug)
        .then((res) => setData(res))
        .catch((err) => console.error("Course fetch error:", err))
        .finally(() => setLoading(false));
    }
  }, [courseSlug]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="h-28 bg-slate-900 rounded-xl" />
          <div className="h-48 bg-slate-900 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  const course = data?.course;
  const modules = data?.modules || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link href="/learn" className="inline-flex items-center text-xs text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to all courses
        </Link>

        {/* Course Header */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <Badge variant="outline" className="text-xs mb-2">
              {course?.difficulty} &bull; {course?.language?.toUpperCase()}
            </Badge>
            <h1 className="text-2xl font-bold text-white tracking-tight">{course?.title}</h1>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
              {course?.description}
            </p>
          </div>
          {modules.length > 0 && modules[0].lessons?.length > 0 && (
            <Link href={`/learn/${courseSlug}/${modules[0].lessons[0].slug}`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-xs px-5">
                Start Next Lesson
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          )}
        </div>

        {/* Modules & Lessons List */}
        <div className="space-y-6">
          {modules.map((m: any, mIdx: number) => (
            <Card key={m.id} className="border-slate-800 bg-slate-900/50">
              <CardHeader className="border-b border-slate-800/80 pb-3">
                <CardTitle className="text-base text-slate-200">
                  {m.title}
                </CardTitle>
                {m.description && (
                  <CardDescription className="text-xs">
                    {m.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-3 space-y-1">
                {m.lessons?.map((l: any) => (
                  <Link
                    key={l.id}
                    href={`/learn/${courseSlug}/${l.slug}`}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800/60 transition-colors text-xs text-slate-300 group"
                  >
                    <div className="flex items-center space-x-2.5">
                      {l.is_completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                      )}
                      <span className="font-medium group-hover:text-white">{l.title}</span>
                    </div>
                    <span className="text-slate-400 text-[11px] group-hover:text-blue-400 flex items-center">
                      Open <ArrowRight className="w-3 h-3 ml-1" />
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
