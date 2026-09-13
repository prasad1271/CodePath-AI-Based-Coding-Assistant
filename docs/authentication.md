# Authentication & Authorization Architecture

## 1. Overview

CodePath employs **Supabase Auth** as the primary identity provider, integrating industry-standard asymmetric JWT (JSON Web Tokens) verification in the FastAPI backend with role-based access control (RBAC).

```
+----------------+          1. Login (Email/Pass or OAuth)           +---------------+
|                | ------------------------------------------------> |               |
| Next.js Client |                                                   | Supabase Auth |
|                | <------------------------------------------------ |               |
+----------------+          2. Returns Access & Refresh Tokens       +---------------+
        |
        | 3. API Requests with Header:
        |    Authorization: Bearer <access_token>
        v
+-------------------+        4. Local RS256/HS256 Verification       +---------------+
|  FastAPI Backend  | ---------------------------------------------> |  App / DB RLS |
| (Security Module) |           or claims inspection                 |               |
+-------------------+                                                +---------------+
```

---

## 2. Authentication Flow

1. **Client Registration / Login**:
   - The user enters credentials on `/login` or `/register` (or authenticates via GitHub OAuth).
   - The Next.js client interacts with `supabase.auth.signUp()` or `supabase.auth.signInWithPassword()`.
   - Upon success, the session tokens are saved in secure browser cookies and local storage.

2. **Backend Token Verification**:
   - Every API request sends `Authorization: Bearer <token>`.
   - The FastAPI dependency `get_current_user` in `backend/app/core/security.py` extracts and validates the JWT against the Supabase JWT secret.
   - If the secret is not configured (e.g. initial dev environment), it parses the standard JWT claims or matches the mock dev session.

3. **User Sync & Profile Provisioning**:
   - On first login, a trigger in PostgreSQL automatically initializes a row in `public.users` matching `auth.users(id)`.
   - A companion record in `public.user_career_readiness` is instantiated with baseline readiness metrics (0%).

---

## 3. Role-Based Access Control (RBAC)

CodePath defines three distinct user roles:

| Role | Permissions |
| :--- | :--- |
| **`student`** | Access to courses, code practice arena, Error Doctor, AI mentor, DSA roadmap, project studio, mock interviews, resume builder, community forum. |
| **`mentor`** | All student permissions + ability to review peer projects, answer student community questions with a verified badge, and author custom problem hints. |
| **`admin`** | Full access to `/admin`, platform metrics, user management, course/problem publishing, and system error logs. |

### Role Enforcement in FastAPI
```python
from fastapi import Depends
from app.core.security import require_role
from app.models.user import User

@router.get("/admin/overview")
def get_admin_overview(current_user: User = Depends(require_role("admin"))):
    return {"status": "authorized"}
```

---

## 4. Session Handling & Token Refresh

- **Access Token Lifetime**: 1 hour.
- **Refresh Token Lifetime**: 30 days.
- **Automatic Refresh**: Handled automatically on the client side via the Supabase Auth listener (`onAuthStateChange`), ensuring zero interruption during coding sessions or timed placement tests.
