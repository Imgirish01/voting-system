# College Election Voting System (ECI-Themed)
### भारत निर्वाचन आयोग • Campus Election Commission Statutory Voting Portal

An enterprise-grade, full-stack College Election Voting System engineered with the official look, feel, and institutional dignity of the **Election Commission of India (ECI)** portal.

---

## 🏛️ System Highlights & ECI Theming

- **Official Statutory Look & Feel**:
  - Official Indian Tricolor header band, statutory notice bar, and bilingual Hindi/English headings.
  - Institutional ECI typography, Ashok Chakra and election crest motifs, SVEEP Voter's Pledge.
  - High-visibility Accessibility Toolbar (font size scaler `A-`, `A`, `A+`, live timestamp, and 1800-CAMPUS-VOTE toll-free helpline).
- **Interactive Electronic Voting Machine (EVM)**:
  - Authentic Ballot Unit (BU-01) interface with candidate serial numbers, photos, names, and allotted electoral symbols (Torch, Book, Tree, Scales, etc.).
  - Realistic red LED indicator glow upon candidate selection and classic blue EVM push-button.
  - Synthetic high-frequency EVM "BEEP" audio confirmation tone via HTML5 Web Audio API (zero external sound files needed).
- **Digital E-EPIC Voter Identity Card**:
  - Downloadable/printable official Electronic Electoral Photo Identity Card (e-EPIC) with security hologram seal, QR simulation, and Chief Election Officer certification.
- **Cryptographic Ballot Secrecy**:
  - Separation of elector audit trail (`voter_participations`) from secret ballot choices (`votes`).
  - Pseudonymous election-specific tokenization using `HMAC-SHA256` prevents individual votes from being linked back to voter accounts.

---

## 👥 Three Independent Panels & Roles

1. **Admin Panel (Chief Election Officer)**:
   - Comprehensive analytical dashboard (voter registrations, pending scrutiny, active polls, total votes cast, immutable audit trail).
   - Form 6-C Voter Verification desk (Approve, Reject with mandatory reason, Suspend accounts).
   - Form 2-B Candidate Nomination scrutiny (Review manifestos, biography, allot symbols, approve/reject).
   - Full election lifecycle management (`DRAFT`, `UPCOMING`, `APPLICATION_OPEN`, `APPLICATION_CLOSED`, `ACTIVE`, `PAUSED`, `COMPLETED`, `CANCELLED`).
   - Automated server-side scheduled polling window closures and candidate application deadline enforcement.
   - Dedicated Results Certification desk (Tabulate valid votes, percentages, turnout %, detect ties, and publish official declarations).
2. **Voter Panel (General Elector)**:
   - Form 6-C registration with college credentials and student ID verification.
   - Status tracking with contextual alerts (`APPROVED`, `PENDING`, `REJECTED`).
   - Digital E-EPIC card generator with print layout.
   - EVM Ballot Booth for active elections with duplicate-voting prevention.
   - Certified Results viewer (restricted until authorized publication by the administrator).
3. **Candidate Panel (Nominee)**:
   - File Form 2-B nomination papers for open elections.
   - Select ECI electoral symbols, author campaign biography and manifesto pledges.
   - Nomination scrutiny tracker with voluntary withdrawal option before deadline.
   - Certified candidate outcome portal (`WON`, `LOST`, `TIED` with vote shares).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide React, Recharts.
- **Backend**: Node.js, Express.js, REST API, JWT in secure HTTP-only cookies, bcryptjs, Multer.
- **Database**:
  - MySQL with foreign keys, unique constraints, transactions, and index optimizations (`database/schema.sql`, `database/seed.sql`).
  - Dual-Engine Fallback: Automatic zero-config storage engine (`database/data_store.json`) when MySQL daemon is offline, enabling immediate out-of-the-box execution without external database setup.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)
- MySQL (Optional: port 3306. If MySQL is not running, the system automatically activates its zero-config storage engine with full persistence and seed data!)

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
# The API will boot on http://localhost:5000
```

### 3. Frontend Setup
In a separate terminal:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
# The portal will open on http://localhost:5173
```

---

## 🔐 Default Demo Accounts for Instant Testing

| Role | Email | Password | Description / Status |
| :--- | :--- | :--- | :--- |
| **Chief Election Officer (Admin)** | `admin@college.edu` | `Admin@123` | Full access to scrutiny, scheduling & results |
| **Verified Elector (Voter)** | `aarav.sharma@college.edu` | `Password@123` | **APPROVED** voter with full EVM franchise |
| **Verified Elector (Voter 2)** | `diya.patel@college.edu` | `Password@123` | **APPROVED** voter in 3rd Year ECE |
| **Pending Elector (Voter 3)** | `rohan.gupta@college.edu` | `Password@123` | **PENDING** Form 6-C scrutiny |
| **Rejected Elector (Voter 4)** | `ananya.singh@college.edu` | `Password@123` | **REJECTED** with resubmission option |
| **Contesting Nominee (Candidate)** | `vikram.roy@college.edu` | `Password@123` | Contesting for Student Council President (Symbol: Torch) |
| **Contesting Nominee (Candidate 2)**| `pooja.verma@college.edu` | `Password@123` | Contesting for Student Council President (Symbol: Book) |

*(You can also use the 1-click **Quick Test Credentials** buttons on the Login page!)*

---

## 📂 Project Architecture

```
voting-system/
├── frontend/                   # Vite + React + Tailwind Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Navbar, TopRibbon, Ticker, StatusBadge, Footer
│   │   │   ├── layout/         # DashboardLayout, Sidebar, MainLayout
│   │   │   └── voting/         # EVMUnit (Electronic Voting Machine)
│   │   ├── context/            # AuthContext (JWT + Session State)
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── public/         # Landing, Login, Register, About, Help
│   │   │   ├── admin/          # Dashboard, Elections, Scrutiny, Results, Audits
│   │   │   ├── voter/          # Dashboard, Form 6-C, Ballot, Results, E-EPIC
│   │   │   └── candidate/      # Dashboard, Form 2-B, Nominations, Results
│   │   ├── routes/             # ProtectedRoute & AppRoutes
│   │   └── services/           # Axios API Client
│   └── package.json
│
├── backend/                    # Node.js + Express Backend REST API
│   ├── src/
│   │   ├── config/             # Dual-engine Database (MySQL + Fallback)
│   │   ├── controllers/        # Auth, Admin, Voter, Candidate, Election
│   │   ├── middleware/         # Authenticate, AuthorizeRole, ErrorHandler
│   │   ├── jobs/               # Scheduled Election Lifecycle Timer
│   │   ├── routes/             # REST API Endpoint Routers
│   │   ├── services/           # Voting (Secret Ballot), Results, Notification
│   │   └── server.js           # Server Entrypoint
│   └── package.json
│
├── database/
│   ├── schema.sql              # Production MySQL Schema
│   └── seed.sql                # Production MySQL Seed Dataset
└── README.md
```

---

## 🔒 Security & Privacy Implementation

- **Ballot Secrecy Protocol**: Individual ballots in the `votes` table contain only `election_id`, `position_id`, `candidate_application_id`, and a cryptographically hashed `voter_token`. No student identity is linked to the ballot record.
- **Double-Voting Prevention**: Unique composite database keys ensure each elector can submit exactly one vote per contested position.
- **HTTP-Only Cookies**: Authentication tokens are transmitted in `httpOnly`, `sameSite: 'lax'` session cookies to protect against Cross-Site Scripting (XSS).
- **Scheduled Auto-Closing**: Polling closes automatically on the server when the scheduled `end_at` timestamp is reached, even if no administrator is logged in.

