def test_list_courses(client):
    response = client.get("/api/v1/learning/courses")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert len(res["data"]) >= 6
    slugs = [c["slug"] for c in res["data"]]
    assert "python-fundamentals" in slugs
    assert "java-programming" in slugs


def test_get_course_detail(client):
    response = client.get("/api/v1/learning/courses/python-fundamentals")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["data"]["course"]["title"] == "Python for Engineers"
    assert len(res["data"]["modules"]) >= 1


def test_list_problems(client):
    response = client.get("/api/v1/practice/problems")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert len(res["data"]) >= 3
    slugs = [p["slug"] for p in res["data"]]
    assert "two-sum" in slugs


def test_get_problem_detail(client):
    response = client.get("/api/v1/practice/problems/two-sum")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["data"]["title"] == "Two Sum"
    assert len(res["data"]["test_cases"]) >= 1


def test_run_sandbox_code(client):
    payload = {
        "language": "python",
        "code": "print('Hello CodePath Sandbox')"
    }
    response = client.post("/api/v1/practice/run", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert "Hello CodePath Sandbox" in res["data"]["output"]
    assert res["data"]["status"] == "Success"


def test_dsa_topics(client):
    response = client.get("/api/v1/dsa/topics")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert len(res["data"]) >= 3
