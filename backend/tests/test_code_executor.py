from app.services.code_executor import CodeExecutorService


def test_python_successful_execution():
    code = "nums = [1, 2, 3, 4]\nprint('Sum:', sum(nums))"
    res = CodeExecutorService.execute("python", code)
    assert res.status == "Success"
    assert "Sum: 10" in res.output
    assert res.execution_time_ms > 0


def test_security_violation_rejection():
    dangerous_code = "import os\nos.system('dir')"
    res = CodeExecutorService.execute("python", dangerous_code)
    assert res.status == "Security Violation"
    assert "prohibited" in res.error.lower()


def test_runtime_error_capture():
    code = "x = 1 / 0"
    res = CodeExecutorService.execute("python", code)
    assert res.status == "Runtime Error"
    assert "ZeroDivisionError" in res.error


def test_unsupported_language():
    res = CodeExecutorService.execute("rust", "fn main() {}")
    assert res.status == "Error"
    assert "Unsupported language" in res.error
