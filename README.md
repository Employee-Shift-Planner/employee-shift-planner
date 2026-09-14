# Employee Shift Planner

## Project Description

The Employee Shift Planner is a modern web application designed to help managers and team leaders efficiently schedule and manage employee shifts. This project aims to streamline the process of shift planning, ensuring that all shifts are covered and that employees are assigned shifts that fit their availability and preferences.

## Features

- Weekly schedule with past and upcoming week navigation
- Create, edit, reassign, copy, cancel, draft, and publish shifts
- Whole-week copying and reusable shift templates
- Employee profiles, positions, availability, and conflict checks
- Time-off requests and supervisor approval
- Staffing requirements and live coverage warnings
- Country/region public-holiday imports, manual closures, and schedule warnings
- Hourly rates, overtime thresholds, and labour-cost forecasting
- Shift swaps, attendance recording, and audit history
- Administrator, Supervisor, and Employee access levels
- Employee mobile schedule and notification preferences
- Weekly CSV and print/PDF reports

## Technology

- React 18, React Router 6, and TanStack React Query 5
- Create React App / `react-scripts`
- Plain CSS components
- JWT bearer authentication supplied by the Scheduler API
- Password recovery through public forgot/reset API endpoints

## Requirements and setup

Use Node.js 18 or later, npm, and a running Scheduler API with migrations applied.

```bash
npm install
npm start
```

The app opens at `http://localhost:3000` and defaults to `http://localhost:5113/api`. Override the API origin with:

```bash
REACT_APP_API_BASE_URL=https://localhost:7213/api npm start
```

Or create an ignored `.env.local` file:

```dotenv
REACT_APP_API_BASE_URL=https://localhost:7213/api
```

The value must include `/api`. Never put secrets in `REACT_APP_*` variables because they are embedded in the browser bundle.

## Roles

| Role | Access |
| --- | --- |
| Administrator | Full supervisor access plus account creation, roles, and activation |
| Supervisor | Scheduling, employees, availability, approvals, reporting, settings, attendance, swaps, and audit history |
| Employee | Personal published schedule, notifications, time-off, and swap requests |

Frontend guards match the API policies, but API authorization is the security boundary. Employee accounts are linked to employee profiles by matching email addresses.

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Login |
| `/forgot-password` | Request a password reset email |
| `/reset-password?email=…&token=…` | Choose a new password from an emailed link |
| `/schedule` | Supervisor weekly planner; accepts `?week=YYYY-MM-DD` |
| `/create-shift` | Create a draft shift |
| `/employees` | Employee directory and profiles |
| `/availability` | Recurring availability matrix |
| `/time-off` | Submit and review leave requests |
| `/operations` | Swaps, attendance, and audit history |
| `/reports` | Coverage, hours, and cost reports |
| `/notifications` | Notification preferences |
| `/settings` | Positions, staffing requirements, holidays, and user access |
| `/mobile` | Employee-facing published schedule |

## Source organization

```text
src/api/          API hooks, authenticated fetch wrapper, and session helpers
src/components/   Layout, UI primitives, and feature components
src/pages/        Route-level screens
src/lib/          Shared date and display formatting
src/utils/        Week-selection helpers
src/data/         Static navigation and fallback display data
```

## Commands

```bash
npm start
npm test -- --watchAll=false
npm run build
npm run deploy
```

The optimized bundle is written to `build/`. Tests currently cover routing and authentication guards; future workflows should add focused component and API-hook coverage.

## Deployment checklist

1. Apply pending Scheduler API migrations.
2. Confirm an Administrator account exists.
3. Match account emails to employee profile emails.
4. Configure the API CORS allowlist with the frontend's exact origin.
5. Build with the production `REACT_APP_API_BASE_URL`.
6. Run tests and deploy the generated bundle.

`staticwebapp.config.json` supplies static-host routing behavior.

## Password-recovery API contract

The client calls `POST /api/auth/forgot-password` with `{ "email": "…" }` and
`POST /api/auth/reset-password` with `{ "email": "…", "token": "…", "password": "…" }`.
Both endpoints are unauthenticated. The forgot endpoint must return the same
successful response for known and unknown addresses, create a single-use
time-limited token, and email a URL using the frontend's `/reset-password`
route. The reset endpoint must validate the token, enforce the server's password
policy, update the password, and invalidate the token. Configure the frontend
origin and mail credentials as server-side settings; never expose them through
`REACT_APP_*`.

## Repository hygiene

The `.gitignore` excludes dependencies, generated builds, coverage, environment files, editor state, and OS/iCloud metadata. Source directories—including `src/lib/`—must remain tracked.

No license file is currently included. Confirm licensing before redistribution.
