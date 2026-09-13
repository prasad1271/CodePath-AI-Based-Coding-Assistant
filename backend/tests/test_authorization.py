import pytest
from app.core.security import get_current_user
from app.models.user import User


def test_own_profile_access_without_user_id(client, db_session):
    # Verify GET /api/v1/users/profile extracts identity strictly from token
    response = client.get("/api/v1/users/profile")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "career_readiness_score" in data["data"]


def test_student_forbidden_on_admin_endpoint(client, db_session):
    # When user is student (default), calling POST /api/v1/admin/users returns 403
    payload = {
        "email": "newstudent@codepath.dev",
        "full_name": "New Student",
        "role": "student"
    }
    response = client.post("/api/v1/admin/users", json=payload)
    assert response.status_code == 403
    data = response.json()
    assert data["detail"]["code"] == "FORBIDDEN"


def test_admin_allowed_on_admin_endpoint(client, db_session):
    # Override current user to have admin role
    admin_user = User(
        id="00000000-0000-0000-0000-000000000099",
        email="admin@codepath.dev",
        full_name="Platform Admin",
        role="admin"
    )

    from app.main import app
    app.dependency_overrides[get_current_user] = lambda: admin_user

    try:
        payload = {
            "email": "invited_mentor@codepath.dev",
            "full_name": "Invited Mentor",
            "role": "mentor"
        }
        response = client.post("/api/v1/admin/users", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["email"] == "invited_mentor@codepath.dev"
        assert data["data"]["role"] == "mentor"
    finally:
        app.dependency_overrides.pop(get_current_user, None)
