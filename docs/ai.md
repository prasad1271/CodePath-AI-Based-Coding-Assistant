# AI Engine & Pedagogical Intelligence

## 1. Pedagogical Architecture

CodePath's AI subsystem is built on a fundamental instructional philosophy: **Socratic & Hint-First Mentorship**. Traditional LLMs generate complete solutions immediately, which deprives engineering students of the cognitive struggle required to develop genuine algorithmic problem-solving instincts.

```
                         [Student Query / Stumbled Problem]
                                         |
                                         v
                         +-------------------------------+
                         |      AI System Prompt Guard   |
                         |  - Hint-First Rule Enforced   |
                         |  - No Direct Full Solutions   |
                         |  - Socratic Questioning       |
                         +---------------+---------------+
                                         |
               +-------------------------+-------------------------+
               |                                                   |
               v                                                   v
     [Provider 1: Gemini 1.5]                            [Provider 2: OpenAI 4o]
               \                                                   /
                +------------------------+------------------------+
                                         | (If offline or error)
                                         v
                         [Local Algorithmic Heuristic Fallback]
                                         |
                                         v
                        [Structured Pedagogical Response]
                        - Key Concept Identification
                        - Progressive Tier Hint (1 of 3)
                        - Guiding Question for Student
```

---

## 2. Core AI Services

### 2.1 AI Programming Mentor (`/mentor`, `/api/v1/ai/mentor`)
- **Tone**: Encouraging, analytical, peer-senior engineer style.
- **Rules**:
  - Breaks down problems into conceptual invariants.
  - Asks the student to identify input boundaries and edge cases.
  - Offers progressive hints (Level 1: High-level intuition, Level 2: Data structure choice, Level 3: Pseudocode structure).

### 2.2 Error Doctor (`/error-doctor`, `/api/v1/ai/diagnose-error`)
- Diagnoses raw compiler errors, stack traces, and runtime exceptions.
- Output Schema:
  - `plain_english_explanation`: Explains the error without jargon (e.g. explains `IndexError` as looking for a 5th item in a box with only 4 items).
  - `root_cause`: Highlights the exact line and logic misstep.
  - `suggested_fix`: Shows the corrected code block.
  - `prevention_tip`: Advises on defensive programming techniques to avoid the bug permanently.

### 2.3 AI Mock Interview Simulator (`/interview`, `/api/v1/interview/*`)
- Conducts realistic engineering interview rounds:
  1. **Technical Problem Solving**: Evaluates algorithmic thinking, time/space complexity analysis, and edge case handling.
  2. **System Design**: Assesses API design, database schemas, scaling, and bottleneck identification.
  3. **Behavioral**: Evaluates communication using the **STAR** method (Situation, Task, Action, Result).
- Yields quantitative rubrics with actionable feedback points.

### 2.4 ATS Resume Engine & GitHub Auditor (`/resume`, `/github`)
- Analyzes candidate resumes against job descriptions for keyword density, impact metrics, action verbs, and structural readability.
- Audits GitHub repositories for repository README completeness, commit conventions, license inclusion, and project architecture explanations.

---

## 3. Fallback & Resilience Strategy

The system is configured with graceful degradation:
- If external API keys (`GEMINI_API_KEY` or `OPENAI_API_KEY`) are missing, expired, or rate-limited, the backend transparently routes calls to the built-in heuristic engine in `ai_service.py`.
- The heuristic engine uses pattern matching and AST token analysis to provide instant Socratic guidance, ensuring the platform remains 100% functional during local development or network outages.
