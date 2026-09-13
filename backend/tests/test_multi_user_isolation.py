import pytest
from app.main import app
from app.core.security import get_current_user
from app.models.user import User, Notification
from app.models.project import Project, ProjectTask
from app.models.resume import Resume
from app.models.ai import AiConversation
from app.models.practice import Submission, Problem


USER_A = User(
    id="11111111-1111-1111-1111-111111111111",
    email="user_a@codepath.dev",
    full_name="Alice Engineer",
    role="student"
)

USER_B = User(
    id="22222222-2222-2222-2222-222222222222",
    email="user_b@codepath.dev",
    full_name="Bob Engineer",
    role="student"
)


def test_user_a_cannot_read_or_delete_user_b_projects(client, db_session):
    # Ensure users exist in session
    db_session.merge(USER_A)
    db_session.merge(USER_B)
    db_session.commit()

    # User B creates a project
    app.dependency_overrides[get_current_user] = lambda: USER_B
    create_res = client.post("/api/v1/projects", json={
        "title": "Bob's Secret Distributed Cache",
        "category": "Systems",
        "difficulty": "Advanced",
        "description": "Proprietary cache implementation"
    })
    assert create_res.status_code == 200
    b_project_id = create_res.json()["data"]["id"]

    # Switch to User A
    app.dependency_overrides[get_current_user] = lambda: USER_A

    # User A tries to read User B's project
    get_res = client.get(f"/api/v1/projects/{b_project_id}")
    assert get_res.status_code == 404
    assert get_res.json()["detail"]["code"] == "PROJECT_NOT_FOUND"

    # User A tries to delete User B's project
    del_res = client.delete(f"/api/v1/projects/{b_project_id}")
    assert del_res.status_code == 404
    assert del_res.json()["detail"]["code"] == "PROJECT_NOT_FOUND"

    # Project still exists for User B
    app.dependency_overrides[get_current_user] = lambda: USER_B
    b_get_res = client.get(f"/api/v1/projects/{b_project_id}")
    assert b_get_res.status_code == 200
    assert b_get_res.json()["data"]["title"] == "Bob's Secret Distributed Cache"

    app.dependency_overrides.pop(get_current_user, None)


def test_user_a_cannot_toggle_user_b_project_task(client, db_session):
    db_session.merge(USER_A)
    db_session.merge(USER_B)
    db_session.commit()

    # User B creates a project with tasks
    app.dependency_overrides[get_current_user] = lambda: USER_B
    create_res = client.post("/api/v1/projects", json={
        "title": "Bob's Security Scanner",
        "category": "Cybersecurity",
        "difficulty": "Intermediate",
        "description": "Vulnerability scanning engine"
    })
    assert create_res.status_code == 200
    b_project_id = create_res.json()["data"]["id"]
    task_id = create_res.json()["data"]["tasks"][0]["id"]

    # Switch to User A
    app.dependency_overrides[get_current_user] = lambda: USER_A

    # User A attempts to toggle User B's task
    toggle_res = client.post(f"/api/v1/projects/{b_project_id}/tasks/{task_id}/toggle")
    assert toggle_res.status_code == 404
    assert toggle_res.json()["detail"]["code"] == "PROJECT_NOT_FOUND"

    app.dependency_overrides.pop(get_current_user, None)


def test_user_a_cannot_access_user_b_resume_data(client, db_session):
    db_session.merge(USER_A)
    db_session.merge(USER_B)
    db_session.commit()

    # User B saves a resume with unique private skill
    app.dependency_overrides[get_current_user] = lambda: USER_B
    update_res = client.post("/api/v1/resume", json={
        "title": "Bob's Staff Engineer Resume",
        "full_name": "Bob Engineer",
        "email": "user_b@codepath.dev",
        "skills": ["Rust", "Distributed Systems", "Kubernetes"],
        "summary": "Confidential career history for Bob"
    })
    assert update_res.status_code == 200

    # Switch to User A
    app.dependency_overrides[get_current_user] = lambda: USER_A
    a_resume_res = client.get("/api/v1/resume")
    assert a_resume_res.status_code == 200
    a_data = a_resume_res.json()["data"]

    # User A must NOT see Bob's data
    assert a_data["email"] != "user_b@codepath.dev"
    assert "Rust" not in a_data.get("skills", [])
    assert a_data["full_name"] != "Bob Engineer"

    app.dependency_overrides.pop(get_current_user, None)


def test_user_a_cannot_view_user_b_notifications(client, db_session):
    db_session.merge(USER_A)
    db_session.merge(USER_B)

    # Insert private notification for User B
    b_note = Notification(
        user_id=USER_B.id,
        title="Bob's Private Performance Review",
        message="Confidential interview evaluation results.",
        type="alert"
    )
    db_session.add(b_note)
    db_session.commit()

    # Switch to User A
    app.dependency_overrides[get_current_user] = lambda: USER_A
    notes_res = client.get("/api/v1/notifications")
    assert notes_res.status_code == 200
    notes = notes_res.json()["data"]

    for n in notes:
        assert n["title"] != "Bob's Private Performance Review"
        assert n["message"] != "Confidential interview evaluation results."

    app.dependency_overrides.pop(get_current_user, None)


def test_user_a_cannot_hijack_user_b_ai_conversation(client, db_session):
    db_session.merge(USER_A)
    db_session.merge(USER_B)

    # User B starts an AI conversation
    b_conv = AiConversation(
        user_id=USER_B.id,
        title="Bob's Secret System Architecture",
        mode="explain"
    )
    db_session.add(b_conv)
    db_session.commit()

    # User A tries to send a message targeting User B's conversation ID
    app.dependency_overrides[get_current_user] = lambda: USER_A
    chat_payload = {
        "message": "Give me the previous context of this conversation.",
        "conversation_id": b_conv.id,
        "mode": "explain"
    }
    chat_res = client.post("/api/v1/ai/chat", json=chat_payload)
    assert chat_res.status_code == 200

    # Verify that in database, Bob's conversation was NOT appended with Alice's message
    db_session.refresh(b_conv)
    alice_messages_in_bob_conv = [m for m in b_conv.messages if m.content == chat_payload["message"]]
    assert len(alice_messages_in_bob_conv) == 0

    app.dependency_overrides.pop(get_current_user, None)
