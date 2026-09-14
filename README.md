# Trinity Care — Senior-care connection demo

**Karim Ladak · portfolio / educational project**

A clean-room React Native (Expo) + FastAPI demo that helps **families** of seniors in assisted living see staff updates and **schedule visits**, while **facility staff** post check-ins.

> **Honesty first**
>
> - **Not a medical device.** Does not diagnose, treat, or manage clinical care.
> - **Not affiliated** with Trinity Health, Trinity Health portals, SpeciaList, Syncura, Precision Cardiology, or any prior collaborator code.
> - **Synthetic seed data only.** No real PHI. No fake user counts, clinical outcomes, or HIPAA certification claims.
> - **Demo auth** (JWT via one-click personas). Privacy-minded audit logs (metadata only).

See [SPEC.md](./SPEC.md) for product scope.

---

## Demo script (60–90s)

Cold start — exact clicks for a recruiter walkthrough or screen recording.

### 0. Prerequisites (once)

```bash
git clone https://github.com/kladak/trinity-care.git
cd trinity-care

# Terminal A — API
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# If port 8000 is taken: use --port 8010 and EXPO_PUBLIC_API_URL=http://localhost:8010

# Terminal B — Expo web
cd mobile
npm install
npx expo start --web
```

Open the Expo web URL (usually `http://localhost:8081`).

### 1. Family path (~45s)

1. On **Demo login**, read the yellow disclaimer banner.
2. Click **Continue as Family** (Jordan Lee).
3. On the **Family feed**, scroll synthetic updates for Margaret / Harold / Robert.
4. Tap any update card → **Resident detail** (notes, updates, visits).
5. Back → click **Schedule visit**.
6. Select a resident, keep/adjust date-time, click **Request visit**.
7. Confirm success banner, return to feed.

### 2. Staff path (~30s)

1. **Sign out** → **Continue as Staff** (Alex Rivera).
2. Click **Post update**.
3. Pick a resident, choose **Check-in**, type a short note, **Publish to family feed**.
4. Return to feed — your new synthetic note appears at the top.
5. Optional: **Residents** → open a profile → confirm visits / updates.

### Optional API check

- Health: http://localhost:8000/health  
- Interactive docs: http://localhost:8000/docs  

Demo password (if using `/auth/token`): `demo1234`  
Emails: `family@demo.trinitycare.local`, `staff@demo.trinitycare.local`

---

## Architecture

| Layer | Stack |
|-------|--------|
| API | FastAPI, SQLAlchemy, SQLite, JWT (demo), seed on startup |
| Client | Expo SDK 57, React Native Web, React Navigation |
| Roles | `family` · `facility_staff` |
| Ops | `/health`, `/ready`, optional `docker compose up` for API |

```
trinity-care/
  SPEC.md
  README.md
  docker-compose.yml
  backend/          # FastAPI
  mobile/           # Expo RN (web-capable)
  .github/workflows # CI
```

---

## Runbook

### Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pytest -q
```

### Mobile (web)

```bash
cd mobile
npm install
# Optional: EXPO_PUBLIC_API_URL=http://localhost:8000
npx expo start --web
```

### Docker (API only)

```bash
docker compose up --build
```

### CI

GitHub Actions runs backend `pytest` on push/PR to `main`.

---

## Seed personas (synthetic)

| Persona | Email | Role |
|---------|-------|------|
| Jordan Lee | family@demo.trinitycare.local | family |
| Sam Chen | family2@demo.trinitycare.local | family |
| Alex Rivera | staff@demo.trinitycare.local | facility_staff |
| Priya Shah | staff2@demo.trinitycare.local | facility_staff |

Facility: **Willow Grove Assisted Living (Demo)** — five synthetic residents with updates and visits.

---

## License / intent

Built for portfolio interviews and educational demonstration. Reuse the idea freely; do not present this as a production clinical product or as affiliated with any health system.
