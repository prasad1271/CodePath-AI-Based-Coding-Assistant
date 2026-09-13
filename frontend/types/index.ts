export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "student" | "mentor" | "admin";
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  branch?: string;
  academic_year?: string;
  programming_experience?: string;
  preferred_language: string;
  current_skill_level: string;
  career_goal: string;
  daily_available_time: string;
  dsa_experience: string;
  project_experience: string;
  placement_goal?: string;
  career_readiness_score: number;
  phone?: string;
  college?: string;
  degree?: string;
  graduation_year?: number;
  bio?: string;
  skills?: string[];
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
}

export interface Streak {
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  language: string;
  icon: string;
  difficulty: string;
  order_index: number;
  modules_count?: number;
  lessons_count?: number;
  completed_lessons?: number;
}

export interface Lesson {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  content_markdown: string;
  code_snippet?: string;
  solution_code?: string;
  hints: string[];
  quiz_questions: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
  practice_problem_slug?: string;
  order_index: number;
  is_completed: boolean;
}

export interface Problem {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  acceptance_rate: number;
  is_solved: boolean;
  company_tags: string[];
  languages_supported?: string[];
  starter_codes?: Record<string, string>;
  constraints_text?: string;
  hints?: string[];
  solution_explanation?: string;
  test_cases?: Array<{
    id: string;
    input: string;
    expected_output: string;
    is_hidden: boolean;
  }>;
}

export interface CodeRunResult {
  status: string;
  output: string;
  error?: string;
  execution_time_ms: number;
  memory_used_kb: number;
}

export interface DsaTopic {
  id: string;
  slug: string;
  title: string;
  category: string;
  order_index: number;
  visualization_type: string;
  is_completed: boolean;
  concept_explanation?: string;
  patterns?: string[];
  common_mistakes?: string[];
  problem_slugs?: string[];
  interview_questions?: string[];
}

export interface CareerPath {
  id: string;
  slug: string;
  title: string;
  target_role: string;
  description: string;
  salary_range?: string;
  market_demand: string;
  required_languages?: string[];
  technologies?: string[];
  dsa_requirements?: string[];
  projects_required?: string[];
  certifications?: string[];
  interview_topics?: string[];
  resume_skills?: string[];
  github_expectations?: string[];
  learning_sequence?: string[];
}

export interface CareerReadiness {
  overall_score: number;
  programming_score: number;
  dsa_score: number;
  projects_score: number;
  interview_score: number;
  resume_score: number;
  readiness_level: string;
  strengths: string[];
  growth_areas: string[];
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  category: string;
  difficulty: string;
  description: string;
  architecture_overview?: string;
  tech_stack: string[];
  database_design?: string;
  api_design?: string;
  folder_structure?: string;
  readme_content?: string;
  resume_bullets: string[];
  github_repo_url?: string;
  status: string;
  created_at: string;
  tasks?: Array<{
    id: string;
    title: string;
    milestone: string;
    is_completed: boolean;
  }>;
}

export interface InterviewSession {
  id: string;
  mode: string;
  target_role: string;
  status: string;
  current_question?: {
    id: string;
    question_text: string;
    question_order: number;
  };
  overall_score?: number;
  technical_score?: number;
  problem_solving_score?: number;
  communication_score?: number;
  confidence_score?: number;
  strengths?: string[];
  weaknesses?: string[];
  feedback_text?: string;
}

export interface PlacementTest {
  id: string;
  title: string;
  category: string;
  time_limit_minutes: number;
  total_questions: number;
  questions?: Array<{
    id: string;
    subject: string;
    question_text: string;
    options: string[];
  }>;
}

export interface ResumeData {
  id?: string;
  title: string;
  full_name?: string;
  email?: string;
  phone?: string;
  github_url?: string;
  linkedin_url?: string;
  summary?: string;
  skills: string[];
  education: Array<{ degree: string; institution: string; year: string; score?: string }>;
  projects: Array<{ title: string; description: string; tech: string; bullets: string[] }>;
  experience: Array<{ role: string; company: string; duration: string; bullets: string[] }>;
  ats_score?: number;
  ats_feedback?: string[];
}

export interface CommunityPost {
  id: string;
  user_id?: string;
  author_name: string;
  title: string;
  content: string;
  tags: string[];
  upvotes_count: number;
  comments_count: number;
  is_resolved: boolean;
  created_at: string;
  comments?: Array<{
    id: string;
    author_name: string;
    content: string;
    upvotes_count: number;
    created_at: string;
  }>;
}
