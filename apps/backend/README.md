<p align="center">
  <a href="https://www.medusajs.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    </picture>
  </a>
</p>
<h1 align="center">
  Medusa
</h1>

<h4 align="center">
  <a href="https://docs.medusajs.com">Documentation</a> |
  <a href="https://www.medusajs.com">Website</a>
</h4>

<p align="center">
  Building blocks for digital commerce
</p>
<p align="center">
  <a href="https://github.com/medusajs/medusa/blob/master/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />
  </a>
    <a href="https://www.producthunt.com/posts/medusa"><img src="https://img.shields.io/badge/Product%20Hunt-%231%20Product%20of%20the%20Day-%23DA552E" alt="Product Hunt"></a>
  <a href="https://discord.gg/xpCwq3Kfn8">
    <img src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" alt="Discord Chat" />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=medusajs">
    <img src="https://img.shields.io/twitter/follow/medusajs.svg?label=Follow%20@medusajs" alt="Follow @medusajs" />
  </a>
</p>

## Compatibility

This starter is compatible with versions >= 2 of `@medusajs/medusa`. 

## Getting Started

Visit the [Quickstart Guide](https://docs.medusajs.com/learn/installation) to set up a server.

Visit the [Docs](https://docs.medusajs.com/learn/installation#get-started) to learn more about our system requirements.

## What is Medusa

Medusa is a set of commerce modules and tools that allow you to build rich, reliable, and performant commerce applications without reinventing core commerce logic. The modules can be customized and used to build advanced ecommerce stores, marketplaces, or any product that needs foundational commerce primitives. All modules are open-source and freely available on npm.

Learn more about [Medusa’s architecture](https://docs.medusajs.com/learn/introduction/architecture) and [commerce modules](https://docs.medusajs.com/learn/fundamentals/modules/commerce-modules) in the Docs.

## Community & Contributions

The community and core team are available in [GitHub Discussions](https://github.com/medusajs/medusa/discussions), where you can ask for support, discuss roadmap, and share ideas.

Join our [Discord server](https://discord.com/invite/medusajs) to meet other community members.

## Other channels

- [GitHub Issues](https://github.com/medusajs/medusa/issues)
- [Twitter](https://twitter.com/medusajs)
- [LinkedIn](https://www.linkedin.com/company/medusajs)
- [Medusa Blog](https://medusajs.com/blog/)




# Medusa v2 E-Commerce Backend Setup Guide
## Complete Installation Guide for Windows Development Environment

**Project:** TapesForYou E-Commerce Platform  
**Version:** 1.0  
**Last Updated:** May 2026

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Database Setup](#database-setup)
4. [Project Configuration](#project-configuration)
5. [Running the Server](#running-the-server)
6. [Custom Module Setup](#custom-module-setup)
7. [Troubleshooting](#troubleshooting)
8. [Quick Reference](#quick-reference)

---

## Prerequisites

### Required Software

| Software | Version | Download Link | Verification Command |
|----------|---------|---------------|---------------------|
| Node.js | 20.x or higher | [nodejs.org](https://nodejs.org/) | `node --version` |
| PostgreSQL | 16.x | [postgresql.org](https://www.postgresql.org/download/windows/) | `psql --version` |
| Redis | 3.0.504+ | [Microsoft Archive](https://github.com/microsoftarchive/redis/releases) | `redis-cli ping` |
| Git | 2.x | [git-scm.com](https://git-scm.com/downloads/win) | `git --version` |
| Medusa CLI | Latest | Via npm | `medusa --version` |

### System Requirements
- Windows 10/11 (64-bit)
- 8GB RAM minimum (16GB recommended)
- 10GB free disk space
- Administrator access (for service installation)

---

## Installation Steps

### Step 1: Install Node.js

```powershell
# Download Node.js LTS from official website
# Run installer with default options

# Verify installation
node --version
# Expected: v20.x.x or higher

npm --version
# Expected: 10.x.x or higher
```

### Step 2: Install PostgreSQL

```powershell
# Download PostgreSQL 16 installer
# Run with these settings:
# - Installation Directory: C:\Program Files\PostgreSQL\16
# - Data Directory: C:\Program Files\PostgreSQL\16\data
# - Password: medusa_password (remember this!)
# - Port: 5432
# - Locale: English, United States

# Add to PATH (if not auto-added)
# System Properties → Environment Variables → Path → Add:
# C:\Program Files\PostgreSQL\16\bin

# Verify installation
psql --version
# Expected: psql (PostgreSQL) 16.x

# Test connection
psql -U postgres -h localhost -p 5432
# Password: medusa_password
# Type \q to exit
```

### Step 3: Install Redis

```powershell
# Download Redis-x64-3.0.504.msi from GitHub
# Run installer with default settings

# Start Redis service
net start redis

# Verify Redis is working
redis-cli ping
# Expected: PONG

# Stop Redis (when needed)
net stop redis
```

### Step 4: Install Medusa CLI

```powershell
# Install globally
npm install -g @medusajs/medusa-cli

# Verify installation
medusa --version
# Expected: @medusajs/medusa-cli/x.x.x
```

---

## Database Setup

### Create Medusa Database

```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database (run these SQL commands)
CREATE DATABASE medusa_db;

# Create dedicated user (optional but recommended)
CREATE USER medusa_user WITH PASSWORD 'medusa_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE medusa_db TO medusa_user;

# Exit psql
\q

# Verify database exists
psql -U postgres -d medusa_db -c "\dt"
# Expected: No relations found (normal for new database)
```

---

## Project Configuration

### Step 1: Create New Medusa Project

```powershell
# Create project
npx create-medusa-app@latest tapesforyou-backend

# When prompted:
# - Choose database: PostgreSQL
# - Database URL: postgres://postgres:medusa_password@localhost:5432/medusa_db
# - Starter template: None

# Navigate to project
cd tapesforyou-backend
```

### Step 2: Configure Environment Variables

Create `.env` file in project root:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_URL=postgres://postgres:medusa_password@localhost:5432/medusa_db

# ============================================
# REDIS CONFIGURATION
# ============================================
REDIS_URL=redis://localhost:6379

# ============================================
# SERVER CONFIGURATION
# ============================================
BACKEND_URL=http://localhost:9000
PORT=9000

# ============================================
# SECURITY (Generate these using command below)
# ============================================
JWT_SECRET=your-32-byte-hex-string-here
COOKIE_SECRET=your-32-byte-hex-string-here

# ============================================
# ADMIN USER
# ============================================
MEDUSA_ADMIN_EMAIL=admin@tapesforyou.com
MEDUSA_ADMIN_PASSWORD=Admin123!

# ============================================
# CORS CONFIGURATION
# ============================================
STORE_CORS=http://localhost:3000,http://localhost:8000
ADMIN_CORS=http://localhost:9000
AUTH_CORS=http://localhost:3000,http://localhost:8000,http://localhost:9000

# ============================================
# SESSION
# ============================================
SESSION_SECRET=session-secret-key-min-32-chars-long
```

### Step 3: Generate Security Keys

```powershell
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate COOKIE_SECRET  
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output and paste into .env file
```

### Step 4: Initialize Database

```powershell
# Test database connection
npx medusa db:check
# Expected: ✅ Database connection successful

# Run initial migrations
npx medusa db:migrate
# Expected: ✅ Migration completed successfully

# Create admin user
npx medusa user --email admin@tapesforyou.com --password Admin123!
# Expected: ✅ User created successfully
```

### Step 5: Start Development Server

```powershell
npm run dev

```
**Expected output:**
```
✔ Server is ready on port: 9000
✔ Database connection established
✔ Redis connection established
✔ Admin dashboard available at: http://localhost:9000/app
```

---

## Custom Module Setup

### Step 1: Create Module Structure

```powershell
# Create directories
mkdir src\modules\tapesforyou
mkdir src\modules\tapesforyou\models
mkdir src\modules\tapesforyou\services
```

### Step 2: Create Model Files

**File:** `src/modules/tapesforyou/models/tape-product.ts`
```typescript
import { model } from "@medusajs/framework/utils"

export const TapeProductMeta = model.define("tape_product_meta", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  tape_type: model.enum(["BOPP", "PET", "PVC", "Masking"]),
  width_mm: model.number(),
  length_m: model.number(),
  micron: model.number(),
  hsn_code: model.text(),
  gst_slab: model.number(),
})
```

**File:** `src/modules/tapesforyou/models/index.ts`
```typescript
export { TapeProductMeta } from "./tape-product"
```

### Step 3: Create Service

**File:** `src/modules/tapesforyou/service.ts`
```typescript
import { MedusaService } from "@medusajs/framework/utils"
import { TapeProductMeta } from "./models"

class TapesForYouModuleService extends MedusaService({
  tapeProductMeta: TapeProductMeta,
}) {}

export default TapesForYouModuleService
```

### Step 4: Create Module Definition

**File:** `src/modules/tapesforyou/index.ts`
```typescript
import TapesForYouModuleService from "./service"
import { TapeProductMeta } from "./models"

export default {
  service: TapesForYouModuleService,
  models: [TapeProductMeta],
}
```

### Step 5: Register Module

**Edit `medusa-config.ts`:**

```typescript
import { defineConfig } from "@medusajs/framework/utils"

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS,
      adminCors: process.env.ADMIN_CORS,
      authCors: process.env.AUTH_CORS,
    },
  },
  modules: {
    tapesforyou: {
      resolve: "./src/modules/tapesforyou",
    },
  },
})
```

### Step 6: Generate and Run Migrations

```powershell
# Generate migration for custom module
npx medusa db:generate tapesforyou

# Run migrations
npx medusa db:migrate

# Verify tables created
psql -U postgres -d medusa_db -c "\dt"
# You should see: tape_product_meta table
```

---

## Running the Server

### Start All Services

```powershell
# Terminal 1: Start PostgreSQL
net start postgresql-x64-16

# Terminal 2: Start Redis  
net start redis

# Terminal 3: Start Medusa
cd tapesforyou-backend
npm run dev
```

### Access Admin Dashboard

1. Open browser: `http://localhost:9000/app`
2. Login with:
   - Email: `admin@tapesforyou.com`
   - Password: `Admin123!`

### Test API Endpoints

```powershell
# Test store API
curl http://localhost:9000/store/products

# Test admin API (requires auth token)
curl http://localhost:9000/admin/products
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: "PostgreSQL password authentication failed"

```powershell
# Reset PostgreSQL password
psql -U postgres -c "ALTER USER postgres PASSWORD 'medusa_password';"

# Update .env file with same password
```

#### Issue 2: "Redis connection refused"

```powershell
# Check if Redis is running
redis-cli ping

# Start Redis service
net start redis

# If Redis not installed, reinstall from Microsoft archive
```

#### Issue 3: "Port 9000 already in use"

```powershell
# Find process using port 9000
netstat -ano | findstr :9000

# Kill process (replace PID with number)
taskkill /PID 12345 /F

# Or change port in medusa-config.ts
```

#### Issue 4: "Could not resolve 'userService'"

```powershell
# Update Medusa to latest version
npm install @medusajs/medusa@latest

# Re-run migrations
npx medusa db:migrate

# Create user with invite method
npx medusa user --email admin@tapesforyou.com --invite
```

#### Issue 5: "Database medusa_db does not exist"

```powershell
# Create database
psql -U postgres -c "CREATE DATABASE medusa_db;"

# Grant privileges
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE medusa_db TO postgres;"
```

### Service Management

```powershell
# PostgreSQL
net start postgresql-x64-16
net stop postgresql-x64-16
net restart postgresql-x64-16

# Redis
net start redis
net stop redis
```

---

## Quick Reference

### Daily Development Commands

```powershell
# Start all services
net start postgresql-x64-16
net start redis
cd tapesforyou-backend
npm run dev

# Stop all services  
net stop postgresql-x64-16
net stop redis
```

### Database Commands

```powershell
# Connect to database
psql -U postgres -d medusa_db

# List all tables
\dt

# Describe table
\d table_name

# Exit psql
\q
```

### Medusa CLI Commands

```powershell
# Database management
npx medusa db:check          # Test connection
npx medusa db:migrate        # Run migrations
npx medusa db:generate       # Generate migrations
npx medusa db:seed           # Seed sample data

# User management
npx medusa user --email admin@example.com --password pass
npx medusa user --email admin@example.com --invite

# Development
npm run dev                  # Start development server
npm run build                # Build for production
npm run start                # Start production server
```

### Useful SQL Queries

```sql
-- Check admin user exists
SELECT email, role FROM "user";

-- List all tables
SELECT table_name FROM information_schema.tables WHERE table_schema='public';

-- Count records in custom table
SELECT COUNT(*) FROM tape_product_meta;

-- View recent orders
SELECT id, email, created_at, total FROM "order" ORDER BY created_at DESC LIMIT 10;
```

---

## Project Structure

```
tapesforyou-backend/
├── src/
│   ├── api/                    # Custom API routes
│   │   └── store/              # Storefront endpoints
│   │   └── admin/              # Admin endpoints
│   ├── modules/                # Custom modules
│   │   └── tapesforyou/        # Your custom module
│   │       ├── models/         # Data models (DML)
│   │       ├── services/       # Service logic
│   │       └── index.ts        # Module definition
│   ├── jobs/                   # Scheduled jobs
│   ├── subscribers/            # Event subscribers
│   └── workflows/              # Custom workflows
├── medusa-config.ts            # Main configuration
├── package.json                # Dependencies
├── .env                        # Environment variables
├── tsconfig.json               # TypeScript config
└── README.md                   # This file
```

---

## Support & Resources

### Official Documentation
- [Medusa Documentation](https://docs.medusajs.com/)
- [Medusa GitHub](https://github.com/medusajs/medusa)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Redis Docs](https://redis.io/documentation)

### Project-Specific
- **Project Name:** TapesForYou
- **Backend URL:** http://localhost:9000
- **Admin URL:** http://localhost:9000/app
- **API Base:** http://localhost:9000/store

### Contact
For development issues related to this setup:
- Create issue in project repository
- Refer to troubleshooting section above
- Check Medusa Discord community

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | May 2026 | Initial setup guide for Windows |

---

## License

This setup guide is proprietary to TapesForYou project.

---

**✅ Setup Complete!** Your Medusa backend is now ready for development.