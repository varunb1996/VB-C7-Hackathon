from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.db import get_conn
from app.auth import get_current_user
from app.grader import grade

router = APIRouter()


class FeatureIn(BaseModel):
    name: str
    description: str = ""

class CaseIn(BaseModel):
    input: str
    expected_output: str

class RubricIn(BaseModel):
    dimensions_text: str

class RunIn(BaseModel):
    actual_outputs: dict  # {case_id: actual_output_text}


def own_feature(feature_id: int, user: dict) -> dict:
    conn = get_conn()
    row = conn.execute("SELECT * FROM features WHERE id = ? AND user_id = ?", (feature_id, user["id"])).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Feature not found")
    return dict(row)


@router.get("/features")
def list_features(user: dict = Depends(get_current_user)):
    conn = get_conn()
    rows = conn.execute("SELECT * FROM features WHERE user_id = ? ORDER BY created_at DESC", (user["id"],)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@router.post("/features")
def create_feature(body: FeatureIn, user: dict = Depends(get_current_user)):
    conn = get_conn()
    cur = conn.execute(
        "INSERT INTO features (user_id, name, description) VALUES (?, ?, ?) RETURNING *",
        (user["id"], body.name.strip(), body.description.strip())
    )
    feature = dict(cur.fetchone())
    conn.commit()
    conn.close()
    return feature


@router.post("/features/{feature_id}/cases")
def add_case(feature_id: int, body: CaseIn, user: dict = Depends(get_current_user)):
    own_feature(feature_id, user)
    conn = get_conn()
    cur = conn.execute(
        "INSERT INTO golden_cases (feature_id, input, expected_output) VALUES (?, ?, ?) RETURNING *",
        (feature_id, body.input.strip(), body.expected_output.strip())
    )
    case = dict(cur.fetchone())
    conn.commit()
    conn.close()
    return case


@router.post("/features/{feature_id}/rubric")
def save_rubric(feature_id: int, body: RubricIn, user: dict = Depends(get_current_user)):
    own_feature(feature_id, user)
    conn = get_conn()
    conn.execute(
        """INSERT INTO rubrics (feature_id, dimensions_text) VALUES (?, ?)
           ON CONFLICT(feature_id) DO UPDATE SET dimensions_text=excluded.dimensions_text""",
        (feature_id, body.dimensions_text.strip())
    )
    conn.commit()
    row = conn.execute("SELECT * FROM rubrics WHERE feature_id = ?", (feature_id,)).fetchone()
    conn.close()
    return dict(row)


@router.post("/features/{feature_id}/run")
def run_eval(feature_id: int, body: RunIn, user: dict = Depends(get_current_user)):
    own_feature(feature_id, user)
    conn = get_conn()

    cases = conn.execute(
        "SELECT * FROM golden_cases WHERE feature_id = ? ORDER BY id", (feature_id,)
    ).fetchall()
    rubric = conn.execute(
        "SELECT * FROM rubrics WHERE feature_id = ?", (feature_id,)
    ).fetchone()

    if not cases:
        raise HTTPException(status_code=400, detail="No golden cases found")
    if not rubric:
        raise HTTPException(status_code=400, detail="No rubric found")

    run_id = conn.execute(
        "INSERT INTO runs (feature_id) VALUES (?) RETURNING id", (feature_id,)
    ).fetchone()["id"]
    conn.commit()

    grades = []
    for case in cases:
        actual_output = body.actual_outputs.get(str(case["id"]), "").strip()
        result = grade(
            rubric=rubric["dimensions_text"],
            expected_output=case["expected_output"],
            actual_output=actual_output,
        )
        conn.execute(
            """INSERT INTO grades (run_id, golden_case_id, actual_output, verdict, reasoning)
               VALUES (?, ?, ?, ?, ?)""",
            (run_id, case["id"], actual_output, result["verdict"], result["reasoning"])
        )
        grades.append(result)

    conn.commit()
    conn.close()
    return {"run_id": run_id, "grades": grades}


@router.get("/runs/{run_id}")
def get_run(run_id: int, user: dict = Depends(get_current_user)):
    conn = get_conn()
    run = conn.execute("SELECT * FROM runs WHERE id = ?", (run_id,)).fetchone()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    # Verify ownership via feature
    feature = conn.execute(
        "SELECT * FROM features WHERE id = ? AND user_id = ?",
        (run["feature_id"], user["id"])
    ).fetchone()
    if not feature:
        raise HTTPException(status_code=403, detail="Forbidden")

    grades = conn.execute(
        """SELECT g.*, c.input, c.expected_output
           FROM grades g JOIN golden_cases c ON g.golden_case_id = c.id
           WHERE g.run_id = ? ORDER BY c.id""",
        (run_id,)
    ).fetchall()
    conn.close()

    grades_list = [dict(g) for g in grades]
    passed = sum(1 for g in grades_list if g["verdict"] == "pass")
    return {
        "run": dict(run),
        "feature": dict(feature),
        "grades": grades_list,
        "summary": {"passed": passed, "total": len(grades_list), "failed": len(grades_list) - passed},
    }


@router.get("/features/{feature_id}")
def get_feature(feature_id: int, user: dict = Depends(get_current_user)):
    feature = own_feature(feature_id, user)
    conn = get_conn()
    cases = conn.execute("SELECT * FROM golden_cases WHERE feature_id = ? ORDER BY id", (feature_id,)).fetchall()
    rubric = conn.execute("SELECT * FROM rubrics WHERE feature_id = ?", (feature_id,)).fetchone()
    runs = conn.execute("SELECT * FROM runs WHERE feature_id = ? ORDER BY created_at DESC", (feature_id,)).fetchall()
    conn.close()
    return {
        "feature": feature,
        "cases": [dict(c) for c in cases],
        "rubric": dict(rubric) if rubric else None,
        "runs": [dict(r) for r in runs],
    }
