-- ============================================================
-- CODEPATH SUPABASE POSTGRESQL INITIAL SCHEMA & RLS POLICIES
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- 1. USERS & PROFILES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'mentor', 'admin')),
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    branch TEXT,
    academic_year TEXT,
    programming_experience TEXT,
    preferred_language TEXT DEFAULT 'python',
    current_skill_level TEXT DEFAULT 'Beginner',
    career_goal TEXT DEFAULT 'Software Developer',
    daily_available_time TEXT DEFAULT '2 hours',
    dsa_experience TEXT DEFAULT 'Beginner',
    project_experience TEXT DEFAULT 'None',
    placement_goal TEXT,
    career_readiness_score NUMERIC(5, 2) DEFAULT 25.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    weekly_digest BOOLEAN DEFAULT TRUE,
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
    editor_keybindings TEXT DEFAULT 'standard',
    editor_font_size INT DEFAULT 14,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 2. LEARNING PATHS & ROADMAPS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    current_week INT DEFAULT 1,
    total_weeks INT DEFAULT 8,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    roadmap_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 3. COURSES, MODULES & LESSONS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    language TEXT NOT NULL,
    icon TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    order_index INT NOT NULL DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    code_snippet TEXT,
    solution_code TEXT,
    hints JSONB DEFAULT '[]'::jsonb,
    quiz_questions JSONB DEFAULT '[]'::jsonb,
    practice_problem_slug TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_module_lesson_slug UNIQUE (module_id, slug)
);

-- ------------------------------------------------------------
-- 4. CODING PRACTICE & TEST CASES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    topic TEXT NOT NULL,
    languages_supported JSONB NOT NULL DEFAULT '["python", "javascript", "java", "cpp", "c"]'::jsonb,
    starter_codes JSONB NOT NULL DEFAULT '{}'::jsonb,
    constraints_text TEXT,
    hints JSONB DEFAULT '[]'::jsonb,
    solution_explanation TEXT,
    company_tags JSONB DEFAULT '[]'::jsonb,
    acceptance_rate NUMERIC(5, 2) DEFAULT 75.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.problem_test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    order_index INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    code TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error', 'Pending')),
    execution_time_ms NUMERIC(8, 2) DEFAULT 0,
    memory_used_kb NUMERIC(10, 2) DEFAULT 0,
    passed_test_cases INT DEFAULT 0,
    total_test_cases INT DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 5. PROGRESS, STREAKS & GAMIFICATION
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('lesson', 'problem', 'dsa_topic', 'project', 'placement_test')),
    entity_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed')),
    score NUMERIC(5, 2) DEFAULT 100.00,
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT unique_user_entity_progress UNIQUE (user_id, entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS public.streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    current_streak INT DEFAULT 1,
    longest_streak INT DEFAULT 1,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    badge_icon TEXT NOT NULL,
    xp_reward INT NOT NULL DEFAULT 50,
    category TEXT NOT NULL CHECK (category IN ('coding', 'streak', 'learning', 'project', 'interview'))
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS public.xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    reason TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 6. DSA SYSTEM
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dsa_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    concept_explanation TEXT NOT NULL,
    patterns JSONB DEFAULT '[]'::jsonb,
    visualization_type TEXT DEFAULT 'array',
    common_mistakes JSONB DEFAULT '[]'::jsonb,
    problem_slugs JSONB DEFAULT '[]'::jsonb,
    interview_questions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 7. PROJECT MENTOR
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Web', 'Mobile', 'AI/ML', 'Data Science', 'Cybersecurity', 'Cloud', 'IoT', 'Automation')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    description TEXT NOT NULL,
    architecture_overview TEXT,
    tech_stack JSONB DEFAULT '[]'::jsonb,
    database_design TEXT,
    api_design TEXT,
    folder_structure TEXT,
    readme_content TEXT,
    resume_bullets JSONB DEFAULT '[]'::jsonb,
    github_repo_url TEXT,
    live_demo_url TEXT,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('planned', 'in_progress', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    milestone TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 8. CAREER ROADMAPS & SKILLS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.career_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    target_role TEXT NOT NULL,
    description TEXT NOT NULL,
    salary_range TEXT,
    market_demand TEXT DEFAULT 'High',
    required_languages JSONB DEFAULT '[]'::jsonb,
    technologies JSONB DEFAULT '[]'::jsonb,
    dsa_requirements JSONB DEFAULT '[]'::jsonb,
    projects_required JSONB DEFAULT '[]'::jsonb,
    certifications JSONB DEFAULT '[]'::jsonb,
    interview_topics JSONB DEFAULT '[]'::jsonb,
    resume_skills JSONB DEFAULT '[]'::jsonb,
    github_expectations JSONB DEFAULT '[]'::jsonb,
    learning_sequence JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 9. INTERVIEW PREPARATION
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    mode TEXT NOT NULL CHECK (mode IN ('HR', 'Technical', 'Coding', 'DSA', 'Project', 'Behavioral')),
    target_role TEXT NOT NULL,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
    overall_score NUMERIC(5, 2),
    technical_score NUMERIC(5, 2),
    problem_solving_score NUMERIC(5, 2),
    communication_score NUMERIC(5, 2),
    confidence_score NUMERIC(5, 2),
    strengths JSONB DEFAULT '[]'::jsonb,
    weaknesses JSONB DEFAULT '[]'::jsonb,
    feedback_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    expected_aspects JSONB DEFAULT '[]'::jsonb,
    question_order INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.interview_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_question_id UUID NOT NULL REFERENCES public.interview_questions(id) ON DELETE CASCADE,
    user_answer_text TEXT NOT NULL,
    score NUMERIC(5, 2),
    feedback TEXT,
    suggested_answer TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 10. PLACEMENT PREPARATION
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.placement_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Aptitude', 'Logical Reasoning', 'Verbal Ability', 'CS Fundamentals', 'Full Mock')),
    time_limit_minutes INT DEFAULT 30,
    total_questions INT DEFAULT 15,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.placement_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES public.placement_tests(id) ON DELETE CASCADE,
    subject TEXT NOT NULL CHECK (subject IN ('DBMS', 'OS', 'Computer Networks', 'OOP', 'SQL', 'Aptitude', 'Reasoning', 'Verbal')),
    question_text TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_option_index INT NOT NULL,
    explanation TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.placement_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES public.placement_tests(id) ON DELETE CASCADE,
    score NUMERIC(5, 2) NOT NULL,
    total_score NUMERIC(5, 2) NOT NULL,
    percentage NUMERIC(5, 2) NOT NULL,
    answers JSONB DEFAULT '{}'::jsonb,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 11. RESUME & GITHUB ASSISTANT
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'My Tech Resume',
    full_name TEXT,
    email TEXT,
    phone TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    summary TEXT,
    skills JSONB DEFAULT '[]'::jsonb,
    education JSONB DEFAULT '[]'::jsonb,
    projects JSONB DEFAULT '[]'::jsonb,
    experience JSONB DEFAULT '[]'::jsonb,
    certifications JSONB DEFAULT '[]'::jsonb,
    ats_score NUMERIC(5, 2) DEFAULT 0,
    ats_feedback JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.github_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    github_username TEXT NOT NULL,
    bio TEXT,
    checklist_results JSONB DEFAULT '[]'::jsonb,
    audit_score NUMERIC(5, 2) DEFAULT 0,
    recommendations JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 12. COMMUNITY FORUM
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    upvotes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    upvotes_count INT DEFAULT 0,
    is_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.community_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('post', 'comment')),
    entity_id UUID NOT NULL,
    vote_type INT NOT NULL CHECK (vote_type IN (1, -1)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_vote UNIQUE (user_id, entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('problem', 'lesson', 'dsa', 'project', 'post')),
    entity_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_bookmark UNIQUE (user_id, entity_type, entity_id)
);

-- ------------------------------------------------------------
-- 13. NOTIFICATIONS & AI CONVERSATIONS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'streak', 'achievement')),
    is_read BOOLEAN DEFAULT FALSE,
    link_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    mode TEXT NOT NULL CHECK (mode IN ('explain', 'debug', 'improve', 'hint', 'example', 'practice', 'interview', 'project')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    code_snippet TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_problems_slug ON public.problems(slug);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON public.problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_problems_topic ON public.problems(topic);
CREATE INDEX IF NOT EXISTS idx_submissions_user_problem ON public.submissions(user_id, problem_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON public.progress(user_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_interviews_user ON public.interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_comments_post ON public.community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv ON public.ai_messages(conversation_id, created_at ASC);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dsa_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- Public content read-only policies
CREATE POLICY "Courses are viewable by everyone" ON public.courses FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Modules are viewable by everyone" ON public.modules FOR SELECT USING (TRUE);
CREATE POLICY "Lessons are viewable by everyone" ON public.lessons FOR SELECT USING (TRUE);
CREATE POLICY "Problems are viewable by everyone" ON public.problems FOR SELECT USING (TRUE);
CREATE POLICY "Non-hidden test cases are viewable" ON public.problem_test_cases FOR SELECT USING (is_hidden = FALSE);
CREATE POLICY "DSA topics are viewable by everyone" ON public.dsa_topics FOR SELECT USING (TRUE);
CREATE POLICY "Career paths are viewable by everyone" ON public.career_paths FOR SELECT USING (TRUE);
CREATE POLICY "Placement tests are viewable by everyone" ON public.placement_tests FOR SELECT USING (TRUE);
CREATE POLICY "Community posts are viewable by everyone" ON public.community_posts FOR SELECT USING (TRUE);
CREATE POLICY "Community comments are viewable by everyone" ON public.community_comments FOR SELECT USING (TRUE);

-- User private data policies (Users can only read/write their own records)
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own learning paths" ON public.learning_paths FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view and create submissions" ON public.submissions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own progress" ON public.progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own streaks" ON public.streaks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own xp" ON public.xp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own interviews" ON public.interviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own placement attempts" ON public.placement_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own resumes" ON public.resumes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own github profile audit" ON public.github_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own community posts" ON public.community_posts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own community comments" ON public.community_comments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own votes" ON public.community_votes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bookmarks" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own ai conversations" ON public.ai_conversations FOR ALL USING (auth.uid() = user_id);
