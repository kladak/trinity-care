# Trinity Care: Product Spec

**Author:** Karim Ladak  
**Status:** runnable locally; no hosted instance.  
**Date:** 2026-09

Residents, families, messages and visits come from `backend/app/seed.py`. The app carries
staff updates and visit scheduling.

## Problem

Families of seniors in nursing homes and assisted-living facilities often lack timely, structured visibility into day-to-day well-being. Staff updates are fragmented (phone trees, paper notes). Families want a single channel for updates, check-ins and visit scheduling that sits alongside the facility's EHR.

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

- **User**: email, display name, role (`family` \| `facility_staff`), facility_id (staff only)
- **Facility**: name, location
- **Resident**: display name, facility_id, room, non-clinical care notes
- **FamilyResidentLink**: family user to resident, with a relationship label
- **Update**: staff-authored message or check-in for a resident (type: update \| check_in \| message)
- **Visit**: scheduled visit request (status: requested \| confirmed \| cancelled \| completed)
- **AuditLog**: who, action, resource and timestamp. No request bodies.

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

1. **Demo Login**: pick a Family or Staff persona
2. **Family Feed**: chronological updates for linked residents
3. **Staff: Post Update**: select resident, type and body
4. **Schedule Visit**: pick resident, date and time, notes
5. **Resident Detail**: profile summary with updates and visits

## Tech stack

- Backend: FastAPI, SQLAlchemy, SQLite (dev), JWT
- Mobile: Expo SDK, React Native Web, TypeScript
- CI: GitHub Actions (pytest + lint smoke)
- Optional: docker-compose for API

## Success criteria

Clone → run API → `npx expo start --web` → demo family/staff login → see synthetic updates → schedule a visit.
