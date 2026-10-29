# Multi Mantech International Pvt. Ltd. (MMIPL)
## Enterprise Task Management & Workflow Delegation System (TaskFlow)

---

## 1. Executive Summary & Business Motivation

### Why Was This System Created?
Multi Mantech International Pvt. Ltd. (MMIPL) delivers multidisciplinary engineering, geospatial surveying, infrastructure planning, and architectural consultancy contracts across India. Previously, task assignment, progress reporting, and deliverable verification relied on fragmented tools: physical registers, Excel spreadsheets, email threads, and WhatsApp chats. 

This created critical operational vulnerabilities:
1. **Unclear Accountability**: Ambiguity between what Project Leads (Managers) assigned and what field engineers/draftsmen (Executors) were actively working on.
2. **Delayed Schedule Visibility**: Projects operate on contract milestones anchored to a contract start date (**Day 0**). Without automated schedule offset calculations, delays were only noticed after deadlines were already missed.
3. **Repeated Manual Setup**: Standardized projects (e.g., City Gas Distribution, Topographic LIDAR Surveys, Highway Geometric Design) were repeatedly planned from scratch rather than leveraging proven blueprint templates.
4. **Lack of Verifiable Deliverables**: Subtasks were verbally claimed as "done" without mandatory proof-of-work (drawings, survey logs, inspection photos, or calculation sheets).
5. **Absence of Audit Trail**: When a deliverable was delayed or reallocated, executive leadership had no immutable chronological record of who modified dates, transferred tasks, or submitted work.

### Business Objective
**TaskFlow** is MMIPL's centralized, cloud-ready workflow orchestration and task governance system. It mathematically schedules activities from Day 0, automates standard operational procedure (SOP) blueprints, enforces mandatory proof-of-work deliverables with Cloudinary storage, provides a 3-tier role hierarchy, and offers a 100% mobile-friendly responsive interface for engineers on the go.

---

## 2. Core Business Logic & Mathematical Scheduling

### A. The "Day-0" Anchor Model
Every infrastructure contract has an official contractual start date known as **Day 0**. 
- In TaskFlow, all milestone activities and individual sub-tasks are scheduled relative to Day 0 using day offsets.
- When an SOP template defines Activity 1 with a duration of 5 days and Sub-task 1.1 with a duration of 2 days:
  $$\text{Scheduled Due Date} = \text{Day 0} + \sum \text{Estimated Offset Days}$$
- If a project start date shifts, updating Day 0 instantly recalibrates the entire mathematical schedule for all dependent workpackages.

### B. Hierarchical Work Breakdown Structure (WBS)
TaskFlow enforces a strict 4-tier structural hierarchy:
```
Project (e.g., Ahmedabad City Gas Distribution — Code: P001, Day 0: 01-Jun-2024)
 │
 └── Task (High-level milestone generated from an SOP Template)
      │
      └── Activity (Functional work package assigned to a Project Manager)
           │
           └── Sub-Task (Atomic unit of work assigned to a Field Executor)
```

### C. Sub-Task State Transition Machine
Every subtask transitions through a finite set of governed states:

```mermaid
stateDiagram-v2
    [*] --> ALLOTTED : Delegated via 4-Step Wizard
    ALLOTTED --> ONGOING : Executor clicks 'Accept' & logs target date
    ALLOTTED --> DELAYED : Calendar due date passes without action
    ONGOING --> DELAYED : Calendar due date passes without submission
    ONGOING --> COMPLETED : Submitted with remarks (>=10 chars) & proof file
    DELAYED --> COMPLETED : Delayed task resolved & submitted with proof
    COMPLETED --> [*] : Manager reviews & assigns 1-5 Star Rating
```

- **Proof-of-Work Verification**: Subtasks cannot be closed with vague one-word notes (e.g. "done", "ok"). The system enforces meaningful remarks (minimum 10 characters) and supports mandatory attachments (PDF, DWG, ZIP, images).
- **Manager Quality Rating**: Every completed subtask is evaluated by the overseeing Manager with a 1-to-5 star quality score, building measurable performance histories.
- **Task Reallocation**: If an engineer is unavailable, managers can transfer the subtask to another executor. The state automatically reverts to `ALLOTTED`, and an immutable note is written to the audit log.

---

## 3. End-to-End Operational Workflow: How It Works

```mermaid
flowchart TD
    A[1. Project Registry] -->|Define Code, Name & Day 0| B[2. SOP Template Builder]
    B -->|Define Activities, Roles & Precedence| C[3. 4-Step Delegation Wizard]
    C -->|Assign Managers & Executors| D[4. Executor 'My Tasks']
    D -->|Accept Subtask & Set Target Date| E[5. Ongoing Work Execution]
    E -->|Upload Proof & Submit Remarks| F[6. Manager Review & 1-5 Star Rating]
    E -.->|Due Date Passes| G[7. Automated Cron Overdue Sweep]
    G -->|Marks DELAYED & Alerts Leadership| F
```

### Step 1: Project Registration & Day 0 Definition
- The **Supervisor** creates the project in the registry (e.g., `P001 — Ahmedabad CGD Project`) and inputs the contract **Day 0** date.
- All subsequent schedule projections across all phases mathematically calculate from this date.

### Step 2: Standard SOP Blueprint Templates
- Pre-approved project blueprints are authored in the **Templates** module.
- Each template specifies:
  - Estimated completion durations in days.
  - Required personnel qualifications (e.g., Senior CAD Draftsman, Topo Surveyor).
  - Precedence constraints (`NONE` or `FINISH_TO_START`).
  - Mandatory deliverable attachment types.

### Step 3: The 4-Step Work Delegation Wizard
The **Supervisor** or **Manager** launches the Delegation Wizard (`/delegation/new`):
1. **Step 1 — Project & Day 0**: Select the target project; Day 0 is loaded automatically.
2. **Step 2 — Select Template**: Pick the operational blueprint.
3. **Step 3 — Assign Managers**: Assign a designated Project Manager to each functional Activity.
4. **Step 4 — Assign Executors & Set Days**: Assign qualified Executors to each individual atomic Sub-task and fine-tune planned days. Click **Delegate Task ✓**.

### Step 4: Executor Acceptance & Progress Tracking
- The **Executor** logs into their dashboard and sees the newly assigned task in the **Allotted** tab.
- Clicking **Accept Task** prompts for an estimated target completion date. The subtask shifts to **On-Hand (Ongoing)**.
- Color-coded indicators notify the user of items due within 2 working days.

### Step 5: Proof Submission & Quality Audit
- When work is finished, the Executor clicks **Submit Work**.
- The submission modal enforces:
  - Submission Status (`SUCCESSFUL`, `PARTIALLY COMPLETED`, `UNSUCCESSFUL`).
  - Detailed remarks ($\ge 10$ characters describing technical output).
  - Deliverable file upload (drawings, reports, ZIP files uploaded directly to Cloudinary).

### Step 6: Manager Verification & 1–5 Star Rating
- The **Manager** audits completed deliverables in their dashboard.
- Clicking the star rating interface scores the engineer's output from 1 to 5 stars.
- Performance statistics update live across the team's dashboard.

### Step 7: Automated Overdue Sweeps (Cron Background Job)
- An automated cron job runs periodically (`/api/cron/mark-delayed`).
- It checks all `ALLOTTED` and `ONGOING` subtasks whose due dates have elapsed and transitions them to `DELAYED`.
- In-app notification alerts are generated for both the executor and supervisor.

---

## 4. User Roles & Permission Matrix

| Feature / Capability | SUPERVISOR (Director / Admin) | MANAGER (Project Lead) | EXECUTOR (Field Engineer) |
|---|:---:|:---:|:---:|
| **Access Executive Dashboard** (All Projects) | ✅ | ❌ | ❌ |
| **Access Tactical Dashboard** (Assigned Scope) | ✅ | ✅ | ❌ |
| **"My Tasks" Execution Center** | ✅ | ✅ | ✅ |
| **Register & Edit Projects & Day-0 Dates** | ✅ | ❌ | ❌ |
| **Create & Edit SOP Templates** | ✅ | ✅ | ❌ |
| **Execute 4-Step Delegation Wizard** | ✅ | ✅ | ❌ |
| **Reallocate / Withdraw Subtasks** | ✅ | ✅ | ❌ |
| **Rate Completed Work (1–5 Stars)** | ✅ | ✅ | ❌ |
| **Run System-wide Overdue Sweeps** | ✅ | ❌ | ❌ |
| **Accept Allotted Tasks & Log Dates** | ❌ | ❌ | ✅ |
| **Submit Work with Remarks & File Proof** | ❌ | ❌ | ✅ |
| **View System Audit Trail & Logs** | ✅ | ✅ (Own team) | ❌ |
| **User Management (Create, Edit, Deactivate)** | ✅ | ❌ | ❌ |

---

## 5. Demo & Testing Credentials

The system provides intuitive, role-based accounts. On the login screen, quick-login buttons let you switch roles with one click:

| Role | Email Address | Password | Intended Workflow |
|---|---|---|---|
| **Supervisor** | `supervisor@mmipl.in` | `password123` | Full administrative control, executive KPIs, project setup, user administration. |
| **Manager** | `manager@mmipl.in` | `password123` | Task delegation, activity monitoring, subtask reallocation, deliverable quality ratings. |
| **Executor** | `executor@mmipl.in` | `password123` | Task acceptance, on-hand worklist, remark logging, proof-of-work file uploads. |

*(Legacy test aliases `alice@test.com`, `bob@test.com`, and `dave@test.com` with password `password123` also remain active for backward compatibility).*

---

## 6. Mobile Responsiveness & On-the-Go UX

TaskFlow is engineered to work seamlessly on smartphones (iOS Safari, Android Chrome) and tablets:

1. **Slide-Out Mobile Drawer**:
   - On desktop screens ($\ge 768\text{px}$), the navigation sidebar is permanently docked.
   - On mobile screens, tapping the top-left **Hamburger Menu** (`Menu` icon) slides in a clean navigation drawer with a backdrop overlay.
   - Tapping any navigation link, the close (`X`) button, or the backdrop smoothly dismisses the drawer.
2. **One-Tap Quick Login**:
   - On mobile login, tap **Supervisor**, **Manager**, or **Executor** to auto-fill credentials instantly without mobile typing friction.
3. **Responsive Touch Tables**:
   - Complex data tables (Project lists, Task boards, Audit trail) are wrapped in horizontal scroll containers (`overflow-x-auto min-w-[550px]`). This prevents tables from breaking page layouts on phones.
4. **Adaptive Stat Grids**:
   - Dashboard stat cards transition smoothly from 1 column on phones to 2 columns on tablets and 3-4 columns on desktop.
5. **Mobile-Optimized Delegation Wizard**:
   - The 4-step wizard features a compact mobile progress bar ("Step X of 4") and stacks subtask input controls vertically for easy finger taps.

---

## 7. Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org) with Turbopack bundler.
- **UI Library**: [React 19](https://react.dev) with [Tailwind CSS 3.4](https://tailwindcss.com).
- **Icons**: [Lucide React](https://lucide.dev).
- **Database ORM**: [Prisma ORM 6.19](https://www.prisma.io).
- **Database Engine**: Hosted PostgreSQL with SSL connection pooling.
- **Authentication**: [NextAuth.js v4](https://next-auth.js.org) using JWT session tokens and BCrypt password encryption.
- **Cloud Storage**: [Cloudinary REST API](https://cloudinary.com) for secure hosting of task attachments and drawings.
- **Visualizations**: [Recharts](https://recharts.org) for team productivity charts and progress distributions.

---

## 8. Directory Structure

```
e:/mmipl/task/task-management-system/
├── app/
│   ├── (auth)/
│   │   ├── login/page.js         # Role-based login with 1-click test buttons
│   │   └── register/page.js      # User registration view
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth authentication handlers
│   │   ├── cron/mark-delayed/    # Scheduled overdue task transition sweep
│   │   ├── dashboard/            # Role-filtered KPI aggregations
│   │   ├── projects/             # Project CRUD & Day-0 computations
│   │   ├── subtasks/             # Acceptance, submission, rating, reallocation
│   │   ├── tasks/                # Multi-tier task delegation service
│   │   ├── templates/            # SOP blueprint builder endpoints
│   │   └── users/                # User management & profile endpoints
│   ├── dashboard/
│   │   ├── executor/page.js      # My Tasks execution center (Tabs: Allotted, On-Hand, Done, Delayed)
│   │   ├── manager/page.js       # Tactical team monitoring & 1-5 star ratings
│   │   └── supervisor/page.js    # Executive command center & team drilldown
│   ├── delegation/new/page.js    # 4-step work delegation wizard
│   ├── history/page.js           # Immutable system audit trail
│   ├── projects/page.js          # Project registry & Day-0 scheduler
│   ├── settings/page.js          # Profile, password change & user management
│   ├── templates/page.js         # Blueprint template editor & builder
│   ├── layout.js                 # Global HTML & NextAuth session wrapper
│   └── page.js                   # Role-based intelligent redirector
├── components/
│   ├── dashboard/                # Responsive StatCards and chart components
│   ├── layout/
│   │   ├── AppShell.js           # Unified responsive shell (desktop sidebar + mobile drawer)
│   │   ├── Navbar.js             # Header with mobile hamburger, greeting & notifications
│   │   └── Sidebar.js            # Role-filtered navigation links & mobile drawer view
│   └── ui/                       # Reusable Badges, buttons, modals
├── prisma/
│   ├── schema.prisma             # Relational data schema (Projects, Tasks, Subtasks, AuditLog)
│   └── seed.js                   # Starter database seed with Supervisor, Manager & Executor accounts
└── Task_Management_System_Documentation.pdf # Official downloadable PDF manual
```

---

## 9. Vercel Cloud Deployment & Environment Variables

### Required Production Environment Keys
When deploying to Vercel, configure the following keys in **Project Settings $\to$ Environment Variables**:

| Variable Name | Description | Example Value |
|---|---|---|
| `NEXTAUTH_SECRET` | 32+ character random encryption key | `mmipl-tms-super-secret-key-2024-xyz` |
| `NEXTAUTH_URL` | Canonical public URL of your Vercel deployment | `https://task-management-mmipl-jaaq.vercel.app` |
| `DATABASE_URL` | PostgreSQL connection string with SSL | `postgres://user:pass@host:5432/db?sslmode=require` |
| `PRISMA_DATABASE_URL`| Direct or pooled PostgreSQL connection URL | `postgres://user:pass@host:5432/db?sslmode=require` |
| `CRON_SECRET` | Secret token authorizing background overdue checks | `cron-secret-2024-xyz` |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary account cloud identifier | `deawzppba` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `887842912374735` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret Key | *(Your secret key)* |

---

## 10. Local Setup & Getting Started

1. **Clone & Install Dependencies**:
   ```bash
   cd e:/mmipl/task/task-management-system
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgres://..."
   NEXTAUTH_SECRET="mmipl-tms-dev-secret-key-2024"
   NEXTAUTH_URL="http://localhost:3000"
   CRON_SECRET="cron-secret-2024-xyz"
   CLOUDINARY_CLOUD_NAME="deawzppba"
   CLOUDINARY_API_KEY="887842912374735"
   CLOUDINARY_API_SECRET="your_secret_key"
   ```

3. **Seed Database**:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

4. **Run Local Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser. Use the Quick Login buttons on `/login` to explore as **Supervisor**, **Manager**, or **Executor**.
