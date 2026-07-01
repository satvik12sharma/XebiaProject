# Project Blueprint & Implementation Plan
## Enterprise Workforce Management Platform with AI Operations Assistant

This document outlines the repository structure and day-wise implementation roadmap designed for academic evaluation and GitHub-ready project tracking.

---

## 📂 Repository Directory Structure

```
enterprise-workforce-platform/
├── README.md                 # Project Overview, Setup, and Quickstart
├── PROJECT_PLAN.md           # This Detailed Implementation & Git Strategy Plan
├── package.json              # Monorepo Workspace configuration
├── start-dev.js              # Dev script to start client & server concurrently
├── .gitignore                # Git exclusions (node_modules, uploads, .env)
│
├── backend/                  # REST API Server (Express.js)
│   ├── package.json          # Server dependencies (bcrypt, JWT, express)
│   ├── server.js             # API Gateway & mount points
│   ├── db.js                 # Database connector / Lowdb simulation engine
│   ├── data/
│   │   ├── seed.js           # Initial database state & roles loader
│   │   └── database.json     # Local database file storage
│   ├── middleware/
│   │   └── auth.js           # Role-Based Access Control (RBAC) middleware
│   └── routes/
│       ├── auth.js           # Auth & User lifecycle endpoints
│       ├── organization.js   # Department and structure configurations
│       ├── employees.js      # Digital employee records
│       ├── recruitment.js    # Job pipelines and AI Resume parsing
│       ├── attendance.js     # Shift tracking, GPS, and QR validations
│       ├── leaves.js         # Leave requests and manager review workflows
│       ├── payroll.js        # Salary runner & payslip generator
│       ├── projects.js       # Sprints, tasks, and comments boards
│       ├── performance.js    # KPI logging and ratings
│       ├── assets.js         # Hardware tracking
│       ├── tickets.js        # Support tickets
│       └── ai.js             # AI Assistant engine
│
└── frontend/                 # Client Single Page App (Vite + React)
    ├── package.json          # React, Lucide Icons, Recharts dashboard libraries
    ├── index.html            # Main SPA entry point
    ├── vite.config.js        # Vite configurations and server routing proxy
    └── src/
        ├── main.jsx          # React app mounter
        ├── index.css         # Modern design style tokens (glassmorphism theme)
        └── App.jsx           # Core navigation, dashboards, and pages
```

---

## 📅 Day-Wise Implementation Roadmap

This 10-day development schedule transitions the platform from environment setup to a deployment-ready system.

### Phase 1: Authentication & Structures (Days 1 - 2)
* **Day 1: Setup & Role Management**
  * Initialize git workspace and package dependencies.
  * Implement User Schemas and JWT auth controller (`backend/routes/auth.js`).
  * Implement Account Lock safety rule (block user after 5 failed attempts).
  * Design the login layout and client-side credential checks.
* **Day 2: Organization Configuration & Employee Profiles**
  * Create department structure schemas. Implement validation (Unique code, single manager, restrict delete if populated).
  * Implement Employee profile CRUD (`backend/routes/employees.js`).
  * Integrate auto-generated Employee IDs (e.g. `EMP1024`) and secure salary views (restricted to HR/Finance).

### Phase 2: Hiring & Operational Cycles (Days 3 - 5)
* **Day 3: Recruitment & AI Candidate Analytics**
  * Build the Kanban hiring board (Applied, Screening, Interview, Offer, Joined).
  * Develop the simulated AI Resume parser (scores matching skills vs missing stacks).
* **Day 4: Shift Attendance & Location Validations**
  * Implement shift logging (Clock-In / Clock-Out) capturing timestamps, GPS coordinates, or office QR scans.
  * Set up overtime thresholds (calculate payouts after 8 hours) and late check-in flags.
* **Day 5: Leave Management & Approvals**
  * Establish leave allocations (12 Casual, 10 Sick, 15 Earned).
  * Implement booking constraints (no negative balances, block retrospective bookings).
  * Set up manager review triggers and auto-deduct balances upon approval.

### Phase 3: Payroll, Agile Tasks, & Performance (Days 6 - 8)
* **Day 6: Payroll Processing Engine**
  * Build the monthly payroll run endpoint.
  * Integrate automatic calculations for basic pay, HRA, bonuses, overtime, PF deductions, and unpaid leave penalties.
  * Create a print-ready digital payslip generator.
* **Day 7: Task Boards & Sprint Control**
  * Develop workspaces supporting projects and sprint tasks.
  * Create the Task status flow (To Do ➔ In Progress ➔ Review ➔ Completed) with worker assignment restrictions.
  * Implement task comment channels and files upload attachments.
* **Day 8: Goal Tracking & KPI Evaluations**
  * Implement manager feedback forms and ratings (1-5 scale).
  * Program automatic recommendation indicators based on high ratings and project deadlines met.

### Phase 4: Core Services & Operations AI (Days 9 - 10)
* **Day 9: Support Desk & IT Assets**
  * Set up asset cataloging (Laptop, Mobile) linked to employee profiles.
  * Create IT Help Desk tickets tracking priority (Low, Medium, High) and resolution states.
* **Day 10: AI Assistant Integration & Dashboard Reports**
  * Assemble the slide-out AI Assistant console on all frontend views.
  * Integrate prompt matching queries linking database tables directly to chat responses.
  * Complete system-wide RBAC validation reviews and final codebase tests.
