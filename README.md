# 🚀 QR Code Generator API — Production REST API

A high-performance, production-ready **REST API for generating and managing customizable QR codes** built with **Node.js, Express.js, TypeScript, MongoDB, and Mongoose**.

Features enterprise-grade security (JWT authentication, bcrypt password hashing, Helmet headers, CORS, Zod validation, rate limiting, and Winston structured logging), rich customization (SVG/PNG/DataURL, colors, margins, error correction levels, central logo embedding), and full OpenAPI 3.0 documentation.
<image src="./assets/qr-code.png">
---

## 📑 Table of Contents

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Architecture & Folder Structure](#-architecture--folder-structure)
4. [Supported QR Types](#-supported-qr-types)
5. [Getting Started](#-getting-started)
   - [Prerequisites](#prerequisites)
   - [Environment Variables](#environment-variables)
   - [Installation & Local Run](#installation--local-run)
   - [Running with Docker](#running-with-docker)
6. [API Endpoints Reference](#-api-endpoints-reference)
7. [Authentication Flow](#-authentication-flow)
8. [cURL Examples](#-curl-examples)
9. [OpenAPI / Swagger Documentation](#-openapi--swagger-documentation)
10. [Automated Testing](#-automated-testing)
11. [Production & Deployment](#-production--deployment)

---

## ✨ Features

- **Multi-Type QR Generation**:
  - 🌐 **URL & Plain Text**
  - 📶 **Wi-Fi** (WPA/WPA2, WEP, Open networks with automatic string escaping)
  - 📇 **vCard 3.0 Contact Cards** (Full name, phone, email, company, title, website, address)
  - ✉️ **Email** (Recipient, subject, prefilled body)
  - 📞 **Phone Call** (`tel:` protocol)
  - 💬 **SMS Message** (`smsto:` protocol with recipient and message body)
  - 📍 **Geolocation** (`geo:` coordinates)
  - ₿ **Crypto** (Bitcoin / cryptocurrency payments with amount and message)
- **Advanced Customization**:
  - Dimensions (`100px` to `2000px`)
  - Margin padding (`0` to `20` modules)
  - Error correction levels: `L` (7%), `M` (15%), `Q` (25%), `H` (30%)
  - Custom Hex foreground & background colors (including transparent backgrounds)
  - Multi-format output: `PNG`, `SVG`, `Data URL`
  - Central logo embedding with automatic high-error correction protection
- **Authentication & History**:
  - User registration & login with secure bcrypt password hashing
  - JWT Bearer Token stateless authentication
  - User history with server-side pagination, search, type filtering, and sorting
  - Single QR inspection and deletion with strict ownership authorization
  - Public anonymous generation endpoint with strict rate limiting
- **Security & Reliability**:
  - **Helmet** HTTP security headers
  - **CORS** configuration with preflight caching
  - **Zod** schema validation on Request Body, Query, and Params
  - **express-rate-limit** DDoS & brute-force protection
  - **Winston** structured JSON logging
  - **MongoDB / Mongoose** with indexed queries and resilient in-memory fallback
  - Centralized error handling and standardized response envelope

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Runtime** | Node.js (v18+) & TypeScript |
| **Framework** | Express.js / Next.js API Routes |
| **Database** | MongoDB (v6+) with Mongoose ORM |
| **QR Engine** | `qrcode` npm engine |
| **Security** | JWT (`jsonwebtoken`), `bcryptjs`, `helmet`, `cors`, `express-rate-limit` |
| **Validation**| `zod` |
| **Logging** | `winston` structured logger |
| **Testing** | `jest`, `ts-jest`, `supertest` |
| **Container** | Docker & Docker Compose |
| **Docs** | OpenAPI 3.0 / Swagger UI |

---

## 🏛 Architecture & Folder Structure

```text
├── src/
│   ├── config/
│   │   ├── env.ts             # Typed environment variables
│   │   ├── database.ts        # MongoDB connection lifecycle & resilience
│   │   └── logger.ts          # Winston structured logger configuration
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts # User auth route handlers
│   │   ├── qr.controller.ts   # QR generation & management handlers
│   │   └── health.controller.ts # Health check & telemetry handler
│   │
│   ├── services/
│   │   ├── auth.service.ts    # User credential & token business logic
│   │   ├── qr.service.ts      # QR formatting, styling, and persistence
│   │   └── storage.service.ts # Safe logo file validation & processing
│   │
│   ├── models/
│   │   ├── User.ts            # Mongoose User model & password hooks
│   │   ├── QRCode.ts          # Mongoose QR code model with indexes
│   │   └── dbAdapter.ts       # Unified DB repository & resilient fallback
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts       # JWT Bearer token validator
│   │   ├── validation.middleware.ts # Zod body/query/params validator
│   │   ├── rateLimit.middleware.ts  # Tiered rate limiting
│   │   ├── error.middleware.ts      # Global centralized error handler
│   │   └── logger.middleware.ts     # Request lifecycle logger
│   │
│   ├── validators/
│   │   ├── auth.validator.ts  # Auth request Zod schemas
│   │   └── qr.validator.ts    # QR generation & query schemas
│   │
│   ├── utils/
│   │   ├── apiResponse.ts     # Standardized JSON response envelope
│   │   ├── errors.ts          # Standard AppError HTTP hierarchy
│   │   ├── jwt.ts             # JWT sign & verify utility
│   │   └── qrFormatter.ts     # Protocol formatters (vCard, Wi-Fi, etc.)
│   │
│   ├── docs/
│   │   └── openapi.json       # OpenAPI 3.0 specification
│   │
│   ├── app.ts                 # Express app assembly & middleware stack
│   └── server.ts              # Production HTTP entry point & graceful shutdown
│
├── tests/
│   ├── auth.test.ts           # Auth endpoint integration tests
│   ├── qr.test.ts             # QR generation & history integration tests
│   └── health.test.ts         # Health check integration tests
│
├── Dockerfile                 # Multi-stage production container build
├── docker-compose.yml         # Containerized API + MongoDB service
└── .env.example               # Environment variables specification
```

---

## 📦 Supported QR Types & Formatting

| Type | Fields | Output Protocol |
| :--- | :--- | :--- |
| `text` | `data` | Plain string |
| `url` | `data` or `url` | Standard URI |
| `wifi` | `ssid`, `password`, `encryption` (`WPA` / `WEP` / `Open`), `hidden` | `WIFI:T:WPA;S:SSID;P:Pass;;` |
| `vcard` | `firstName`, `lastName`, `phone`, `email`, `company`, `title`, `website`, `street`, `city`, `state`, `zipCode`, `country` | `BEGIN:VCARD\nVERSION:3.0\n...` |
| `email`| `email`, `subject`, `body` | `mailto:user@domain.com?subject=...` |
| `phone`| `phone` | `tel:+1234567890` |
| `sms`  | `phone`, `message` | `smsto:+1234567890:Message` |
| `geo`  | `latitude`, `longitude` | `geo:37.7749,-122.4194` |
| `crypto`| `address`, `currency`, `amount` | `bitcoin:1A1zP1e...?amount=0.01` |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **MongoDB**: v6.0 or higher (or use Docker Compose)
- **npm** or **pnpm** or **yarn**

### Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Configure the values in `.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/qr-generator
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
MAX_FILE_SIZE=5242880
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_PUBLIC=60
RATE_LIMIT_MAX_AUTH=300
```

### Installation & Local Run

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run tests**:
   ```bash
   npm test
   ```

3. **Start API development server**:
   ```bash
   npm run dev
   ```

---

## 🐳 Running with Docker

You can launch the entire stack (Express API + MongoDB with persistent volumes) using Docker Compose:

```bash
# Build and run containers in background
docker compose up --build -d

# View real-time logs
docker compose logs -f api

# Stop containers
docker compose down
```

---

## 🌐 API Endpoints Reference

### Base URL: `/api/v1`

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/health` | No | System health and database status |
| `POST` | `/auth/register` | No | Register a new user account |
| `POST` | `/auth/login` | No | Login and obtain JWT token |
| `GET` | `/auth/me` | **Yes** | Get current authenticated user profile |
| `POST` | `/qr/generate` | No | Generate QR code anonymously (rate-limited) |
| `POST` | `/qr/upload-logo` | No / Yes | Upload and validate logo image |
| `POST` | `/qr` | **Yes** | Generate and save QR code to history |
| `GET` | `/qr` | **Yes** | List user's saved QR codes (paginated) |
| `GET` | `/qr/:id` | **Yes** | Get a single saved QR code by ID |
| `DELETE` | `/qr/:id` | **Yes** | Delete a saved QR code by ID |
| `GET` | `/docs/openapi.json` | No | OpenAPI 3.0 specification JSON |

---

## 📋 cURL Examples

### 1. Health Check
```bash
curl -X GET http://localhost:5000/api/v1/health
```

### 2. User Registration
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Developer",
    "email": "jane@example.com",
    "password": "StrongPassword123!"
  }'
```

### 3. User Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "StrongPassword123!"
  }'
```

### 4. Anonymous Wi-Fi QR Code Generation
```bash
curl -X POST http://localhost:5000/api/v1/qr/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "wifi",
    "ssid": "Office_Guest_WiFi",
    "password": "SecurePassword2026",
    "encryption": "WPA",
    "options": {
      "size": 400,
      "margin": 4,
      "foregroundColor": "#0f172a",
      "backgroundColor": "#ffffff",
      "format": "png",
      "errorCorrectionLevel": "H"
    }
  }'
```

### 5. Anonymous vCard Contact QR Code
```bash
curl -X POST http://localhost:5000/api/v1/qr/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "vcard",
    "firstName": "Alex",
    "lastName": "Rivera",
    "phone": "+1 (555) 019-2834",
    "email": "alex.rivera@techcorp.io",
    "company": "TechCorp Solutions",
    "title": "Principal Architect",
    "website": "https://techcorp.io",
    "options": {
      "format": "svg",
      "foregroundColor": "#1e293b",
      "backgroundColor": "#f8fafc"
    }
  }'
```

### 6. Authenticated QR Code Save
```bash
curl -X POST http://localhost:5000/api/v1/qr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "title": "Production Website Link",
    "type": "url",
    "data": "https://myapp.production.com",
    "options": {
      "size": 500,
      "format": "png"
    }
  }'
```

### 7. Query User History with Filters & Pagination
```bash
curl -X GET "http://localhost:5000/api/v1/qr?page=1&limit=10&type=url&search=production&sort=createdAt:desc" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

## 🧪 Automated Testing

The suite uses **Jest** and **Supertest** with an in-memory database adapter for fast, deterministic, non-blocking test execution:

```bash
# Run all tests
npm test

# Run tests in watch mode
npx jest --watch

# Run with coverage report
npx jest --coverage
```

Test coverage includes:
- ✅ User Registration & Validation
- ✅ Password Strength Constraints & Duplication Handling
- ✅ Login Credentials & Token Generation
- ✅ Protected Routes Authorization
- ✅ Multi-Type QR Generation (Text, URL, Wi-Fi, vCard, Email, Phone, SMS, Geo)
- ✅ Customization (Size, Margin, Colors, Error Correction, SVG/PNG formats)
- ✅ History Persistence, Search, Filtering, and Pagination
- ✅ Resource Ownership & Deletion Security
- ✅ System Health Check & Telemetry

---

## 🚢 Production & Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Run in production mode**:
   ```bash
   NODE_ENV=production npm start
   ```

3. **Key Production Recommendations**:
   - Ensure a robust `JWT_SECRET` is set in production secrets.
   - Point `MONGODB_URI` to a replica set or MongoDB Atlas cluster.
   - Deploy behind a reverse proxy (e.g. Nginx, Cloudflare, Cloud Run, AWS ECS).
   - Configure custom rate limit tiers based on client IP / API keys.

---

## 📄 License

This project is licensed under the MIT License.
