"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  User as UserIcon, Mail, Phone, School, GraduationCap,
  BookOpen, Calendar, FileText, Tag, Github, Linkedin,
  Globe, Edit3, Save, X, Loader2, CheckCircle2, AlertCircle, Camera
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";
import { useAuth } from "@/lib/context/AuthContext";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [degree, setDegree] = useState("");
  const [branch, setBranch] = useState("");
  const [graduationYear, setGraduationYear] = useState<number>(2026);
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [readinessScore, setReadinessScore] = useState<number>(35);

  // Original snapshot for cancel
  const [initialData, setInitialData] = useState<any>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const [u, p] = await Promise.all([
        api.getMe().catch(() => null),
        api.getProfile().catch(() => null),
      ]);

      const nameVal = u?.full_name || authUser?.user_metadata?.full_name || "Engineering Student";
      const emailVal = u?.email || authUser?.email || "student@codepath.dev";
      const phoneVal = p?.phone || "+91 98765 43210";
      const collegeVal = p?.college || "Institute of Engineering & Technology";
      const degreeVal = p?.degree || "B.Tech Computer Science";
      const branchVal = p?.branch || "Computer Science & Engineering";
      const gradYearVal = p?.graduation_year || 2026;
      const bioVal = p?.bio || "Aspiring software engineer learning algorithms, full-stack architecture, and cloud deployment.";
      const skillsVal = p?.skills || ["Python", "Data Structures", "Next.js", "PostgreSQL", "Docker"];
      const gitVal = p?.github_url || "https://github.com";
      const linkVal = p?.linkedin_url || "https://linkedin.com";
      const portVal = p?.portfolio_url || "https://portfolio.dev";
      const readinessVal = p?.career_readiness_score ? Number(p.career_readiness_score) : 35;

      setFullName(nameVal);
      setEmail(emailVal);
      setPhone(phoneVal);
      setCollege(collegeVal);
      setDegree(degreeVal);
      setBranch(branchVal);
      setGraduationYear(gradYearVal);
      setBio(bioVal);
      setSkills(Array.isArray(skillsVal) ? skillsVal : []);
      setGithubUrl(gitVal);
      setLinkedinUrl(linkVal);
      setPortfolioUrl(portVal);
      setReadinessScore(readinessVal);

      setInitialData({
        fullName: nameVal,
        email: emailVal,
        phone: phoneVal,
        college: collegeVal,
        degree: degreeVal,
        branch: branchVal,
        graduationYear: gradYearVal,
        bio: bioVal,
        skills: Array.isArray(skillsVal) ? skillsVal : [],
        githubUrl: gitVal,
        linkedinUrl: linkVal,
        portfolioUrl: portVal,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load student profile.");
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleCancel = () => {
    if (initialData) {
      setFullName(initialData.fullName);
      setPhone(initialData.phone);
      setCollege(initialData.college);
      setDegree(initialData.degree);
      setBranch(initialData.branch);
      setGraduationYear(initialData.graduationYear);
      setBio(initialData.bio);
      setSkills(initialData.skills);
      setGithubUrl(initialData.githubUrl);
      setLinkedinUrl(initialData.linkedinUrl);
      setPortfolioUrl(initialData.portfolioUrl);
    }
    setIsEditing(false);
    setErrorMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.updateProfile({
        full_name: fullName,
        phone,
        college,
        degree,
        branch,
        graduation_year: Number(graduationYear),
        bio,
        skills,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        portfolio_url: portfolioUrl,
      });

      setSuccessMsg("Profile successfully updated and synchronized.");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to persist profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (isEditing) {
      setSkills(skills.filter((s) => s !== skillToRemove));
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="space-y-6 animate-pulse max-w-4xl mx-auto">
            <div className="h-40 bg-slate-900 rounded-2xl" />
            <div className="h-96 bg-slate-900 rounded-2xl" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Header Card */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg ring-2 ring-blue-500/30">
                  {fullName.charAt(0) || "S"}
                </div>
                {isEditing && (
                  <button className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors shadow">
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-white tracking-tight">{fullName}</h1>
                  <Badge variant="outline" className="text-[10px] font-mono border-blue-500/30 text-blue-400">
                    Student
                  </Badge>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">
                  {degree} • {college}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-xs h-9 px-4 shadow-md"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saving}
                    className="text-xs h-9 px-3 border-slate-700 hover:bg-slate-800"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-xs h-9 px-4"
                  >
                    {saving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    ) : (
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 flex items-start space-x-2 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 flex items-start space-x-2 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Profile Form Content */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* 1. Basic & Contact Information */}
            <Card className="border-slate-800 bg-slate-900/50 p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <UserIcon className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Basic & Contact Details
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 text-slate-200 focus:outline-none focus:border-blue-500 disabled:opacity-75 disabled:bg-slate-950/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Email (Authenticated)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      readOnly
                      disabled
                      value={email}
                      className="w-full h-9 bg-slate-950/50 border border-slate-800 rounded-lg pl-9 pr-3 text-slate-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 text-slate-200 focus:outline-none focus:border-blue-500 disabled:opacity-75 disabled:bg-slate-950/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Career Readiness Gauge</label>
                  <div className="h-9 rounded-lg bg-slate-950 border border-slate-800 px-3 flex items-center justify-between font-mono">
                    <span className="text-slate-400 text-xs">Overall Preparedness</span>
                    <Badge variant="default" className="text-xs">
                      {readinessScore.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* 2. Academic Information */}
            <Card className="border-slate-800 bg-slate-900/50 p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <School className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Academic Background
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">College / University</label>
                  <div className="relative">
                    <School className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-75 disabled:bg-slate-950/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Degree Program</label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-75 disabled:bg-slate-950/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Engineering Branch</label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-75 disabled:bg-slate-950/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Graduation Year</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      disabled={!isEditing}
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(Number(e.target.value))}
                      className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-75 disabled:bg-slate-950/40"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 text-xs">Bio / Engineering Summary</label>
                <textarea
                  disabled={!isEditing}
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 disabled:opacity-75 disabled:bg-slate-950/40"
                />
              </div>
            </Card>

            {/* 3. Skills & Engineering Portfolio Links */}
            <Card className="border-slate-800 bg-slate-900/50 p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Tag className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Technical Skills & Portfolio
                </h2>
              </div>

              {/* Skills Tags */}
              <div className="space-y-2">
                <label className="text-slate-400 block text-xs">Proficient Technologies & Concepts</label>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-md bg-purple-950/50 text-purple-300 border border-purple-800/40 text-xs flex items-center space-x-1"
                    >
                      <span>{s}</span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(s)}
                          className="hover:text-red-400 ml-1"
                        >
                          &times;
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                {isEditing && (
                  <div className="flex space-x-2 pt-2 max-w-sm">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="Add a skill (e.g. React, Redis)"
                      className="flex-1 h-8 bg-slate-950 border border-slate-800 rounded-lg px-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddSkill}
                      className="h-8 bg-purple-600 hover:bg-purple-700 text-xs px-3"
                    >
                      Add
                    </Button>
                  </div>
                )}
              </div>

              {/* Social & Portfolio Links */}
              <div className="grid sm:grid-cols-3 gap-4 text-xs pt-2">
                <div>
                  <label className="text-slate-400 block mb-1">GitHub Profile</label>
                  <div className="relative">
                    <Github className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="url"
                      disabled={!isEditing}
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 text-slate-200 focus:outline-none focus:border-purple-500 disabled:opacity-75 disabled:bg-slate-950/40 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">LinkedIn Profile</label>
                  <div className="relative">
                    <Linkedin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="url"
                      disabled={!isEditing}
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 text-slate-200 focus:outline-none focus:border-purple-500 disabled:opacity-75 disabled:bg-slate-950/40 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Portfolio / Personal Site</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="url"
                      disabled={!isEditing}
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://yourportfolio.dev"
                      className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 text-slate-200 focus:outline-none focus:border-purple-500 disabled:opacity-75 disabled:bg-slate-950/40 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
