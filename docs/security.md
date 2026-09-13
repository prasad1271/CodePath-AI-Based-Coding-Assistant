# Security Architecture & Hardening Guide

## 1. Threat Model & Mitigations

| Threat | Target Layer | Mitigation Architecture |
| :--- | :--- | :--- |
| **Malicious Code Execution** | Backend Sandbox | Blacklist validation (`os`, `sys`, `subprocess`, `socket`, `eval`), isolated temp filesystem, non-root user, 8.0s timeout, memory bounds. |
| **SQL Injection** | Database | 100% parameterized queries via SQLAlchemy 2.0 ORM; direct raw SQL concatenation strictly prohibited. |
| **Cross-Site Scripting (XSS)** | Frontend | React JSX automatic escaping, strict Content Security Policies (CSP), DOMPurify on markdown previewers. |
| **Cross-Site Request Forgery** | API / Session | Strict SameSite cookie policies, Bearer JWT authorization headers, state verification on OAuth. |
| **Unauthorized Data Access** | Database | Supabase Row Level Security (RLS) policies enforced at the PostgreSQL engine level. |
| **Denial of Service / Abuse** | AI & Execution APIs | Rate limiting per IP and per authenticated user; bounded execution runtimes; token budget limits. |

---

## 2. Sandboxed Code Execution Safeguards

The CodePath execution engine (`backend/app/services/code_executor.py`) adheres to defense-in-depth principles:

1. **Static Analysis AST Pre-Scan**:
   - Rejects code containing dangerous imports and builtin functions before invoking a compiler or interpreter:
   ```python
   DANGEROUS_PATTERNS = [
       "import os", "from os", "import sys", "from sys",
       "import subprocess", "from subprocess",
       "import socket", "from socket",
       "__import__", "eval(", "exec(", "open("
   ]
   ```

2. **Filesystem Isolation**:
   - Each execution runs in an isolated ephemeral directory created via `tempfile.mkdtemp`.
   - The directory is completely removed via `shutil.rmtree(temp_dir, ignore_errors=True)` in a guaranteed `finally` block.

3. **Execution Limits**:
   - Maximum Execution Time: **8.0 seconds** (enforced via `subprocess.run(timeout=8.0)`).
   - Maximum Output Capture: **100,000 characters** to prevent buffer overflow attacks.
   - Resource cleanup guarantees no dangling zombie processes.

---

## 3. Row Level Security (RLS)

All database operations pass through Supabase RLS policies:
- User submission records, resumes, and interview feedback are only queryable if `auth.uid() = user_id`.
- Public course content and problems are read-only for anonymous and authenticated users; modifications require `role = 'admin'`.

---

## 4. Secrets Management

- Zero secrets committed to the repository.
- `.env.example` provides exact variable names with safe placeholder descriptions.
- Production credentials are injected via environment variables in Render (FastAPI) and Vercel (Next.js).
- GitHub Actions CI/CD uses GitHub Encrypted Secrets for deploy hooks.
