# Enterprise Inventory & Order Management System

A production-ready, full-stack Inventory & Order Management System built with FastAPI, React, and PostgreSQL. It features robust transaction handling, inventory level control with audit logs, and a clean professional dashboard.

---

## Architecture & Project Structure

The project is split into a separated backend (FastAPI) and frontend (React).

```text
inventory-management-system/
├── backend/
│   ├── app/
│   │   ├── core/           # Configuration and settings
│   │   ├── database/       # DB session, migrations, and seeds
│   │   ├── models/         # SQLAlchemy schemas
│   │   ├── schemas/        # Pydantic models
│   │   ├── routers/        # API endpoints
│   │   └── services/       # Core business logic (Orders, CSV, Audits)
│   ├── main.py             # Entrypoint
│   ├── alembic.ini         # Database migrations configurations
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # Skeletons, dialogs, breadcrumbs
│   │   ├── context/        # Global Toast & Dark Mode states
│   │   ├── layouts/        # Dashboard layout sidebar
│   │   ├── pages/          # React router views
│   │   ├── services/       # Axios API client
│   │   ├── App.js          # Routes config
│   │   └── index.js
│   ├── nginx.conf          # Nginx production proxy
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Features

- **Dashboard**: High-level sales KPIs (Revenue, Orders, Products, Customers), low stock warning banners, revenue charts (Recharts), and audit trail logs.
- **Product Catalog**: Paginated, sortable, and searchable product table with filtering options, manual stock adjustment forms, image uploads, and audit log history.
- **Customer Directory**: Customer profiles, email verification format, phone validators, and cascade relation tracking.
- **Order Processing**: Multi-line invoice generator with search autocomplete, real-time total updates, stock validations, and transactional safety (database rollback).
- **Data Export**: One-click Excel-compatible CSV exports for products and orders.
- **Theme**: Premium light & dark mode modes support.

---

## Running with Docker (Recommended)

1. Clone or copy this repository.
2. In the root directory, run:
   ```bash
   docker-compose up --build
   ```
3. Once running:
   - Frontend application: `http://localhost:3000`
   - FastAPI Interactive Docs: `http://localhost:8000/docs`
   - Database port: `localhost:5432`

The system automatically initializes tables and inserts realistic seed data on container startup.

---

## Running Locally (Development Mode)

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL server active (or sqlite during local fallback testing)

### Backend Configuration
1. Navigate to `backend/` folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate # Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment template:
   ```bash
   cp ../.env.example .env
   ```
   *(Update connection string if needed. By default, it will fall back to PostgreSQL or SQLite if postgres is not active).*
5. Start development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Configuration
1. Navigate to `frontend/` folder:
   ```bash
   cd ../frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Start React server:
   ```bash
   npm start
   ```
   *(Runs on `http://localhost:3000`)*

---

## API Documentation

FastAPI auto-generates Swagger UI docs at `/docs`. Below is a summary of major endpoints.

### Products API
- `GET /api/products` - List products (Pagination: `page`, `limit`, Search: `search`, Filter: `low_stock`)
- `POST /api/products` - Create product
- `GET /api/products/{id}` - Get product detail
- `PUT /api/products/{id}` - Edit product specs
- `DELETE /api/products/{id}` - Delete product
- `POST /api/products/{id}/image` - Upload product image file
- `GET /api/products/{id}/audit` - Get product inventory adjustment logs
- `GET /api/products/export/csv` - Download products catalog CSV

### Customers API
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `DELETE /api/customers/{id}` - Remove customer profile

### Orders API
- `GET /api/orders` - List order invoices
- `POST /api/orders` - Process new order (checks stock availability, performs transactional decrease, and updates audit records)
- `GET /api/orders/{id}` - Get invoice details
- `DELETE /api/orders/{id}` - Delete order (cancels sale and restocks items back to inventory)
- `GET /api/orders/export/csv` - Download order records CSV

### Dashboard API
- `GET /api/dashboard` - Get KPI cards, low stock alerts, weekly charts, and recent activity feed.

---

## Deployment Steps

### Backend Deployment (Render / Railway / Fly.io)
1. **Database**: Provision a PostgreSQL instance.
2. **Environment Variables**: Add:
   - `DATABASE_URL` (pointing to your production postgres instance)
   - `SECRET_KEY` (a secure random string)
3. **Build Command**: Set build commands on deployment server:
   ```bash
   pip install -r requirements.txt
   ```
4. **Start Command**: Run uvicorn:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

### Frontend Deployment (Vercel / Netlify / Cloudflare Pages)
1. Set the build environment variable `REACT_APP_API_URL` pointing to your deployed backend API URL (e.g. `https://your-backend-api.onrender.com`).
2. Set build configurations:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `build`
3. Configure Redirect Rules for client-side routing.
   - For **Netlify**: Create a `_redirects` file in the build output folder with `/* /index.html 200`.
   - For **Vercel**: Create a `vercel.json` file:
     ```json
     {
       "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
     }
     ```
