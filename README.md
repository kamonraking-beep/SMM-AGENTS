# SMM AI App

Production starter for a social media manager assistant using:
- Next.js for frontend UI
- Express/Node for backend control plane
- OpenAI-hosted ChatKit for the chat interface
- OpenAI Agents SDK for server-side orchestration
- Prisma + PostgreSQL for persistence
- MCP wrappers for draft, asset, and publish tools

## Why this structure

- ChatKit stays in the frontend and talks to a server-created ChatKit session.
- The backend owns OpenAI secrets, approvals, MCP access, audit logs, and publish permissions.
- The workflow logic lives in `packages/agents` so it can evolve independently of the UI.

## Commands

```bash
pnpm install
cp .env.example .env
pnpm dev
```

## Apps

- `apps/web`: Next.js app with ChatKit embed and draft views
- `apps/api`: Express API with ChatKit session route, draft routes, publish approval route
- `packages/agents`: workflow orchestration and agent modules
- `packages/shared`: shared schemas and utilities
- `packages/db`: Prisma schema and client generation

## Notes

- Replace the placeholder auth with your real session/user lookup.
- Replace the stub MCP client methods with real calls to your Jacai MCP server.
- Keep social publishing server-side only.
- Fix malformed allowed domains from the original workflow before migrating them. The pasted workflow includes values like `www.google.comhttps` and an empty publish-tool allowlist for the publish agent. Those should be corrected before production use. 
