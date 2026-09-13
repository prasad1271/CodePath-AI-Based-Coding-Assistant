from sqlalchemy.orm import Session
from app.models.learning import Course, Module, Lesson
from app.models.practice import Problem, ProblemTestCase
from app.models.dsa import DsaTopic
from app.models.career import CareerPath
from app.models.placement import PlacementTest, PlacementQuestion
from app.models.user import Achievement, User, Profile, Streak, UserSettings
from app.core.logging import logger


def seed_database_if_empty(db: Session):
    """
    Idempotent database seeder ensuring the platform is immediately populated
    with realistic engineering education content.
    """
    try:
        # Check if already seeded
        if db.query(Course).count() > 0:
            return

        logger.info("Database is empty. Populating educational seed data...")

        # 1. Courses
        c_py = Course(
            slug="python-fundamentals",
            title="Python for Engineers",
            description="Master core Python from basic syntax to object-oriented programming and data manipulation.",
            language="python",
            icon="Code",
            difficulty="Beginner",
            order_index=1,
            is_published=True
        )
        c_java = Course(
            slug="java-programming",
            title="Java Core & OOP",
            description="Deep dive into Java syntax, memory management, object-oriented principles, and Collections Framework.",
            language="java",
            icon="Coffee",
            difficulty="Beginner",
            order_index=2,
            is_published=True
        )
        c_cpp = Course(
            slug="cpp-stl-dsa",
            title="C++ & Standard Template Library",
            description="Harness modern C++ for high-performance computing, competitive coding, and interview problem solving.",
            language="cpp",
            icon="Terminal",
            difficulty="Intermediate",
            order_index=3,
            is_published=True
        )
        c_c = Course(
            slug="c-programming",
            title="C Programming & Memory",
            description="Understand low-level computing, memory addresses, pointers, and systems programming fundamentals.",
            language="c",
            icon="Cpu",
            difficulty="Beginner",
            order_index=4,
            is_published=True
        )
        c_js = Course(
            slug="javascript-web",
            title="Modern JavaScript (ES6+)",
            description="Build dynamic logic, asynchronous workflows, and modern web application logic.",
            language="javascript",
            icon="Globe",
            difficulty="Beginner",
            order_index=5,
            is_published=True
        )
        c_sql = Course(
            slug="sql-databases",
            title="SQL & Relational Databases",
            description="Master schema design, complex joins, aggregations, window functions, and indexing strategies.",
            language="sql",
            icon="Database",
            difficulty="Beginner",
            order_index=6,
            is_published=True
        )
        db.add_all([c_py, c_java, c_cpp, c_c, c_js, c_sql])
        db.flush()

        # Modules & Lessons for Python
        m1 = Module(
            course_id=c_py.id,
            title="Module 1: Variables & Data Types",
            description="Fundamental data containers and type system in Python.",
            order_index=1
        )
        m2 = Module(
            course_id=c_py.id,
            title="Module 2: Control Flow & Loops",
            description="Conditionals, for-loops, while-loops, and iteration techniques.",
            order_index=2
        )
        db.add_all([m1, m2])
        db.flush()

        l1 = Lesson(
            module_id=m1.id,
            slug="variables-and-print",
            title="Variables & Standard Output",
            content_markdown="""### Understanding Variables in Python

In Python, variables are dynamically typed data labels created upon assignment.

```python
student_name = "Alex"
student_gpa = 3.85
is_enrolled = True
print(f"Student: {student_name}, GPA: {student_gpa}")
```

The `print()` function formats and displays text to the standard console.
""",
            code_snippet="# Create student profile variables and print\nstudent_name = \"Jordan\"\ngpa = 3.9\nprint(f\"Student {student_name} has GPA: {gpa}\")",
            solution_code="student_name = \"Jordan\"\ngpa = 3.9\nprint(f\"Student {student_name} has GPA: {gpa}\")",
            hints=["Use f-strings for clean string interpolation", "Variables in Python should follow snake_case naming conventions"],
            quiz_questions=[
                {
                    "question": "What is the return type of input() in Python 3?",
                    "options": ["int", "str", "float", "object"],
                    "correctIndex": 1,
                    "explanation": "input() always returns user input as a string (str)."
                }
            ],
            practice_problem_slug="two-sum",
            order_index=1
        )
        l2 = Lesson(
            module_id=m1.id,
            slug="data-types-and-casting",
            title="Data Types & Type Conversion",
            content_markdown="""### Primitive Data Types & Casting

Python provides `int`, `float`, `str`, and `bool`.

```python
score_str = "95"
score_num = int(score_str)
```
""",
            code_snippet="raw_input = \"105\"\nconverted = int(raw_input)\nprint(\"Result:\", converted + 5)",
            solution_code="raw_input = \"105\"\nconverted = int(raw_input)\nprint(\"Result:\", converted + 5)",
            hints=["int() converts valid numeric strings to integers"],
            quiz_questions=[
                {
                    "question": "What will float('12.5') return?",
                    "options": ["12", "12.5", "Error", "'12.5'"],
                    "correctIndex": 1,
                    "explanation": "float('12.5') parses the string into a floating-point number 12.5."
                }
            ],
            practice_problem_slug="valid-palindrome",
            order_index=2
        )
        db.add_all([l1, l2])

        # 2. Coding Problems & Test Cases
        p1 = Problem(
            slug="two-sum",
            title="Two Sum",
            description="""Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.""",
            difficulty="Easy",
            topic="Arrays",
            languages_supported=["python", "javascript", "java", "cpp"],
            starter_codes={
                "python": "def twoSum(nums: list[int], target: int) -> list[int]:\n    # Optimal Hash Map approach O(N)\n    lookup = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in lookup:\n            return [lookup[diff], i]\n        lookup[num] = i\n    return []\n\n# Test execution\nprint(twoSum([2, 7, 11, 15], 9))",
                "javascript": "function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) return [map.get(diff), i];\n        map.set(nums[i], i);\n    }\n    return [];\n}\nconsole.log(twoSum([2, 7, 11, 15], 9));"
            },
            constraints_text="2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
            hints=["Store visited numbers in a dictionary mapping value -> index.", "For each number x, check if (target - x) already exists in the dictionary."],
            solution_explanation="Use a hash map to achieve linear O(N) time complexity and O(N) space.",
            company_tags=["Amazon", "Google", "Microsoft", "TCS"],
            acceptance_rate=82.50
        )

        p2 = Problem(
            slug="valid-palindrome",
            title="Valid Palindrome",
            description="""A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string `s`, return `true` if it is a palindrome, or `false` otherwise.""",
            difficulty="Easy",
            topic="Strings",
            languages_supported=["python", "javascript", "java", "cpp"],
            starter_codes={
                "python": "def isPalindrome(s: str) -> bool:\n    clean = [c.lower() for c in s if c.isalnum()]\n    return clean == clean[::-1]\n\nprint(isPalindrome(\"A man, a plan, a canal: Panama\"))",
                "javascript": "function isPalindrome(s) {\n    const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n    return clean === clean.split('').reverse().join('');\n}\nconsole.log(isPalindrome(\"racecar\"));"
            },
            constraints_text="1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.",
            hints=["Filter out non-alphanumeric characters using isalnum()", "Compare characters using two pointers from opposite ends."],
            solution_explanation="Two pointer scan gives O(N) time and O(1) auxiliary space.",
            company_tags=["Facebook", "Microsoft", "Adobe"],
            acceptance_rate=78.20
        )

        p3 = Problem(
            slug="maximum-subarray",
            title="Maximum Subarray (Kadane's Algorithm)",
            description="Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
            difficulty="Medium",
            topic="Dynamic Programming",
            languages_supported=["python", "javascript", "java", "cpp"],
            starter_codes={
                "python": "def maxSubArray(nums: list[int]) -> int:\n    max_sum = nums[0]\n    curr = 0\n    for x in nums:\n        curr = max(x, curr + x)\n        max_sum = max(max_sum, curr)\n    return max_sum\n\nprint(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]))",
                "javascript": "function maxSubArray(nums) {\n    let max = nums[0], curr = 0;\n    for (const x of nums) {\n        curr = Math.max(x, curr + x);\n        max = Math.max(max, curr);\n    }\n    return max;\n}\nconsole.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]));"
            },
            constraints_text="1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
            hints=["If current_sum becomes negative, reset it to the current element."],
            solution_explanation="Kadane algorithm computes optimal maximum subarray in single pass O(N) time.",
            company_tags=["Amazon", "Apple", "Google"],
            acceptance_rate=65.80
        )
        db.add_all([p1, p2, p3])
        db.flush()

        # Problem Test Cases
        tc1 = ProblemTestCase(problem_id=p1.id, input="nums = [2,7,11,15], target = 9", expected_output="[0, 1]", is_hidden=False, order_index=1)
        tc2 = ProblemTestCase(problem_id=p1.id, input="nums = [3,2,4], target = 6", expected_output="[1, 2]", is_hidden=False, order_index=2)
        tc3 = ProblemTestCase(problem_id=p2.id, input="s = 'A man, a plan, a canal: Panama'", expected_output="True", is_hidden=False, order_index=1)
        db.add_all([tc1, tc2, tc3])

        # 3. DSA Topics
        d1 = DsaTopic(
            slug="arrays-and-hashing",
            title="Arrays & Hashing",
            category="Core Structures",
            order_index=1,
            concept_explanation="Arrays provide contiguous memory storage with O(1) random access by index. Combined with Hash Tables, you achieve O(1) average lookup and insertion.",
            patterns=["Frequency Map Pattern", "Prefix Sum Pattern", "Two Pointer Scan"],
            visualization_type="array",
            common_mistakes=["Off-by-one errors on boundary indices", "Modifying array length during iteration"],
            problem_slugs=["two-sum"],
            interview_questions=["Explain how collision resolution works in hash tables.", "What is the difference between Array and ArrayList in Java?"]
        )
        d2 = DsaTopic(
            slug="two-pointers",
            title="Two Pointers & Sliding Window",
            category="Algorithmic Patterns",
            order_index=2,
            concept_explanation="The two-pointer technique uses two directional references to search for pairs or iterate sub-ranges in linear O(N) time without nested loops.",
            patterns=["Opposite Ends Scan", "Fast & Slow Pointers", "Variable Size Window"],
            visualization_type="pointers",
            common_mistakes=["Forgetting to increment both pointers", "Not handling empty string or single-character edge cases"],
            problem_slugs=["valid-palindrome"],
            interview_questions=["How does Floyd Cycle Detection algorithm work using fast and slow pointers?"]
        )
        d3 = DsaTopic(
            slug="dynamic-programming",
            title="Dynamic Programming Fundamentals",
            category="Advanced Algorithms",
            order_index=3,
            concept_explanation="Dynamic Programming solves complex problems by breaking them down into overlapping subproblems and optimal substructure.",
            patterns=["1D Kadane / Fibonacci Pattern", "0/1 Knapsack Pattern", "Longest Common Subsequence"],
            visualization_type="matrix",
            common_mistakes=["Failing to identify base cases", "Unnecessary state dimensions blowing up memory limit"],
            problem_slugs=["maximum-subarray"],
            interview_questions=["Compare top-down memoization versus bottom-up tabulation in terms of recursion stack overhead."]
        )
        db.add_all([d1, d2, d3])

        # 4. Career Paths
        cp1 = CareerPath(
            slug="full-stack-developer",
            title="Full Stack Developer",
            target_role="Full Stack Engineer",
            description="Design and build responsive frontends, scalable REST/GraphQL APIs, database architectures, and cloud deployments.",
            salary_range="₹8 LPA - ₹24 LPA ($85k - $140k)",
            market_demand="Very High",
            required_languages=["TypeScript", "JavaScript", "Python", "SQL"],
            technologies=["React", "Next.js", "FastAPI / Node.js", "PostgreSQL", "Docker", "Tailwind CSS", "Git"],
            dsa_requirements=["Arrays", "Strings", "Trees", "Graphs", "Dynamic Programming (Medium)"],
            projects_required=["Full Stack SaaS with Auth & Payments", "Real-time Collaboration App (WebSockets)", "REST API with Microservices"],
            certifications=["AWS Certified Developer Associate", "Meta Front-End/Back-End Professional"],
            interview_topics=["System Design (High & Low Level)", "REST API Principles", "Browser Rendering Cycle", "Database Indexing & Normalization"],
            resume_skills=["React/Next.js", "FastAPI/Node.js", "PostgreSQL", "Docker", "CI/CD Pipelines", "TypeScript"],
            github_expectations=["3+ clean repositories with comprehensive READMEs", "Proper commit history", "Live demo links deployed on Vercel/Render"],
            learning_sequence=["1. Programming Core", "2. Frontend Fundamentals", "3. Backend API Development", "4. Database Design & SQL", "5. Cloud Deployment & Docker", "6. Capstone Full Stack Project"]
        )
        cp2 = CareerPath(
            slug="ai-ml-engineer",
            title="AI/ML Engineer",
            target_role="Machine Learning Engineer",
            description="Develop intelligent systems, data processing pipelines, deep learning models, and production LLM applications.",
            salary_range="₹10 LPA - ₹30 LPA ($95k - $160k)",
            market_demand="Extremely High",
            required_languages=["Python", "SQL", "C++"],
            technologies=["PyTorch", "TensorFlow", "scikit-learn", "FastAPI", "Hugging Face", "LangChain/LlamaIndex", "Docker"],
            dsa_requirements=["Linear Algebra", "Calculus & Probability", "Graphs & Trees", "Optimization Algorithms"],
            projects_required=["End-to-End ML Pipeline with Model Serving", "RAG (Retrieval-Augmented Generation) System", "Computer Vision or NLP Classification API"],
            certifications=["TensorFlow Developer Certificate", "AWS Certified Machine Learning Specialty"],
            interview_topics=["Loss Functions & Gradient Descent", "Overfitting Prevention", "Transformers Architecture", "Model Quantization & Deployment"],
            resume_skills=["Python", "PyTorch", "Pandas/NumPy", "FastAPI", "Docker", "Vector Databases", "MLflow"],
            github_expectations=["Jupyter notebooks with clear EDA", "Modular Python packages with unit tests", "Hugging Face Spaces or Streamlit live demos"],
            learning_sequence=["1. Python & Math Foundations", "2. Data Analysis (NumPy, Pandas)", "3. Classical ML Algorithms", "4. Deep Learning & PyTorch", "5. LLMs & GenAI Systems", "6. ML Deployment & MLOps"]
        )
        db.add_all([cp1, cp2])

        # 5. Placement Tests
        pt1 = PlacementTest(
            title="CS Fundamentals Sprint: DBMS & OS",
            category="CS Fundamentals",
            time_limit_minutes=20,
            total_questions=3
        )
        db.add(pt1)
        db.flush()

        pq1 = PlacementQuestion(
            test_id=pt1.id,
            subject="DBMS",
            question_text="Which of the following database isolation levels prevents phantom reads according to ANSI SQL standard?",
            options=["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
            correct_option_index=3,
            explanation="Serializable is the highest isolation level and uses range locks or multiversion concurrency control to prevent phantom reads."
        )
        pq2 = PlacementQuestion(
            test_id=pt1.id,
            subject="OS",
            question_text="What condition is NOT required for a deadlock to occur (Coffman conditions)?",
            options=["Mutual Exclusion", "Hold and Wait", "Preemption", "Circular Wait"],
            correct_option_index=2,
            explanation="NO preemption is the condition. If preemption is allowed, deadlocks cannot persist."
        )
        pq3 = PlacementQuestion(
            test_id=pt1.id,
            subject="Computer Networks",
            question_text="In the TCP/IP stack, which layer is responsible for end-to-end reliability and flow control?",
            options=["Network Layer", "Transport Layer", "Data Link Layer", "Application Layer"],
            correct_option_index=1,
            explanation="The Transport Layer (e.g. TCP) handles flow control, sequence numbers, checksums, and retransmissions."
        )
        db.add_all([pq1, pq2, pq3])

        # 6. Achievements
        ach1 = Achievement(code="first-solve", title="First Step Forward", description="Solved your very first coding problem on CodePath.", badge_icon="Award", xp_reward=50, category="coding")
        ach2 = Achievement(code="streak-7", title="Unstoppable Momentum", description="Maintained a 7-day consecutive coding activity streak.", badge_icon="Flame", xp_reward=150, category="streak")
        ach3 = Achievement(code="dsa-initiate", title="Algorithm Apprentice", description="Mastered your first fundamental Data Structures & Algorithms topic.", badge_icon="BookOpen", xp_reward=100, category="learning")
        ach4 = Achievement(code="project-builder", title="Production Architect", description="Created and planned a full capstone project with architecture milestones.", badge_icon="FolderGit2", xp_reward=200, category="project")
        ach5 = Achievement(code="interview-ready", title="Interview Challenger", description="Completed an AI-driven technical mock interview with detailed feedback.", badge_icon="Target", xp_reward=250, category="interview")
        db.add_all([ach1, ach2, ach3, ach4, ach5])

        db.commit()
        logger.info("Database seeded successfully with courses, problems, DSA topics, career paths, and tests.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error during database seed: {e}")
