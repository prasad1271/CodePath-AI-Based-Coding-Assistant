"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud, FileText, CheckCircle2, AlertCircle,
  Loader2, X, Eye, Sparkles
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

interface ResumeUploadProps {
  onUploadSuccess?: (filePath: string, file: File) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

export function ResumeUpload({ onUploadSuccess, onUploadError, className = "" }: ResumeUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedData, setUploadedData] = useState<{ path: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  // STEP 32.7 — Complete upload function
  const uploadResume = async (file: File) => {
    if (!file) {
      throw new Error("Please select a resume.");
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Only PDF, DOC, and DOCX files are allowed.");
    }

    const maxSize = 15 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new Error("Resume must be smaller than 15 MB.");
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Not authenticated. Please sign in to upload your resume.");
    }

    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.+/g, ".");
    const filePath = `${user.id}/${sanitizedFileName}`;

    const { data, error } = await supabase.storage
      .from("resumes")
      .upload(filePath, file, {
        upsert: true,
      });

    if (error) {
      console.error("Resume upload failed:", error.message);
      throw new Error(error.message);
    }

    console.log("Resume uploaded:", data);

    return data;
  };

  const handleFileSelect = (file: File | undefined) => {
    setUploadError(null);
    setUploadedData(null);

    if (!file) return;

    // Client-side quick check
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadError("Only PDF, DOC, and DOCX files are allowed.");
      return;
    }

    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("Resume must be smaller than 15 MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a resume first.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const data = await uploadResume(selectedFile);
      setUploadedData(data);
      if (onUploadSuccess && data) {
        onUploadSuccess(data.path, selectedFile);
      }
    } catch (err: any) {
      const msg = err.message || "Failed to upload resume. Please try again.";
      setUploadError(msg);
      if (onUploadError) {
        onUploadError(msg);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setUploadError(null);
    setUploadedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className={`border-slate-800 bg-slate-900/60 shadow-xl overflow-hidden ${className}`}>
      <CardHeader className="text-center pb-4">
        <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-2 shadow-inner">
          <UploadCloud className="w-6 h-6" />
        </div>
        <CardTitle className="text-lg font-bold text-white tracking-tight">Upload Your Resume</CardTitle>
        <CardDescription className="text-xs text-slate-400">
          Upload your existing CV for ATS parsing, skill gap diagnosis, and formatting improvements.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            handleFileSelect(file);
          }}
        />

        {/* Dropzone / File Picker */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files?.[0];
            handleFileSelect(file);
          }}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
            isDragOver
              ? "border-blue-500 bg-blue-950/20"
              : selectedFile
              ? "border-emerald-700/60 bg-emerald-950/10"
              : "border-slate-800 hover:border-slate-700 bg-slate-950/50"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          {selectedFile ? (
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="flex items-center space-x-3 truncate">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left truncate">
                  <p className="text-xs font-semibold text-slate-200 truncate">{selectedFile.name}</p>
                  <p className="text-[11px] text-slate-400">{formatFileSize(selectedFile.size)} • {selectedFile.type.split("/")[1]?.toUpperCase() || "FILE"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                  Choose Resume
                </Button>
              </div>
              <p className="text-[11px] text-slate-400">
                Drag and drop your file here, or click to browse
              </p>
              <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500 font-mono">
                <span>PDF, DOC, DOCX</span>
                <span>•</span>
                <span>Max 15 MB</span>
              </div>
            </div>
          )}
        </div>

        {/* Error Feedback */}
        {uploadError && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 flex items-start space-x-2 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Success Feedback */}
        {uploadedData && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 flex items-start space-x-2 text-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-emerald-200">Resume Uploaded Successfully!</p>
              <p className="text-[11px] text-emerald-400/90 font-mono break-all">
                Storage Path: {uploadedData.path}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full bg-blue-600 hover:bg-blue-700 h-10 text-xs font-semibold text-white transition-colors"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading to Supabase Storage...
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4 mr-2" />
              Upload Resume
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
