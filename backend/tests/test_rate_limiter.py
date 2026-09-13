import pytest


def test_rate_limiting_trigger_429(client):
    headers = {"X-Test-Rate-Limit": "true"}

    # Rapid requests to an API endpoint
    responses = []
    for _ in range(4):
        res = client.get("/api/v1/auth/me", headers=headers)
        responses.append(res)

    status_codes = [r.status_code for r in responses]
    # At least the 4th request must be throttled with 429 Too Many Requests
    assert 429 in status_codes
    last_res = responses[-1]
    assert last_res.status_code == 429
    assert last_res.json()["error"]["code"] == "RATE_LIMIT_EXCEEDED"
    assert "Retry-After" in last_res.headers
