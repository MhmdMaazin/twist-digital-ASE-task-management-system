# Task Management System

A secure, full-stack task management application built with Next.js 15, MongoDB, and TypeScript. Features include user authentication, CRUD operations for tasks, real-time statistics, and comprehensive security measures.

## 🚀 Live Demo

**Deployed URL**: [Will be added after deployment]

## 📋 Features

### Core Functionality
- ✅ **User Authentication** - Secure registration and login with JWT tokens
- ✅ **Task Management** - Create, read, update, and delete tasks
- ✅ **Task Organization** - Status (To Do, In Progress, Done) and Priority (Low, Medium, High)
- ✅ **Task Statistics** - Real-time dashboard with task counts
- ✅ **Due Dates** - Optional due date tracking
- ✅ **Route Protection** - Protected dashboard requiring authentication

### Security Features
- 🔒 **Password Hashing** - bcrypt with 12 rounds
- 🔒 **JWT Authentication** - Short-lived access tokens (15 min) with refresh tokens (7 days)
- 🔒 **Rate Limiting** - Protects against brute force attacks (5 req/min for auth, 100 req/min for API)
- 🔒 **Input Validation** - Zod schemas for runtime validation + Mongoose schemas
- 🔒 **Security Headers** - CSP, X-Frame-Options, HSTS, etc.
- 🔒 **NoSQL Injection Prevention** - Sanitized inputs and strict validation
- 🔒 **CSRF Protection** - SameSite cookies
- 🔒 **Error Handling** - No stack trace leaks in production

### UI/UX
- 🎨 **Responsive Design** - Mobile-first, works on all devices
- 🎨 **Accessibility** - ARIA labels, keyboard navigation, semantic HTML
- 🎨 **Loading States** - Skeleton loaders and spinners
- 🎨 **Error States** - User-friendly error messages
- 🎨 **Form Validation** - Real-time validation with helpful error messages

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - App Router with React Server Components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database
- **Mongoose** - ODM with schema validation
- **Jose** - JWT handling for edge runtime
- **bcryptjs** - Password hashing

### Security & DevOps
- **Zod** - Runtime type validation
- **@upstash/ratelimit** - Distributed rate limiting
- **Next.js Middleware** - Security headers and CORS

## 📦 Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **MongoDB** - Local installation or MongoDB Atlas account
- **(Optional) Upstash Redis** - For distributed rate limiting

## 🚀 Getting Started

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd task-management-system
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Environment Setup

Create a \`.env.local\` file in the root directory:

\`\`\`env
# MongoDB Connection
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/task-management

# OR MongoDB Atlas (recommended for production)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/task-management?retryWrites=true&w=majority

# JWT Secrets (Generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret-change-this

# Upstash Redis (Optional - for distributed rate limiting)
# Sign up at https://upstash.com for free tier
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
\`\`\`

### 4. Generate Secure Secrets

\`\`\`bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Minimum 0 -Maximum 256}))
\`\`\`

Use these generated strings for \`JWT_SECRET\` and \`JWT_REFRESH_SECRET\`.

### 5. Setup MongoDB

**Option A: Local MongoDB**

1. Install MongoDB: https://www.mongodb.com/docs/manual/installation/
2. Start MongoDB:
\`\`\`bash
# On Mac/Linux
mongod

# On Windows
net start MongoDB
\`\`\`

**Option B: MongoDB Atlas (Recommended)**

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Whitelist your IP address (or allow from anywhere: 0.0.0.0/0)
4. Create a database user
5. Get your connection string and update \`MONGODB_URI\` in \`.env.local\`

### 6. (Optional) Setup Upstash Redis

1. Sign up at https://upstash.com
2. Create a Redis database
3. Copy REST URL and Token to \`.env.local\`

If you skip this, the app will use in-memory rate limiting (works fine for development/single-instance deployment).

### 7. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 8. Create Your First Account

1. Navigate to http://localhost:3000/register
2. Create an account (password must have uppercase, lowercase, and number)
3. You'll be automatically logged in and redirected to the dashboard

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user.

**Request:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
\`\`\`

#### POST /api/auth/login
Login with existing credentials.

#### POST /api/auth/refresh
Refresh access token.

#### POST /api/auth/logout
Logout and clear tokens.

#### GET /api/auth/me
Get current user details.

### Task Endpoints (Authentication Required)

#### GET /api/tasks
Get all tasks for authenticated user.

#### POST /api/tasks
Create a new task.

\`\`\`json
{
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "priority": "medium",
  "dueDate": "2024-12-31T00:00:00.000Z"
}
\`\`\`

#### PUT /api/tasks/[id]
Update an existing task.

#### DELETE /api/tasks/[id]
Delete a task.

#### GET /api/tasks/stats
Get task statistics.

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**

\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
\`\`\`

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Add environment variables from \`.env.local\`
   - Click "Deploy"

3. **Important**: Use MongoDB Atlas for production (not local MongoDB)

## 🏗 Project Structure

\`\`\`
task-management-system/
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── (auth)/                     # Auth pages (login, register)
│   │   ├── api/                        # API routes
│   │   ├── dashboard/                  # Dashboard page
│   │   └── page.tsx                    # Home (redirects)
│   ├── components/                     # React components
│   │   ├── dashboard/                  # Dashboard components
│   │   └── ui/                         # Reusable UI components
│   ├── contexts/                       # React contexts
│   ├── lib/
│   │   ├── api/                        # API client
│   │   ├── auth/                       # JWT utilities
│   │   ├── db/                         # MongoDB & models
│   │   ├── services/                   # Business logic
│   │   ├── utils/                      # Helper functions
│   │   └── validations/                # Zod schemas
│   └── middleware.ts                   # Security headers
├── .env.example                        # Environment template
└── README.md
\`\`\`

## 🔒 Security Measures

- ✅ Passwords hashed with bcrypt (12 rounds)
- ✅ JWT with short expiry + refresh tokens
- ✅ Rate limiting (auth & API)
- ✅ Input validation (Zod + Mongoose)
- ✅ Security headers (CSP, HSTS, etc.)
- ✅ NoSQL injection prevention
- ✅ CSRF protection
- ✅ No stack trace leaks

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string
- Verify IP whitelist (MongoDB Atlas)

### Module Not Found
\`\`\`bash
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Port Already in Use
\`\`\`bash
PORT=3001 npm run dev
\`\`\`

---

**Built for Associate Software Engineer Assessment at Twist Digital**