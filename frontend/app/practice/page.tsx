"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Code, Search, Filter, CheckCircle2, Circle, ArrowRight, Tag } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Problem } from "@/types";
import { api } from "@/services/api";

export default function PracticePage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState("All");

  const fetchProblems = useCallback(() => {
    setLoading(true);
    const params: any = {};
    if (selectedDifficulty !== "All") params.difficulty = selectedDifficulty;
    if (selectedTopic !== "All") params.topic = selectedTopic;
    if (search.trim()) params.search = search.trim();

    api.getProblems(params)
      .then((res) => setProblems(res))
      .catch((err) => console.error("Problems fetch error:", err))
      .finally(() => setLoading(false));
  }, [selectedDifficulty, selectedTopic, search]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProblems();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Code className="w-6 h-6 text-indigo-400" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Coding Practice Arena</h1>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Curated algorithmic problems asked in product MNCs and technical campus placement rounds.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {problems.length} Problems Available
          </Badge>
        </div>

        {/* Filters and Search Toolbar */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problem title..."
              className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </form>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
            {/* Difficulty */}
            <div className="flex space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {["All", "Easy", "Medium", "Hard"].map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  className={`px-3 py-1 rounded-md text-xs transition-colors ${
                    selectedDifficulty === d
                      ? "bg-indigo-600 text-white font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Topic Filter */}
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="bg-slate-950 text-slate-300 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
            >
              <option value="All">All Topics</option>
              <option value="Arrays">Arrays</option>
              <option value="Strings">Strings</option>
              <option value="Dynamic Programming">Dynamic Programming</option>
            </select>
          </div>
        </div>

        {/* Problems List Table */}
        <Card className="border-slate-800 bg-slate-900/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Status</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Acceptance</th>
                  <th className="py-3 px-4">Company Tags</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      Loading practice problems...
                    </td>
                  </tr>
                ) : problems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No problems found matching this filter.
                    </td>
                  </tr>
                ) : (
                  problems.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="py-3.5 px-4 text-center">
                        {p.is_solved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-600 inline" />
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                        <Link href={`/practice/${p.slug}`}>
                          {p.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {p.topic}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            p.difficulty === "Easy" ? "success" : p.difficulty === "Medium" ? "warning" : "destructive"
                          }
                          className="text-[10px]"
                        >
                          {p.difficulty}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {p.acceptance_rate.toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {p.company_tags?.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/practice/${p.slug}`}>
                          <Button size="sm" variant="outline" className="h-7 text-xs border-slate-800 hover:bg-slate-800">
                            Solve
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
