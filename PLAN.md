# Phase 1 - Technical Planning Document

## 1. Backend Technology Choice

**Selected: Next.js 15 App Router with Route Handlers (API Routes)**

### Justification
- **Monorepo Efficiency**: Unified TypeScript codebase eliminates API contract drift, reduces deployment complexity, and accelerates iteration speed—critical for fast-moving product teams
- **Edge-First Architecture**: Route handlers support edge runtime for global low-latency responses, middleware for auth/CORS, and server actions for type-safe mutations without REST boilerplate
- **Production-Grade DX**: Hot module replacement across frontend and backend, integrated TypeScript, and React Server Components enable rapid feature development without context switching
- **Deployment Simplicity**: Single-command Vercel deployment with zero configuration, automatic HTTPS, preview environments for PRs, and built-in analytics reduces DevOps overhead
- **Modern Patterns**: Server actions, middleware pipeline, and route segment config demonstrate understanding of cutting-edge full-stack architecture

**Architectural Trade-off Analysis**: While NestJS offers enterprise patterns (DI, decorators, modules), Next.js API routes with clean architecture (service layer, DTOs, middleware) achieve the same separation of concerns with lower operational complexity. For a CRUD application with real-time features, rapid deployment and iteration speed outweigh framework ceremony—a decision I'd defend in production environments focused on shipping value.

**Note on Twist Digital Alignment**: While proficient in NestJS (familiar with Guards, Modules, Passport integration), I chose Next.js API for this assessment to demonstrate pragmatic technical decision-making. In Phase 3, I can discuss NestJS architecture patterns and migration strategies for team scaling scenarios.

## 2. High-Level Architecture

```
┌───────────────────────────────────────────────────────────────┐
│               NEXT.JS 15 FULL-STACK APPLICATION               │
│                                                               │
│  ┌─────────────────── CLIENT LAYER ──────────────────────┐   │
│  │  /app/(auth)/login      /app/dashboard                │   │
│  │  /app/(auth)/register   /app/tasks/[id]               │   │
│  │                                                        │   │
│  │  React Server Components + Client Components          │   │
│  │  (Server-side rendering, streaming, suspense)         │   │
│  └────────────────────────┬───────────────────────────────┘   │
│                           │                                   │
│  ┌────────────────────────▼──────────────────────────────┐   │
│  │              MIDDLEWARE PIPELINE                      │   │
│  │  Auth Check → CSRF Validation → Rate Limit → Route   │   │
│  └────────────────────────┬──────────────────────────────┘   │
│                           │                                   │
│  ┌────────────────────────▼──────────────────────────────┐   │
│  │              API LAYER (Route Handlers)               │   │
│  │                                                        │   │
│  │  /api/auth/register    /api/tasks/route               │   │
│  │  /api/auth/login       /api/tasks/[id]/route          │   │
│  │  /api/auth/refresh     /api/tasks/ws (WebSocket)      │   │
│  │                                                        │   │
│  │  ┌──────────────┐    ┌─────────────────┐             │   │
│  │  │   Services   │    │   Validation    │             │   │
│  │  │   (Business  │    │   (Zod Schemas) │             │   │
│  │  │    Logic)    │    │                 │             │   │
│  │  └──────────────┘    └─────────────────┘             │   │
│  └────────────────────────┬──────────────────────────────┘   │
└───────────────────────────┼───────────────────────────────────┘
                            │
              ┌─────────────▼──────────┐      ┌──────────────┐
              │   MongoDB Atlas        │      │ Upstash Redis│
              │   (Mongoose ODM)       │      │ (Rate Limit) │
              │   - Users Collection   │      └──────────────┘
              │   - Tasks Collection   │
              └────────────────────────┘
```

**Key Architectural Decisions** (Demonstrating Technical Ownership):

1. **Clean Architecture with Service Layer**: Route handlers delegate to service classes (auth.service.ts, tasks.service.ts) for business logic, enabling unit testing and separation from HTTP concerns—same pattern as NestJS but without framework overhead

2. **Middleware-First Security**: Next.js middleware intercepts ALL requests before reaching routes, enforcing authentication, CSRF tokens, and rate limits at the edge (runs on CDN, not origin server)

3. **Type-Safe Data Layer**: Mongoose schemas with TypeScript interfaces + Zod runtime validation creates double validation (compile-time + runtime) preventing invalid data from entering the system

4. **Server Actions for Mutations**: Type-safe form actions (e.g., createTask, updateTask) eliminate REST boilerplate and provide progressive enhancement—if JS fails, forms still work

5. **Feature-Based File Structure**: `/lib/auth/*`, `/lib/tasks/*` mirrors modular architecture, allowing clear code ownership even in a monorepo (team members own folders, not just files)

## 3. Security Considerations

### Client-Side Security
| Risk | Mitigation Strategy |
|------|---------------------|
| **XSS Attacks** | React's automatic escaping + DOMPurify for any HTML, strict CSP headers |
| **Token Storage** | httpOnly cookies for refresh tokens, memory/sessionStorage for short-lived access tokens |
| **CSRF** | Next.js middleware with token validation, SameSite cookie flags |
| **Sensitive Data Exposure** | Never log tokens, sanitize error messages, use HTTPS-only cookies |

### Server-Side Security
| Risk | Mitigation Strategy |
|------|---------------------|
| **Broken Authentication** | bcrypt (12+ rounds) for passwords, JWT with short expiry (15min), secure refresh token rotation |
| **NoSQL Injection** | Mongoose schema validation + Zod runtime validation, sanitize all user input before queries |
| **Rate Limiting** | Upstash Redis with @upstash/ratelimit (5 req/min for auth, 100 req/min for tasks) via middleware |
| **Mass Assignment** | Zod schemas with .strict() mode strip unknown properties, explicit type definitions for all inputs |
| **Insecure Dependencies** | Regular `npm audit`, automated Dependabot PRs, Snyk integration for vulnerability scanning |

### Additional Hardening
- **Headers**: CSP, HSTS, X-Frame-Options via Next.js middleware
- **Logging**: Structured logging without PII, error monitoring with Sentry
- **Environment Isolation**: Separate .env files, secrets in Vercel environment variables

## 4. Enhanced Technology Stack & Leadership Decisions

**Core Stack** (Production-Ready Choices):
- **MongoDB + Mongoose**: Schema validation with TypeScript interfaces, indexing strategy for query performance, flexible document model for evolving requirements. Horizontal scaling via sharding, JSON-native storage eliminates ORM impedance mismatch.
- **Zod**: Runtime type validation library that infers TypeScript types—single source of truth for API contracts. Strict mode prevents mass assignment, detailed error messages improve API DX.
- **Jose (JWT library)**: Lightweight, edge-runtime compatible JWT signing/verification. Supports token rotation, algorithm security (ES256), and integrates cleanly with Next.js middleware.
- **Upstash Redis**: Serverless Redis for rate limiting with geographic replication. Pay-per-request pricing (cost-effective), REST API works in edge runtime where traditional Redis clients fail.
- **Tailwind CSS + shadcn/ui**: Component library built on Radix UI (accessibility-first) with headless architecture. No runtime JS for styles (performance), design tokens enable consistent theming.

**Infrastructure & DevOps**:
- **Docker Compose**: Local dev environment with MongoDB + Redis containers, eliminates "works on my machine" issues
- **Vercel**: Zero-config deployment, preview environments on every PR (critical for team code review), automatic HTTPS, edge functions for global performance
- **GitHub Actions**: CI/CD pipeline with TypeScript type checking, Prettier/ESLint, unit tests, and Snyk security scanning—blocks merges on failure

**Novelty Feature Decision**: **Real-time collaboration** using Vercel's `@vercel/functions` with Server-Sent Events (SSE) for live task updates across users—demonstrates edge computing knowledge and modern alternative to WebSockets (simpler, works with serverless).

**Trade-off Analysis & Decision Rationale**:
| Decision | Why This Matters for Team Leadership |
|----------|--------------------------------------|
| Monorepo over microservices | Shared types prevent API drift, atomic commits across frontend/backend reduce coordination overhead |
| MongoDB over PostgreSQL | Schema flexibility allows rapid iteration on data models without migrations blocking feature development |
| Vercel over self-hosting | Removes DevOps bottleneck, preview environments enable parallel feature development and safer code reviews |
| Service layer pattern | Business logic isolated from routes enables unit testing, clear ownership boundaries for team members |

---

**Alignment with Twist Digital's Values**:
✅ **Scalable**: Feature-based modules + MongoDB sharding + Edge runtime for global performance
✅ **Impactful**: Real-time collaboration + excellent UX demonstrate product thinking beyond CRUD
✅ **Engineered for Future**: Clean architecture enables framework migration (Next.js → NestJS) without business logic rewrites
✅ **Team Leadership**: Service layer pattern and modular file structure facilitate clear code ownership and mentorship
