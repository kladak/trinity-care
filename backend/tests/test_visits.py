from datetime import datetime, timedelta


def test_schedule_visit(client, family_token):
    residents = client.get("/residents", headers={"Authorization": f"Bearer {family_token}"})
    assert residents.status_code == 200
    rid = residents.json()[0]["id"]
    when = (datetime.utcnow() + timedelta(days=3)).isoformat()
    r = client.post(
        "/visits",
        headers={"Authorization": f"Bearer {family_token}"},
        json={"resident_id": rid, "scheduled_at": when, "notes": "Demo visit"},
    )
    assert r.status_code == 201
    assert r.json()["status"] == "requested"


def test_staff_confirm_visit(client, family_token, staff_token):
    residents = client.get("/residents", headers={"Authorization": f"Bearer {family_token}"})
    rid = residents.json()[0]["id"]
    when = (datetime.utcnow() + timedelta(days=4)).isoformat()
    created = client.post(
        "/visits",
        headers={"Authorization": f"Bearer {family_token}"},
        json={"resident_id": rid, "scheduled_at": when, "notes": "Confirm me"},
    )
    vid = created.json()["id"]
    r = client.patch(
        f"/visits/{vid}",
        headers={"Authorization": f"Bearer {staff_token}"},
        json={"status": "confirmed"},
    )
    assert r.status_code == 200
    assert r.json()["status"] == "confirmed"


def test_resident_detail(client, family_token):
    residents = client.get("/residents", headers={"Authorization": f"Bearer {family_token}"})
    rid = residents.json()[0]["id"]
    r = client.get(f"/residents/{rid}", headers={"Authorization": f"Bearer {family_token}"})
    assert r.status_code == 200
    assert "updates" in r.json()
    assert "visits" in r.json()
