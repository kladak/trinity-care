# Trinity Care — Product Spec (Clean-Room Educational Demo)

**Author:** Karim Ladak  
**Status:** Portfolio / educational demo only  
**Date:** 2026-09

## Disclaimers (read first)

- **Not a medical device.** This application does not diagnose, treat, or manage clinical care.
- **Not affiliated** with Trinity Health, Trinity Health portals, SpeciaList, Syncura, Precision Cardiology, or any prior collaborator codebases.
- **Synthetic data only.** All residents, families, messages, and visits are fictional seed data. No real PHI.
- **No compliance claims.** This demo does not claim HIPAA certification, SOC 2, or clinical outcomes.
- **Clean-room build.** Implemented from this public product brief alone; no proprietary source was consulted or copied.

## Problem

Families of seniors in nursing homes and assisted-living facilities often lack timely, structured visibility into day-to-day well-being. Staff updates are fragmented (phone trees, paper notes). Families want a simple channel for updates, check-ins, and visit scheduling without replacing clinical EHR workflows.

## Goals

1. Let **family** members see a feed of updates for linked residents and request/schedule visits.
2. Let **facility staff** post updates/check-ins for residents and manage visit requests.
3. Keep auth simple for demos (JWT + demo tokens) with privacy-minded audit logging.
4. Ship a runnable Expo (web-capable) client and FastAPI backend with seed data.

## Non-goals

- Clinical charting, medication administration, billing, or EHR integration.
- Real identity verification, payment, or push notifications at scale.
- Claiming production readiness or regulatory clearance.

## Roles

| Role | Capabilities |
|------|----------------|
| `family` | View linked residents, feed of updates, schedule visit requests, view resident detail |
| `facility_staff` | Post updates/check-ins, view residents at facility, respond to visit scheduling |

## Core entities

- **User** — email, display name, role (`family` \| `facility_staff`), facility_id (staff only)
- **Facility** — name, location (synthetic)
- **Resident** — display name, facility_id, room, care notes (synthetic, non-clinical fluff)
- **FamilyResidentLink** — family user ↔ resident, relationship label
- **Update** — staff-authored message/check-in for a resident (type: update \| check_in \| message)
- **Visit** — scheduled visit request (status: requested \| confirmed \| cancelled \| completed)
- **AuditLog** — privacy-minded event log (who, action, resource, timestamp; no PHI payloads)

## API surface (v1)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/health` | Liveness |
| GET | `/ready` | Readiness (DB) |
| POST | `/auth/demo-login` | Demo login by role/email → JWT |
| POST | `/auth/token` | Email + password (seeded demo users) |
| GET | `/me` | Current user |
| GET | `/residents` | Role-scoped list |
| GET | `/residents/{id}` | Detail + recent updates |
| GET | `/feed` | Family feed of updates for linked residents |
| POST | `/updates` | Staff post update/check-in |
| GET | `/visits` | Role-scoped visits |
| POST | `/visits` | Schedule / request visit |
| PATCH | `/visits/{id}` | Confirm / cancel (staff or requester) |
| GET | `/audit` | Staff-only recent audit events (metadata only) |

## Auth

- JWT (HS256) with short TTL for demos.
- Demo tokens via `/auth/demo-login` selecting a seeded persona.
- Passwords for seeded users are public demo passwords documented in README only.

## Client (Expo React Native, web-capable)

Screens:

1. **Demo Login** — pick Family or Staff persona
2. **Family Feed** — chronological updates for linked residents
3. **Staff: Post Update** — select resident, type, body
4. **Schedule Visit** — pick resident, date/time, notes
5. **Resident Detail** — profile summary + updates + visits

## Tech stack

- Backend: FastAPI, SQLAlchemy, SQLite (dev), JWT
- Mobile: Expo SDK, React Native Web, TypeScript
- CI: GitHub Actions (pytest + lint smoke)
- Optional: docker-compose for API

## Success criteria

Clone → run API → `npx expo start --web` → demo family/staff login → see synthetic updates → schedule a visit.
