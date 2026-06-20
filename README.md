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

- **Backend:** FastAPI + PostgreSQL (Supabase)
- **Frontend:** React + Vite + Tailwind CSS
- **LLM grader:** owl-alpha via OpenRouter
- **Auth:** JWT stored in httponly cookies, bcrypt password hashing, user-scoped data isolation
- **Deployment:** Docker on Render.com

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

## How to use the app

1. **Register** — create an account with your email and password
2. **Create a feature** — name and describe the AI feature you want to evaluate
3. **Add 5 golden cases** — for each case, provide an input and the expected perfect output
4. **Write a rubric** — describe what "good" looks like (e.g. "mentions score", "no hallucinated facts")
5. **Run an eval** — paste your AI's actual outputs for each case and submit
6. **See results** — the LLM judge scores each case pass/fail with a one-line reason
7. **Improve and re-run** — tweak your AI prompt, run again, compare

---

## Running locally

```bash
# Backend
pip install -r requirements.txt
export DATABASE_URL=your_supabase_connection_string
export OPENROUTER_API_KEY=your_openrouter_key
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Deployment

Deployed on Render.com using Docker. The `render.yaml` in the repo defines the service configuration. Required environment variables on Render:

- `DATABASE_URL` — Supabase PostgreSQL connection pooler URI
- `OPENROUTER_API_KEY` — OpenRouter API key
