# Supabase Integration Guide

This backend uses **Supabase** for:
- **Database**: Managed PostgreSQL
- **Authentication**: JWT validation for API requests
- **Storage**: Media file storage (images, videos)

## 📦 Setup

### 1. Create a Supabase Project

1. Go to [database.new](https://database.new) and create a new project.
2. Save your database password securely.

### 2. Get Credentials

Go to **Project Settings -> API** and copy:
- **Project URL**
- **anon public key**
- **service_role key**

Update your `.env.dev` file:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Database Connection

Go to **Project Settings -> Database -> Connection string** and copy the **URI (Session pooler)** mode string.

Update `.env.dev`:
```bash
DATABASE_URL=postgresql://postgres.ref:[PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres
```

### 4. Storage Setup

1. Go to **Storage**.
2. Create a new public bucket named `motorove`.
3. Add policies to allow public read access.

## 🔐 Authentication

The backend verifies Supabase JWT tokens passed in the `Authorization` header.

```bash
Authorization: Bearer <SUPABASE_JWT>
```

## 🔄 Local Development

You can use the remote Supabase instance for local development, or use the Supabase CLI to run logically.

Currently we recommend connecting to the remote development instance.
