# ⚡ Task Orchestrator

Task Orchestrator is a polyglot task-management and scheduling project. Teams can assign work, set priorities and dependencies, and request schedules from a separate Spring Boot algorithm service.

[Live frontend](https://task-manager-1-5jlg.onrender.com) · [Scheduling engine repository](https://github.com/Mudit-vijay/Algorithm.Scheduler)

## What it does

- **Workspaces:** Create Personal, Team, or Project groups. Registered users can belong to several groups, with a separate Member or Group Admin role in each.
- **Task assignment:** A group owner or admin can create and reassign tasks to members of that group. The personal view shows tasks assigned to the signed-in user; the group view shows the group's tasks.
- **Dependencies:** Tasks can depend on other tasks in the same group. Updates reject cycles, and an assignee cannot complete a task until its prerequisites are complete.
- **Scheduling:** The task service loads eligible tasks, priorities, durations, deadlines, and dependencies from MongoDB, then calls the Java scheduler. Owners and group admins can schedule a group; users can schedule their assigned personal tasks.
- **Saved results:** Schedule runs are persisted, and the latest group or personal run is rendered as a Gantt chart. Scheduling, assignment, creation, and completion events are recorded in an audit log.
- **Authentication:** Email/password, OTP verification, and Google OAuth. The auth service signs a JWT and sends it in an HttpOnly session cookie; the browser does not store the token in local storage.

The Java service supports topological dependency ordering, cycle detection, backtracking, and Branch-and-Bound scheduling. The task service currently requests `branchAndBound`. It treats a schedule that omits pending tasks as infeasible.

## Architecture

```text
React frontend ── HTTPS/cookies ──> API Gateway ──> Auth service ──> MongoDB
                                      │
                                      ├───────────> Task/group service ──> MongoDB
                                      │                     │
                                      │                     └────────────> Java scheduler
                                      └───────────> OAuth service
```

This repository contains the React frontend, API Gateway, auth service, and task/group service. The [Java scheduler](https://github.com/Mudit-vijay/Algorithm.Scheduler) is a separate repository. The OAuth service is deployed separately. The browser calls scheduling endpoints on the task service through the gateway; it does not call the Java scheduler directly.

| Component | Main technology | Directory |
|---|---|---|
| Frontend | React 19, Vite, Axios | `FRONTEND/` |
| API Gateway | Node.js, Express, HTTP proxy | `Gateway/` |
| Authentication | Node.js, Express, MongoDB, JWT cookies | `login_Services/` |
| Tasks and groups | Node.js, Express, Mongoose | `starter/` |
| Scheduling engine | Java 21, Spring Boot 4 | Separate repository |

## Run locally

Prerequisites: Node.js, MongoDB, Java 21 for the scheduler, and Maven or the scheduler's Maven wrapper. Run each service in its own terminal. Copy each service's `.env.example` to `.env` and replace placeholders. `.env` files are ignored by Git.

For a fully local run, set the same `JWT` secret in `login_Services/.env` and `starter/.env`, and use the same local MongoDB database in both. Set `NODE_ENV=development` on auth for HTTP cookies. Set `OTP_ENABLED=false` **only for disposable local testing** if you do not have a mail provider. Keep OTP enabled in production.

Set these local URL overrides:

| Service | Variable | Local value |
|---|---|---|
| Gateway | `LOGIN_SERVICE_URL` | `http://localhost:5000` |
| Gateway | `STARTER_SERVICE_URL` | `http://localhost:9000` |
| Gateway | `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` |
| Auth and task services | `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` |
| Task service | `SCHEDULER_SERVICE_URL` | `http://localhost:9001` |
| Frontend | `VITE_API_URL` | `http://localhost:8080/api/v1` |
| Frontend | `VITE_OAUTH_URL` | URL of your local OAuth service, if running one |

The frontend and gateway default to the Render production URLs when no overrides are provided. Restart Vite after changing `VITE_*` values; they are embedded at build time.

```bash
# Terminal 1: from this repository root
cd login_Services
npm ci
node index.js

# Terminal 2: from this repository root
cd starter
npm ci
node app.js

# Terminal 3: from this repository root
cd Gateway
npm ci
node index.js

# Terminal 4: from this repository root
cd FRONTEND
npm ci
npm run dev
```

The defaults are auth `5000`, task service `9000`, gateway `8080`, and Vite `5173`. Clone [Algorithm.Scheduler](https://github.com/Mudit-vijay/Algorithm.Scheduler) alongside this repository and run `./mvnw spring-boot:run` from its root (`.\mvnw.cmd spring-boot:run` on Windows); it listens on `9001` by default. Google sign-in also requires the separately configured OAuth service.

## Deployment

Current production defaults target these Render URLs. Set the corresponding environment variables to your own URLs if any service moves.

| Service | URL |
|---|---|
| Frontend | `https://task-manager-1-5jlg.onrender.com` |
| Gateway | `https://task-manager-xp1g.onrender.com` |
| Task service | `https://backend-a-tvul.onrender.com` |
| Auth service | `https://backend-b-wxdw.onrender.com` |
| Scheduler | `https://algorithm-scheduler.onrender.com` |
| OAuth service | `https://oauth-service-fyrc.onrender.com` |

Set the same strong `JWT` secret on auth and task services, production `MONGO_URI` values, the auth mail-provider settings, and the exact frontend origin in `CORS_ALLOWED_ORIGINS`. Keep `OTP_ENABLED=true`. Auth cookies default to `Secure` and `SameSite=None` outside development. The task service defaults to the Render scheduler URL; `SCHEDULER_SERVICE_URL` can override it. Use the service `.env.example` files as a deployment checklist. Never put secrets in `VITE_*` values: those values are visible in the browser bundle.
