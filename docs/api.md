# API Reference Specification

All endpoints are served under `/api/v1` and follow standard REST principles with JSON payloads and response envelopes.

## 1. Response Envelopes

### Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Requested entity does not exist",
    "details": null
  }
}
```

---

## 2. Authentication & Headers

Protected routes require an `Authorization` header containing a valid Supabase JWT bearer token:
```http
Authorization: Bearer <supabase_jwt_access_token>
```
Client requests should also optionally supply an `X-Request-ID` UUID for cross-tier log tracing.

---

## 3. Endpoints Directory

### 3.1 Authentication & Profile
- `POST /api/v1/auth/signup` - Register a new student account
- `POST /api/v1/auth/login` - Authenticate student credentials
- `POST /api/v1/auth/refresh` - Refresh access token session
- `POST /api/v1/auth/logout` - Invalidate session token
- `GET /api/v1/users/me` - Fetch authenticated user profile and stats
- `PUT /api/v1/users/me` - Update profile, university, and career targets

### 3.2 Learning & Curriculums
- `GET /api/v1/learning/courses` - List published programming courses
- `GET /api/v1/learning/courses/{slug}` - Fetch course syllabus with modules and lessons
- `GET /api/v1/learning/lessons/{id}` - Fetch lesson markdown and starter code
- `POST /api/v1/learning/lessons/{id}/complete` - Record lesson completion and award XP

### 3.3 Practice Arena & Code Execution
- `GET /api/v1/practice/problems` - Query problems by difficulty, category, and status
- `GET /api/v1/practice/problems/{slug}` - Get problem detail, starter code, and sample test cases
- `POST /api/v1/practice/run` - Execute code against public sample test cases
- `POST /api/v1/practice/submit` - Execute code against full hidden test suite and save submission
- `GET /api/v1/practice/submissions` - List user's past submissions and statuses

### 3.4 Data Structures & Algorithms
- `GET /api/v1/dsa/roadmap` - Fetch structured roadmap with topic completion percentages
- `GET /api/v1/dsa/topics/{slug}` - Get deep dive into algorithms, patterns, and problems
- `POST /api/v1/dsa/problems/{id}/status` - Update problem mastery state (Solved, Revision)

### 3.5 AI Programming Assistant & Diagnostics
- `POST /api/v1/ai/mentor` - Socratic AI mentor conversational guidance
- `POST /api/v1/ai/diagnose-error` - Error Doctor diagnostic analysis
- `POST /api/v1/ai/code-review` - Automated code review for complexity, style, and edge cases
- `POST /api/v1/ai/explain-concept` - Intuitive concept breakdown with real-world analogies

### 3.6 Career & Readiness Engine
- `GET /api/v1/career/roles` - List available engineering roles and demand metrics
- `GET /api/v1/career/roadmaps/{role_slug}` - Step-by-step milestone roadmap for target role
- `GET /api/v1/career/readiness` - Get live multi-factor Career Readiness breakdown (0-100%)

### 3.7 Mock Interviews
- `GET /api/v1/interview/sessions` - List student's historical mock interviews
- `POST /api/v1/interview/start` - Initialize new AI interview session (Technical, Behavioral, System Design)
- `POST /api/v1/interview/{id}/message` - Post response to interviewer and receive next question
- `POST /api/v1/interview/{id}/finish` - Conclude session and receive comprehensive rubric report

### 3.8 Placement Simulator
- `GET /api/v1/placement/drives` - List company-specific mock placement drives
- `GET /api/v1/placement/drives/{slug}` - Fetch drive details, sections, and time limits
- `POST /api/v1/placement/drives/{id}/start` - Begin timed placement test attempt
- `POST /api/v1/placement/attempts/{id}/submit` - Submit section answers and compute placement percentile

### 3.9 Resume & GitHub
- `GET /api/v1/resume` - Fetch saved resume profile
- `POST /api/v1/resume` - Save resume JSON structure
- `POST /api/v1/resume/analyze` - Run ATS keyword audit against target job description
- `POST /api/v1/github/audit` - Analyze public GitHub username or repository for engineering best practices

### 3.10 Community & Admin
- `GET /api/v1/community/threads` - List discussion threads with pagination
- `POST /api/v1/community/threads` - Create new discussion or question thread
- `POST /api/v1/community/threads/{id}/replies` - Reply to an existing discussion
- `GET /api/v1/admin/overview` - Fetch platform KPIs, active learners, and error logs (admin only)
