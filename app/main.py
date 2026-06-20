import os
from fastapi import FastAPI, Request, Form, Depends
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.db import init_db
from app.auth import register_user, login_user, get_current_user
from app.routes.features import router as features_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()
app.include_router(features_router)


@app.post("/register")
def register(email: str = Form(...), password: str = Form(...)):
    user = register_user(email, password)
    return {"ok": True, "user": user}


@app.post("/login")
def login(email: str = Form(...), password: str = Form(...)):
    token = login_user(email, password)
    response = JSONResponse({"ok": True, "user": {"email": email}})
    response.set_cookie("token", token, httponly=True, samesite="lax")
    return response


@app.get("/logout")
def logout():
    response = JSONResponse({"ok": True})
    response.delete_cookie("token")
    return response


@app.get("/me")
def me(user: dict = Depends(get_current_user)):
    return user


# Serve React build — must be last
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str):
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
