# Testing & Quality Assurance Strategy

## 1. Testing Philosophy

CodePath maintains a rigorous, multi-tiered test suite ensuring functional correctness, security isolation, and API contract reliability.

---

## 2. Backend Automated Test Suite (`pytest`)

The backend tests reside in `backend/tests/` and cover all core capabilities:
- Health and Readiness probes (`test_health.py`)
- Code Execution Engine & Security Sandbox (`test_code_executor.py`)
  - Valid Python execution
  - Syntax error handling
  - Timeout enforcement (infinite loops)
  - Malicious command rejection (`import os`, `subprocess`, `eval`)
  - Hidden test case evaluation
- AI Pedagogical Engine (`test_ai_service.py`)
  - Socratic hint generation
  - Error Doctor diagnosis formatting
- Career Readiness Engine (`test_readiness.py`)
  - Multi-factor weighted score calculation
- API Route Contracts (`test_api_routes.py`)
  - Problem catalog fetching
  - Course catalog fetching
  - Placement drives listing

### Running Backend Tests
```bash
cd backend
pytest -v
```
Sample test output:
```
backend/tests/test_api_routes.py::test_health_endpoint PASSED
backend/tests/test_api_routes.py::test_courses_endpoint PASSED
backend/tests/test_api_routes.py::test_problems_endpoint PASSED
backend/tests/test_api_routes.py::test_career_readiness_endpoint PASSED
backend/tests/test_api_routes.py::test_placement_drives_endpoint PASSED
backend/tests/test_code_executor.py::test_python_execution_success PASSED
backend/tests/test_code_executor.py::test_python_syntax_error PASSED
backend/tests/test_code_executor.py::test_python_infinite_loop_timeout PASSED
backend/tests/test_code_executor.py::test_security_blacklist_rejection PASSED
backend/tests/test_code_executor.py::test_run_test_cases PASSED
backend/tests/test_ai_service.py::test_ai_mentor_offline_socratic PASSED
backend/tests/test_ai_service.py::test_error_doctor_offline PASSED
backend/tests/test_ai_service.py::test_ats_analysis_offline PASSED
backend/tests/test_readiness.py::test_readiness_calculation PASSED
backend/tests/test_health.py::test_health_check PASSED
============================== 15 passed in 1.05s ==============================
```

---

## 3. Frontend Build & Static Analysis

The Next.js frontend is verified via TypeScript compilation and Next.js static page generation:
```bash
cd frontend
npm run build
```
The build exercises:
- Full TypeScript typing across all 28 routes and components.
- Zero broken imports or invalid prop types.
- Client/Server component boundary correctness.

---

## 4. End-to-End Verification Checklist

| Scenario | Expected Result | Verified |
| :--- | :--- | :---: |
| Student opens `/practice` and clicks "Two Sum" | Monaco Editor loads starter code, description, and test cases | Yes |
| Student clicks "Run Code" | Code runs in sandbox and displays sample test case results | Yes |
| Student pastes code with error and clicks "Error Doctor" | Plain-English diagnosis is generated with fix recommendations | Yes |
| Student completes practice problem | Submission is recorded and Career Readiness Score increments | Yes |
| Student chats with AI Mentor on `/mentor` | AI replies using progressive hints without revealing direct code | Yes |
| Student opens `/placement` and takes mock drive | Sectional timer runs and calculates score on completion | Yes |
| Student generates ATS resume on `/resume` | Resume is rendered and scored against target job description | Yes |
