import os
import json
import httpx
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL = "openrouter/auto"  # falls back gracefully; swap to exact model id if needed

SYSTEM_PROMPT = """You are a strict evaluator. Your job is to grade an AI output against a rubric and a golden (expected) answer.
Be strict. Do not give benefit of the doubt. Return ONLY valid JSON."""

USER_TEMPLATE = """Rubric:
{rubric}

Golden (expected) output:
{expected_output}

Actual output to grade:
{actual_output}

Grade the actual output against the rubric and the golden answer.
Return JSON in exactly this format:
{{"verdict": "pass" or "fail", "reasoning": "one sentence explaining the verdict"}}"""


def grade(rubric: str, expected_output: str, actual_output: str) -> dict:
    prompt = USER_TEMPLATE.format(
        rubric=rubric,
        expected_output=expected_output,
        actual_output=actual_output,
    )

    response = httpx.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": "openrouter/owl-alpha",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0,
        },
        timeout=30,
    )
    response.raise_for_status()

    content = response.json()["choices"][0]["message"]["content"]
    parsed = json.loads(content)

    verdict = parsed.get("verdict", "fail").lower()
    if verdict not in ("pass", "fail"):
        verdict = "fail"

    return {
        "verdict": verdict,
        "reasoning": parsed.get("reasoning", ""),
    }
