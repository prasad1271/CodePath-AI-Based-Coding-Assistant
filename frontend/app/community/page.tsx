"use client";

import React, { useEffect, useState } from "react";
import {
  Users, ThumbsUp, MessageSquare, Plus, CheckCircle2,
  Tag, ArrowRight, Send, Loader2, Trash2
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommunityPost } from "@/types";
import { api } from "@/services/api";
import { useAuth } from "@/lib/context/AuthContext";

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("dsa, python");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active post comments state
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    api.getCommunityPosts()
      .then((res) => setPosts(res))
      .catch((err) => console.error("Posts error:", err))
      .finally(() => setLoading(false));
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setIsSubmitting(true);

    const tags = tagInput.split(",").map((t) => t.trim()).filter(Boolean);
    try {
      await api.createCommunityPost(title, content, tags);
      setTitle("");
      setContent("");
      setShowNewPost(false);
      fetchPosts();
    } catch (err) {
      console.error("Create post error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (postId: string, voteType: number) => {
    try {
      await api.voteCommunity("post", postId, voteType);
      fetchPosts();
    } catch (err) {
      console.error("Vote error:", err);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentInput.trim()) return;
    setIsCommenting(true);
    try {
      await api.addCommunityComment(postId, commentInput);
      setCommentInput("");
      fetchPosts();
    } catch (err) {
      console.error("Add comment error:", err);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to remove this discussion post?")) return;
    try {
      await api.deleteCommunityPost(postId);
      fetchPosts();
    } catch (err) {
      console.error("Delete post error:", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-indigo-400" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Engineering Community Forum</h1>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Ask programming questions, share debugging insights, discuss placement experiences, and collaborate.
            </p>
          </div>

          <Button
            onClick={() => setShowNewPost(!showNewPost)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Discussion Post
          </Button>
        </div>

        {/* New Post Form Drawer */}
        {showNewPost && (
          <Card className="border-indigo-900/40 bg-slate-900/90 p-5 space-y-4 animate-in fade-in">
            <h3 className="font-bold text-sm text-white">Create Community Question or Discussion</h3>
            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 'How to optimize recursion memory overhead in Depth-First Search?'"
                  className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Content / Explanation</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe your question, approach, or discussion points..."
                  className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="dsa, python, interviews"
                  className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setShowNewPost(false)} className="text-xs">
                  Cancel
                </Button>
                <Button size="sm" type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-xs">
                  {isSubmitting ? "Posting..." : "Publish Post"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Posts Thread */}
        <div className="space-y-4">
          {loading ? (
            [1, 2, 3].map((n) => <div key={n} className="h-32 bg-slate-900 rounded-xl animate-pulse" />)
          ) : posts.length === 0 ? (
            <Card className="border-slate-800 bg-slate-900/40 p-8 text-center space-y-2 text-xs text-slate-400">
              <p>No community posts yet. Be the first to start a conversation!</p>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="border-slate-800 bg-slate-900/50 p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 mb-1">
                      <span className="font-semibold text-slate-300">{post.author_name}</span>
                      <span>&bull;</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <h2 className="text-base font-bold text-white hover:text-blue-400 transition-colors cursor-pointer" onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}>
                      {post.title}
                    </h2>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(post.id, 1)}
                      className="h-8 px-2 text-xs text-slate-400 hover:text-emerald-400"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                      {post.upvotes_count}
                    </Button>

                    {(post.user_id === user?.id || !post.user_id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                        className="h-8 px-2 text-xs text-slate-500 hover:text-red-400"
                        title="Delete Post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex flex-wrap gap-1">
                    {post.tags?.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 text-[10px] font-mono border border-slate-800">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                    className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{post.comments?.length || post.comments_count || 0} Answers</span>
                  </button>
                </div>

                {/* Expanded Answers & Commenting Section */}
                {expandedPostId === post.id && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 animate-in fade-in">
                    <h3 className="font-semibold text-xs text-slate-300">Answers & Discussion:</h3>
                    {post.comments && post.comments.length > 0 ? (
                      <div className="space-y-2">
                        {post.comments.map((c) => (
                          <div key={c.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span className="font-semibold text-slate-300">{c.author_name}</span>
                              <span>{new Date(c.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-300">{c.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500">No replies yet. Share your insights!</p>
                    )}

                    {/* Answer input */}
                    <div className="flex space-x-2 pt-2">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Write your answer or explanation..."
                        className="flex-1 h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddComment(post.id)}
                        disabled={isCommenting || !commentInput.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-xs px-3"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
