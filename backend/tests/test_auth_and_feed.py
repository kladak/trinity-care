def test_demo_login_family(client):
    r = client.post("/auth/demo-login", json={"persona": "family"})
    assert r.status_code == 200
    data = r.json()
    assert data["role"] == "family"
    assert "access_token" in data


def test_demo_login_staff(client):
    r = client.post("/auth/demo-login", json={"persona": "staff"})
    assert r.status_code == 200
    assert r.json()["role"] == "facility_staff"


def test_password_login(client):
    r = client.post(
        "/auth/token",
        json={"email": "family@demo.trinitycare.local", "password": "demo1234"},
    )
    assert r.status_code == 200
    assert r.json()["role"] == "family"


def test_family_feed(client, family_token):
    r = client.get("/feed", headers={"Authorization": f"Bearer {family_token}"})
    assert r.status_code == 200
    feed = r.json()
    assert len(feed) >= 1
    assert all("body" in u for u in feed)


def test_staff_post_update(client, staff_token):
    residents = client.get("/residents", headers={"Authorization": f"Bearer {staff_token}"})
    assert residents.status_code == 200
    rid = residents.json()[0]["id"]
    r = client.post(
        "/updates",
        headers={"Authorization": f"Bearer {staff_token}"},
        json={"resident_id": rid, "update_type": "check_in", "body": "Synthetic test check-in"},
    )
    assert r.status_code == 201
    assert r.json()["body"] == "Synthetic test check-in"


def test_family_cannot_post_update(client, family_token):
    r = client.post(
        "/updates",
        headers={"Authorization": f"Bearer {family_token}"},
        json={"resident_id": 1, "update_type": "update", "body": "nope"},
    )
    assert r.status_code == 403
