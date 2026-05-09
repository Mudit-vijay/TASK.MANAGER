# ⚡ Task Orchestrator

> A production-grade, polyglot microservices platform for intelligent task scheduling — powered by a constraint-based AI engine built with Backtracking and Branch-and-Bound algorithms.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://task-manager-1-5jlg.onrender.com)
[![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-darkgreen?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)](https://docker.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Scheduling Engine](#-scheduling-engine)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)

---

## Overview

Task Orchestrator is a distributed task management system designed to optimize how teams plan and execute work. Unlike simple to-do apps, it uses a **Java-based AI scheduling engine** that analyzes task priorities, deadlines, durations, and dependencies to compute optimal execution timelines using graph algorithms and constraint satisfaction techniques.

The platform is built as **6 independently deployable microservices**, connected through a centralized API Gateway, and features collaborative workspaces, multi-strategy authentication, and a premium React dashboard.

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React.js)                   │
│              task-manager-1-5jlg.onrender.com            │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  API GATEWAY (Node.js)                    │
│              task-manager-xp1g.onrender.com              │
│         Reverse Proxy · CORS · Helmet · Compression      │
└──────┬──────────┬───────────────┬───────────┬───────────┘
       │          │               │           │
       ▼          ▼               ▼           ▼
┌───────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐
│   Auth    │ │  Starter │ │ Scheduler │ │  OAuth   │
│  Service  │ │  Service │ │  Engine   │ │ Service  │
│ (Node.js) │ │(Node.js) │ │  (Java)   │ │(Node.js) │
│  Login    │ │  Tasks   │ │ Spring    │ │ Google   │
│  Signup   │ │  Groups  │ │ Boot      │ │ SSO      │
│  OTP      │ │  CRUD    │ │ B&B/BT    │ │          │
│  JWT      │ │  Collab  │ │ Topo Sort │ │          │
└─────┬─────┘ └────┬─────┘ └───────────┘ └──────────┘
      │             │
      ▼             ▼
┌─────────────────────────┐
│     MongoDB Atlas        │
│   Users · Tasks · Groups │
└─────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, Redux Toolkit, Axios, Lucide Icons, React Hook Form |
| **API Gateway** | Node.js, Express, http-proxy-middleware |
| **Auth Service** | Node.js, Express, JWT, bcrypt.js, Brevo SMTP |
| **Task Service** | Node.js, Express, Mongoose, Axios |
| **Scheduling Engine** | Java 21, Spring Boot 4.0, Lombok |
| **OAuth** | Google OAuth 2.0 (Stateless) |
| **Database** | MongoDB Atlas |
| **Containerization** | Docker (multi-stage builds) |
| **Security** | Helmet.js, CORS, HttpOnly Cookies, Compression |
| **Deployment** | Render (6 services) |

---

## ✨ Features

### Core
- **AI-Powered Scheduling** — Constraint-based optimization engine that computes optimal task timelines
- **Collaborative Workspaces** — Create Personal, Team, or Project workspaces with email-based member invitations
- **Role-Based Views** — Owned workspaces ("Primary Assets") vs. shared workspaces ("External Alliances")
- **Task Management** — Full CRUD with priority levels, deadlines, estimated durations, and completion tracking

### Authentication & Security
- **Multi-Strategy Auth** — Email/password login, Google OAuth 2.0 SSO, and OTP email verification
- **Session Management** — Automatic JWT expiry detection with re-authentication modal
- **Production Security** — Helmet.js headers, Gzip compression, strict CORS whitelisting, HttpOnly cookies

### User Experience
- **Dark / Light Mode** — System-wide theme toggle with persistent preference
- **Premium UI** — Glassmorphism design, micro-animations, custom confirmation modals
- **AI Timeline Visualization** — Horizontal scroll of optimized task phases with start/end times
- **Configurable Schedule Window** — Users set their own working hours (e.g., 09:00–17:00)

---

## 🧠 Scheduling Engine

The Java Spring Boot engine is the core intelligence of the platform. It receives tasks from the Node.js backend and returns an optimized execution timeline.

### Algorithms Implemented

| Algorithm | Purpose |
|---|---|
| **Topological Sort** | Resolves task dependency order and detects circular dependencies |
| **Backtracking** | Explores all valid schedules via recursive constraint satisfaction |
| **Branch and Bound** | Prunes infeasible branches early for faster optimal solutions |

### Scoring Model

Each task is scored using a multi-factor **Weightage** system:

```
Score = (priorityMultiplier × priority) 
      + (deadlineMultiplier × deadline_urgency) 
      + (dependencyMultiplier × dependency_depth)
```

### Constraint System

```json
{
  "constraints": {
    "startTime": 540,
    "endTime": 1020,
    "totalHours": 480,
    "totalDays": 7
  },
  "policy": {
    "optimizationGoal": "EARLIEST_DEADLINE",
    "priorityMultiplier": 1.0,
    "deadlineMultiplier": 1.0,
    "dependencyMultiplier": 1.0
  },
  "algorithmType": "backtracking"
}
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **Java** JDK 21
- **Maven** (or use the included `mvnw` wrapper)
- **MongoDB** Atlas connection string
- **Docker** (optional, for containerized scheduler)

### Installation

```bash
# Clone the repository
git clone https://github.com/Mudit-vijay/TASK.MANAGER.git
cd TASK.MANAGER
```

#### 1. Frontend
```bash
cd FRONTEND
npm install
npm run dev
# → http://localhost:5173
```

#### 2. API Gateway
```bash
cd Gateway
npm install
node index
# → http://localhost:8080
```

#### 3. Auth Service
```bash
cd login_Services
npm install
node index
# → http://localhost:4282
```

#### 4. Task/Group Service
```bash
cd starter
npm install
node app
# → http://localhost:9000
```

#### 5. Scheduling Engine
```bash
cd Algorithm.scheduler
./mvnw spring-boot:run
# → http://localhost:9001
```

**Or with Docker:**
```bash
cd Algorithm.scheduler
docker build -t algorithm-scheduler .
docker run -p 9001:9001 algorithm-scheduler
```

---

## 🔐 Environment Variables

### Auth Service (`login_Services/.env`)
```env
MONGO_URI=mongodb+srv://<connection-string>
JWT=<your-jwt-secret>
BREVO_API_KEY=<brevo-smtp-api-key>
SENDGRID_VERIFIED_EMAIL=<verified-sender-email>
OTP_ENABLED=true
PORT=4282
```

### Task Service (`starter/.env`)
```env
MONGO_URI=mongodb+srv://<connection-string>
JWT=<your-jwt-secret>
PORT=9000
```

### Frontend (`FRONTEND/.env`)
```env
VITE_API_URL=http://localhost:8080/api/v1
```

> In production, `VITE_API_URL` is omitted — the app defaults to the live Gateway URL.

---

## ☁️ Deployment

All 6 services are deployed on **Render** as independent web services:

| Service | URL | Runtime |
|---|---|---|
| Frontend | `task-manager-1-5jlg.onrender.com` | Static Site |
| Gateway | `task-manager-xp1g.onrender.com` | Node.js |
| Starter | `backend-a-tvul.onrender.com` | Node.js |
| Login | `backend-b-wxdw.onrender.com` | Node.js |
| Scheduler | `algorithm-scheduler.onrender.com` | Docker |
| OAuth | `oauth-service-fyrc.onrender.com` | Node.js |

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/login` | Email/password login |
| `POST` | `/api/v1/createUser` | Register + OTP |
| `POST` | `/api/v1/otpverification` | Verify OTP code |
| `POST` | `/api/v1/oauthcreation` | Google OAuth callback |

### Workspaces
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/group/groups` | List user's workspaces |
| `POST` | `/api/v1/group/groups` | Create workspace |
| `DELETE` | `/api/v1/group/groups/:id` | Delete workspace |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/task/:groupId/tasks` | List tasks in workspace |
| `POST` | `/api/v1/task/:groupId/tasks` | Create task |
| `PATCH` | `/api/v1/task/:groupId/tasks/:taskId` | Update task |
| `DELETE` | `/api/v1/task/:groupId/tasks/:taskId` | Delete task |

### Scheduler
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/group/groups/:groupId/schedule` | Run AI optimization |
| `GET` | `/api/v1/scheduler/health` | Scheduler health check |

---

## 📁 Project Structure

```
TASK.MANAGER/
├── FRONTEND/                  # React.js SPA
│   ├── src/
│   │   ├── components/        # Login, OTP, NavBar
│   │   ├── services/          # Axios API layer
│   │   └── App.jsx            # Route definitions
│   └── temp/                  # Dashboard, GroupView, OAuth
│
├── Gateway/                   # API Gateway (reverse proxy)
│   └── index.js
│
├── login_Services/            # Auth microservice
│   ├── controllers/login.js   # Login, Signup, OTP, OAuth
│   ├── schemas/               # Mongoose user schema
│   └── routers/               # Express routes
│
├── starter/                   # Task & Group microservice
│   ├── controlers_Task/       # Groups, Tasks, Scheduler bridge
│   ├── models/                # Mongoose schemas
│   └── routes/                # Express routes
│
├── Algorithm.scheduler/       # Java scheduling engine
│   ├── src/main/java/
│   │   └── Algorithm/scheduler/
│   │       ├── Controller/    # REST endpoints
│   │       ├── DataModel/     # TaskModel, Schedule, Policy
│   │       └── Service/       # Backtracking, B&B, TopoSort
│   ├── Dockerfile             # Multi-stage build
│   └── pom.xml                # Maven config
│
└── README.md
```

---

## 👤 Author

**Mudit Vijay**
- GitHub: [@Mudit-vijay](https://github.com/Mudit-vijay)

---

## 📄 License

This project is for educational and portfolio purposes.
