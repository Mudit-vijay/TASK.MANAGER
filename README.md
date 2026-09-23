# ⚡ Task Orchestrator

Task Orchestrator is a polyglot task-management and scheduling project. Teams can assign work, set priorities and dependencies, and request schedules from a separate Spring Boot algorithm service.

[Live frontend](https://task-manager-1-5jlg.onrender.com) · [Scheduling engine repository](https://github.com/Mudit-vijay/Algorithm-Scheduler)

## What it does

- **Workspaces:** Create Personal, Team, or Project groups. Registered users can belong to several groups, with a separate Member or Group Admin role in each.
- **Task assignment:** A group owner or admin can create and reassign tasks to members of that group. The personal view shows tasks assigned to the signed-in user; the group view shows the group's tasks.
- **Dependencies:** Tasks can depend on other tasks in the same group. Updates reject cycles, and an assignee cannot complete a task until its prerequisites are complete.
- **Scheduling:** The task service loads eligible tasks, priorities, durations, deadlines, and dependencies from MongoDB, then calls the Java scheduler. Owners and group admins can schedule a group; users can schedule their assigned personal tasks.
- **Saved results:** Schedule runs are persisted, and the latest group or personal run is rendered as a Gantt chart. Scheduling, assignment, creation, and completion events are recorded in an audit log.
- **Authentication:** Email/password and Google OAuth. New password accounts currently skip email verification; use verified email ownership before treating an address as trusted for invitations. The auth service signs a JWT and sends it in an HttpOnly session cookie; the browser does not store the token in local storage.

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

This repository contains the React frontend, API Gateway, auth service, and task/group service. The [Java scheduler](https://github.com/Mudit-vijay/Algorithm-Scheduler) is a separate repository. The OAuth service is deployed separately. The browser calls scheduling endpoints on the task service through the gateway; it does not call the Java scheduler directly.

| Component | Main technology | Directory |
|---|---|---|
| Frontend | React 19, Vite, Axios | `FRONTEND/` |
| API Gateway | Node.js, Express, HTTP proxy | `Gateway/` |
| Authentication | Node.js, Express, MongoDB, JWT cookies | `login_Services/` |
| Tasks and groups | Node.js, Express, Mongoose | `starter/` |
| Scheduling engine | Java 21, Spring Boot 4 | Separate repository |

## Run locally

Prerequisites: Node.js, MongoDB, Java 21 for the scheduler, and Maven or the scheduler's Maven wrapper. Run each service in its own terminal. Create local `.env` files for the Node services using the variables below; `.env` files are ignored by Git. The scheduler's `.env.example` documents its environment variables.

For a fully local run, set the same `JWT` secret in `login_Services/.env` and `starter/.env`, and use the same local MongoDB database in both. Set `NODE_ENV=development` on auth for HTTP cookies. Set the same random `SCHEDULER_API_KEY` of at least 32 characters in the task service and scheduler environment.

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

`FRONTEND/package.json` is currently absent from this repository, so a fresh clone cannot run the frontend install/build commands until that manifest is restored.

The defaults are auth `5000`, task service `9000`, gateway `8080`, and Vite `5173`. Clone [Algorithm-Scheduler](https://github.com/Mudit-vijay/Algorithm-Scheduler) alongside this repository and run `./mvnw spring-boot:run` from its root (`.\mvnw.cmd spring-boot:run` on Windows); configure it to listen on `9001`. Google sign-in also requires the separately configured OAuth service.

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

Set the same strong `JWT` secret on auth and task services, production `MONGO_URI` values, the same random `SCHEDULER_API_KEY` of at least 32 characters on the task service and scheduler, and the exact frontend origin in `CORS_ALLOWED_ORIGINS`. Auth cookies default to `Secure` and `SameSite=None` outside development. The task service defaults to the Render scheduler URL; `SCHEDULER_SERVICE_URL` can override it. Use the variable list below and the scheduler's `.env.example` as a deployment checklist. Never put secrets in `VITE_*` values: those values are visible in the browser bundle.

The live demo may run an older deployment until all services are redeployed. A gateway or scheduler health response alone does not verify login, assignment, or scheduling across the deployed services.

## API routes

All routes below are reached through the gateway. Protected routes require the session cookie. Group task changes and group scheduling require the group owner or a group admin; the completion route requires the assignee.

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/v1/createUser` | Register and start a session; email is not verified |
| `POST` | `/api/v1/login` | Sign in |
| `GET` / `POST` | `/api/v1/me`, `/api/v1/logout` | Read or end session |
| `GET` / `POST` | `/api/v1/group/groups` | List accessible groups or create one |
| `GET` | `/api/v1/group/groups/:groupId/members` | List assignable members (owner/admin) |
| `GET` / `POST` | `/api/v1/task/:groupId/tasks` | List group tasks or create one |
| `PATCH` / `DELETE` | `/api/v1/task/:groupId/tasks/:taskId` | Update or delete a group task |
| `PATCH` | `/api/v1/task/:groupId/tasks/:taskId/complete` | Assignee completes a task |
| `GET` | `/api/v1/task/personal/tasks` | List tasks assigned to the signed-in user |
| `POST` | `/api/v1/task/personal/schedule` | Schedule assigned personal tasks |
| `GET` | `/api/v1/task/personal/schedule/latest` | Load saved personal Gantt data |
| `POST` | `/api/v1/group/groups/:groupId/schedule` | Schedule group tasks |
| `GET` | `/api/v1/group/groups/:groupId/schedule/latest` | Load saved group Gantt data |
| `GET` | `/api/v1/group/audit` | Read accessible audit events |

Both schedule POST routes accept a window in **minutes from midnight**, for example:

```json
{ "startTime": 540, "endTime": 1020, "totalHours": 480 }
```

The scheduler returns times relative to the start of that window; the frontend converts them to clock labels. See [SCHEDULER_INTEGRATION.md](SCHEDULER_INTEGRATION.md) for the service contract.

## Verification

```bash
# From starter/
node --test --test-concurrency=1 groupMembership.test.js personalScheduling.test.js scheduleViews.test.js

# From FRONTEND/
npm run lint
npm run build

# From the separate Algorithm-Scheduler repository
./mvnw test
```

The backend tests cover multi-group membership, assignment authorization, personal scheduling, and persisted schedule views. Before publishing a deployment, also test signup/login, group membership, assignment, dependency completion, group and personal scheduling, and audit visibility against the deployed services.

## Repository layout

```text
TASK.MANAGER/
├── FRONTEND/            React application and API client
├── Gateway/             API proxy and CORS policy
├── login_Services/      Authentication and session cookies
├── starter/             Groups, tasks, scheduling orchestration, audit data
├── SCHEDULER_INTEGRATION.md
└── README.md
```

Author: [Mudit Vijay](https://github.com/Mudit-vijay). This project is for educational and portfolio use.
