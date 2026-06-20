# Eval Co-pilot — Track B

A tool that tells a builder whether the AI inside their own app is actually good, or just happens to run.

---

## The Hypothesis (Move 2 — locked before first commit)

**Claim:** A builder handed a golden set and a rubric for their own AI feature will find a real failure they did not already know about, more often than not.

| Signal | Threshold |
|--------|-----------|
| Proves me right | ≥ 3 of 4 builders (Move 1 + Move 5 combined) surface an unknown failure |
| Means I built a mirror | ≤ 1 of 4 finds something they didn't already know |
| **Kill-number** | **0 of 2 Move-5 builders find an unknown failure → hypothesis is wrong, I built a rubber stamp** |

The difference between "found a real failure" and "confirmed what they already knew" is the only thing being measured. A tool that only validates existing beliefs is worse than nothing — it manufactures false confidence.

---

## What the tool does

A builder describes their AI feature and provides example inputs. The tool helps them:
1. Build a **golden set** — inputs paired with what a good output looks like, written down before the model runs
2. Write a **rubric** — the rule for grading any output the same way twice
3. **Run** their feature against the golden set
4. See the exact cases where it **fails**

Not a benchmark. Not a dashboard. A list of the places your own AI is wrong and you did not know it.

---

## Stack

- **Backend:** FastAPI + SQLite
- **Frontend:** Jinja2 HTML templates (served by FastAPI)
- **LLM grader:** owl-alpha via OpenRouter
- **Auth:** JWT-based user accounts with user-scoped data isolation

---

## The five moves

| Move | What | Output |
|------|------|--------|
| 1 | Be the eval yourself on 2 real apps | 5 golden cases per app, hand-graded |
| 2 | Write the bet before writing code | Timestamped hypothesis with kill-number |
| 3 | Draw the deterministic/probabilistic boundary | Hand-drawn system design diagram |
| 4 | Build the domain model and the app | Hand-drawn schema + working tool |
| 5 | Put it in front of 2 builders, report what happened | Failing case → change → re-run, per builder |

---

## Running locally

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open `http://localhost:8000`
