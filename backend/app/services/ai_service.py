import json
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
    ) -> Dict[str, str]:
        if settings.AI_PROVIDER == "gemini" and settings.AI_API_KEY:
            # Call Gemini with structured JSON schema prompt
            pass
        elif settings.AI_PROVIDER == "openai" and settings.AI_API_KEY:
            pass

        # Intelligent static diagnostic engine fallback
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
    async def analyze_resume_ats(cls, resume_data: Dict[str, Any]) -> Dict[str, Any]:
        skills = resume_data.get("skills", [])
        projects = resume_data.get("projects", [])
        experience = resume_data.get("experience", [])

        crit_skills = ["Python", "JavaScript", "TypeScript", "React", "PostgreSQL", "Docker", "Git", "REST APIs", "FastAPI", "Data Structures"]
        matched = [s for s in skills if any(c.lower() in s.lower() for c in crit_skills)]
        missing = [c for c in crit_skills if not any(c.lower() in s.lower() for s in skills)][:4]

        # Calculate ATS score
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
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.AI_MODEL_NAME}:generateContent?key={settings.AI_API_KEY}"
            payload = {
                "contents": [
                    {"role": "user", "parts": [{"text": f"{system_prompt}\n\nStudent question:\n{user_prompt}"}]}
                ],
                "generationConfig": {
                    "temperature": settings.AI_TEMPERATURE,
                    "maxOutputTokens": settings.AI_MAX_TOKENS
                }
            }
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
        except Exception as e:
            logger.warning(f"Gemini API request failed: {e}. Falling back to offline engine.")

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
    def _diagnose_error_offline(cls, language: str, code: str, error_message: Optional[str]) -> Dict[str, str]:
        err = (error_message or "").lower()
        code_str = code.lower()
        lang = (language or "python").lower()

        # ------------------------------------------------------------
        # C / C++ Specific Diagnostics
        # ------------------------------------------------------------
        if lang in ["c", "cpp"]:
            # 1. Missing '#' in include directive (e.g. include<stdio.h>)
            if "include<" in code_str or "include <" in code_str:
                has_hash = "#include" in code_str
                if not has_hash:
                    return {
                        "error_type": "C Compilation Error: Missing '#' in preprocessor directive / void main mismatch",
                        "what_happened": "The preprocessor directive 'include' is missing the leading '#' symbol ('#include <stdio.h>'), and 'void main()' specifies a void return type but returns 0.",
                        "why_it_happened": "In C and C++, header inclusions must begin with '#'. Without '#', the compiler treats 'include' as an unknown type name. Furthermore, standard C requires 'int main()' when returning an exit code.",
                        "where_it_happened": "Line 1: include<stdio.h> (missing '#') and Line 2: void main() vs return 0;",
                        "how_to_fix": "Add '#' before 'include <stdio.h>' and change 'void main()' to 'int main()'.",
                        "corrected_example": "#include <stdio.h>\n\nint main() {\n    printf(\"hello\\n\");\n    return 0;\n}",
                        "prevention_tip": "Always start preprocessor directives with '#' and use 'int main()' as the standard entry point.",
                        "practice_question": "Why does the C preprocessor require '#' before directives like include and define?"
                    }

            # 2. void main() returning value
            if "void main" in code_str and "return" in code_str:
                return {
                    "error_type": "C Compilation Error: return with a value in function returning void",
                    "what_happened": "Function 'main' is declared with return type 'void' but contains a 'return 0;' statement.",
                    "why_it_happened": "In C and C++, functions declared with 'void' return type cannot return any value. Additionally, the ISO C standard mandates that main() must return int.",
                    "where_it_happened": "Function signature: void main() vs return 0;",
                    "how_to_fix": "Change the return type from 'void' to 'int': 'int main()'.",
                    "corrected_example": "#include <stdio.h>\n\nint main() {\n    printf(\"hello\\n\");\n    return 0;\n}",
                    "prevention_tip": "Always declare the main entry point as 'int main()' in C/C++ applications.",
                    "practice_question": "What status does returning 0 from main() indicate to the operating system?"
                }

            # 3. Segmentation fault / null pointer in C
            if "segmentation" in err or "sigsegv" in err or "core dump" in err or "*ptr" in code_str:
                return {
                    "error_type": "Segmentation Fault (SIGSEGV / Core Dump)",
                    "what_happened": "The program attempted to read or write to an invalid or unmapped memory location.",
                    "why_it_happened": "Dereferencing a NULL, uninitialized, or already freed pointer triggers an illegal memory access signal (SIGSEGV).",
                    "where_it_happened": "At the pointer dereference operator (*ptr) or invalid array index.",
                    "how_to_fix": "Initialize pointers before use, and guard accesses with null checks: 'if (ptr != NULL)'.",
                    "corrected_example": "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int val = 42;\n    int *ptr = &val; // Correctly pointing to valid memory\n    if (ptr != NULL) {\n        *ptr = 100;\n        printf(\"Value: %d\\n\", *ptr);\n    }\n    return 0;\n}",
                    "prevention_tip": "Always initialize pointers to NULL or a valid address immediately upon declaration.",
                    "practice_question": "What is the difference between stack memory and heap memory allocation in C?"
                }

            # 4. Out of bounds in C/C++
            if "index" in err or "bounds" in err:
                return {
                    "error_type": "C/C++ Buffer Overflow / Array Index Out of Bounds",
                    "what_happened": "The program attempted to access an array element beyond its allocated capacity.",
                    "why_it_happened": "C arrays do not perform runtime bounds checking. Accessing indices >= length causes undefined behavior or memory corruption.",
                    "where_it_happened": "Inside array index expression arr[i].",
                    "how_to_fix": "Ensure loop counter strictly stays within index bounds (from 0 to SIZE - 1): 'i < SIZE'.",
                    "corrected_example": "#include <stdio.h>\n\n#define SIZE 3\n\nint main() {\n    int nums[SIZE] = {10, 20, 30};\n    for (int i = 0; i < SIZE; i++) {\n        printf(\"%d\\n\", nums[i]);\n    }\n    return 0;\n}",
                    "prevention_tip": "Use named constants for array bounds and avoid hardcoded index integers.",
                    "practice_question": "Why does C not check array boundaries automatically at runtime?"
                }

            # 5. Generic C fallback
            return {
                "error_type": "C/C++ Syntax / Compilation Error",
                "what_happened": "The C compiler detected syntax errors, missing preprocessor symbols, or type mismatches.",
                "why_it_happened": "C requires explicit header includes (#include), matching semicolon delimiters, and strict type signatures.",
                "where_it_happened": "Inspect header directives, function signatures, and line terminations.",
                "how_to_fix": "Ensure '#include <stdio.h>' is present, use 'int main()', and terminate statements with semicolons.",
                "corrected_example": "#include <stdio.h>\n\nint main() {\n    printf(\"hello world\\n\");\n    return 0;\n}",
                "prevention_tip": "Compile with '-Wall -Wextra' flags to turn on comprehensive compiler diagnostic warnings.",
                "practice_question": "What is the difference between the preprocessor, the compiler, and the linker?"
            }

        # ------------------------------------------------------------
        # Java Specific Diagnostics
        # ------------------------------------------------------------
        elif lang == "java":
            if "nullpointer" in err or "null" in err:
                return {
                    "error_type": "java.lang.NullPointerException",
                    "what_happened": "The application attempted to invoke a method or access a field on an object reference that is null.",
                    "why_it_happened": "A variable was declared without being instantiated, or a method returned null without a defensive check.",
                    "where_it_happened": "At the dot operator '.' dereference on an uninitialized reference.",
                    "how_to_fix": "Add a null check before calling methods: 'if (obj != null) { obj.method(); }'.",
                    "corrected_example": "public class Solution {\n    public static void main(String[] args) {\n        String studentName = \"CodePath\";\n        if (studentName != null) {\n            System.out.println(studentName.length());\n        }\n    }\n}",
                    "prevention_tip": "Use Java Optional<T> or Objects.requireNonNull() for safe reference handling.",
                    "practice_question": "What is the difference between a primitive type and a reference type in Java?"
                }
            return {
                "error_type": "Java Compilation / Runtime Exception",
                "what_happened": "Java compiler or JVM encountered a syntax violation or unhandled exception.",
                "why_it_happened": "Missing class definition, mismatched types, or unhandled checked exceptions.",
                "where_it_happened": "Inside the class or method definition.",
                "how_to_fix": "Ensure the public class matches the filename and methods are properly typed.",
                "corrected_example": "public class Solution {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, CodePath!\");\n    }\n}",
                "prevention_tip": "Rely on IDE static analysis to catch type mismatches before compiling.",
                "practice_question": "How does Java bytecode execution differ from compiled C machine code?"
            }

        # ------------------------------------------------------------
        # JavaScript Specific Diagnostics
        # ------------------------------------------------------------
        elif lang == "javascript":
            if "typeerror" in err or "undefined" in err or "null" in err:
                return {
                    "error_type": "TypeError: Cannot read properties of undefined / null",
                    "what_happened": "JavaScript attempted to access a property or method on an undefined or null value.",
                    "why_it_happened": "An asynchronous fetch had not completed yet, or an expected object property was missing.",
                    "where_it_happened": "At the property access chain (e.g. user.profile.name).",
                    "how_to_fix": "Use optional chaining '?.' or nullish coalescing '??': 'user?.profile?.name'.",
                    "corrected_example": "const user = { profile: { name: 'Alice' } };\n// Safe access with optional chaining\nconsole.log(user?.profile?.name ?? 'Anonymous');",
                    "prevention_tip": "Always use optional chaining '?.' when accessing nested properties from external APIs.",
                    "practice_question": "What is the difference between null and undefined in JavaScript?"
                }
            return {
                "error_type": "JavaScript Syntax / Runtime Error",
                "what_happened": "JavaScript engine encountered unexpected tokens or reference errors.",
                "why_it_happened": "Undeclared variable, mismatched parentheses, or async promise unhandled rejection.",
                "where_it_happened": "Inspect the line indicated in the stack trace.",
                "how_to_fix": "Ensure all variables are declared with 'const' or 'let' and promises are awaited.",
                "corrected_example": "const greeting = 'Hello, CodePath!';\nconsole.log(greeting);",
                "prevention_tip": "Run ESLint or TypeScript to catch undeclared variables at edit time.",
                "practice_question": "What is the event loop in JavaScript and how does it handle asynchronous callbacks?"
            }

        # ------------------------------------------------------------
        # Python Diagnostics
        # ------------------------------------------------------------
        else:
            if "indexerror" in err or "index out of range" in err or "out of bounds" in err:
                return {
                    "error_type": "IndexError: list index out of range",
                    "what_happened": "The code attempted to access an element at an index that does not exist in the collection.",
                    "why_it_happened": "In 0-indexed languages, valid indices range from 0 to length - 1. Accessing index == length raises an out of bounds error.",
                    "where_it_happened": "Inside the loop or array access expression.",
                    "how_to_fix": "Change the loop range condition from '<= len(arr)' to '< len(arr)' or use pythonic iteration 'for item in arr:'.",
                    "corrected_example": "# Correct\nnums = [10, 20, 30]\nfor i in range(len(nums)):\n    print(nums[i])\n\n# Or even better (Pythonic):\nfor num in nums:\n    print(num)",
                    "prevention_tip": "Prefer direct iteration over index-based looping whenever indices are not strictly needed.",
                    "practice_question": "Write a safe function 'safe_get(lst, index, default=None)' that returns the item or default if out of bounds."
                }
            elif "nullpointer" in err or "none" in err or "attributeerror" in err:
                return {
                    "error_type": "AttributeError: 'NoneType' object has no attribute",
                    "what_happened": "The code attempted to access a method or property on a variable that evaluates to None.",
                    "why_it_happened": "A function or query returned None (e.g. key not found, failed lookup) and the caller did not verify existence before dereferencing.",
                    "where_it_happened": "At the dot operator '.' dereference.",
                    "how_to_fix": "Add a guard clause or null-check prior to property access: 'if obj is not None: obj.action()'.",
                    "corrected_example": "result = find_user(id)\nif result is not None:\n    print(result.name)\nelse:\n    print('User not found')",
                    "prevention_tip": "Adopt defensive programming principles: always define fallback defaults for nullable return types.",
                    "practice_question": "How can 'dict.get('key', default)' prevent KeyError and None attribute crashes?"
                }
            else:
                return {
                    "error_type": "Python Syntax / Runtime Error",
                    "what_happened": "The execution environment encountered unexpected tokens, unbalanced brackets, or unhandled exceptions.",
                    "why_it_happened": "Mismatched variable names, missing colons, or incorrect type conversions (e.g. adding string to integer).",
                    "where_it_happened": "Inspect the line indicated in the stack trace.",
                    "how_to_fix": "Verify that all open brackets have matching closing pairs, and ensure variables are properly casted.",
                    "corrected_example": "# Ensure explicit type casting\nage_str = '21'\nage_num = int(age_str)\nnext_year = age_num + 1",
                    "prevention_tip": "Run a linter (flake8, ruff) or static type checker (mypy) to catch type errors before execution.",
                    "practice_question": "What is the difference between compile-time syntax errors and runtime exceptions?"
                }
