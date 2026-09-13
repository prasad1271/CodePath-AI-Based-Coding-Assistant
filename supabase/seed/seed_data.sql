-- ============================================================
-- CODEPATH SEED DATA: Realistic Courses, Problems, DSA & Career Paths
-- ============================================================

-- ------------------------------------------------------------
-- 1. COURSES
-- ------------------------------------------------------------
INSERT INTO public.courses (id, slug, title, description, language, icon, difficulty, order_index, is_published)
VALUES
  ('c0000001-0000-0000-0000-000000000001', 'python-fundamentals', 'Python for Engineers', 'Master core Python from basic syntax to object-oriented programming and data manipulation.', 'python', 'Code', 'Beginner', 1, TRUE),
  ('c0000001-0000-0000-0000-000000000002', 'java-programming', 'Java Core & OOP', 'Deep dive into Java syntax, memory management, object-oriented principles, and Collections Framework.', 'java', 'Coffee', 'Beginner', 2, TRUE),
  ('c0000001-0000-0000-0000-000000000003', 'c-programming', 'C Programming & Memory', 'Understand low-level computing, memory addresses, pointers, and systems programming fundamentals.', 'c', 'Cpu', 'Beginner', 3, TRUE),
  ('c0000001-0000-0000-0000-000000000004', 'cpp-stl-dsa', 'C++ & Standard Template Library', 'Harness modern C++ for high-performance computing, competitive coding, and interview problem solving.', 'cpp', 'Terminal', 'Intermediate', 4, TRUE),
  ('c0000001-0000-0000-0000-000000000005', 'javascript-web', 'Modern JavaScript (ES6+)', 'Build dynamic logic, asynchronous workflows, and modern web application logic.', 'javascript', 'Globe', 'Beginner', 5, TRUE),
  ('c0000001-0000-0000-0000-000000000006', 'sql-databases', 'SQL & Relational Databases', 'Master schema design, complex joins, aggregations, window functions, and indexing strategies.', 'sql', 'Database', 'Beginner', 6, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------
-- 2. MODULES & LESSONS (Python Example)
-- ------------------------------------------------------------
INSERT INTO public.modules (id, course_id, title, description, order_index)
VALUES
  ('m0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Module 1: Variables & Data Types', 'Fundamental data containers and type system in Python.', 1),
  ('m0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'Module 2: Control Flow & Loops', 'Conditionals, for-loops, while-loops, and iteration techniques.', 2),
  ('m0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000001', 'Module 3: Functions & Modularity', 'Defining reusable blocks, parameters, return values, and scopes.', 3)
ON CONFLICT DO NOTHING;

INSERT INTO public.lessons (id, module_id, slug, title, content_markdown, code_snippet, solution_code, hints, quiz_questions, practice_problem_slug, order_index)
VALUES
  ('l0000001-0000-0000-0000-000000000001', 'm0000001-0000-0000-0000-000000000001', 'variables-and-print', 'Variables & Standard Output',
  '### Understanding Variables in Python\n\nIn Python, variables are created when you assign a value to them. Python is dynamically typed, meaning you do not need to explicitly declare variable types.\n\n```python\nstudent_name = "Alex"\nstudent_gpa = 3.85\nis_enrolled = True\n```\n\nThe `print()` function displays formatted output to the console.',
  '# Create variables and print them\nstudent_name = "Jordan"\nage = 20\n\n# Print a greeting message\nprint("Student:", student_name)',
  'student_name = "Jordan"\nage = 20\nprint(f"Student: {student_name}, Age: {age}")',
  '["Use string formatting like f-strings: f\"Hello {name}\"", "Verify variable naming conventions (lowercase with underscores)"]'::jsonb,
  '[{"question": "What is the type of variable x = 42.0?", "options": ["int", "float", "double", "str"], "correctIndex": 1, "explanation": "In Python, numeric literals with decimal points are float instances."}]'::jsonb,
  'two-sum', 1),
  ('l0000001-0000-0000-0000-000000000002', 'm0000001-0000-0000-0000-000000000001', 'data-types-and-casting', 'Data Types & Type Conversion',
  '### Python Primitive Data Types\n\nPython provides integers (`int`), floating-point numbers (`float`), text strings (`str`), and booleans (`bool`). You can inspect types using `type()` and convert between them using casting functions (`int()`, `float()`, `str()`).',
  'raw_input = "105"\n# Convert string to integer and add 5\nconverted = int(raw_input)\nresult = converted + 5\nprint("Result:", result)',
  'raw_input = "105"\nconverted = int(raw_input)\nresult = converted + 5\nprint("Result:", result)',
  '["Remember int() raises a ValueError if given non-numeric text"]'::jsonb,
  '[{"question": "What does bool(0) return in Python?", "options": ["True", "False", "None", "Error"], "correctIndex": 1, "explanation": "Zero evaluates to False in Python truthiness checks."}]'::jsonb,
  'valid-palindrome', 2)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 3. CODING PROBLEMS & TEST CASES
-- ------------------------------------------------------------
INSERT INTO public.problems (id, slug, title, description, difficulty, topic, languages_supported, starter_codes, constraints_text, hints, solution_explanation, company_tags, acceptance_rate)
VALUES
  ('p0000001-0000-0000-0000-000000000001', 'two-sum', 'Two Sum',
  'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
  'Easy', 'Arrays', '["python", "javascript", "java", "cpp"]'::jsonb,
  '{
    "python": "def twoSum(nums: list[int], target: int) -> list[int]:\n    # Write your solution here\n    pass",
    "javascript": "function twoSum(nums, target) {\n    // Write your solution here\n}",
    "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write solution\n        return new int[]{};\n    }\n}",
    "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write solution\n    }\n};"
  }'::jsonb,
  '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
  '["A brute force approach checks every pair with O(N^2) complexity.", "Can you use a hash map / dictionary to find the complement target - num in O(1) time?"]'::jsonb,
  '### Optimal Hash Map Solution\n\nIterate through the array while maintaining a hash map mapping value -> index. For each number, calculate `complement = target - num`. If the complement exists in the map, return `[map[complement], current_index]`. Time Complexity: O(N), Space Complexity: O(N).',
  '["Amazon", "Google", "Microsoft", "TCS", "Infosys"]'::jsonb, 82.50),

  ('p0000001-0000-0000-0000-000000000002', 'valid-palindrome', 'Valid Palindrome',
  'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.',
  'Easy', 'Strings', '["python", "javascript", "java", "cpp"]'::jsonb,
  '{
    "python": "def isPalindrome(s: str) -> bool:\n    # Write your solution here\n    pass",
    "javascript": "function isPalindrome(s) {\n    // Write your solution here\n}",
    "java": "class Solution {\n    public boolean isPalindrome(String s) {\n        // Write solution\n        return false;\n    }\n}"
  }'::jsonb,
  '1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.',
  '["Consider using two pointers: one at the start, one at the end.", "Skip non-alphanumeric characters using isalnum()."]'::jsonb,
  '### Two Pointer Solution\n\nInitialize left = 0 and right = len(s) - 1. Move pointers inward, skipping non-alphanumeric characters and comparing characters in lowercase. If characters mismatch, return False. Time Complexity: O(N), Space Complexity: O(1).',
  '["Facebook", "Microsoft", "Adobe"]'::jsonb, 79.10),

  ('p0000001-0000-0000-0000-000000000003', 'maximum-subarray', 'Maximum Subarray (Kadane Algorithm)',
  'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.',
  'Medium', 'Dynamic Programming', '["python", "javascript", "java", "cpp"]'::jsonb,
  '{
    "python": "def maxSubArray(nums: list[int]) -> int:\n    # Write your solution here\n    pass",
    "javascript": "function maxSubArray(nums) {\n    // Write your solution here\n}"
  }'::jsonb,
  '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
  '["Think about what happens when the running sum becomes negative.", "Kadane algorithm maintains max_so_far and current_sum."]'::jsonb,
  '### Kadane Algorithm\n\nMaintain `current_sum = 0` and `max_sum = nums[0]`. For each element, `current_sum = max(num, current_sum + num)`. Then `max_sum = max(max_sum, current_sum)`. Time: O(N), Space: O(1).',
  '["Amazon", "Apple", "Google"]'::jsonb, 68.40)
ON CONFLICT (slug) DO NOTHING;

-- Test Cases for Two Sum
INSERT INTO public.problem_test_cases (problem_id, input, expected_output, is_hidden, order_index)
VALUES
  ('p0000001-0000-0000-0000-000000000001', 'nums = [2,7,11,15], target = 9', '[0, 1]', FALSE, 1),
  ('p0000001-0000-0000-0000-000000000001', 'nums = [3,2,4], target = 6', '[1, 2]', FALSE, 2),
  ('p0000001-0000-0000-0000-000000000001', 'nums = [3,3], target = 6', '[0, 1]', TRUE, 3)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 4. DSA TOPICS
-- ------------------------------------------------------------
INSERT INTO public.dsa_topics (id, slug, title, category, order_index, concept_explanation, patterns, visualization_type, common_mistakes, problem_slugs, interview_questions)
VALUES
  ('d0000001-0000-0000-0000-000000000001', 'arrays-and-hashing', 'Arrays & Hashing', 'Core Structures', 1,
  'Arrays provide contiguous memory storage with O(1) random access by index. Combined with Hash Tables (dictionaries), you achieve O(1) average lookup and insertion, enabling optimal two-sum and frequency counting solutions.',
  '["Frequency Map Pattern", "Prefix Sum Pattern", "Two Pointer Scan"]'::jsonb,
  'array',
  '["Off-by-one errors on boundary indices", "Modifying array length during iteration", "Assuming hash tables are always sorted"]'::jsonb,
  '["two-sum"]'::jsonb,
  '["Explain the internal collision resolution in hash tables.", "What is the difference between an Array and an ArrayList in Java memory?"]'::jsonb),

  ('d0000001-0000-0000-0000-000000000002', 'two-pointers', 'Two Pointers & Sliding Window', 'Algorithmic Patterns', 2,
  'The two-pointer technique uses two directional references to search for pairs or iterate sub-ranges in linear O(N) time without nested loops. The sliding window variation manages contiguous subarray constraints.',
  '["Opposite Ends Scan", "Fast & Slow Pointers", "Variable Size Window"]'::jsonb,
  'pointers',
  '["Forgetting to increment/decrement both pointers", "Not handling empty string or single-character edge cases"]'::jsonb,
  '["valid-palindrome"]'::jsonb,
  '["How does Floyd Cycle Detection algorithm work using fast and slow pointers?"]'::jsonb),

  ('d0000001-0000-0000-0000-000000000003', 'dynamic-programming', 'Dynamic Programming Fundamentals', 'Advanced Algorithms', 3,
  'Dynamic Programming solves complex problems by breaking them down into overlapping subproblems and optimal substructure. Techniques include memoization (top-down) and tabulation (bottom-up).',
  '["1D Kadane / Fibonacci Pattern", "0/1 Knapsack Pattern", "Longest Common Subsequence"]'::jsonb,
  'matrix',
  '["Failing to identify base cases", "Unnecessary state dimensions blowing up memory limit"]'::jsonb,
  '["maximum-subarray"]'::jsonb,
  '["Compare top-down memoization versus bottom-up tabulation in terms of recursion stack overhead."]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------
-- 5. CAREER PATHS
-- ------------------------------------------------------------
INSERT INTO public.career_paths (id, slug, title, target_role, description, salary_range, market_demand, required_languages, technologies, dsa_requirements, projects_required, certifications, interview_topics, resume_skills, github_expectations, learning_sequence)
VALUES
  ('cp000001-0000-0000-0000-000000000001', 'full-stack-developer', 'Full Stack Developer', 'Full Stack Engineer',
  'Design and build responsive frontends, scalable REST/GraphQL APIs, database architectures, and cloud deployments.',
  '₹8 LPA - ₹24 LPA ($85k - $140k)', 'Very High',
  '["TypeScript", "JavaScript", "Python", "SQL"]'::jsonb,
  '["React", "Next.js", "Node.js/FastAPI", "PostgreSQL", "Docker", "Tailwind CSS", "Git"]'::jsonb,
  '["Arrays", "Strings", "Trees", "Graphs", "Dynamic Programming (Medium)"]'::jsonb,
  '["Full Stack SaaS with Auth & Payments", "Real-time Collaboration App (WebSockets)", "REST API with Microservices"]'::jsonb,
  '["AWS Certified Developer Associate", "Meta Front-End/Back-End Professional"]'::jsonb,
  '["System Design (High & Low Level)", "REST API Principles", "Browser Rendering Cycle", "Database Indexing & Normalization"]'::jsonb,
  '["React/Next.js", "Node.js", "PostgreSQL", "Docker", "CI/CD Pipelines", "TypeScript"]'::jsonb,
  '["3+ clean repositories with comprehensive READMEs", "Proper commit history", "Live demo links deployed on Vercel/Render"]'::jsonb,
  '["1. Programming Core", "2. Frontend Fundamentals", "3. Backend API Development", "4. Database Design & SQL", "5. Cloud Deployment & Docker", "6. Capstone Full Stack Project"]'::jsonb),

  ('cp000001-0000-0000-0000-000000000002', 'ai-ml-engineer', 'AI/ML Engineer', 'Machine Learning Engineer',
  'Develop intelligent systems, data processing pipelines, deep learning models, and production LLM applications.',
  '₹10 LPA - ₹30 LPA ($95k - $160k)', 'Extremely High',
  '["Python", "SQL", "C++"]'::jsonb,
  '["PyTorch", "TensorFlow", "scikit-learn", "FastAPI", "Hugging Face", "LangChain/LlamaIndex", "Docker"]'::jsonb,
  '["Linear Algebra", "Calculus & Probability", "Graphs & Trees", "Optimization Algorithms"]'::jsonb,
  '["End-to-End ML Pipeline with Model Serving", "RAG (Retrieval-Augmented Generation) System", "Computer Vision or NLP Classification API"]'::jsonb,
  '["TensorFlow Developer Certificate", "AWS Certified Machine Learning Specialty"]'::jsonb,
  '["Loss Functions & Gradient Descent", "Overfitting Prevention", "Transformers Architecture", "Model Quantization & Deployment"]'::jsonb,
  '["Python", "PyTorch", "Pandas/NumPy", "FastAPI", "Docker", "Vector Databases", "MLflow"]'::jsonb,
  '["Jupyter notebooks with clear EDA", "Modular Python packages with unit tests", "Hugging Face Spaces or Streamlit live demos"]'::jsonb,
  '["1. Python & Math Foundations", "2. Data Analysis (NumPy, Pandas)", "3. Classical ML Algorithms", "4. Deep Learning & PyTorch", "5. LLMs & GenAI Systems", "6. ML Deployment & MLOps"]'::jsonb),

  ('cp000001-0000-0000-0000-000000000003', 'cybersecurity-analyst', 'Cybersecurity Specialist', 'Security Engineer',
  'Protect enterprise systems, audit software codebases for vulnerabilities, perform penetration testing, and enforce cloud security.',
  '₹8 LPA - ₹22 LPA ($80k - $135k)', 'High',
  '["Python", "Bash", "C", "SQL"]'::jsonb,
  '["Linux/Unix", "Wireshark", "Burp Suite", "Metasploit", "Nmap", "OWASP ZAP", "Snort"]'::jsonb,
  '["Bit Manipulation", "Graph Traversal (Network topologies)", "Hashing & Cryptography"]'::jsonb,
  '["Vulnerability Scanner in Python", "Network Packet Sniffer & Analyzer", "Secure Identity & RBAC Authentication Service"]'::jsonb,
  '["CompTIA Security+", "Certified Ethical Hacker (CEH)", "AWS Certified Security Specialty"]'::jsonb,
  '["OWASP Top 10 Web Vulnerabilities", "Cryptography (Symmetric vs Asymmetric)", "TCP/IP 3-Way Handshake & Protocols", "SOC Incident Response"]'::jsonb,
  '["Network Security", "Penetration Testing", "OWASP Standards", "Linux Administration", "Python Scripting", "SIEM Tools"]'::jsonb,
  '["Security tool automation scripts", "CTF challenge writeups", "Vulnerability disclosure reports (cleanly documented)"]'::jsonb,
  '["1. Linux & Networking Core", "2. Python Automation & Scripting", "3. Web Application Security (OWASP)", "4. Cryptography & Authentication", "5. Cloud Security & Compliance", "6. Mock Security Auditing"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------
-- 6. ACHIEVEMENTS & GAMIFICATION
-- ------------------------------------------------------------
INSERT INTO public.achievements (id, code, title, description, badge_icon, xp_reward, category)
VALUES
  ('a0000001-0000-0000-0000-000000000001', 'first-solve', 'First Step Forward', 'Solved your very first coding problem on CodePath.', 'Award', 50, 'coding'),
  ('a0000001-0000-0000-0000-000000000002', 'streak-7', 'Unstoppable Momentum', 'Maintained a 7-day consecutive coding activity streak.', 'Flame', 150, 'streak'),
  ('a0000001-0000-0000-0000-000000000003', 'dsa-initiate', 'Algorithm Apprentice', 'Mastered your first fundamental Data Structures & Algorithms topic.', 'BookOpen', 100, 'learning'),
  ('a0000001-0000-0000-0000-000000000004', 'project-builder', 'Production Architect', 'Created and planned a full capstone project with architecture milestones.', 'FolderGit2', 200, 'project'),
  ('a0000001-0000-0000-0000-000000000005', 'interview-ready', 'Interview Challenger', 'Completed an AI-driven technical mock interview with detailed feedback.', 'Target', 250, 'interview')
ON CONFLICT (code) DO NOTHING;

-- ------------------------------------------------------------
-- 7. PLACEMENT PREPARATION TESTS & QUESTIONS
-- ------------------------------------------------------------
INSERT INTO public.placement_tests (id, title, category, time_limit_minutes, total_questions)
VALUES
  ('pt000001-0000-0000-0000-000000000001', 'CS Fundamentals Sprint: DBMS & OS', 'CS Fundamentals', 20, 5),
  ('pt000001-0000-0000-0000-000000000002', 'Quantitative Aptitude & Logical Reasoning', 'Aptitude', 25, 5)
ON CONFLICT DO NOTHING;

INSERT INTO public.placement_questions (id, test_id, subject, question_text, options, correct_option_index, explanation)
VALUES
  ('pq000001-0000-0000-0000-000000000001', 'pt000001-0000-0000-0000-000000000001', 'DBMS',
  'Which of the following database isolation levels prevents phantom reads according to ANSI SQL standard?',
  '["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"]'::jsonb,
  3, 'Serializable is the highest isolation level and uses range locks or multiversion concurrency to completely prevent phantom reads.'),

  ('pq000001-0000-0000-0000-000000000002', 'pt000001-0000-0000-0000-000000000001', 'OS',
  'What condition is NOT required for a deadlock to occur (Coffman conditions)?',
  '["Mutual Exclusion", "Hold and Wait", "Preemption", "Circular Wait"]'::jsonb,
  2, 'NO preemption is the condition. If preemption is allowed, deadlocks cannot persist because resources can be forcibly taken back.'),

  ('pq000001-0000-0000-0000-000000000003', 'pt000001-0000-0000-0000-000000000001', 'Computer Networks',
  'In the TCP/IP stack, which layer is responsible for end-to-end reliability and flow control?',
  '["Network Layer", "Transport Layer", "Data Link Layer", "Application Layer"]'::jsonb,
  1, 'The Transport Layer (e.g. TCP) handles flow control, sequence numbers, checksums, and retransmissions for end-to-end reliability.')
ON CONFLICT DO NOTHING;
