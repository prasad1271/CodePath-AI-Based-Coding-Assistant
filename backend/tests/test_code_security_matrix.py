import pytest
from app.services.code_executor import CodeExecutorService


def test_prohibited_module_imports():
    prohibited_modules = [
        "import os",
        "from os import path",
        "import sys",
        "from sys import modules",
        "import subprocess",
        "import socket",
        "import shutil",
        "import ctypes",
        "import builtins",
        "import importlib"
    ]

    for stmt in prohibited_modules:
        code = f"{stmt}\nprint('attempting module import')"
        result = CodeExecutorService.execute("python", code)
        assert result.status == "Security Violation", f"Expected Security Violation for: {stmt}"
        assert "prohibited" in result.error.lower()


def test_prohibited_function_calls():
    prohibited_calls = [
        "eval('2 + 2')",
        "exec('x = 10')",
        "open('/etc/passwd', 'r')",
        "__import__('math')",
        "compile('x = 1', 'test', 'exec')",
        "g = globals()",
        "l = locals()"
    ]

    for call in prohibited_calls:
        code = f"x = {call}\nprint(x)"
        result = CodeExecutorService.execute("python", code)
        assert result.status == "Security Violation", f"Expected Security Violation for: {call}"
        assert "prohibited" in result.error.lower()


def test_dunder_reflection_blocking():
    reflection_attempts = [
        "subclasses = ().__class__.__base__.__subclasses__()\nprint(subclasses)",
        "g = (lambda: None).__globals__\nprint(g)",
        "b = ().__class__.__mro__\nprint(b)"
    ]

    for payload in reflection_attempts:
        result = CodeExecutorService.execute("python", payload)
        assert result.status == "Security Violation", f"Expected Security Violation for reflection payload: {payload}"
        assert "prohibited" in result.error.lower()


def test_huge_output_truncation():
    code = "print('X' * 15000)"
    result = CodeExecutorService.execute("python", code)
    assert result.status == "Success"
    assert len(result.output) <= CodeExecutorService.MAX_OUTPUT_LENGTH + 100
    assert "[Output truncated - exceeded maximum output limit]" in result.output


def test_timeout_on_infinite_loop():
    # Set short timeout to verify timeout logic swiftly
    original_timeout = CodeExecutorService.TIMEOUT_SECONDS
    CodeExecutorService.TIMEOUT_SECONDS = 2
    try:
        code = "while True:\n    pass"
        result = CodeExecutorService.execute("python", code)
        assert result.status == "Time Limit Exceeded"
        assert "exceeded time limit" in result.error.lower()
    finally:
        CodeExecutorService.TIMEOUT_SECONDS = original_timeout
