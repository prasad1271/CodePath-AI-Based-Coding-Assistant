import json
import re
import ast
from typing import Dict, Any, List, Optional
import httpx
from app.core.config import settings
from app.core.logging import logger


class AIService:
    """
    Provider-agnostic AI Service abstraction.
    Supports Google Gemini, OpenAI, Anthropic, and an intelligent Mock/Offline fallback.
    Never exposes API keys to client-side.
    """

    @classmethod
    async def chat(
        cls,
        message: str,
        mode: str = "explain",
        language: str = "python",
        code_context: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        system_prompt = cls._get_system_prompt_for_mode(mode, language)
        full_user_prompt = message
        if code_context:
            full_user_prompt += f"\n\nStudent Code Context:\n```{language}\n{code_context}\n```"

        if settings.AI_PROVIDER == "gemini" and settings.AI_API_KEY:
            return await cls._call_gemini(system_prompt, full_user_prompt, mode)
        elif settings.AI_PROVIDER == "openai" and settings.AI_API_KEY:
            return await cls._call_openai(system_prompt, full_user_prompt, mode)
        else:
            return cls._mock_chat_response(message, mode, language, code_context)

    @classmethod
    async def diagnose_error(
        cls,
        language: str,
        code: str,
        error_message: Optional[str] = None
    ) -> Dict[str, Any]:
        # Pre-flight error auto-detection if none or blank provided
        if not error_message or not error_message.strip():
            error_message = cls._auto_detect_error(language, code)

        if settings.AI_PROVIDER == "gemini" and settings.AI_API_KEY:
            gemini_result = await cls._call_gemini_diagnose(language, code, error_message)
            if gemini_result:
                return gemini_result
        elif settings.AI_PROVIDER == "openai" and settings.AI_API_KEY:
            openai_result = await cls._call_openai_diagnose(language, code, error_message)
            if openai_result:
                return openai_result

        # Advanced static diagnostic & code auto-rectification engine fallback
        return cls._diagnose_error_offline(language, code, error_message)

    @classmethod
    async def generate_hint(
        cls,
        problem_title: str,
        student_code: str,
        current_issue: Optional[str] = None,
        hints_already_given: int = 0
    ) -> Dict[str, str]:
        level = hints_already_given + 1

        if settings.AI_PROVIDER == "gemini" and settings.AI_API_KEY:
            system_prompt = (
                f"You are the CodePath AI Algorithm Mentor. Provide a pedagogical Socratic hint at Level {level}/3.\n"
                "PEDAGOGICAL RULES:\n"
                "- Level 1: Focus on problem constraints, boundary values, edge cases, and high-level strategy without any code.\n"
                "- Level 2: Point toward optimal data structures (e.g. hash map, two pointers, sliding window) and invariants.\n"
                "- Level 3: Outline iteration steps or pseudo-invariants without giving away the complete final solution code.\n"
                "Return a JSON object with EXACTLY these keys:\n"
                "- hint: string (actionable pedagogical hint)\n"
                "- guiding_question: string (reflective question that triggers discovery)\n"
                "- concept_to_review: string (CS topic, e.g. 'Two Pointers & Invariants')\n"
                "Return valid JSON only."
            )
            user_prompt = f"Problem: {problem_title}\nHints Given: {hints_already_given}\nStudent Code:\n{student_code}\n"
            if current_issue:
                user_prompt += f"Current Issue/Error: {current_issue}\n"

            gemini_res = await cls._call_gemini_json(system_prompt, user_prompt, max_tokens=800)
            if gemini_res and "hint" in gemini_res:
                return {
                    "hint_level": level,
                    "hint": str(gemini_res.get("hint")),
                    "guiding_question": str(gemini_res.get("guiding_question", "What happens on a minimal sample input?")),
                    "concept_to_review": str(gemini_res.get("concept_to_review", "Algorithmic Invariants"))
                }

        # Offline fallback bank
        hints_bank = {
            1: {
                "hint": "Analyze the problem constraints and boundary conditions. Are you considering zero, negative numbers, or single-element inputs?",
                "guiding_question": "What is the expected behavior when the input collection is empty or contains duplicates?",
                "concept_to_review": "Boundary Checking & Base Cases"
            },
            2: {
                "hint": "Consider the optimal data structure. If searching or frequency counting is required, can a Hash Map (dictionary) reduce lookup time to O(1)?",
                "guiding_question": "What value do you need to look up repeatedly, and can you cache prior computations in a lookup table?",
                "concept_to_review": "Hash Tables & Space-Time Tradeoffs"
            },
            3: {
                "hint": "Break down the iteration loop. Ensure your pointer movement or state transitions correctly update variables at each step without off-by-one errors.",
                "guiding_question": "Trace your loop variables step-by-step with a 3-element sample input. Where does the logic deviate from expectation?",
                "concept_to_review": "Loop Invariants & Pointer Updates"
            }
        }
        selected = hints_bank.get(level, {
            "hint": "Review the algorithm pattern: Are you applying Two Pointers, Sliding Window, or Dynamic Programming memoization correctly?",
            "guiding_question": "Can you draw the state transformation diagram on paper before typing the next lines?",
            "concept_to_review": "Algorithmic Invariants"
        })
        return {
            "hint_level": level,
            "hint": selected["hint"],
            "guiding_question": selected["guiding_question"],
            "concept_to_review": selected["concept_to_review"]
        }

    @classmethod
    async def evaluate_interview_answer(
        cls,
        question: str,
        user_answer: str,
        target_role: str
    ) -> Dict[str, Any]:
        if settings.AI_PROVIDER == "gemini" and settings.AI_API_KEY:
            system_prompt = (
                f"You are a Senior Principal Technical Interviewer evaluating a candidate for a '{target_role}' role.\n"
                "Analyze the candidate's answer with deep engineering rigor across technical correctness, trade-offs, scalability, and clarity.\n"
                "Return a JSON object with EXACTLY these keys:\n"
                "- score: float between 40.0 and 99.0 (composite interview score)\n"
                "- technical_score: float between 40.0 and 99.0\n"
                "- communication_score: float between 40.0 and 99.0\n"
                "- problem_solving_score: float between 40.0 and 99.0\n"
                "- feedback: string (comprehensive constructive critique highlighting depth, latency, trade-offs)\n"
                "- suggested_answer: string (an exemplary, production-grade model answer demonstrating mastery for this role)\n"
                "- strengths: list of strings (2-3 specific technical strengths exhibited)\n"
                "- weaknesses: list of strings (1-2 areas to deepen or edge cases to consider)\n"
                "Return valid JSON only."
            )
            user_prompt = f"Role: {target_role}\nQuestion: {question}\nCandidate Answer: {user_answer}\n"
            gemini_res = await cls._call_gemini_json(system_prompt, user_prompt, max_tokens=1500)
            if gemini_res and "score" in gemini_res:
                try:
                    return {
                        "score": round(float(gemini_res.get("score", 75.0)), 1),
                        "technical_score": round(float(gemini_res.get("technical_score", 75.0)), 1),
                        "communication_score": round(float(gemini_res.get("communication_score", 75.0)), 1),
                        "problem_solving_score": round(float(gemini_res.get("problem_solving_score", 75.0)), 1),
                        "feedback": str(gemini_res.get("feedback", "Structured explanation.")),
                        "suggested_answer": str(gemini_res.get("suggested_answer", "")),
                        "strengths": list(gemini_res.get("strengths", ["Clear logical progression"])),
                        "weaknesses": list(gemini_res.get("weaknesses", ["Quantify engineering trade-offs"]))
                    }
                except Exception:
                    pass

        # Offline heuristic fallback
        words = len(user_answer.split())
        base_score = min(95.0, max(40.0, float(words * 2.5)))
        technical_keywords = ["complexity", "latency", "scale", "memory", "database", "index", "async", "cache", "security", "thread", "api"]
        tech_hits = sum(1 for kw in technical_keywords if kw in user_answer.lower())
        tech_score = min(98.0, 50.0 + tech_hits * 8.0)
        comm_score = 80.0 if words > 30 else 55.0
        prob_score = min(95.0, 60.0 + tech_hits * 6.0)
        overall = round((tech_score * 0.4 + comm_score * 0.3 + prob_score * 0.3), 1)

        return {
            "score": overall,
            "technical_score": tech_score,
            "communication_score": comm_score,
            "problem_solving_score": prob_score,
            "feedback": "Strong structured explanation. Consider providing a concrete real-world example with quantitative metrics (e.g. throughput, latency impact) to elevate your technical response.",
            "suggested_answer": f"For {target_role}, articulate the core principles clearly, mention trade-offs (e.g. memory vs speed), reference industry standard patterns, and conclude with edge cases you would monitor in production.",
            "strengths": ["Clear logical progression", "Appropriate engineering terminology"],
            "weaknesses": ["Could quantify trade-offs with specific benchmarks", "Mention error handling edge cases"]
        }

    @classmethod
    async def generate_interview_questions(
        cls,
        target_role: str,
        mode: str = "Technical"
    ) -> List[str]:
        if settings.AI_PROVIDER == "gemini" and settings.AI_API_KEY:
            system_prompt = (
                f"You are an Elite Tech Hiring Bar Raiser creating 3 top-tier mock interview questions for a '{target_role}' candidate.\n"
                f"Interview Mode: {mode}.\n"
                "Questions must be progressive (Question 1: fundamental principles, Question 2: architecture & real-world trade-offs, Question 3: failure recovery, concurrency, or scale).\n"
                "Return a JSON object with key 'questions': list of 3 concise strings."
            )
            user_prompt = f"Role: {target_role}\nMode: {mode}\n"
            gemini_res = await cls._call_gemini_json(system_prompt, user_prompt, max_tokens=600)
            if gemini_res and isinstance(gemini_res.get("questions"), list) and len(gemini_res["questions"]) >= 3:
                return [str(q) for q in gemini_res["questions"][:3]]

        # Default fallback questions
        if mode == "HR":
            return [
                "Tell me about a challenging engineering project where you had to learn a technology on a tight deadline.",
                "How do you handle disagreement with a teammate over technical architecture?",
                "Where do you see your technical trajectory in the next 3 years?"
            ]
        elif mode == "DSA":
            return [
                "Explain how a Hash Map handles collision resolution internally using Chaining vs Open Addressing.",
                "Compare Quick Sort and Merge Sort in terms of time complexity, stability, and cache locality.",
                "How would you detect a cycle in a singly linked list using constant O(1) space?"
            ]
        return [
            f"For a {target_role} role, how do you design a high-throughput REST API that remains resilient under traffic spikes?",
            "Explain the difference between optimistic and pessimistic locking in database transactions.",
            "How do you profile and eliminate memory leaks or slow database queries in production?"
        ]

    @classmethod
    async def analyze_resume_ats(cls, resume_data: Dict[str, Any]) -> Dict[str, Any]:
        if settings.AI_PROVIDER == "gemini" and settings.AI_API_KEY:
            system_prompt = (
                "You are an Executive Technical Recruiter and ATS (Applicant Tracking System) Specialist.\n"
                "Audit this software engineering resume against top-tier tech industry standards (Google, Meta, Stripe).\n"
                "Return a JSON object with EXACTLY these keys:\n"
                "- ats_score: float between 50.0 and 98.0 (realistic ATS compatibility score)\n"
                "- keyword_matches: list of strings (strong technical keywords and frameworks detected)\n"
                "- missing_critical_skills: list of strings (3-5 high-demand industry skills missing for tech roles)\n"
                "- action_verb_score: float between 50.0 and 98.0\n"
                "- quantifiable_metrics_present: boolean\n"
                "- section_scores: dict with keys 'contact_info', 'skills_alignment', 'project_impact', 'format_readability' (floats)\n"
                "- recommendations: list of strings (3 concrete, actionable improvements)\n"
                "Return valid JSON only."
            )
            user_prompt = f"Resume Data:\n{json.dumps(resume_data, indent=2)}\n"
            gemini_res = await cls._call_gemini_json(system_prompt, user_prompt, max_tokens=1500)
            if gemini_res and "ats_score" in gemini_res:
                try:
                    return {
                        "ats_score": round(float(gemini_res.get("ats_score", 78.0)), 1),
                        "keyword_matches": list(gemini_res.get("keyword_matches", [])),
                        "missing_critical_skills": list(gemini_res.get("missing_critical_skills", [])),
                        "action_verb_score": round(float(gemini_res.get("action_verb_score", 80.0)), 1),
                        "quantifiable_metrics_present": bool(gemini_res.get("quantifiable_metrics_present", False)),
                        "section_scores": dict(gemini_res.get("section_scores", {
                            "contact_info": 100.0,
                            "skills_alignment": 80.0,
                            "project_impact": 75.0,
                            "format_readability": 88.0
                        })),
                        "recommendations": list(gemini_res.get("recommendations", []))
                    }
                except Exception:
                    pass

        # Offline fallback
        skills = resume_data.get("skills", [])
        projects = resume_data.get("projects", [])
        experience = resume_data.get("experience", [])

        crit_skills = ["Python", "JavaScript", "TypeScript", "React", "PostgreSQL", "Docker", "Git", "REST APIs", "FastAPI", "Data Structures"]
        matched = [s for s in skills if any(c.lower() in s.lower() for c in crit_skills)]
        missing = [c for c in crit_skills if not any(c.lower() in s.lower() for s in skills)][:4]

        skills_score = min(100.0, len(matched) * 12.0)
        projects_score = min(100.0, len(projects) * 35.0)
        ats_score = round((skills_score * 0.4 + projects_score * 0.4 + (80.0 if experience else 50.0) * 0.2), 1)

        return {
            "ats_score": ats_score,
            "keyword_matches": matched,
            "missing_critical_skills": missing,
            "action_verb_score": 85.0,
            "quantifiable_metrics_present": any("%" in str(p) or "k" in str(p).lower() for p in projects),
            "section_scores": {
                "contact_info": 100.0,
                "skills_alignment": skills_score,
                "project_impact": projects_score,
                "format_readability": 90.0
            },
            "recommendations": [
                f"Incorporate high-demand skills like {', '.join(missing[:3])} where applicable.",
                "Quantify project accomplishments using XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'.",
                "Ensure every project links to a clean GitHub repository with architectural documentation."
            ]
        }

    @classmethod
    async def improve_resume_bullet(
        cls,
        original_bullet: str,
        role_or_project_context: Optional[str] = None
    ) -> Dict[str, Any]:
        orig = original_bullet.strip()
        if settings.AI_PROVIDER == "gemini" and settings.AI_API_KEY:
            system_prompt = (
                "You are an expert Resume Coach for software engineers.\n"
                "Rewrite the student's bullet point using Google's XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'.\n"
                "Provide 3 distinct, high-impact variations starting with powerful action verbs (e.g. Architected, Engineered, Optimized, Streamlined).\n"
                "Do NOT fabricate untruthful metrics; phrase metrics as measurable throughput, latency, test coverage, or operational efficiency improvements.\n"
                "Return a JSON object with:\n"
                "- improved_bullets: list of 3 strings\n"
                "- rationale: string (concise explanation of why these improvements pass ATS screening and impress recruiters)\n"
                "Return valid JSON only."
            )
            user_prompt = f"Original Bullet: {orig}\nContext: {role_or_project_context or 'Software Engineering'}\n"
            gemini_res = await cls._call_gemini_json(system_prompt, user_prompt, max_tokens=800)
            if gemini_res and isinstance(gemini_res.get("improved_bullets"), list) and len(gemini_res["improved_bullets"]) >= 1:
                return {
                    "original_bullet": orig,
                    "improved_bullets": [str(b) for b in gemini_res["improved_bullets"]],
                    "rationale": str(gemini_res.get("rationale", "Enhanced with Google XYZ formula and impactful technical action verbs."))
                }

        # Offline fallback
        return {
            "original_bullet": orig,
            "improved_bullets": [
                f"Engineered {orig.lower() if orig else 'project component'} using modern design patterns, improving code modularity and maintainability.",
                f"Implemented robust validation and error handling for {orig.lower() if orig else 'system feature'}, ensuring 99.9% uptime across local test suites.",
                f"Optimized computational workflow for {orig.lower() if orig else 'application module'}, reducing average latency and resource consumption."
            ],
            "rationale": "Transformed passive descriptions into results-driven statements led by strong technical action verbs without altering factual context."
        }

    @classmethod
    async def review_code_submission(
        cls,
        problem_title: str,
        problem_description: str,
        code: str,
        language: str = "python"
    ) -> Dict[str, Any]:
        if settings.AI_PROVIDER == "gemini" and settings.AI_API_KEY:
            system_prompt = (
                f"You are a Staff Software Engineer conducting a thorough code review of a {language} algorithmic solution.\n"
                "Analyze time complexity (Big-O), space complexity (Big-O), edge cases, and code style.\n"
                "Return a JSON object with:\n"
                "- time_complexity: string (e.g. 'O(N)')\n"
                "- space_complexity: string (e.g. 'O(1)')\n"
                "- time_analysis: string (explanation of time complexity loops/recursion)\n"
                "- space_analysis: string (explanation of auxiliary memory/structures)\n"
                "- strengths: list of strings (2 clean code highlights)\n"
                "- edge_cases: list of strings (2 boundary conditions to watch out for)\n"
                "- clean_code_tips: list of strings (idiomatic naming, type hints, refactoring suggestions)\n"
                "- optimization_suggestion: string (how this could scale or be optimized further)\n"
                "Return valid JSON only."
            )
            user_prompt = f"Problem: {problem_title}\nDescription: {problem_description}\nLanguage: {language}\nCode:\n```{language}\n{code}\n```"
            gemini_res = await cls._call_gemini_json(system_prompt, user_prompt, max_tokens=1500)
            if gemini_res and "time_complexity" in gemini_res:
                return {
                    "time_complexity": str(gemini_res.get("time_complexity", "O(N)")),
                    "space_complexity": str(gemini_res.get("space_complexity", "O(1)")),
                    "time_analysis": str(gemini_res.get("time_analysis", "Analyzed algorithmic execution steps.")),
                    "space_analysis": str(gemini_res.get("space_analysis", "Analyzed memory allocation.")),
                    "strengths": list(gemini_res.get("strengths", ["Logical structure"])),
                    "edge_cases": list(gemini_res.get("edge_cases", ["Empty inputs", "Single element boundary"])),
                    "clean_code_tips": list(gemini_res.get("clean_code_tips", ["Add type annotations"])),
                    "optimization_suggestion": str(gemini_res.get("optimization_suggestion", "Consider caching repeating calculations."))
                }

        # Offline fallback
        return {
            "time_complexity": "O(N)",
            "space_complexity": "O(1)",
            "time_analysis": "Linear scan across input elements.",
            "space_analysis": "Constant additional variables used in memory.",
            "strengths": ["Readable loop structure", "Direct variable naming"],
            "edge_cases": ["Empty list or null input", "Max constraint boundary"],
            "clean_code_tips": ["Add function docstring", "Ensure type hints are present"],
            "optimization_suggestion": "Review whether hash set or dictionary can reduce lookup steps."
        }

    @classmethod
    async def explain_lesson_concept(
        cls,
        lesson_title: str,
        lesson_content: str,
        student_question: str,
        language: str = "python"
    ) -> Dict[str, Any]:
        if settings.AI_PROVIDER == "gemini" and settings.AI_API_KEY:
            system_prompt = (
                f"You are the CodePath AI Interactive Tutor for {language}.\n"
                "A student is learning a lesson and has a question. Explain concepts clearly with simple real-world analogies, step-by-step reasoning, and a clean runnable example.\n"
                "Return a JSON object with:\n"
                "- explanation: string (comprehensive beginner-friendly markdown explanation)\n"
                "- key_takeaways: list of strings (3 bullet points)\n"
                "- sample_code: string or null (concise illustrative code snippet)\n"
                "- challenge_question: string (a micro-challenge for the student to test their comprehension)\n"
                "Return valid JSON only."
            )
            user_prompt = f"Lesson: {lesson_title}\nLesson Content Excerpt:\n{lesson_content[:2000]}\nStudent Question: {student_question}\n"
            gemini_res = await cls._call_gemini_json(system_prompt, user_prompt, max_tokens=1500)
            if gemini_res and "explanation" in gemini_res:
                return {
                    "explanation": str(gemini_res.get("explanation")),
                    "key_takeaways": list(gemini_res.get("key_takeaways", [])),
                    "sample_code": gemini_res.get("sample_code"),
                    "challenge_question": gemini_res.get("challenge_question")
                }

        # Offline fallback
        return {
            "explanation": f"### Understanding {lesson_title}\n\nWhen working with {language}, understanding fundamental core principles is key. Break the problem into independent steps, trace variable states on paper, and verify edge cases.",
            "key_takeaways": [
                "Decompose complex procedures into minimal functions.",
                "Ensure correct type definitions.",
                "Always verify zero and boundary conditions."
            ],
            "sample_code": f"# Sample concept for {lesson_title}\ndef demo():\n    print('Hello from CodePath')\n",
            "challenge_question": "How would you modify this to handle negative numbers or empty collections?"
        }

    @classmethod
    async def assess_career_readiness(
        cls,
        target_role: str,
        skills: List[str],
        solved_problems_count: int,
        projects: List[dict]
    ) -> Dict[str, Any]:
        if settings.AI_PROVIDER == "gemini" and settings.AI_API_KEY:
            system_prompt = (
                f"You are an Elite Career Mentor and Engineering Director.\n"
                f"Assess this candidate's career readiness for the role: '{target_role}'.\n"
                "Analyze their verified problem count, technical skills, and project portfolio.\n"
                "Return a JSON object with:\n"
                "- readiness_score: float between 40.0 and 95.0\n"
                "- top_strengths: list of strings (2-3 demonstrable engineering strengths)\n"
                "- critical_skill_gaps: list of strings (2-3 missing high-demand skills for this specific role)\n"
                "- recommended_projects: list of objects with keys 'title', 'tech_stack', 'why_it_matters'\n"
                "- weekly_action_plan: list of strings (4 actionable weekly steps to become hireable)\n"
                "Return valid JSON only."
            )
            user_prompt = f"Role: {target_role}\nSkills: {', '.join(skills)}\nSolved Problems: {solved_problems_count}\nProjects: {json.dumps(projects, indent=2)}\n"
            gemini_res = await cls._call_gemini_json(system_prompt, user_prompt, max_tokens=1500)
            if gemini_res and "readiness_score" in gemini_res:
                try:
                    return {
                        "readiness_score": round(float(gemini_res.get("readiness_score", 70.0)), 1),
                        "target_role": target_role,
                        "top_strengths": list(gemini_res.get("top_strengths", [])),
                        "critical_skill_gaps": list(gemini_res.get("critical_skill_gaps", [])),
                        "recommended_projects": list(gemini_res.get("recommended_projects", [])),
                        "weekly_action_plan": list(gemini_res.get("weekly_action_plan", []))
                    }
                except Exception:
                    pass

        # Offline fallback
        return {
            "readiness_score": min(92.0, max(45.0, 50.0 + solved_problems_count * 2.0 + len(skills) * 3.0)),
            "target_role": target_role,
            "top_strengths": ["Foundational programming proficiency", "Hands-on project work"],
            "critical_skill_gaps": ["Production CI/CD pipelines", "System design & caching strategies"],
            "recommended_projects": [
                {
                    "title": f"High-Throughput {target_role} API Service",
                    "tech_stack": "FastAPI / Node, Redis, PostgreSQL, Docker",
                    "why_it_matters": "Demonstrates asynchronous architecture, database indexing, and caching."
                }
            ],
            "weekly_action_plan": [
                "Solve 3 medium DSA problems focusing on Hash Maps and Dynamic Programming.",
                "Dockerize a full-stack project and write comprehensive integration tests.",
                "Conduct 2 mock technical interviews on system design.",
                "Revise resume bullet points with quantifiable XYZ metrics."
            ]
        }

    @classmethod
    def _get_system_prompt_for_mode(cls, mode: str, language: str) -> str:
        base = f"You are CodePath AI, an expert programming mentor for engineering students. You teach {language}.\n"
        if mode == "hint":
            return base + "PEDAGOGICAL RULE: DO NOT provide the complete solution code. Provide a guiding hint, ask a reflective question, and help the student discover the logic themselves."
        elif mode == "debug":
            return base + "Explain what caused the error, locate the exact conceptual flaw, and explain how to resolve it."
        elif mode == "interview":
            return base + "Conduct a rigorous technical interview. Ask challenging follow-up questions and assess system design and algorithmic complexity."
        elif mode == "improve":
            return base + "Suggest clean code improvements, algorithmic time/space optimizations, and modern idiom best practices."
        return base + "Explain concepts clearly in beginner-friendly language with step-by-step reasoning."

    @classmethod
    async def _call_gemini(cls, system_prompt: str, user_prompt: str, mode: str) -> Dict[str, Any]:
        candidate_models = [
            settings.AI_MODEL_NAME,
            "gemini-flash-lite-latest",
            "gemini-3.1-flash-lite",
            "gemini-3.6-flash"
        ]
        seen = set()
        models = [m for m in candidate_models if m and not (m in seen or seen.add(m))]

        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": f"{system_prompt}\n\nStudent question:\n{user_prompt}"}]}
            ],
            "generationConfig": {
                "temperature": settings.AI_TEMPERATURE,
                "maxOutputTokens": settings.AI_MAX_TOKENS
            }
        }

        for model in models:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.AI_API_KEY}"
                async with httpx.AsyncClient(timeout=15.0) as client:
                    res = await client.post(url, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        text = data["candidates"][0]["content"]["parts"][0]["text"]
                        return {
                            "conversation_id": "gemini-conv",
                            "response": text,
                            "mode": mode,
                            "suggested_hints": ["Can you optimize space complexity?", "What edge cases should we check?"],
                            "follow_up_questions": ["Would you like to write unit tests for this?", "Should we analyze the Big-O time complexity?"]
                        }
                    elif res.status_code in (429, 503):
                        logger.warning(f"Gemini model {model} returned {res.status_code}. Trying alternate model...")
                        continue
            except Exception as e:
                logger.warning(f"Gemini model {model} failed: {e}. Trying next model...")

        return cls._mock_chat_response(user_prompt, mode, "python", None)

    @classmethod
    async def _call_openai(cls, system_prompt: str, user_prompt: str, mode: str) -> Dict[str, Any]:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {settings.AI_API_KEY}"}
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": settings.AI_TEMPERATURE,
                "max_tokens": settings.AI_MAX_TOKENS
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    text = data["choices"][0]["message"]["content"]
                    return {
                        "conversation_id": "openai-conv",
                        "response": text,
                        "mode": mode,
                        "suggested_hints": ["Think about the worst-case time complexity."],
                        "follow_up_questions": ["Would you like an example with custom input?"]
                    }
        except Exception as e:
            logger.warning(f"OpenAI API call failed: {e}. Falling back to offline engine.")

        return cls._mock_chat_response(user_prompt, mode, "python", None)

    @classmethod
    def _mock_chat_response(cls, message: str, mode: str, language: str, code_context: Optional[str]) -> Dict[str, Any]:
        msg_lower = message.lower()
        if "nullpointer" in msg_lower or "null pointer" in msg_lower:
            response_text = (
                "### Understanding NullPointerException in Java\n\n"
                "**What happened:** Your program attempted to use an object reference that points to `null` (nowhere in memory).\n\n"
                "**Common Causes:**\n"
                "1. Calling a method on an uninitialized object variable.\n"
                "2. Accessing an array slot that hasn't been instantiated.\n"
                "3. Auto-unboxing a `null` wrapper class (`Integer` to `int`).\n\n"
                "**How to Fix:** Always check for `null` before dereferencing, or use `Optional<T>`:\n"
                "```java\nif (student != null) {\n    System.out.println(student.getName());\n}\n```"
            )
        elif mode == "hint":
            response_text = (
                "### Mentorship Hint 💡\n\n"
                "Let's break down your algorithm without giving away the direct code:\n\n"
                "1. **Observe your invariant:** What must remain true after each iteration of your loop?\n"
                "2. **State space:** Are you storing elements you've already visited in a hash set or dictionary for instant lookup?\n"
                "3. **Next step to try:** Trace your code with input `[2, 7, 11, 15]` and target `9`. At index `0`, what complement value are you looking for?"
            )
        elif mode == "debug":
            response_text = (
                "### Code Debug Analysis 🔍\n\n"
                "I reviewed your code structure:\n\n"
                "1. **Syntax & Imports:** Ensure required libraries are imported.\n"
                "2. **Index Boundaries:** Check if `range(len(arr))` or `<=` goes beyond the maximum valid index.\n"
                "3. **Return Value:** Verify your function returns the expected data structure rather than printing and returning `None`."
            )
        else:
            response_text = (
                f"### CodePath Programming Mentor ({language.capitalize()})\n\n"
                f"Great question about **{message[:40]}...**\n\n"
                "When writing scalable software, engineering students should follow three core rules:\n"
                "1. **Deconstruct the problem** into minimal independent functions.\n"
                "2. **Define inputs and outputs** with strict data types.\n"
                "3. **Analyze algorithmic complexity** before optimizing prematurely.\n\n"
                f"Would you like me to walk you through a clean {language} implementation or provide an interactive practice exercise?"
            )

        return {
            "conversation_id": "codepath-mentor-session",
            "response": response_text,
            "mode": mode,
            "suggested_hints": [
                "Give me a hint instead of the solution",
                "Explain the time complexity O(N)",
                "Show an edge-case test example"
            ],
            "follow_up_questions": [
                "What happens if the input array is empty?",
                "How would this scale to 1 million records?"
            ]
        }

    @classmethod
    def _extract_line_number(cls, error_message: Optional[str], code: str) -> Optional[int]:
        if not error_message:
            return None
        patterns = [
            r"line (\d+)",
            r"Line (\d+)",
            r":(\d+):(?:\d+:)? (?:error|warning|fatal error):",
            r"(?:\.py|\.js|\.java|\.c|\.cpp|\.ts):(\d+)",
            r"at [^(\n]+(?:\.java|\.js|\.ts):(\d+)",
            r", line (\d+)"
        ]
        for pat in patterns:
            m = re.search(pat, error_message)
            if m:
                try:
                    num = int(m.group(1))
                    if 1 <= num <= len(code.splitlines()) + 10:
                        return num
                except Exception:
                    pass
        return None

    @classmethod
    def _clean_and_parse_llm_json(cls, raw_text: str, code: str, language: str) -> Optional[Dict[str, Any]]:
        """
        Sanitizes and extracts structured JSON from Cloud AI responses,
        handling markdown fences, partial objects, and normalizing keys.
        """
        if not raw_text or not raw_text.strip():
            return None

        text = raw_text.strip()
        # Handle markdown code blocks
        if "```" in text:
            m = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
            if m:
                text = m.group(1).strip()
            else:
                lines = text.splitlines()
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                text = "\n".join(lines).strip()

        # Locate outer JSON curly brackets if extra text precedes or follows
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            text = text[start:end + 1]

        try:
            data = json.loads(text)
            if not isinstance(data, dict):
                return None
        except Exception:
            return None

        error_type = str(data.get("error_type") or f"{language.capitalize()} Diagnostic Issue")
        what_happened = str(data.get("what_happened") or "An issue was detected in the submitted code.")
        why_it_happened = str(data.get("why_it_happened") or "The code violated language syntax or runtime semantics.")
        where_it_happened = str(data.get("where_it_happened") or "In code block")
        how_to_fix = str(data.get("how_to_fix") or "Apply the prescribed code changes to fix the error.")
        corrected_example = str(data.get("corrected_example") or "")
        rectified_code = str(data.get("rectified_code") or corrected_example or code)
        prevention_tip = str(data.get("prevention_tip") or "Use static analyzers and boundary verification.")
        practice_question = str(data.get("practice_question") or "How can you prevent similar edge cases in the future?")

        # Severity normalization
        sev = str(data.get("severity") or "error").lower().strip()
        if sev not in ["error", "warning", "logical_bug"]:
            if "warn" in sev:
                sev = "warning"
            elif "logic" in sev or "bug" in sev:
                sev = "logical_bug"
            else:
                sev = "error"

        # Line number normalization
        line_no = data.get("line_number")
        if line_no is not None:
            try:
                line_no = int(line_no)
                if line_no <= 0 or line_no > len(code.splitlines()) + 20:
                    line_no = None
            except (ValueError, TypeError):
                line_no = None
        if line_no is None:
            line_no = cls._extract_line_number(where_it_happened + " " + error_type, code)

        return {
            "error_type": error_type,
            "what_happened": what_happened,
            "why_it_happened": why_it_happened,
            "where_it_happened": where_it_happened,
            "line_number": line_no,
            "severity": sev,
            "how_to_fix": how_to_fix,
            "corrected_example": corrected_example or rectified_code,
            "rectified_code": rectified_code,
            "prevention_tip": prevention_tip,
            "practice_question": practice_question
        }

    @classmethod
    def _auto_detect_error(cls, language: str, code: str) -> Optional[str]:
        """
        Pre-flight error auto-detection:
        1. Python AST parsing for syntax, missing colons, and bracket balance.
        2. Safe sandbox execution via CodeExecutorService to capture real runtime exceptions.
        3. Structural scanners across C, C++, Java, JS, TS, Go, Rust, and SQL.
        """
        if not code or not code.strip():
            return None
        lang = (language or "python").lower()

        # 1. Python Syntax & AST pre-check
        if lang == "python":
            try:
                compile(code, "<student_code>", "exec")
                ast.parse(code)
            except SyntaxError as e:
                col = e.offset or 1
                return f"SyntaxError: {e.msg} at line {e.lineno}, column {col}"
            except Exception as e:
                return f"Error: {e}"

        # 2. Execution sandbox check to capture real compiler/interpreter trace
        try:
            from app.services.code_executor import CodeExecutorService
            res = CodeExecutorService.execute(language, code)
            if res.status != "Success" and res.error:
                return res.error
        except Exception:
            pass

        # 3. Structural bracket balance check for all languages
        stack = []
        pairs = {')': '(', '}': '{', ']': '['}
        for idx, char in enumerate(code):
            if char in "({[":
                stack.append((char, idx))
            elif char in ")}]":
                if not stack or stack[-1][0] != pairs[char]:
                    line_num = code[:idx].count("\n") + 1
                    return f"SyntaxError: Unmatched closing bracket '{char}' at line {line_num}"
                stack.pop()
        if stack:
            unclosed_char, idx = stack[-1]
            line_num = code[:idx].count("\n") + 1
            return f"SyntaxError: Unclosed bracket '{unclosed_char}' opened at line {line_num}"

        # 4. Language-specific static pre-flight checks
        if lang in ["c", "cpp"]:
            if re.search(r"(?m)^\s*include\s*<", code):
                return "C/C++ Preprocessor Error: 'include' directive missing leading '#'"
            if "void main" in code:
                return "C/C++ Compliance Error: 'void main()' is non-standard. ISO C/C++ requires 'int main()'"
            if ("printf" in code or "scanf" in code) and "#include <stdio.h>" not in code:
                return "C Compilation Error: implicit declaration of function 'printf' or 'scanf'. Missing <stdio.h>"
            if ("cout" in code or "cin" in code) and "#include <iostream>" not in code:
                return "C++ Compilation Error: 'cout' was not declared in this scope. Missing <iostream>"
            if re.search(r"(?:int|char|float|double)\s*\*([a-zA-Z0-9_]+)\s*=\s*(?:NULL|nullptr|0)?\s*;\s*\*\1\s*=", code):
                return "Runtime Error: Segmentation fault (SIGSEGV). Attempted to dereference unallocated null pointer."
            if re.search(r"i\s*<=\s*(?:len|size|sizeof|[a-zA-Z0-9_]+)", code) and ("[" in code):
                return "Logical Bug: Potential buffer overflow or out of bounds array access (i <= bound)."

        elif lang == "java":
            if "class " not in code:
                return "Java Syntax Error: class, interface, enum, or record expected. Standalone statements outside class envelope."
            if re.search(r"\bstring\s+[a-zA-Z0-9_]+", code):
                return "Java Compilation Error: cannot find symbol 'string'. Java is case-sensitive: use 'String'."
            if "system.out" in code:
                return "Java Compilation Error: package system does not exist. Use 'System.out'."
            if re.search(r"String\s+([a-zA-Z0-9_]+)\s*=\s*null\s*;\s*\n?\s*\1\.length\(", code):
                return "java.lang.NullPointerException: Cannot invoke \"String.length()\" because variable is null"

        elif lang in ["javascript", "typescript"]:
            if "await " in code and "async " not in code:
                return "SyntaxError: await is only valid in async functions and the top-level bodies of modules."
            if re.search(r"\bconst\s+([a-zA-Z0-9_]+)\s*=.*\n.*\1\s*=", code):
                return "TypeError: Assignment to constant variable."
            if re.search(r"\bconst\s+user\s*=\s*\{\}\s*;.*user\.profile\.name", code, re.DOTALL):
                return "TypeError: Cannot read properties of undefined (reading 'name')"

        elif lang == "go":
            if "package main" not in code:
                return "Go Compilation Error: expected 'package main', found EOF or other declaration."
            if "func main()" not in code:
                return "Go Linker Error: function main is undeclared in the main package."
            if ("fmt.Print" in code or "fmt.Println" in code) and 'import "fmt"' not in code:
                return 'Go Compilation Error: undefined: fmt. Did you forget to import "fmt"?'

        elif lang == "rust":
            if "fn main()" not in code and "fn main ()" not in code:
                return "Rust Compilation Error: `main` function not found in crate."
            if re.search(r"\bprintln\s*\(", code):
                return "Rust Compilation Error: cannot find function `println` in this scope. Did you mean `println!` macro?"
            if re.search(r"\blet\s+([a-zA-Z0-9_]+)\s*=.*\n.*\1\s*=", code) and not re.search(r"\blet\s+mut\s+([a-zA-Z0-9_]+)\s*=", code):
                return "Rust Compilation Error: cannot assign twice to immutable variable."

        elif lang == "sql":
            code_upper = code.upper()
            if "SELECT" in code_upper and "FROM" not in code_upper and ("WHERE" in code_upper or ";" in code):
                return "SQL Syntax Error: SELECT statement missing FROM clause."
            if ("DELETE" in code_upper or "UPDATE" in code_upper) and "WHERE" not in code_upper:
                return "SQL Safety Warning: Destructive statement executed without a WHERE filtering clause."
            if not code.strip().endswith(";"):
                return "SQL Syntax Warning: Statement missing terminating semicolon ';'."

        return None

    @classmethod
    async def _call_gemini_json(
        cls,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 2048,
        temperature: float = 0.2
    ) -> Optional[Dict[str, Any]]:
        candidate_models = [
            settings.AI_MODEL_NAME,
            "gemini-flash-lite-latest",
            "gemini-3.1-flash-lite",
            "gemini-3.6-flash"
        ]
        seen = set()
        models = [m for m in candidate_models if m and not (m in seen or seen.add(m))]

        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}
            ],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
                "responseMimeType": "application/json"
            }
        }

        for model in models:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.AI_API_KEY}"
                async with httpx.AsyncClient(timeout=20.0) as client:
                    res = await client.post(url, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                        if "```" in raw_text:
                            m = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw_text)
                            if m:
                                raw_text = m.group(1).strip()
                        start = raw_text.find("{")
                        end = raw_text.rfind("}")
                        if start != -1 and end != -1 and end > start:
                            raw_text = raw_text[start:end + 1]
                        parsed = json.loads(raw_text)
                        if isinstance(parsed, dict):
                            return parsed
                    elif res.status_code in (429, 503):
                        logger.warning(f"Gemini model {model} returned {res.status_code}. Trying backup model...")
                        continue
            except Exception as e:
                logger.warning(f"Gemini JSON call to {model} failed: {e}. Trying next model...")

        return None

    @classmethod
    async def _call_gemini_diagnose(cls, language: str, code: str, error_message: Optional[str]) -> Optional[Dict[str, Any]]:
        candidate_models = [
            settings.AI_MODEL_NAME,
            "gemini-flash-lite-latest",
            "gemini-3.1-flash-lite",
            "gemini-3.6-flash"
        ]
        seen = set()
        models = [m for m in candidate_models if m and not (m in seen or seen.add(m))]

        system_prompt = (
            f"You are the CodePath AI Error Doctor. Analyze this {language} code, diagnose compiler/runtime/logic errors, "
            "and rectify the code into a fully working, robust solution.\n"
            "Return a JSON object with EXACTLY these keys:\n"
            "- error_type: string (concise name of error)\n"
            "- what_happened: string (plain-English explanation of symptom)\n"
            "- why_it_happened: string (underlying cause in memory, type system, or language rules)\n"
            "- where_it_happened: string (e.g. 'Line 4, in loop bounds')\n"
            "- line_number: integer or null (primary 1-indexed offending line)\n"
            "- severity: string ('error', 'warning', or 'logical_bug')\n"
            "- how_to_fix: string (actionable steps to resolve the issue)\n"
            "- corrected_example: string (clean, concise code snippet showing the fix)\n"
            "- rectified_code: string (the COMPLETE student code fully repaired, working and ready to execute)\n"
            "- prevention_tip: string (best practice to prevent this in future)\n"
            "- practice_question: string (conceptual question to test student understanding)\n"
            "Return valid JSON only."
        )
        user_prompt = f"Language: {language}\nCode:\n{code}\n"
        if error_message:
            user_prompt += f"Compiler/Runtime Trace:\n{error_message}\n"

        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 2048,
                "responseMimeType": "application/json"
            }
        }

        for model in models:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.AI_API_KEY}"
                async with httpx.AsyncClient(timeout=20.0) as client:
                    res = await client.post(url, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                        parsed = cls._clean_and_parse_llm_json(raw_text, code, language)
                        if parsed:
                            return parsed
                    elif res.status_code in (429, 503):
                        logger.warning(f"Gemini diagnose model {model} returned {res.status_code}. Trying backup model...")
                        continue
            except Exception as e:
                logger.warning(f"Gemini diagnose model {model} failed: {e}. Trying next model...")

        return None

    @classmethod
    async def _call_openai_diagnose(cls, language: str, code: str, error_message: Optional[str]) -> Optional[Dict[str, Any]]:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {settings.AI_API_KEY}"}
            system_prompt = (
                f"You are the CodePath AI Error Doctor. Analyze {language} code, diagnose compiler/runtime/logic errors, "
                "and rectify the code into a working solution. Return JSON with error_type, what_happened, why_it_happened, "
                "where_it_happened, line_number, severity ('error', 'warning', or 'logical_bug'), how_to_fix, "
                "corrected_example, rectified_code, prevention_tip, practice_question."
            )
            user_prompt = f"Language: {language}\nCode:\n{code}\nTrace:\n{error_message or 'No trace provided'}"
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.2,
                "max_tokens": 2048
            }
            async with httpx.AsyncClient(timeout=20.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    raw_text = data["choices"][0]["message"]["content"].strip()
                    parsed = cls._clean_and_parse_llm_json(raw_text, code, language)
                    if parsed:
                        return parsed
        except Exception as e:
            logger.warning(f"OpenAI diagnose request failed: {e}. Falling back to offline engine.")
        return None

    @classmethod
    def _diagnose_error_offline(cls, language: str, code: str, error_message: Optional[str]) -> Dict[str, Any]:
        """
        Deep multi-language structural diagnostic and code auto-rectification engine.
        Operates on student's actual code across 9 languages.
        """
        err = (error_message or "").lower()
        code_str = code.lower()
        lang = (language or "python").lower()
        lines = code.splitlines() if code else [""]
        line_num = cls._extract_line_number(error_message, code)

        # ------------------------------------------------------------
        # 1. Python Code Analysis & Auto-Rectification
        # ------------------------------------------------------------
        if lang == "python":
            # A. Check real AST syntax errors
            syntax_err = None
            try:
                ast.parse(code)
            except SyntaxError as e:
                syntax_err = e

            if syntax_err:
                err_line = syntax_err.lineno or 1
                col = syntax_err.offset or 1
                rectified_lines = list(lines)
                fix_desc = ""

                if err_line <= len(rectified_lines):
                    target = rectified_lines[err_line - 1]
                    stripped = target.strip()

                    # Missing colon on header
                    control_headers = ("def ", "if ", "elif ", "else", "for ", "while ", "class ", "try", "except", "finally", "with ")
                    if any(stripped.startswith(h) for h in control_headers) and not stripped.endswith(":"):
                        rectified_lines[err_line - 1] = target.rstrip() + ":"
                        fix_desc = f"Appended missing colon ':' to line {err_line} statement header."
                    # Python 2 print statement
                    elif re.match(r"^(\s*)print\s+([^(].*)$", target):
                        rectified_lines[err_line - 1] = re.sub(r"^(\s*)print\s+([^(].*)$", r"\1print(\2)", target)
                        fix_desc = f"Converted Python 2 print statement on line {err_line} to print(...) function call."
                    # Unclosed parenthesis/bracket on this line
                    elif target.count("(") > target.count(")"):
                        diff = target.count("(") - target.count(")")
                        rectified_lines[err_line - 1] = target.rstrip() + (")" * diff)
                        fix_desc = f"Added missing closing parenthesis ')' on line {err_line}."
                    elif target.count("[") > target.count("]"):
                        diff = target.count("[") - target.count("]")
                        rectified_lines[err_line - 1] = target.rstrip() + ("]" * diff)
                        fix_desc = f"Added missing closing bracket ']' on line {err_line}."
                    elif "expected an indented block" in str(syntax_err):
                        rectified_lines.insert(err_line, "    pass  # Added required indented block statement")
                        fix_desc = f"Added required indentation on line {err_line}."
                    else:
                        fix_desc = f"Corrected syntax formatting on line {err_line}."

                rectified_code = "\n".join(rectified_lines)
                return {
                    "error_type": f"SyntaxError: {syntax_err.msg}",
                    "what_happened": f"Python parser encountered an invalid syntax token on line {err_line}: {syntax_err.msg}.",
                    "why_it_happened": "Python requires strict syntax grammar including colons ':' after control headers, balanced brackets, and proper function call parentheses.",
                    "where_it_happened": f"Line {err_line}, Column {col}",
                    "line_number": err_line,
                    "severity": "error",
                    "how_to_fix": fix_desc or f"Review line {err_line} and ensure statement headers end with ':' and all quotes/brackets are balanced.",
                    "corrected_example": rectified_code,
                    "rectified_code": rectified_code,
                    "prevention_tip": "Run static syntax analysis or use an editor with real-time Python language server feedback.",
                    "practice_question": "Why does Python require explicit colons at the end of block headers like def, if, and for?"
                }

            # B. Check Runtime & Logic Errors in Python
            # 1. IndexError (e.g. range(len(arr) + 1) or arr[len(arr)] or arr[10])
            if "indexerror" in err or "index out of range" in err or "out of bounds" in err or any("range(len(" in l and "+ 1" in l for l in lines) or any("<=" in l and "len(" in l for l in lines):
                rectified_lines = []
                detected_line = line_num or 1
                severity = "error"
                for idx, l in enumerate(lines):
                    if "range(len(" in l and "+ 1" in l:
                        rectified_lines.append(re.sub(r"\s*\+\s*1", "", l))
                        detected_line = idx + 1
                        severity = "logical_bug"
                    elif "<= len(" in l:
                        rectified_lines.append(l.replace("<= len(", "< len("))
                        detected_line = idx + 1
                        severity = "logical_bug"
                    elif re.search(r"\[\s*len\([^)]+\)\s*\]", l):
                        rectified_lines.append(re.sub(r"\[\s*len\(([^)]+)\)\s*\]", r"[len(\1) - 1]", l))
                        detected_line = idx + 1
                        severity = "logical_bug"
                    elif re.search(r"\[\s*(\d+)\s*\]", l):
                        # Out of bounds literal index e.g. arr[10]
                        rectified_lines.append(re.sub(r"\[\s*(\d+)\s*\]", r"[len(arr) - 1]  # Guarded: last valid element", l) if "arr" in l else l)
                        detected_line = idx + 1
                    else:
                        rectified_lines.append(l)

                rectified = "\n".join(rectified_lines)
                return {
                    "error_type": "IndexError: list index out of range",
                    "what_happened": "The code attempted to access an element at an index equal to or greater than the collection length.",
                    "why_it_happened": "In 0-indexed sequences, valid indices range from 0 to length - 1. Iterating with range(len(arr) + 1) accesses index == length, triggering IndexError.",
                    "where_it_happened": f"Line {detected_line}, in iteration loop bounds",
                    "line_number": detected_line,
                    "severity": severity,
                    "how_to_fix": "Change 'range(len(arr) + 1)' to 'range(len(arr))', or use pythonic iteration: 'for item in arr:'.",
                    "corrected_example": rectified,
                    "rectified_code": rectified,
                    "prevention_tip": "Prefer direct iteration 'for item in collection:' instead of indexing whenever index values are not strictly required.",
                    "practice_question": "What is the difference between iterating by value versus iterating by index in Python?"
                }

            # 2. TypeError: can only concatenate str (not "int") to str / unsupported operand
            if "typeerror" in err or "concatenate str" in err or "unsupported operand" in err or any('"' in l and " + " in l and any(c.isdigit() for c in l) for l in lines):
                detected_line = line_num or 1
                rectified_lines = []
                for idx, l in enumerate(lines):
                    if " + " in l and ('"' in l or "'" in l):
                        fixed_l = re.sub(r'\+\s*([a-zA-Z0-9_]+)(?!\s*[\+\)])', r'+ str(\1)', l)
                        if fixed_l != l:
                            rectified_lines.append(fixed_l)
                            detected_line = idx + 1
                            continue
                    rectified_lines.append(l)

                rectified = "\n".join(rectified_lines)
                return {
                    "error_type": "TypeError: can only concatenate str (not 'int') to str",
                    "what_happened": "The code attempted to concatenate a string and a numeric type directly using '+'.",
                    "why_it_happened": "Python is strongly typed and does not implicitly coerce integers or floats to strings during concatenation.",
                    "where_it_happened": f"Line {detected_line}, at the '+' concatenation operator",
                    "line_number": detected_line,
                    "severity": "error",
                    "how_to_fix": "Wrap the numeric variable in str() or use Python f-strings: f'Value: {variable}'.",
                    "corrected_example": rectified,
                    "rectified_code": rectified,
                    "prevention_tip": "Use modern Python f-strings (f'...') for all string interpolation instead of '+' operators.",
                    "practice_question": "Why does Python avoid implicit type coercion (like JavaScript does) when adding strings and numbers?"
                }

            # 3. AttributeError / NoneType dereference
            if "attributeerror" in err or "'nonetype'" in err or ("none" in err and "." in code):
                detected_line = line_num or 1
                rectified_lines = []
                for idx, l in enumerate(lines):
                    if " = None" in l:
                        var_name = l.split(" = ")[0].strip()
                        rectified_lines.append(l)
                        detected_line = idx + 2
                    elif "." in l and ("print(" in l or "return " in l):
                        obj = l.strip().split('.')[0].replace('print(', '').strip()
                        rectified_lines.append(f"    # Guard clause against NoneType\n    if {obj} is not None:\n    {l}")
                    else:
                        rectified_lines.append(l)

                rectified = "\n".join(rectified_lines)
                return {
                    "error_type": "AttributeError: 'NoneType' object has no attribute",
                    "what_happened": "The code attempted to access a field or method on a variable that currently holds None.",
                    "why_it_happened": "A function or query returned None (e.g., failed lookup or uninitialized state) and the caller did not verify existence prior to dereferencing.",
                    "where_it_happened": f"Line {detected_line}, at the '.' dereference operator",
                    "line_number": detected_line,
                    "severity": "error",
                    "how_to_fix": "Add a guard clause: 'if obj is not None:' before accessing attributes or calling methods.",
                    "corrected_example": rectified,
                    "rectified_code": rectified,
                    "prevention_tip": "Adopt defensive programming principles: always define fallback defaults or check for None before dereferencing.",
                    "practice_question": "How can dict.get(key, default) prevent KeyError and None attribute crashes?"
                }

            # 4. NameError / UnboundLocalError (undefined variable)
            if "nameerror" in err or "unboundlocalerror" in err or "is not defined" in err or "referenced before assignment" in err:
                m = re.search(r"(?:name|variable) '(\w+)'", err)
                missing_var = m.group(1) if m else "x"
                detected_line = line_num or 1
                rectified_lines = []
                inserted = False
                for l in lines:
                    if (l.strip().startswith("def ") or l.strip().startswith("class ")) and not inserted:
                        rectified_lines.append(l)
                        rectified_lines.append(f"    {missing_var} = 0  # Initialized variable before use")
                        inserted = True
                    else:
                        rectified_lines.append(l)
                if not inserted:
                    rectified_lines.insert(0, f"{missing_var} = 0  # Initialized variable before use")
                rectified = "\n".join(rectified_lines)
                err_title = f"UnboundLocalError: local variable '{missing_var}' referenced before assignment" if "referenced before assignment" in err else f"NameError: name '{missing_var}' is not defined"
                return {
                    "error_type": err_title,
                    "what_happened": f"The identifier '{missing_var}' was referenced before being assigned a value in the current scope.",
                    "why_it_happened": "Python variables must be initialized before they are evaluated. Typographical errors in variable names also trigger NameError.",
                    "where_it_happened": f"Line {detected_line}, identifier '{missing_var}'",
                    "line_number": detected_line,
                    "severity": "error",
                    "how_to_fix": f"Declare and initialize '{missing_var}' before using it, or verify spelling consistency.",
                    "corrected_example": rectified,
                    "rectified_code": rectified,
                    "prevention_tip": "Use an IDE with language server protocol (LSP) to highlight undefined variables as you type.",
                    "practice_question": "What is the difference between local scope, global scope, and enclosing scope in Python?"
                }

            # 5. ZeroDivisionError
            if "zerodivision" in err or "division by zero" in err or "/ 0" in code:
                detected_line = line_num or 1
                rectified = code.replace("/ 0", "/ 1  # Protected from ZeroDivision")
                return {
                    "error_type": "ZeroDivisionError: division by zero",
                    "what_happened": "A mathematical division or modulo operation attempted to divide by zero.",
                    "why_it_happened": "Division by zero is mathematically undefined and raises an unhandled ZeroDivisionError in Python.",
                    "where_it_happened": f"Line {detected_line}, at the division operator '/'",
                    "line_number": detected_line,
                    "severity": "error",
                    "how_to_fix": "Add a denominator check: 'if denominator != 0:' before dividing.",
                    "corrected_example": rectified,
                    "rectified_code": rectified,
                    "prevention_tip": "Always validate user or dynamic input before using it in division or modulo operations.",
                    "practice_question": "How do floating point division rules differ from integer modulo with zero divisors?"
                }

            # 6. General Python Fallback
            detected_line = line_num or 1
            rectified = code
            return {
                "error_type": "Python Execution / Diagnostic Issue",
                "what_happened": "The code encountered an execution exception, unexpected token, or unhandled condition.",
                "why_it_happened": "Review function parameters, variable types, and branch logic for edge case handling.",
                "where_it_happened": f"Line {detected_line}",
                "line_number": detected_line,
                "severity": "error",
                "how_to_fix": "Inspect the line indicated in the stack trace, verify data types, and add proper error handling.",
                "corrected_example": rectified,
                "rectified_code": rectified,
                "prevention_tip": "Run code through unit tests with boundary inputs (empty lists, 0, None).",
                "practice_question": "What is the difference between compile-time syntax errors and runtime exceptions?"
            }

        # ------------------------------------------------------------
        # 2. C / C++ Code Analysis & Auto-Rectification
        # ------------------------------------------------------------
        elif lang in ["c", "cpp"]:
            rectified = code
            fixes_applied = []
            detected_line = line_num or 1

            # 1. Missing '#' in include directive
            if re.search(r"(?m)^\s*include\s*<", rectified):
                rectified = re.sub(r"(?m)^\s*include\s*<", r"#include <", rectified)
                fixes_applied.append("Added '#' before include directive")
                detected_line = 1

            # 2. Missing standard library headers (clean regex check)
            if ("printf" in rectified or "scanf" in rectified) and not re.search(r"#include\s*<\s*stdio\.h\s*>", rectified):
                rectified = "#include <stdio.h>\n" + rectified
                fixes_applied.append("Included <stdio.h> for standard I/O functions")

            if lang == "cpp" and ("cout" in rectified or "cin" in rectified or "endl" in rectified):
                if not re.search(r"#include\s*<\s*iostream\s*>", rectified):
                    rectified = "#include <iostream>\nusing namespace std;\n" + rectified
                    fixes_applied.append("Included <iostream> and namespace std")

            if ("malloc" in rectified or "free" in rectified or "exit(" in rectified) and not re.search(r"#include\s*<\s*stdlib\.h\s*>", rectified):
                rectified = "#include <stdlib.h>\n" + rectified
                fixes_applied.append("Included <stdlib.h> for standard memory and utility functions")

            if ("strlen" in rectified or "strcpy" in rectified or "strcmp" in rectified) and not re.search(r"#include\s*<\s*string\.h\s*>", rectified):
                rectified = "#include <string.h>\n" + rectified
                fixes_applied.append("Included <string.h> for string manipulation routines")

            if lang == "cpp" and "vector<" in rectified and not re.search(r"#include\s*<\s*vector\s*>", rectified):
                rectified = "#include <vector>\n" + rectified
                fixes_applied.append("Included <vector> container")

            # 3. Fix invalid printf call without format string e.g. printf(i) -> printf("%d\n", i)
            if re.search(r"\bprintf\s*\(\s*([a-zA-Z0-9_]+)\s*\)\s*;", rectified):
                var_match = re.search(r"\bprintf\s*\(\s*([a-zA-Z0-9_]+)\s*\)\s*;", rectified).group(1)
                rectified = re.sub(r"\bprintf\s*\(\s*[a-zA-Z0-9_]+\s*\)\s*;", f'printf("%d\\n", {var_match});', rectified)
                fixes_applied.append(f'Corrected printf({var_match}) to include format string: printf("%d\\n", {var_match});')

            # 4. void main() vs int main() and brace matching
            if re.search(r"\bvoid\s+main\s*\(", rectified):
                rectified = re.sub(r"\bvoid\s+main\s*\(", "int main(", rectified)
                fixes_applied.append("Changed 'void main()' to standard 'int main()' with return 0")
                detected_line = 2

            open_braces = rectified.count("{")
            close_braces = rectified.count("}")
            if open_braces > close_braces:
                diff = open_braces - close_braces
                if "int main" in rectified and "return 0;" not in rectified:
                    rectified = rectified.rstrip() + "\n    return 0;\n" + ("}\n" * diff)
                    fixes_applied.append("Closed unclosed braces and added 'return 0;'")
                else:
                    rectified = rectified.rstrip() + "\n" + ("}\n" * diff)
                    fixes_applied.append("Closed unclosed braces '}'")
            elif "int main" in rectified and "return 0;" not in rectified:
                rectified = re.sub(r"(\}\s*)$", r"    return 0;\n\1", rectified)

            # 4. Null pointer dereference / Segmentation Fault
            if "int *ptr = null;" in rectified.lower() or "int *ptr = nullptr;" in rectified.lower() or "int *ptr;" in rectified.lower() or "*ptr =" in rectified:
                rectified = re.sub(
                    r"int\s*\*ptr\s*=\s*(?:NULL|nullptr|0)?\s*;",
                    "int val = 42;\nint *ptr = &val; // Correctly bound to allocated memory",
                    rectified
                )
                fixes_applied.append("Initialized pointer to point to valid allocated memory address (&val)")
                detected_line = 3

            # 5. Array Index Out of Bounds (<= size instead of < size)
            if re.search(r"i\s*<=\s*([a-zA-Z0-9_]+)", rectified):
                rectified = re.sub(r"i\s*<=\s*([a-zA-Z0-9_]+)", r"i < \1", rectified)
                fixes_applied.append("Fixed array loop bound from '<=' to strictly '<'")

            # 6. Semicolon check on return statements and calls
            rectified = re.sub(r"(?m)^\s*(return\s+[^;\n]+)$", r"\1;", rectified)
            rectified = re.sub(r"(?m)^\s*(printf\([^)]+\))$", r"\1;", rectified)

            err_type = "C/C++ Compilation Error"
            severity = "error"
            if "segmentation" in err or "sigsegv" in err or "null" in err or "*ptr" in code:
                err_type = "Segmentation Fault (SIGSEGV / Null Pointer Dereference)"
            elif ("include<" in code_str or "include <" in code_str) and not ("#include" in code_str):
                err_type = "C Compilation Error: Missing '#' in preprocessor directive"
            elif "void main" in code_str:
                err_type = "C Compilation Error: return with a value in function returning void"
            elif "i <= " in code_str:
                err_type = "Logical Bug: Array Index Out of Bounds (Off-by-One)"
                severity = "logical_bug"

            return {
                "error_type": err_type,
                "what_happened": "C/C++ compiler or runtime detected memory violation, invalid entry point, or missing preprocessor headers.",
                "why_it_happened": "C and C++ mandate strict preprocessor notation (#include), standard 'int main()' signatures, and valid pointer initialization prior to dereferencing.",
                "where_it_happened": f"Line {detected_line}",
                "line_number": detected_line,
                "severity": severity,
                "how_to_fix": "; ".join(fixes_applied) if fixes_applied else "Ensure headers are included with '#', use 'int main()', and initialize all pointers.",
                "corrected_example": rectified,
                "rectified_code": rectified,
                "prevention_tip": "Compile with flags '-Wall -Wextra -pedantic' to detect undeclared headers and pointer hazards at compile time.",
                "practice_question": "Why does dereferencing a NULL pointer cause a segmentation fault in modern protected operating systems?"
            }

        # ------------------------------------------------------------
        # 3. Java Code Analysis & Auto-Rectification
        # ------------------------------------------------------------
        elif lang == "java":
            rectified = code
            fixes_applied = []
            detected_line = line_num or 1

            # A. Wrap naked code in class & main if missing
            if "class " not in rectified:
                indented = "\n".join("        " + l for l in lines)
                rectified = f"public class Solution {{\n    public static void main(String[] args) {{\n{indented}\n    }}\n}}"
                fixes_applied.append("Enclosed standalone statements inside standard 'public class Solution { public static void main(String[] args) }'")
            elif "public static void main" not in rectified and "main(" not in rectified:
                fixes_applied.append("Ensure public static void main(String[] args) entry point is defined")

            # B. Case sensitivity fixes
            if re.search(r"\bstring\b", rectified):
                rectified = re.sub(r"\bstring\b", "String", rectified)
                fixes_applied.append("Capitalized 'string' to Java class 'String'")

            if re.search(r"\bsystem\.out\b", rectified):
                rectified = re.sub(r"\bsystem\.out\b", "System.out", rectified)
                fixes_applied.append("Capitalized 'system.out' to 'System.out'")

            # C. Semicolon check on variable declaration or print
            rectified = re.sub(r"(?m)^\s*(System\.out\.println\([^)]+\))$", r"\1;", rectified)

            # D. NullPointerException guard
            if "nullpointer" in err or "null" in err or "= null;" in rectified:
                rectified = re.sub(
                    r'String\s+([a-zA-Z0-9_]+)\s*=\s*null\s*;\s*\n(\s*)([a-zA-Z0-9_]+)\.length\(\);',
                    r'String \1 = "CodePath"; // Initialized with valid instance\n\2int length = (\1 != null) ? \1.length() : 0;',
                    rectified
                )
                fixes_applied.append("Added null guard and valid object instantiation")

            err_type = "java.lang.NullPointerException" if ("null" in err or "nullpointer" in err) else "Java Compilation / Structure Error"

            return {
                "error_type": err_type,
                "what_happened": "Java compiler or JVM detected uninstantiated object dereference or class structure violation.",
                "why_it_happened": "Java is strictly object-oriented and requires all execution inside a class method. Calling methods on null references triggers NullPointerException.",
                "where_it_happened": f"Line {detected_line}",
                "line_number": detected_line,
                "severity": "error",
                "how_to_fix": "; ".join(fixes_applied) if fixes_applied else "Ensure class and main method are defined, and check object references for null before dereferencing.",
                "corrected_example": rectified,
                "rectified_code": rectified,
                "prevention_tip": "Use Java 8+ Optional<T> and Objects.requireNonNull() for resilient reference handling.",
                "practice_question": "What is the difference between a primitive type and a reference type in the Java Virtual Machine?"
            }

        # ------------------------------------------------------------
        # 4. JavaScript / TypeScript Code Analysis & Auto-Rectification
        # ------------------------------------------------------------
        elif lang in ["javascript", "typescript"]:
            rectified = code
            fixes_applied = []
            detected_line = line_num or 1

            # A. TypeError: undefined property access
            if "typeerror" in err or "undefined" in err or "user.profile.name" in rectified or "profile.name" in rectified:
                rectified = re.sub(r"([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)", r"\1?.\2?.\3 ?? 'Default'", rectified)
                fixes_applied.append("Applied optional chaining '?.' and nullish coalescing '??'")

            # B. Missing async on function using await
            if "await " in rectified and "async " not in rectified:
                if re.search(r"\bfunction\s*([a-zA-Z0-9_]*)\s*\(", rectified):
                    rectified = re.sub(r"\bfunction\s*([a-zA-Z0-9_]*)\s*\(", r"async function \1(", rectified)
                else:
                    rectified = re.sub(r"(\([a-zA-Z0-9_,\s]*\)\s*=>)", r"async \1", rectified)
                fixes_applied.append("Marked enclosing function as 'async' to support 'await'")

            # C. Const reassignment
            if "assignment to constant variable" in err or ("const " in rectified and re.search(r"\bconst\s+([a-zA-Z0-9_]+)\s*=.*\n.*\1\s*=", rectified)):
                rectified = re.sub(r"\bconst\b", "let", rectified, count=1)
                fixes_applied.append("Changed 'const' declaration to mutable 'let'")

            # D. Bracket balancing
            open_cur = rectified.count("{") - rectified.count("}")
            if open_cur > 0:
                rectified += "\n" + ("}" * open_cur)
                fixes_applied.append("Balanced missing closing curly brace '}'")

            err_type = "TypeError: Cannot read properties of undefined" if "typeerror" in err or "undefined" in err else f"{language.upper()} Syntax / Runtime Error"

            return {
                "error_type": err_type,
                "what_happened": f"{language.upper()} engine encountered invalid property access on an undefined/null value or syntax inconsistency.",
                "why_it_happened": f"In {language.upper()}, accessing properties of undefined throws a fatal TypeError. Asynchronous calls must be awaited inside async blocks.",
                "where_it_happened": f"Line {detected_line}",
                "line_number": detected_line,
                "severity": "error",
                "how_to_fix": "; ".join(fixes_applied) if fixes_applied else "Use optional chaining '?.' or verify asynchronous data has loaded before property access.",
                "corrected_example": rectified,
                "rectified_code": rectified,
                "prevention_tip": "Adopt TypeScript strict null checks ('strictNullChecks: true') to catch unhandled undefined states at compile time.",
                "practice_question": "What is the difference between '==' (loose equality) and '===' (strict equality) in JavaScript?"
            }

        # ------------------------------------------------------------
        # 5. Go Code Analysis & Auto-Rectification
        # ------------------------------------------------------------
        elif lang == "go":
            rectified = code.strip()
            fixes_applied = []
            detected_line = line_num or 1

            if "package main" not in rectified:
                rectified = "package main\n\n" + rectified
                fixes_applied.append("Added 'package main' declaration at top")

            if ("fmt.Print" in rectified or "fmt.Println" in rectified or "fmt.Printf" in rectified) and 'import "fmt"' not in rectified:
                rectified = re.sub(r"(package main\n*)", r'\1import "fmt"\n\n', rectified)
                fixes_applied.append('Imported standard "fmt" package')

            if "func main()" not in rectified:
                # Wrap statements into func main()
                body_lines = [l for l in rectified.splitlines() if not l.startswith("package ") and not l.startswith("import ")]
                indented = "\n".join("    " + l for l in body_lines)
                rectified = f'package main\n\nimport "fmt"\n\nfunc main() {{\n{indented}\n}}'
                fixes_applied.append("Wrapped execution statements inside 'func main()'")

            # Check unused variable error: x declared and not used
            if "declared and not used" in err or ":=" in rectified:
                m = re.search(r"(\w+) declared and not used", err)
                var_name = m.group(1) if m else None
                if not var_name:
                    m2 = re.search(r"(\w+)\s*:=", rectified)
                    if m2:
                        var_name = m2.group(1)
                if var_name and f"_ = {var_name}" not in rectified:
                    rectified = re.sub(r"(\}\s*)$", f"    _ = {var_name} // Suppress unused variable error\n\\1", rectified)
                    fixes_applied.append(f"Silenced unused variable '{var_name}' with blank identifier '_ = {var_name}'")

            return {
                "error_type": "Go Compilation / Package Structure Error",
                "what_happened": "Go compiler failed due to missing package header, undeclared import, or unused variable.",
                "why_it_happened": "Every standalone executable Go program must belong to 'package main', declare an entrypoint 'func main()', and adhere to strict zero-unused-import/variable rules.",
                "where_it_happened": f"Line {detected_line}",
                "line_number": detected_line,
                "severity": "error",
                "how_to_fix": "; ".join(fixes_applied) if fixes_applied else "Ensure 'package main', required imports, and 'func main()' are present.",
                "corrected_example": rectified,
                "rectified_code": rectified,
                "prevention_tip": "Run 'go vet' and 'golangci-lint' as part of your local build workflow to enforce Go idioms.",
                "practice_question": "Why does the Go compiler reject code with unused variables or imports as a fatal compilation error?"
            }

        # ------------------------------------------------------------
        # 6. Rust Code Analysis & Auto-Rectification
        # ------------------------------------------------------------
        elif lang == "rust":
            rectified = code.strip()
            fixes_applied = []
            detected_line = line_num or 1

            # Missing fn main()
            if "fn main()" not in rectified and "fn main ()" not in rectified:
                indented = "\n".join("    " + l for l in rectified.splitlines())
                rectified = f"fn main() {{\n{indented}\n}}"
                fixes_applied.append("Wrapped code inside entrypoint 'fn main()'")

            # Missing '!' on println
            if re.search(r"\bprintln\s*\(", rectified):
                rectified = re.sub(r"\bprintln\s*\(", "println!(", rectified)
                fixes_applied.append("Replaced 'println(' with standard macro 'println!('")

            # Reassignment of immutable variable
            if "cannot assign twice to immutable variable" in err or "cannot mutate immutable variable" in err or re.search(r"\blet\s+([a-zA-Z0-9_]+)\s*=.*\n.*\1\s*=", rectified):
                rectified = re.sub(r"\blet\s+([a-zA-Z0-9_]+)\s*=", r"let mut \1 =", rectified, count=1)
                fixes_applied.append("Added 'mut' keyword to enable variable mutation")

            # Missing semicolon
            rectified = re.sub(r"(?m)^\s*(let\s+[^;\n]+)$", r"\1;", rectified)

            return {
                "error_type": "Rust Borrow Checker / Compilation Error",
                "what_happened": "Rust compiler (rustc) detected an immutability violation, missing macro notation, or missing main function.",
                "why_it_happened": "Variables in Rust are immutable by default and require 'let mut' to reassign. Also, 'println!' is a macro requiring the '!' delimiter.",
                "where_it_happened": f"Line {detected_line}",
                "line_number": detected_line,
                "severity": "error",
                "how_to_fix": "; ".join(fixes_applied) if fixes_applied else "Declare variables mutable with 'let mut' and ensure 'println!' includes the macro exclamation mark.",
                "corrected_example": rectified,
                "rectified_code": rectified,
                "prevention_tip": "Run 'cargo check' and 'cargo clippy' for near-instant compile-time and lifetime feedback.",
                "practice_question": "Why does Rust enforce variable immutability by default, and how does it prevent concurrency data races?"
            }

        # ------------------------------------------------------------
        # 7. SQL Code Analysis & Auto-Rectification
        # ------------------------------------------------------------
        elif lang == "sql":
            rectified = code.strip()
            fixes_applied = []
            detected_line = line_num or 1
            severity = "error"

            if not rectified.endswith(";"):
                rectified += ";"
                fixes_applied.append("Added statement termination semicolon ';'")

            if "select" in rectified.lower() and "from" not in rectified.lower():
                rectified = re.sub(r";$", " FROM table_name;", rectified)
                fixes_applied.append("Added missing 'FROM table_name' clause")

            if ("delete" in rectified.lower() or "update" in rectified.lower()) and "where" not in rectified.lower():
                rectified = re.sub(r";$", " WHERE id = 1; -- Protected with WHERE clause", rectified)
                fixes_applied.append("Added protective WHERE clause to prevent accidental whole-table wipe")
                severity = "warning"

            return {
                "error_type": "SQL Syntax / Query Design Issue",
                "what_happened": "SQL query is missing required relational clauses (FROM/WHERE) or statement delimiter.",
                "why_it_happened": "SQL is a declarative relational query language requiring complete clauses for table targets and filtering.",
                "where_it_happened": f"Line {detected_line}",
                "line_number": detected_line,
                "severity": severity,
                "how_to_fix": "; ".join(fixes_applied) if fixes_applied else "Ensure all required SQL clauses (SELECT, FROM, WHERE) are present and properly terminated.",
                "corrected_example": rectified,
                "rectified_code": rectified,
                "prevention_tip": "Always execute destructive queries (DELETE/UPDATE) within explicit database transactions (BEGIN ... ROLLBACK/COMMIT).",
                "practice_question": "What is the performance difference between an INNER JOIN and an OUTER JOIN in SQL query execution plans?"
            }

        # ------------------------------------------------------------
        # 8. Universal Arbitrary Code Fallback
        # ------------------------------------------------------------
        else:
            detected_line = line_num or 1
            rectified = code
            return {
                "error_type": f"{language.capitalize()} Execution / Syntax Issue",
                "what_happened": f"The {language} code encountered an error during parsing or runtime.",
                "why_it_happened": "Code syntax or execution flow violated the language grammar rules or runtime constraints.",
                "where_it_happened": f"Line {detected_line}",
                "line_number": detected_line,
                "severity": "error",
                "how_to_fix": "Review the indicated line, ensure all required packages/libraries are imported, and check type boundaries.",
                "corrected_example": rectified,
                "rectified_code": rectified,
                "prevention_tip": "Use standard compiler/linter diagnostics in your toolchain to catch syntax flaws early.",
                "practice_question": f"How does memory allocation work in {language} compared to garbage-collected environments?"
            }

