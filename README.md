# Flood Monitoring and Emergency Alert System

> **Problem Statement:** Authorities need real-time monitoring of river levels, rainfall, flood-prone zones, and emergency alerts to reduce flood-related losses.

A full-stack web application designed for disaster management authorities and observers to track river water levels, gauge rainfall, monitor flood-prone zones, and automatically trigger severity-based alerts.

---

## 🛠 Tech Stack (Backend)

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **CORS & Environment:** cors, dotenv
- **Development Tooling:** nodemon, concurrently

---

## 📁 Project Structure

```
flood_monitor/
├── .gitignore
├── package.json               # Root scripts (runs client and server)
├── README.md
└── server/
    ├── .env                   # Environment variables (private)
    ├── .env.example           # Example template for environment configuration
    ├── package.json           # Server dependencies and scripts
    ├── server.js              # Express app entry point
    ├── seed.js                # Database seeder (sample stations, readings, zones, users)
    ├── config/
    │   └── db.js              # MongoDB connection setup
    ├── controllers/
    │   ├── alertController.js
    │   ├── authController.js
    │   ├── dashboardController.js
    │   ├── readingController.js
    │   ├── stationController.js
    │   └── zoneController.js
    ├── middleware/
    │   └── authMiddleware.js   # JWT authentication & role authorization
    ├── models/
    │   ├── Alert.js
    │   ├── Reading.js
    │   ├── Station.js
    │   ├── User.js
    │   └── Zone.js
    ├── routes/
    │   ├── alertRoutes.js
    │   ├── authRoutes.js
    │   ├── dashboardRoutes.js
    │   ├── readingRoutes.js
    │   ├── stationRoutes.js
    │   └── zoneRoutes.js
    └── services/
        └── alertService.js    # Automatic alert evaluation logic
```

---

## 🚀 Getting Started

### 1. Install Dependencies
Run the installation command from the project root:
```bash
npm run install-all
```
*(or run `npm install` in the root and `npm install` inside the `server/` directory).*

### 2. Configure Environment Variables
Inside `server/`, create or update `.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
```

### 3. Seed Sample Data
Once your MongoDB connection URI is configured:
```bash
npm run seed
```

Default credentials seeded:
- **Administrator:** `admin@flood.com` / `Password123!`
- **Observer:** `officer@flood.com` / `Password123!`

### 4. Run Development Server
```bash
npm run dev:server
```
The server will start at `http://localhost:5000`.

Health Check:
```
GET http://localhost:5000/api/health
```

---

## 🔐 API Permissions

| Route | Method | Access | Description |
|---|---|---|---|
| `/api/auth/register` | POST | Public | Register new user |
| `/api/auth/login` | POST | Public | Login and receive JWT |
| `/api/stations` | GET | Authenticated | List all monitoring stations |
| `/api/stations/:id` | GET | Authenticated | Get station details |
| `/api/stations` | POST | Admin | Add new station |
| `/api/stations/:id` | PUT | Admin | Update station |
| `/api/stations/:id` | DELETE | Admin | Delete station |
| `/api/readings` | POST | Admin, Observer | Add new water level / rain reading |
| `/api/readings/station/:id` | GET | Authenticated | Station reading history (oldest to newest) |
| `/api/zones` | GET | Authenticated | List flood-prone zones |
| `/api/zones` | POST, PUT, DELETE | Admin | Manage flood zones |
| `/api/alerts` | GET | Authenticated | List all alerts |
| `/api/alerts/active` | GET | Authenticated | List active alerts |
| `/api/alerts/:id/resolve` | PATCH | Admin | Mark an alert as resolved |
| `/api/dashboard/summary` | GET | Authenticated | Dashboard statistics & summary counts |
