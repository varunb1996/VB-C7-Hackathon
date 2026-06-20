from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import psycopg2.extras

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


def cur(conn):
    return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)


def own_feature(feature_id: int, user: dict) -> dict:
    conn = get_conn()
    c = cur(conn)
    c.execute("SELECT * FROM features WHERE id = %s AND user_id = %s", (feature_id, user["id"]))
    row = c.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Feature not found")
    return dict(row)


@router.get("/features")
def list_features(user: dict = Depends(get_current_user)):
    conn = get_conn()
    c = cur(conn)
    c.execute("SELECT * FROM features WHERE user_id = %s ORDER BY created_at DESC", (user["id"],))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]


@router.post("/features")
def create_feature(body: FeatureIn, user: dict = Depends(get_current_user)):
    conn = get_conn()
    c = cur(conn)
    c.execute(
        "INSERT INTO features (user_id, name, description) VALUES (%s, %s, %s) RETURNING *",
        (user["id"], body.name.strip(), body.description.strip())
    )
    feature = dict(c.fetchone())
    conn.commit()
    conn.close()
    return feature


@router.post("/features/{feature_id}/cases")
def add_case(feature_id: int, body: CaseIn, user: dict = Depends(get_current_user)):
    own_feature(feature_id, user)
    conn = get_conn()
    c = cur(conn)
    c.execute(
        "INSERT INTO golden_cases (feature_id, input, expected_output) VALUES (%s, %s, %s) RETURNING *",
        (feature_id, body.input.strip(), body.expected_output.strip())
    )
    case = dict(c.fetchone())
    conn.commit()
    conn.close()
    return case


@router.post("/features/{feature_id}/rubric")
def save_rubric(feature_id: int, body: RubricIn, user: dict = Depends(get_current_user)):
    own_feature(feature_id, user)
    conn = get_conn()
    c = cur(conn)
    c.execute(
        """INSERT INTO rubrics (feature_id, dimensions_text) VALUES (%s, %s)
           ON CONFLICT (feature_id) DO UPDATE SET dimensions_text = EXCLUDED.dimensions_text""",
        (feature_id, body.dimensions_text.strip())
    )
    conn.commit()
    c.execute("SELECT * FROM rubrics WHERE feature_id = %s", (feature_id,))
    row = dict(c.fetchone())
    conn.close()
    return row


@router.post("/features/{feature_id}/run")
def run_eval(feature_id: int, body: RunIn, user: dict = Depends(get_current_user)):
    own_feature(feature_id, user)
    conn = get_conn()
    c = cur(conn)

    c.execute("SELECT * FROM golden_cases WHERE feature_id = %s ORDER BY id", (feature_id,))
    cases = c.fetchall()
    c.execute("SELECT * FROM rubrics WHERE feature_id = %s", (feature_id,))
    rubric = c.fetchone()

    if not cases:
        raise HTTPException(status_code=400, detail="No golden cases found")
    if not rubric:
        raise HTTPException(status_code=400, detail="No rubric found")

    c.execute("INSERT INTO runs (feature_id) VALUES (%s) RETURNING id", (feature_id,))
    run_id = c.fetchone()["id"]
    conn.commit()

    grades = []
    for case in cases:
        actual_output = body.actual_outputs.get(str(case["id"]), "").strip()
        result = grade(
            rubric=rubric["dimensions_text"],
            expected_output=case["expected_output"],
            actual_output=actual_output,
        )
        c.execute(
            """INSERT INTO grades (run_id, golden_case_id, actual_output, verdict, reasoning)
               VALUES (%s, %s, %s, %s, %s)""",
            (run_id, case["id"], actual_output, result["verdict"], result["reasoning"])
        )
        grades.append(result)

    conn.commit()
    conn.close()
    return {"run_id": run_id, "grades": grades}


@router.get("/runs/{run_id}")
def get_run(run_id: int, user: dict = Depends(get_current_user)):
    conn = get_conn()
    c = cur(conn)
    c.execute("SELECT * FROM runs WHERE id = %s", (run_id,))
    run = c.fetchone()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    c.execute(
        "SELECT * FROM features WHERE id = %s AND user_id = %s",
        (run["feature_id"], user["id"])
    )
    feature = c.fetchone()
    if not feature:
        raise HTTPException(status_code=403, detail="Forbidden")

    c.execute(
        """SELECT g.*, gc.input, gc.expected_output
           FROM grades g JOIN golden_cases gc ON g.golden_case_id = gc.id
           WHERE g.run_id = %s ORDER BY gc.id""",
        (run_id,)
    )
    grades_list = [dict(g) for g in c.fetchall()]
    conn.close()

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
    c = cur(conn)
    c.execute("SELECT * FROM golden_cases WHERE feature_id = %s ORDER BY id", (feature_id,))
    cases = c.fetchall()
    c.execute("SELECT * FROM rubrics WHERE feature_id = %s", (feature_id,))
    rubric = c.fetchone()
    c.execute("SELECT * FROM runs WHERE feature_id = %s ORDER BY created_at DESC", (feature_id,))
    runs = c.fetchall()
    conn.close()
    return {
        "feature": feature,
        "cases": [dict(c) for c in cases],
        "rubric": dict(rubric) if rubric else None,
        "runs": [dict(r) for r in runs],
    }
