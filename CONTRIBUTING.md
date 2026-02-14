# Contributing to Offsyde

Thank you for your interest in contributing to Offsyde. This document covers the conventions and workflows we follow. Read it before submitting your first pull request.

## Table of Contents

- [Project Setup](#project-setup)
- [Development Workflow](#development-workflow)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Reporting Issues](#reporting-issues)
- [Proposing Major Changes](#proposing-major-changes)

---

## Project Setup

### Prerequisites

- **Node.js** 20+
- **Bun** (preferred package manager; the lockfile is `bun.lock`)
- A Chromium-compatible environment (Playwright uses `@sparticuz/chromium` for serverless, but local dev uses your system's Chromium)

### Local Setup

```bash
# 1. Fork and clone
git clone https://github.com/<your-username>/Offsyde-Debugger.git
cd Offsyde-Debugger

# 2. Install dependencies
bun install

# 3. Start the dev server
bun dev
```

The app runs at `http://localhost:3000`.

### Notes

- There is no Docker setup. The project runs directly via Next.js and deploys to Vercel as serverless functions.
- There is no external database. All state lives client-side in Zustand stores.
- The API routes spawn headless Chromium instances via Playwright. If you're working on API route handlers (`src/app/api/`), make sure Playwright browsers are installed locally: `bunx playwright install chromium`.
- No environment variables are required for local development. The `.env` file in the repo is a legacy artifact.

---

## Development Workflow

1. Create a branch from `main` (see [Branch Naming](#branch-naming)).
2. Make your changes. Keep commits atomic and well-scoped.
3. Run the linter before pushing: `bun lint`.
4. Run a production build to catch type errors: `bun run build`.
5. Push your branch and open a pull request against `main`.

### Key Scripts

| Command | Purpose |
|---|---|
| `bun dev` | Start the development server |
| `bun run build` | Production build (catches TypeScript errors) |
| `bun start` | Start the production server |
| `bun lint` | Run ESLint |

---

## Branch Naming

Use the following prefixes:

| Prefix | Use case |
|---|---|
| `feat/` | New feature or module (e.g., `feat/export-csv`) |
| `fix/` | Bug fix (e.g., `fix/broken-image-detection`) |
| `refactor/` | Code restructuring without behavior change |
| `docs/` | Documentation only |
| `chore/` | Tooling, CI, dependency updates |
| `perf/` | Performance improvement |
| `test/` | Adding or updating tests |

Use lowercase, kebab-case after the prefix. Keep names short and descriptive.

```
feat/css-audit-severity-levels
fix/playmaker-timeout-handling
refactor/zustand-store-consolidation
```

---

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Meaning |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `docs` | Documentation only |
| `chore` | Build process, tooling, dependency updates |
| `perf` | Performance improvement |
| `test` | Adding or correcting tests |
| `style` | Formatting, whitespace (no logic change) |

### Scope

Use the module name when applicable: `scoutings`, `audits`, `visuals`, `traces`, `statsheets`, `api`, `state`, `ui`.

### Examples

```
feat(visuals): add severity classification to CSS analysis
fix(api): handle timeout in playwright-crawl for slow sites
refactor(state): consolidate dominator stores into single store
docs: add architecture overview to README
chore: upgrade next to 15.6
```

---

## Pull Request Process

### Before Opening

- [ ] Your branch is up to date with `main`.
- [ ] `bun lint` passes with no errors.
- [ ] `bun run build` succeeds (no TypeScript errors).
- [ ] You have tested your changes locally by running the relevant feature end-to-end.
- [ ] New API endpoints include proper error handling and return consistent `{ success, data, error }` response shapes.
- [ ] No hardcoded URLs, secrets, or `.env` values are committed.

### PR Description

- Clearly describe **what** changed and **why**.
- Reference related issues (e.g., `Closes #42`).
- If the change is visual, include a screenshot or short recording.
- If the change affects an API route, document the request/response format.

### Review

- PRs require at least one maintainer approval.
- Address review feedback with new commits (do not force-push during review).
- Squash-merge is the default merge strategy.

---

## Coding Standards

### TypeScript

- **Strict mode is enabled.** Do not use `@ts-ignore` or `any` unless absolutely necessary and documented with a comment explaining why.
- Use explicit return types on exported functions and API route handlers.
- Prefer `interface` over `type` for object shapes. Use `type` for unions, intersections, and utility types.
- Use the `@/*` path alias (maps to `src/*`) for imports. Do not use relative paths that traverse more than one level up.

### React & Next.js

- Use the App Router patterns. Pages are in `src/app/`, API routes in `src/app/api/`.
- Default to Server Components. Add `"use client"` only when the component needs browser APIs, event handlers, or Zustand stores.
- Co-locate state logic in `src/app/state/`. Each Zustand store should have a clear, single responsibility.

### Styling

- Use **Tailwind CSS 4** utility classes. Avoid inline `style` attributes.
- Global utility classes (`.ui-card`, `.btn-primary`, etc.) are defined in `src/app/globals.css`. Prefer these over one-off class combinations for recurring patterns.
- The app is dark-mode only. Do not add light-mode styles.

### API Routes

- All API route handlers are in `src/app/api/` and export named HTTP method functions (`POST`, `GET`, etc.).
- Return `NextResponse.json()` with consistent shapes: `{ success: true, data: ... }` or `{ success: false, error: "..." }`.
- Include concurrency controls for routes that spawn browser instances. Follow the existing patterns in `audits/route.ts` and `dominator/route.ts`.
- Handle errors gracefully. Never let unhandled exceptions crash a serverless function.

### Code Organization

- Keep files focused. If a component file exceeds ~300 lines, consider splitting it.
- Utility functions go in `src/utils/`.
- Shared components go in `src/components/`. Page-specific components can live alongside their page.

---

## Testing

The project does not yet have a test suite. This is a known gap. If you're interested in setting up testing infrastructure, here's what we'd want:

- **Framework**: Vitest (preferred for Next.js App Router projects)
- **Priority targets**: API route handlers (`src/app/api/`) and utility functions (`src/utils/`)
- **Integration tests**: For the Playwright-based crawling and auditing logic
- **Component tests**: React Testing Library for key UI components

If you're adding a new feature, writing tests for it is appreciated but not currently required. If you want to contribute test infrastructure, open a discussion issue first (see [Proposing Major Changes](#proposing-major-changes)).

---

## Reporting Issues

### Bug Reports

Open an issue with the following:

- **Title**: Short, specific description of the bug.
- **Environment**: Browser, OS, Node.js version.
- **Steps to reproduce**: Numbered steps to trigger the bug.
- **Expected behavior**: What should happen.
- **Actual behavior**: What actually happens.
- **URL tested** (if applicable): The website URL you were analyzing when the bug occurred.
- **Screenshots/console errors**: If available.

### Feature Requests

Open an issue with:

- **Title**: `[Feature Request] <short description>`
- **Problem**: What pain point does this address?
- **Proposed solution**: How you'd approach it.
- **Alternatives considered**: Other approaches you thought about.
- **Module affected**: Which part of Offsyde (Scoutings, Audits, Visuals, Traces, Statsheets, or a new module).

---

## Proposing Major Changes

For significant changes -- new modules, architectural shifts, dependency replacements, or breaking API changes -- **open a discussion issue before writing code**.

Label it `[RFC]` or `[Discussion]` and include:

- Motivation and context
- Proposed approach with enough technical detail for review
- Tradeoffs and alternatives
- Impact on existing features

This prevents wasted effort and ensures alignment with the project's direction. Small bug fixes and minor improvements do not need an RFC.

---

## Questions?

If something in this guide is unclear, open an issue and we'll clarify. We'd rather answer a question than review a PR that went in the wrong direction.
