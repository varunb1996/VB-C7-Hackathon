"""
Two-user isolation test — proves one builder cannot read another's data.
Run with: python test_two_user_isolation.py
The FastAPI server must be running on localhost:8000.
"""
import httpx

BASE = "http://localhost:8000"


def register_and_login(email, password):
    httpx.post(f"{BASE}/register", data={"email": email, "password": password})
    r = httpx.post(f"{BASE}/login", data={"email": email, "password": password})
    return r.cookies


def test_isolation():
    print("\n=== Two-User Isolation Test ===\n")

    # User 1 — creates a feature
    cookies1 = register_and_login("user1_test@example.com", "password123")
    r = httpx.post(f"{BASE}/features",
                   json={"name": "User1 Secret Feature", "description": "private"},
                   cookies=cookies1)
    feature_id = r.json()["id"]
    print(f"[User 1] Created feature id={feature_id}: '{r.json()['name']}'")

    # User 1 can read own feature
    r = httpx.get(f"{BASE}/features/{feature_id}", cookies=cookies1)
    assert r.status_code == 200, "User 1 should be able to read own feature"
    print(f"[User 1] Can read own feature: ✓")

    # User 2 — tries to read User 1's feature
    cookies2 = register_and_login("user2_test@example.com", "password123")
    r = httpx.get(f"{BASE}/features/{feature_id}", cookies=cookies2)
    assert r.status_code == 404, f"User 2 should get 404, got {r.status_code}: {r.text}"
    print(f"[User 2] Cannot read User 1's feature — got 404: ✓")

    # User 2 sees empty feature list (not User 1's features)
    r = httpx.get(f"{BASE}/features", cookies=cookies2)
    assert r.json() == [], f"User 2 should see empty list, got {r.json()}"
    print(f"[User 2] Feature list is empty (User 1's features not visible): ✓")

    print("\n✅ PASS — cross-user read is blocked. One builder cannot see another's data.\n")


if __name__ == "__main__":
    test_isolation()
