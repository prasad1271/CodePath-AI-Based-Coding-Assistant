import pytest


def test_users_dashboard_endpoint(client, db_session):
    response = client.get("/api/v1/users/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "career_readiness_breakdown" in data["data"]
    assert "problems_solved" in data["data"]["stats"]


def test_career_paths_and_role_detail(client, db_session):
    response = client.get("/api/v1/career/paths")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) > 0

    role_slug = data["data"][0]["target_role"].lower().replace(" ", "-")
    detail_res = client.get(f"/api/v1/career/paths/{role_slug}")
    assert detail_res.status_code in [200, 404]


def test_projects_crud_flow(client, db_session):
    # List projects
    list_res = client.get("/api/v1/projects")
    assert list_res.status_code == 200
    assert list_res.json()["success"] is True

    # Create project with full schema
    create_payload = {
        "title": "Automated Test Project",
        "category": "Web",
        "difficulty": "Intermediate",
        "description": "Integration test capstone project",
        "tech_stack": ["Python", "FastAPI", "React"],
        "architecture_overview": "Clean layered architecture with automated CI/CD"
    }
    create_res = client.post("/api/v1/projects", json=create_payload)
    assert create_res.status_code == 200
    proj_data = create_res.json()["data"]
    project_id = proj_data["id"]

    # Retrieve single project
    get_res = client.get(f"/api/v1/projects/{project_id}")
    assert get_res.status_code == 200
    assert get_res.json()["data"]["title"] == "Automated Test Project"

    # Toggle task
    tasks = get_res.json()["data"].get("tasks", [])
    if tasks:
        task_id = tasks[0]["id"]
        toggle_res = client.post(f"/api/v1/projects/{project_id}/tasks/{task_id}/toggle")
        assert toggle_res.status_code == 200
        assert toggle_res.json()["success"] is True


def test_resume_endpoints(client, db_session):
    # Get user resume
    res = client.get("/api/v1/resume")
    assert res.status_code == 200
    assert res.json()["success"] is True

    # Improve bullet point
    bullet_payload = {"original_bullet": "Wrote code for login and database"}
    bullet_res = client.post("/api/v1/resume/improve-bullet", json=bullet_payload)
    assert bullet_res.status_code == 200
    assert len(bullet_res.json()["data"]["improved_bullets"]) > 0


def test_placement_flow(client, db_session):
    tests_res = client.get("/api/v1/placement/tests")
    assert tests_res.status_code == 200
    tests = tests_res.json()["data"]
    if len(tests) > 0:
        test_id = tests[0]["id"]
        detail_res = client.get(f"/api/v1/placement/tests/{test_id}")
        assert detail_res.status_code == 200

        # Submit test attempt
        answers_dict = {
            q["id"]: 1 for q in detail_res.json()["data"]["questions"]
        }
        submit_payload = {
            "test_id": test_id,
            "answers": answers_dict
        }
        sub_res = client.post("/api/v1/placement/submit", json=submit_payload)
        assert sub_res.status_code == 200
        assert "percentage" in sub_res.json()["data"]


def test_interview_session_flow(client, db_session):
    start_payload = {
        "mode": "Technical",
        "target_role": "Full Stack Developer"
    }
    start_res = client.post("/api/v1/interviews/start", json=start_payload)
    assert start_res.status_code == 200
    session_data = start_res.json()["data"]
    session_id = session_data["id"]
    question_id = session_data["current_question"]["id"]

    # Submit an answer
    answer_payload = {
        "answer_text": "I utilized dependency injection and layered architecture to isolate business logic, resulting in 99.9% test reliability."
    }
    ans_res = client.post(f"/api/v1/interviews/{session_id}/questions/{question_id}/answer", json=answer_payload)
    assert ans_res.status_code == 200
    assert "score" in ans_res.json()["data"]


def test_community_forum_flow(client, db_session):
    posts_res = client.get("/api/v1/community/posts")
    assert posts_res.status_code == 200
    assert posts_res.json()["success"] is True

    # Create post
    post_payload = {
        "title": "Best way to structure FastAPI routers in production?",
        "content": "Looking for recommended patterns for modular API structure with dependency injection.",
        "tags": ["FastAPI", "Python", "CleanCode"]
    }
    create_res = client.post("/api/v1/community/posts", json=post_payload)
    assert create_res.status_code == 200
    post_id = create_res.json()["data"]["id"]

    # Vote on post
    vote_payload = {
        "entity_type": "post",
        "entity_id": post_id,
        "vote_type": 1
    }
    vote_res = client.post("/api/v1/community/vote", json=vote_payload)
    assert vote_res.status_code == 200


def test_github_audit_flow(client, db_session):
    audit_payload = {
        "github_username": "octocat",
        "target_role": "Full Stack Developer"
    }
    res = client.post("/api/v1/github/audit", json=audit_payload)
    assert res.status_code == 200
    assert "audit_score" in res.json()["data"]
    assert "checklist" in res.json()["data"]
