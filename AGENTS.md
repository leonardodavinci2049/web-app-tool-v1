# Agent Coding Guidelines

This guide helps agentic coding agents work effectively in this Next.js 16 TypeScript codebase.

## Project Overview
- **Framework**: Next.js 16.1.6 with App Router
- **Language**: TypeScript (strict mode enabled)
- **Package Manager**: pnpm
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Linter/Formatter**: Biome (2 spaces, auto-organize imports)
- **PORT**: 7777

## Commands

### Development
```bash
pnpm dev          # Start dev server (loads .env)
pnpm build        # Production build
pnpm start        # Start production server
```

### Code Quality
```bash
pnpm lint         # Run Biome linter (check)
pnpm format       # Format code with Biome
```

### Testing
No test framework is currently configured. When adding tests, use a framework compatible with Next.js 16 (e.g., Vitest, Jest with React Testing Library).

## Code Style Guidelines

### File Naming
- **Pages/Components**: `page.tsx`, `layout.tsx` (App Router convention)
- **UI Components**: PascalCase (e.g., `Button.tsx`, `ThemeProvider.tsx`)
- **Services (functional)**: kebab-case (e.g., `shopee-affiliate.service.ts`)
- **Services (class-based)**: PascalCase with `.service.ts` (e.g., `LogService` in `log.service.ts`)
- **Types**: `*.types.ts` (e.g., `shopee-affiliate.types.ts`)
- **Schemas (Zod)**: `*.schema.ts` (e.g., `shopee-affiliate.schema.ts`)
- **DTOs**: PascalCase with `*.dto.ts` (e.g., `log_operation_create.dto.ts`)
- **Queries**: PascalCase with `*.query.ts` (e.g., `log_operation_create.query.ts`)

### Imports
- Use `@/*` path alias for internal imports (configured in tsconfig.json)
- Import order: 1) React/libraries, 2) Internal modules, 3) Relative imports
- Biome auto-organizes imports on format

### Naming Conventions
- **Interfaces/Types**: PascalCase (e.g., `GenerateAffiliateLinkResult`, `ApiResponse<T>`)
- **Classes**: PascalCase (e.g., `Logger`, `ResultModel`)
- **Functions/Variables**: camelCase (e.g., `generateShortLink`, `createLogger`)
- **Constants**: SCREAMING_SNAKE_CASE or PascalCase for exported constants (e.g., `API_STATUS_CODES`, `PRODUCT_ENDPOINTS`)
- **React Components**: PascalCase (e.g., `Button`, `ThemeProvider`, `HomePage`)
- **Schema names**: PascalCase with `Schema` suffix (e.g., `GenerateShortLinkSchema`)
- **DTO names**: PascalCase with `Dto` suffix (e.g., `LogOperationCreateDto`)

### TypeScript Patterns
- Use strict mode - always provide proper types
- Prefer `interface` for object shapes, `type` for unions/intersections
- Use Zod schemas for validation where possible (see `shopee-affiliate.schema.ts`)
- For database DTOs, use custom validation functions that throw descriptive errors
- Use `unknown` instead of `any` when type is truly unknown
- Server functions: Export async functions with return types specified

### Server Actions
- Use `"use server"` directive at top of file
- Server actions in `src/app/actions/` directory
- Return objects with `{ success: boolean; ...rest }` shape
- Handle errors with try/catch and return user-friendly error messages

### Client Components
- Use `"use client"` directive for components needing interactivity
- Keep client components minimal - prefer server components
- Use React hooks (useState, useTransition, etc.) appropriately
- Toast notifications: `toast.success()`, `toast.error()` from `sonner`

### API Services
- Server-side: Extend `BaseApiService` class from `@/lib/axios/base-api-service.ts`
- Use protected methods: `get()`, `post()`, `put()`, `patch()`, `delete()`
- Return typed responses, throw descriptive errors
- Use `ApiResponse<T>` interface for external API responses
- Custom error classes: `ApiConnectionError`, `ApiValidationError`, `ApiAuthenticationError`, `ApiNotFoundError`, `ApiServerError`

### Database Operations
- Services in `src/services/db/` follow class-based pattern
- Query functions return SQL query strings (see `log_operation_create.query.ts`)
- DTO validation functions throw descriptive errors
- Use `ResultModel` class for consistent response shape
- MySQL stored procedures via `dbService.selectExecute()`

### Environment Variables
- Define schema in `src/core/config/envs.ts` using Zod
- Access via `envs.EXTERNAL_API_MAIN_URL` (object export)
- Public variables: prefix with `NEXT_PUBLIC_`
- Add all new env vars to schema with appropriate validation

### Utility Functions
- `cn()` from `@/lib/utils.ts` for className merging (clsx + tailwind-merge)
- `createLogger()` from `@/core/logger.ts` for logging with context

### Error Handling
- Always use try/catch around async operations
- Type guard with `error instanceof Error` before accessing `.message`
- Return user-friendly error messages to client
- Use `MESSAGES.UNKNOWN_ERROR` as fallback from `@/core/constants/globalConstants.ts`

### UI Components
- Use shadcn/ui components from `@/components/ui/`
- Component variants via `class-variance-authority` (cva)
- Icons from `lucide-react`
- Dark mode support via `next-themes` and `ThemeProvider`
- Use `className` prop for styling, avoid inline styles

### Code Formatting (Biome)
- 2 space indentation
- Auto-organize imports on format
- Follow Biome's recommended rules with React/Next.js extensions
- Turn off `suspicious.noUnknownAtRules` for Tailwind

### Additional Notes
- Server-only code: Add `"server-only"` import at top
- Keep client/server boundaries clear
- Portuguese language used for user-facing strings/messages
- Custom API status codes (100XXX format) - see `API_STATUS_CODES` in `api-constants.ts`
