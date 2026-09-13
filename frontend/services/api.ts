import {
  User, Profile, Course, Lesson, Problem, CodeRunResult,
  DsaTopic, CareerPath, CareerReadiness, Project,
  InterviewSession, PlacementTest, ResumeData, CommunityPost
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

class ApiClient {
  private getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("codepath_token");
    }
    return null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const res = await fetch(url, {
        ...options,
        headers,
      });

      if (!res.ok) {
        let errMessage = `HTTP error ${res.status}`;
        try {
          const errData = await res.json();
          if (errData.error?.message) {
            errMessage = errData.error.message;
          }
        } catch {
          // Ignore JSON parse error on non-json error responses
        }
        throw new Error(errMessage);
      }

      const json: ApiResponse<T> = await res.json();
      return json.data;
    } catch (err: any) {
      console.error(`API request failed [${endpoint}]:`, err);
      throw err;
    }
  }

  // Auth & Profile
  async getMe(): Promise<User> {
    return this.request<User>("/auth/me");
  }

  async syncUser(): Promise<User> {
    return this.request<User>("/auth/sync", { method: "POST" });
  }

  async getProfile(): Promise<Profile> {
    return this.request<Profile>("/users/profile");
  }

  async updateProfile(data: any): Promise<Profile> {
    return this.request<Profile>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async completeOnboarding(data: Partial<Profile>): Promise<Profile> {
    return this.request<Profile>("/users/onboarding", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getDashboard(): Promise<any> {
    return this.request<any>("/users/dashboard");
  }

  // Learning & Courses
  async getCourses(): Promise<Course[]> {
    return this.request<Course[]>("/learning/courses");
  }

  async getCourseDetail(courseSlug: string): Promise<{ course: Course; modules: any[] }> {
    return this.request<{ course: Course; modules: any[] }>(`/learning/courses/${courseSlug}`);
  }

  async getLessonDetail(courseSlug: string, lessonSlug: string): Promise<Lesson> {
    return this.request<Lesson>(`/learning/courses/${courseSlug}/lessons/${lessonSlug}`);
  }

  async completeLesson(lessonSlug: string): Promise<any> {
    return this.request<any>(`/learning/lessons/${lessonSlug}/complete`, {
      method: "POST",
    });
  }

  // Coding Practice
  async getProblems(params?: { difficulty?: string; topic?: string; search?: string }): Promise<Problem[]> {
    const query = new URLSearchParams();
    if (params?.difficulty) query.append("difficulty", params.difficulty);
    if (params?.topic) query.append("topic", params.topic);
    if (params?.search) query.append("search", params.search);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return this.request<Problem[]>(`/practice/problems${qs}`);
  }

  async getProblem(slug: string): Promise<Problem> {
    return this.request<Problem>(`/practice/problems/${slug}`);
  }

  async runCode(language: string, code: string, custom_input?: string): Promise<CodeRunResult> {
    return this.request<CodeRunResult>("/practice/run", {
      method: "POST",
      body: JSON.stringify({ language, code, custom_input }),
    });
  }

  async submitSolution(problem_id: string, language: string, code: string): Promise<any> {
    return this.request<any>("/practice/submit", {
      method: "POST",
      body: JSON.stringify({ problem_id, language, code }),
    });
  }

  // AI Mentor & Error Doctor
  async chatWithMentor(message: string, mode: string = "explain", language: string = "python", code_context?: string, conversation_id?: string): Promise<any> {
    return this.request<any>("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message, mode, language, code_context, conversation_id }),
    });
  }

  async diagnoseError(language: string, code: string, error_message?: string): Promise<any> {
    return this.request<any>("/ai/error-doctor", {
      method: "POST",
      body: JSON.stringify({ language, code, error_message }),
    });
  }

  async getAiHint(problem_title: string, student_code: string, current_error_or_issue?: string, hints_already_given: number = 0): Promise<any> {
    return this.request<any>("/ai/hint", {
      method: "POST",
      body: JSON.stringify({ problem_title, student_code, current_error_or_issue, hints_already_given }),
    });
  }

  // DSA
  async getDsaTopics(): Promise<DsaTopic[]> {
    return this.request<DsaTopic[]>("/dsa/topics");
  }

  async getDsaTopic(slug: string): Promise<DsaTopic> {
    return this.request<DsaTopic>(`/dsa/topics/${slug}`);
  }

  async completeDsaTopic(slug: string): Promise<any> {
    return this.request<any>(`/dsa/topics/${slug}/complete`, { method: "POST" });
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>("/projects");
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/projects/${id}`);
  }

  async deleteProject(id: string): Promise<any> {
    return this.request<any>(`/projects/${id}`, { method: "DELETE" });
  }

  async createProject(project: Partial<Project>): Promise<Project> {
    return this.request<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(project),
    });
  }

  async generateProjectIdea(category: string, difficulty: string): Promise<any> {
    return this.request<any>("/projects/generate", {
      method: "POST",
      body: JSON.stringify({ category, difficulty }),
    });
  }

  async toggleProjectTask(projectId: string, taskId: string): Promise<any> {
    return this.request<any>(`/projects/${projectId}/tasks/${taskId}/toggle`, { method: "POST" });
  }

  // Career Roadmaps
  async getCareerPaths(): Promise<CareerPath[]> {
    return this.request<CareerPath[]>("/career/paths");
  }

  async getCareerPath(slug: string): Promise<CareerPath> {
    return this.request<CareerPath>(`/career/paths/${slug}`);
  }

  async getCareerReadiness(): Promise<CareerReadiness> {
    return this.request<CareerReadiness>("/career/readiness");
  }

  // Interviews
  async startInterview(mode: string, target_role: string): Promise<InterviewSession> {
    return this.request<InterviewSession>("/interviews/start", {
      method: "POST",
      body: JSON.stringify({ mode, target_role }),
    });
  }

  async submitInterviewAnswer(interviewId: string, questionId: string, answer_text: string): Promise<any> {
    return this.request<any>(`/interviews/${interviewId}/questions/${questionId}/answer`, {
      method: "POST",
      body: JSON.stringify({ answer_text }),
    });
  }

  async completeInterview(interviewId: string): Promise<InterviewSession> {
    return this.request<InterviewSession>(`/interviews/${interviewId}/complete`, { method: "POST" });
  }

  // Placement Prep
  async getPlacementTests(): Promise<PlacementTest[]> {
    return this.request<PlacementTest[]>("/placement/tests");
  }

  async getPlacementTest(testId: string): Promise<PlacementTest> {
    return this.request<PlacementTest>(`/placement/tests/${testId}`);
  }

  async submitPlacementTest(testId: string, answers: Record<string, number>): Promise<any> {
    return this.request<any>("/placement/submit", {
      method: "POST",
      body: JSON.stringify({ test_id: testId, answers }),
    });
  }

  // Resume & GitHub
  async getResume(): Promise<ResumeData> {
    return this.request<ResumeData>("/resume");
  }

  async updateResume(data: Partial<ResumeData>): Promise<ResumeData> {
    return this.request<ResumeData>("/resume", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async analyzeResumeAts(): Promise<any> {
    return this.request<any>("/resume/analyze", { method: "POST" });
  }

  async improveResumeBullet(original_bullet: string, role_or_project_context?: string): Promise<any> {
    return this.request<any>("/resume/improve-bullet", {
      method: "POST",
      body: JSON.stringify({ original_bullet, role_or_project_context }),
    });
  }

  async auditGithub(github_username: string, target_role?: string): Promise<any> {
    return this.request<any>("/github/audit", {
      method: "POST",
      body: JSON.stringify({ github_username, target_role }),
    });
  }

  // Community
  async getCommunityPosts(): Promise<CommunityPost[]> {
    return this.request<CommunityPost[]>("/community/posts");
  }

  async createCommunityPost(title: string, content: string, tags: string[]): Promise<CommunityPost> {
    return this.request<CommunityPost>("/community/posts", {
      method: "POST",
      body: JSON.stringify({ title, content, tags }),
    });
  }

  async addCommunityComment(postId: string, content: string): Promise<any> {
    return this.request<any>(`/community/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  }

  async voteCommunity(entity_type: "post" | "comment", entity_id: string, vote_type: number): Promise<any> {
    return this.request<any>("/community/vote", {
      method: "POST",
      body: JSON.stringify({ entity_type, entity_id, vote_type }),
    });
  }

  async deleteCommunityPost(id: string): Promise<any> {
    return this.request<any>(`/community/posts/${id}`, { method: "DELETE" });
  }

  // Notifications
  async getNotifications(): Promise<any[]> {
    return this.request<any[]>("/notifications");
  }

  async markNotificationRead(id: string): Promise<any> {
    return this.request<any>(`/notifications/${id}/read`, { method: "POST" });
  }

  async markAllNotificationsRead(): Promise<any> {
    return this.request<any>("/notifications/read-all", { method: "POST" });
  }

  // Admin
  async getAdminStats(): Promise<any> {
    return this.request<any>("/admin/stats");
  }

  async getAdminUsers(): Promise<User[]> {
    return this.request<User[]>("/admin/users");
  }
}

export const api = new ApiClient();
