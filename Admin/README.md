# IR-IMCC | Indian Railways Integrated Maintenance Planning & Block Coordination Control Center

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.11-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.16-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.62-FF4154?logo=react-query&logoColor=white)](https://tanstack.com/query)

**IR-IMCC** is a mission-critical, industrial-grade Operations Control Room dashboard designed for **Indian Railways**. It streamlines corridor health monitoring, AI-powered track defect triage, multi-departmental maintenance synchronization, and traffic block authorization to minimize railway line downtime while maximizing passenger and freight safety.

---

## 📸 Key Modules & Features

### 1. 🚆 Operational Command Overview (`/`)
- **Live Fleet & Corridor KPIs**: Real-time metrics tracking Critical Open Reports, Active Weekly Blocks, Corridor Health Status (Healthy / Warning / Critical), and Backlog Task Counts.
- **Interactive Railway Route GIS Map**: High-contrast dark CartoDB basemap plotting Indian Railway trunk routes, dynamic corridor glow lines, and geo-located severity markers with smooth fly-to camera controls.
- **Departmental Workload Analytics**: Recharts visual distribution comparing pending maintenance load across **Track (P-Way)**, **Signal (S&T)**, and **OHE (Traction / TRD)**.
- **Real-Time Critical Alerts**: Instant feed of unmitigated track fractures, catenary wear, and interlocking faults with quick-access triage triggers.

### 2. 🔍 Live Defect Reports & AI Triage (`/reports`)
- **Multimodal Defect Telemetry**: Comprehensive defect logs with high-resolution photographic evidence, asset IDs, and exact GPS coordinates.
- **AI Severity Verification**: Pre-classified severity scores (**CRITICAL**, **HIGH**, **MEDIUM**, **LOW**) alongside AI model confidence percentages.
- **Supervisor Severity Override**: Allows control room supervisors to inspect and override AI classifications with real-time audit logging.
- **One-Click Work Order Conversion**: Directly convert verified defect reports into actionable maintenance tasks assigned to specific railway engineering departments.
- **Advanced Filtering & Sorting**: Filter by Corridor Sector, Severity, Triage Status (`NEW`, `REVIEWED`, `CONVERTED`), or free-text search.

### 3. ⚡ Multi-Department Coordination Center (`/coordination`)
- **Smart Opportunity Detection**: Automatically groups maintenance tasks across different departments (Track, Signal, OHE) occurring on the same corridor sector.
- **Downtime Optimization Engine**: Computes separate sequential maintenance durations vs. combined parallel window durations, highlighting net minutes saved.
- **Recommended Timetable Windows**: Proposes optimal low-traffic slots (e.g., night maintenance windows) to prevent congestion with high-speed express trains (Rajdhani, Vande Bharat).
- **One-Click Block Proposal**: Generates structured traffic block proposals directly for operational sign-off.

### 4. 📅 Traffic Block Planning & Timetable Matrix (`/blocks`)
- **Block Lifecycle Management**: Track blocks categorized by operational status:
  - `RECOMMENDED`: Awaiting Divisional Operating Manager (DOM) / Traffic Controller review.
  - `APPROVED`: Authorized for line possession and power cut.
  - `MODIFIED`: Rescheduled with adjusted time boundaries.
  - `REJECTED`: Declined due to timetable clashes with reason tracking.
- **Schedule Rescheduling Modal**: Visual time picker with automatic possession duration calculation.
- **Status Audit & Logging**: Instant state updates integrated with TanStack Query caching.

---

## 🛠️ Architecture & Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Core Framework** | [React 18](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/) | Type-safe, component-driven UI architecture |
| **Build & Tooling** | [Vite 5](https://vitejs.dev/) | Lightning-fast Hot Module Replacement (HMR) & production bundling |
| **Styling & Theme** | [Tailwind CSS 3](https://tailwindcss.com/) | Custom industrial high-contrast dark control room theme |
| **GIS Mapping** | [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/) | Geo-spatial railway corridor & defect node visualization |
| **Data Visualization** | [Recharts](https://recharts.org/) | Responsive SVG charts for departmental maintenance distribution |
| **Server State** | [TanStack React Query v5](https://tanstack.com/query) | Declarative asynchronous caching, queries, and optimistic mutations |
| **Client UI State** | [Zustand](https://github.com/pmndrs/zustand) | Ultra-lightweight global state for filters, modals, and sidebar state |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, accessible industrial iconography |

---

## 📂 Project Structure

```text
Admin-dashboard/
├── public/                     # Static assets (favicons, SVG railway icons)
│   ├── favicon.svg
│   ├── icons.svg
│   └── train-icon.svg
├── src/
│   ├── assets/                 # Brand images and icons
│   ├── components/
│   │   ├── common/             # Reusable domain badges & indicators
│   │   │   ├── DepartmentBadge.tsx
│   │   │   ├── SeverityIndicator.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── layout/             # Shell layout, header with IST clock, sidebar
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── map/                # Leaflet map container & camera controller
│   │   │   └── RailwayMap.tsx
│   │   └── ui/                 # Accessible base components
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── table.tsx
│   │       └── tabs.tsx
│   ├── lib/                    # Utilities & formatting functions
│   │   └── utils.ts
│   ├── pages/                  # Main route views
│   │   ├── BlockPlanningPage.tsx
│   │   ├── CoordinationPage.tsx
│   │   ├── LiveReportsPage.tsx
│   │   └── OverviewPage.tsx
│   ├── services/               # API clients & simulated telemetry layer
│   │   ├── api.ts
│   │   └── mockData.ts
│   ├── store/                  # Zustand state store
│   │   └── uiStore.ts
│   ├── types/                  # TypeScript interface definitions
│   │   └── railway.ts
│   ├── App.tsx                 # Route configuration
│   ├── index.css               # Base CSS & industrial scrollbar tokens
│   ├── main.tsx                # React entry point with QueryClientProvider
│   └── vite-env.d.ts           # Environment typings
├── .gitignore                  # Git ignore rules for node, builds & environment
├── .oxlintrc.json              # Oxlint linting configuration
├── index.html                  # HTML entry point
├── package.json                # Project dependencies and npm scripts
├── tailwind.config.js          # Tailwind styling tokens & custom color palette
├── tsconfig.json               # TypeScript compiler options
└── vite.config.ts              # Vite configuration with @ path aliases
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher (or `pnpm` / `yarn`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Admin-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📜 Available Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts Vite local development server with instant HMR |
| `npm run build` | Runs TypeScript type check (`tsc`) and compiles production build to `dist/` |
| `npm run preview` | Previews the compiled production build locally |
| `npm run typecheck`| Validates all TypeScript types across the codebase without emitting files |
| `npm run lint` | Runs ultra-fast code quality check using Oxlint |

---

## 🎨 Industrial Control Room Design Principles

- **High-Contrast Dark Palette (`slate-950`)**: Minimizes eye strain in 24/7 continuous operations control rooms.
- **Monospace Typography (`JetBrains Mono`)**: Unambiguous reading of critical numeric data, asset IDs (`AST-C12-01`), GPS coordinates, and railway mileposts (`KM 412/10`).
- **Synchronized Live Clock (`IST`)**: Synchronized to Indian Standard Time (`Asia/Kolkata`) with millisecond-accuracy telemetry heartbeat indicator.
- **Deterministic Color Codes**:
  - 🔴 **CRITICAL / Red**: Line blockage, fracture risk, immediate speed restriction.
  - 🟠 **HIGH / Orange**: Major wear, component renewal needed.
  - 🟡 **MEDIUM / Amber**: Routine intervention required.
  - 🔵 **LOW / Blue**: Non-critical monitoring / routine testing.
  - 🟢 **HEALTHY / APPROVED / Emerald**: Line clear, block approved, system nominal.

---

## 📄 License
This project is licensed for Indian Railways internal maintenance operations and demonstration purposes.
