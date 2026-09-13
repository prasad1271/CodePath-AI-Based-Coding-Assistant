def test_ai_mentor_chat(client):
    payload = {
        "message": "Explain what a recursion base case is in Python",
        "mode": "explain",
        "language": "python"
    }
    response = client.post("/api/v1/ai/chat", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert "response" in res["data"]
    assert res["data"]["mode"] == "explain"


def test_ai_hint_mode(client):
    payload = {
        "problem_title": "Two Sum",
        "student_code": "def twoSum(nums, target):\n    for i in nums: pass",
        "hints_already_given": 0
    }
    response = client.post("/api/v1/ai/hint", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["data"]["hint_level"] == 1
    assert "hint" in res["data"]
    assert "guiding_question" in res["data"]


def test_error_doctor_diagnosis(client):
    payload = {
        "language": "python",
        "code": "arr = [1, 2, 3]\nprint(arr[10])",
        "error_message": "IndexError: list index out of range"
    }
    response = client.post("/api/v1/ai/error-doctor", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert "IndexError" in data["error_type"]
    assert "what_happened" in data
    assert "how_to_fix" in data
    assert "prevention_tip" in data


def test_error_doctor_c_preprocessor_diagnosis(client):
    payload = {
        "language": "c",
        "code": "include<stdio.h>\nvoid main(){\nprintf(\"hello\");\nreturn 0;\n}",
        "error_message": "IndexError: list index out of range"
    }
    response = client.post("/api/v1/ai/error-doctor", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert "C Compilation Error" in data["error_type"]
    assert "#include <stdio.h>" in data["corrected_example"]
