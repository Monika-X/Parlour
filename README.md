# 🌸 Parlour – Premium Salon & Spa Web Application

A full-stack salon management system built with HTML, Tailwind CSS, JavaScript (frontend) and Node.js + Express + MySQL (backend).

---

## 📁 Project Structure

```
Parlour Website/
├── client/                     # Frontend
│   ├── index.html              # Homepage
│   ├── assets/
│   │   ├── css/style.css       # Custom CSS (glassmorphism, animations)
│   │   └── js/
│   │       ├── api.js          # Centralised API client
│   │       └── main.js         # Global utilities
│   └── pages/
│       ├── services.html       # Services browser
│       ├── booking.html        # Multi-step booking form
│       ├── staff.html          # Team page
│       ├── contact.html        # Contact form
│       ├── login.html          # Login / Register
│       └── dashboard.html      # Admin dashboard
│
└── server/                     # Backend API
    ├── app.js                  # Express entry point
    ├── .env                    # Environment variables
    ├── config/
    │   ├── db.js               # MySQL connection pool
    │   └── database.sql        # Schema + seed data
    ├── middleware/
    │   ├── auth.js             # JWT protect + role authorize
    │   ├── errorHandler.js     # Global error & 404 handlers
    │   └── validate.js         # express-validator middleware
    ├── controllers/
    │   ├── authController.js
    │   ├── serviceController.js
    │   ├── appointmentController.js
    │   ├── staffController.js
    │   ├── customerController.js
    │   └── analyticsController.js
    └── routes/
        ├── auth.js
        ├── services.js
        ├── appointments.js
        ├── staff.js
        ├── customers.js
        └── analytics.js
```

---

## 🚀 Setup & Run

### 1. Database Setup

Open MySQL and run:
```sql
SOURCE server/config/database.sql;
```

### 2. Configure Environment

Edit `server/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password   ← change this!
DB_NAME=parlour_db
JWT_SECRET=parlour_super_secret_key_2024_xYzAbC
JWT_EXPIRES_IN=7d
```

### 3. Start the Backend

```bash
cd server
npm run dev       # development (nodemon)
# or
npm start         # production
```

Server runs at: **http://localhost:5000**

### 4. Open the Frontend

Open `client/index.html` in a browser, **or** use VS Code Live Server (port 5500).

---

## 🔐 Default Credentials

| Role  | Email                | Password  |
|-------|----------------------|-----------|
| Admin | admin@parlour.com    | Admin@123 |

---

## 🌐 API Endpoints

| Method | Endpoint                        | Auth       | Description              |
|--------|---------------------------------|------------|--------------------------|
| POST   | /api/auth/register              | Public     | Register user            |
| POST   | /api/auth/login                 | Public     | Login                    |
| GET    | /api/auth/profile               | Protected  | Get own profile          |
| GET    | /api/services                   | Public     | List all services        |
| GET    | /api/services/categories        | Public     | List categories          |
| POST   | /api/services                   | Admin      | Create service           |
| GET    | /api/appointments               | Admin/Staff| List appointments        |
| POST   | /api/appointments               | Protected  | Book appointment         |
| PATCH  | /api/appointments/:id/status    | Admin/Staff| Update status            |
| GET    | /api/staff                      | Public     | List staff               |
| GET    | /api/customers                  | Admin      | List customers           |
| GET    | /api/analytics/dashboard        | Admin      | Dashboard stats          |
| GET    | /api/analytics/revenue          | Admin      | Revenue trend            |

---

## ✨ Features

- **Homepage** – Hero, services preview, team section, testimonials, stats counter, CTA
- **Services** – Searchable, category-filtered grid with live API data
- **Booking** – 4-step form: service → stylist → date/time → confirm
- **Team** – Staff grid with specialization and rating
- **Contact** – Info cards + contact form
- **Login/Register** – Tabbed auth with password strength meter
- **Admin Dashboard** – Stats, appointments table with status update, analytics charts

---

## 🛠 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | HTML5, Tailwind CSS (CDN), JavaScript |
| Backend    | Node.js, Express.js               |
| Database   | MySQL 8                           |
| Auth       | JWT + bcryptjs                    |
| Validation | express-validator                 |
| Logging    | Morgan                            |
