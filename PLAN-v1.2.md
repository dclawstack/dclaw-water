# DClaw Water — v1.2 Feature Roadmap

> 📘 **REVISED PRD v2.3 available:** See `REVISED-PRD.md` for complete gap analysis, current state, and full feature roadmap.

> **For coding agents:** Pick features from this list, implement them fully, and update this doc with a checkmark.
> **Do NOT change the basic stack.** See `AGENTS.md` for architecture lock.

## Pre-Flight Checklist — Do This First

Before implementing any v1.2 feature, verify:

- [x] `frontend/package-lock.json` is committed after any `npm install` / dependency change
- [x] `frontend/next-env.d.ts` exists and is committed (required for Next.js TypeScript builds)
- [x] `frontend/.gitignore` excludes `node_modules/` and `.next/`
- [x] `docker-compose.yml` healthchecks use `python urllib.request.urlopen()` (backend) and `wget -q --spider` (frontend)
- [x] `frontend/Dockerfile` declares `ARG NEXT_PUBLIC_API_URL` before `RUN npm run build`

## v1.0 Feature Inventory (Current)

- [x] WaterMeter CRUD — register and manage physical meters
- [x] MeterReading CRUD — log consumption, flow rate, pressure
- [x] LeakAlert CRUD — create, triage, and resolve leak alerts
- [x] QualityReading CRUD — log pH, turbidity, chlorine, compliance auto-check
- [x] Dashboard — KPI cards, top consumers, recent alerts
- [x] AI Copilot — domain-aware chat assistant (P0.1)
- [x] Real backend CRUD (no mocks) — all data persisted to PostgreSQL
- [x] Docker + Helm deployment
- [x] Alembic migrations (init_water_schema)
- [x] Backend tests (meters, leaks, quality, dashboard)
- [x] DPanel manifest at `frontend/public/dclaw-manifest.json`

---

## v1.2 Roadmap

### P0 — Must Have (YC-ready demo)

#### 1. AI Water Copilot ✅
**Description:** Domain-aware chat assistant monitoring leaks, quality, and usage.
- **Backend:** `app/services/copilot_service.py`, `app/api/v1/copilot.py`, `CopilotMessage` model
- **Frontend:** `components/copilot-chat.tsx` (floating FAB on all pages)
- **Files:** `backend/app/services/copilot_service.py`, `frontend/src/components/copilot-chat.tsx`

#### 2. Usage Monitoring ✅
**Description:** Track consumption by building, process, and zone with trend analysis.
- **Backend:** `MeterReading` model + `ReadingRepository` + `/api/v1/readings/`
- **Frontend:** `/readings` page with filterable table
- **Files:** `backend/app/models/meter_reading.py`, `frontend/src/app/readings/page.tsx`

#### 3. Leak Detection ✅
**Description:** Create, triage (open → investigating → resolved), and track leak alerts.
- **Backend:** `LeakAlert` model + `LeakRepository` + `/api/v1/leaks/`
- **Frontend:** `/leaks` page with severity badges and status workflow
- **Files:** `backend/app/models/leak_alert.py`, `frontend/src/app/leaks/page.tsx`

#### 4. Quality Monitoring ✅
**Description:** Track pH, turbidity, chlorine; auto-flag non-compliant readings.
- **Backend:** `QualityReading` model + `QualityRepository` + `/api/v1/quality/` (auto-compliance check)
- **Frontend:** `/quality` page with parameter cards and pass/fail badges
- **Files:** `backend/app/models/quality_reading.py`, `frontend/src/app/quality/page.tsx`

### P1 — Should Have (v1.1–1.2)

#### 5. Irrigation Optimization
**Description:** Optimize landscape irrigation based on weather and soil sensors.
- **Backend:** `IrrigationZone` model, weather API integration, scheduling service
- **Frontend:** `/irrigation` page with schedule calendar
- **Status:** Not started

#### 6. Wastewater Tracking
**Description:** Monitor BOD/COD/TSS and optimize aeration.
- **Backend:** `WastewaterReading` model, treatment metrics
- **Frontend:** `/wastewater` page
- **Status:** Not started

#### 7. Regulatory Reporting
**Description:** Auto-generate compliance reports for regulators.
- **Backend:** Report generation service, PDF export
- **Frontend:** `/reports` page
- **Status:** Not started

### P2 — Could Have (v1.3+)

#### 8. Digital Twins
**Description:** EPANET hydraulic model integration for simulation.
- **Status:** Not started

#### 9. Customer Portal
**Description:** Usage dashboard, bill pay, leak alert for end customers.
- **Status:** Not started

#### 10. Asset Management
**Description:** Track pipes, pumps, valves; AI health scoring.
- **Status:** Not started

---

## Implementation Priority

1. ✅ P0.1 AI Water Copilot
2. ✅ P0.2 Usage Monitoring
3. ✅ P0.3 Leak Detection
4. ✅ P0.4 Quality Monitoring
5. P1.1 Irrigation Optimization
6. P1.2 Wastewater Tracking
7. P1.3 Regulatory Reporting
8. P2.1 Digital Twins
9. P2.2 Customer Portal
10. P2.3 Asset Management
