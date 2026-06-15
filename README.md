# DevPulse API

A RESTful Issue Tracking System built with Express.js, TypeScript, PostgreSQL, and JWT Authentication. The API allows team members to register, authenticate, create issues, manage issue reports, and enforce role-based permissions.

## Live URL

```
https://your-live-url.com
```

## Features

### Authentication

* User registration
* User login with JWT
* Password hashing using bcrypt
* Protected routes with token verification

### Issue Management

* Create issue
* Get all issues with filtering and sorting
* Get single issue
* Update issue
* Delete issue

### Authorization

* Contributor and Maintainer roles
* Contributors can update only their own open issues
* Maintainers can update any issue
* Maintainers can delete issues

### API Standards

* Consistent success responses
* Consistent error responses
* Environment variable configuration
* Modular architecture
* PostgreSQL database integration

---

# Tech Stack

### Backend

* Node.js
* Express.js
* TypeScript

### Database

* PostgreSQL

### Authentication

* JWT (jsonwebtoken)
* bcrypt

### Development Tools

* tsx
* dotenv

---

# Project Structure

```
src
│
├── app
│   ├── config
│   ├── middleware
│   ├── modules
│   │   ├── auth
│   │   └── issue
│   ├── routes
│   └── utils
│
├── db
│
├── server.ts
└── app.ts
```

---

# Installation & Setup

## 1. Clone Repository

```bash
git clone <repository-url>
cd devpulse-api
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000

DB_CONNECTION=postgresql://username:password@localhost:5432/devpulse

JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=1d
```

## 4. Start Development Server

```bash
npm run dev
```

Server runs on:

```txt
http://localhost:3000
```

---

# API Endpoints

## Authentication

### Register User

```http
POST /api/auth/signup
```

### Login User

```http
POST /api/auth/login
```

---

## Issues

### Create Issue

```http
POST /api/issues
```

Access: Authenticated Users

### Get All Issues

```http
GET /api/issues
```

Query Parameters:

| Parameter | Values                      |
| --------- | --------------------------- |
| sort      | newest, oldest              |
| type      | bug, feature_request        |
| status    | open, in_progress, resolved |

Example:

```http
GET /api/issues?sort=newest&type=bug
```

### Get Single Issue

```http
GET /api/issues/:id
```

### Update Issue

```http
PATCH /api/issues/:id
```

Access Rules:

* Maintainer → Any issue
* Contributor → Own issue only
* Contributor → Issue status must be open

### Delete Issue

```http
DELETE /api/issues/:id
```

Access:

* Maintainer only

---

# Database Schema Summary

## Users Table

| Field      | Type                     |
| ---------- | ------------------------ |
| id         | SERIAL PRIMARY KEY       |
| name       | VARCHAR(255)             |
| email      | VARCHAR(255) UNIQUE      |
| password   | TEXT                     |
| role       | contributor / maintainer |
| created_at | TIMESTAMP                |
| updated_at | TIMESTAMP                |

### SQL

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'contributor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Issues Table

| Field       | Type                          |
| ----------- | ----------------------------- |
| id          | SERIAL PRIMARY KEY            |
| title       | VARCHAR(150)                  |
| description | TEXT                          |
| type        | bug / feature_request         |
| status      | open / in_progress / resolved |
| reporter_id | INTEGER                       |
| created_at  | TIMESTAMP                     |
| updated_at  | TIMESTAMP                     |

### SQL

```sql
CREATE TABLE IF NOT EXISTS issues (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    reporter_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# Success Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

---

# Error Response Format

```json
{
  "success": false,
  "message": "Something went wrong",
  "errors": {}
}
```

---

# Author

Alamin

Backend Developer | TypeScript | Express.js | PostgreSQL
