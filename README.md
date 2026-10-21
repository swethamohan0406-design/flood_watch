# Flood Monitoring and Emergency Alert System

> **Problem Statement:** Authorities need real-time monitoring of river levels, rainfall, flood-prone zones, and emergency alerts to reduce flood-related losses.

A full-stack web application designed for disaster management authorities and field observers to track river water levels, gauge rainfall, monitor flood-prone zones, plot geospatial telemetry on an interactive map, and automatically trigger severity-based emergency alerts.

---

## 🌟 Key Features

1. **Hydrological Dashboard:**
   - 4 real-time summary metric cards: Total Stations, Active Alerts, Stations in Danger, and Peak Rainfall.
   - 7-day interactive water level trend line chart (Recharts) with threshold markers for warning and danger stages.
   - Real-time station telemetry table with color-coded status badges (`normal`, `warning`, `danger`).
   - Field telemetry entry form to record new water level and rainfall readings.

2. **Interactive Geospatial Map (Leaflet):**
   - Live OpenStreetMap centered on India showing all river monitoring stations.
   - Status-colored interactive markers (Green = Normal, Orange = Warning, Red = Danger).
   - Rich informational popups displaying river basin, latest water level, rainfall, and thresholds.
   - Visual status legend.

3. **Flood-Prone Zones Management:**
   - Track vulnerable riverine settlements and population counts at risk.
   - Color-coded risk level badges (`low`, `medium`, `high`, `critical`).
   - Association with primary river monitoring stations.
   - Admin-only controls to register new flood zones or remove existing ones.

4. **Emergency Alerts Dispatch Center:**
   - Automated server-side threshold evaluation: alerts trigger automatically when water levels breach warning or danger marks.
   - Severity tags (`warning`, `danger`) and live status tracking (`active`, `resolved`).
   - Filter tabs: All, Active Alarms, and Resolved Archive.
   - Admin-only resolution workflow: mark active emergencies as resolved once floodwaters recede.

5. **Role-Based Access Control (RBAC):**
   - JWT authentication with secure password hashing (`bcryptjs`).
   - **Administrator:** Full CRUD on stations and zones, alert resolution, and telemetry recording.
   - **Observer:** View all dashboards, maps, zones, alerts, and record field readings.

---

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, React Router v6, Recharts, Leaflet, React Leaflet, Vanilla CSS.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose ODM), JWT, bcryptjs, CORS, dotenv.
- **Tooling:** Concurrently, Nodemon.

---

## 📁 Project Structure

```
flood_monitor/
├── .gitignore
├── package.json               # Root scripts (runs client and server together)
├── README.md
├── client/                    # React + Vite Frontend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js         # Configured with proxy to http://localhost:5000
│   └── src/
│       ├── api/api.js         # Axios instance with JWT interceptor
│       ├── context/           # AuthContext (login, register, logout, persistent user)
│       ├── components/        # Navbar, ProtectedRoute
│       ├── pages/             # Dashboard, MapPage, ZonesPage, AlertsPage, Login, Register
│       ├── App.jsx
│       ├── index.css          # Design system & styles
│       └── main.jsx
└── server/                    # Express + MongoDB Backend
    ├── .env                   # Environment variables (private)
    ├── .env.example           # Example environment template
    ├── package.json
    ├── server.js              # Express app entry point & routes mounting
    ├── seed.js                # Database seeder (5 stations, 4 zones, 35 readings, 3 alerts)
    ├── config/db.js           # Mongoose database connection
    ├── controllers/           # Auth, stations, readings, zones, alerts, dashboard
    ├── middleware/            # JWT protect & role restrictTo
    ├── models/                # User, Station, Reading, Zone, Alert
    ├── routes/                # API routes mounted at /api
    └── services/              # Alert threshold evaluation service
```

---

## 🚀 Getting Started

### 1. Install Dependencies
Run the installation command from the project root:
```bash
npm run install-all
```
*(Installs dependencies across the root, server, and client directories).*

---

### 2. Configure Environment Variables
Inside `server/`, create or update `.env`. Ensure that the `MONGO_URI` includes the database name **`floodSimple`** directly between `.net/` and `?`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/floodSimple?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
```

---

### 3. Seed Sample Data
Once your MongoDB connection URI is configured in `server/.env`, populate initial stations, zones, readings, and accounts:
```bash
npm run seed
```

#### Pre-Configured Seed Accounts:
| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@flood.com` | `Password123!` |
| **Field Observer** | `officer@flood.com` | `Password123!` |

---

### 4. Run the Full-Stack Application
Start both the backend Express server and the Vite frontend concurrently:
```bash
npm run dev
```

- **Frontend Client:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`
- **API Health Check:** `http://localhost:5000/api/health`

Alternatively, run each service independently:
- `npm run dev:server` (starts Express server on port 5000)
- `npm run dev:client` (starts Vite dev server on port 5173)

---

## 🔐 API Reference & Permissions

| Route | Method | Access | Description |
|---|---|---|---|
| `/api/auth/register` | POST | Public | Register new user |
| `/api/auth/login` | POST | Public | Authenticate & receive JWT |
| `/api/dashboard/summary` | GET | Authenticated | System summary metrics |
| `/api/stations` | GET | Authenticated | List all river monitoring stations |
| `/api/stations/:id` | GET | Authenticated | Retrieve single station details |
| `/api/stations` | POST, PUT, DELETE | Admin | Manage monitoring stations |
| `/api/readings` | POST | Admin, Observer | Add new water level / rain reading |
| `/api/readings/station/:id` | GET | Authenticated | Station reading history (oldest to newest) |
| `/api/zones` | GET | Authenticated | List flood-prone zones |
| `/api/zones` | POST, PUT, DELETE | Admin | Manage flood zones |
| `/api/alerts` | GET | Authenticated | List all alerts (history & active) |
| `/api/alerts/active` | GET | Authenticated | List only active alerts |
| `/api/alerts/:id/resolve` | PATCH | Admin | Mark active alert as resolved |
