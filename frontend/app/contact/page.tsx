"use client";

import React, { useState } from "react";
import { Mail, Send, CheckCircle2, MessageSquare } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-6 flex-1 w-full">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Contact CodePath Team</h1>
          <p className="text-slate-400 text-xs">
            Questions, campus partnership inquiries, or platform feedback? We&apos;d love to hear from you.
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/60 p-6">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h2 className="text-lg font-bold text-white">Message Received!</h2>
              <p className="text-xs text-slate-300">
                Thank you, {name}. An engineering mentor from our team will respond to <strong className="text-white">{email}</strong> shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Verma"
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@college.edu"
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Message / Question</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help your learning or placement preparation?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-10 text-xs font-semibold">
                <Send className="w-3.5 h-3.5 mr-2" />
                Submit Message
              </Button>
            </form>
          )}
        </Card>
      </div>
      <Footer />
    </div>
  );
}
