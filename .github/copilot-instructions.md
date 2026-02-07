# WebsiteBuilder - AI Agent Instructions

## Project Overview

**WebsiteBuilder** is a full-stack React + TypeScript SPA with an Express + Prisma backend. It enables users to generate, preview, edit, and share AI-generated HTML websites with auth, project management, and community features.

**Location**: Frontend in `/client`, backend in `/server`  
**Tech Stack**: React 19 + TypeScript + Vite + TailwindCSS 4 (browser JIT) + React Router v7 + Lucide Icons + Express + Prisma + better-auth

## Architecture & Data Flow

### App Structure
```
client/src/
├── App.tsx              # Router + navbar conditional logic
├── pages/               # Full-page components (default export)
│   ├── Home.tsx
│   ├── MyProjects.tsx
│   ├── Preview.tsx      # Edit project with iframe
│   ├── AuthPage.tsx      # better-auth UI views
│   ├── Settings.tsx      # better-auth account settings
│   ├── View.tsx         # Public view
│   └── [others]
├── components/
│   ├── Navbar.tsx       # Sticky nav (hidden on /preview, /view)
│   ├── ProjectPreview.tsx  # Renders HTML in iframe + editor panel
│   ├── Sidebar.tsx       # Chat + versions timeline
│   ├── EditorPanel.tsx   # Inline element editor for iframe selection
│   └── [others]
├── types/index.ts       # Interfaces (Project, User, Plan, Message, Version)
└── assets/assets.ts     # Dummy data: appPlans, dummyUser, dummyProjects

server/
├── server.ts             # Express app + better-auth handler
├── routes/               # API routes
├── controllers/          # Project/user controllers
├── lib/                  # Prisma + auth
└── prisma/               # schema + migrations
```

### Navbar Logic (Important)
[App.tsx](client/src/App.tsx#L12-L18): Navbar hidden on `/auth/*`, `/preview/*`, `/view/*`, and `/projects/:id` routes. Keep the `pathname.startsWith(...)` checks aligned with new routes.

### Core Data Model: Project
```typescript
interface Project {
  id: string;                    // UUID
  name: string;
  initial_prompt: string;        // User's AI generation prompt
  current_code: string;          // **Full HTML string with inline Tailwind v4 CSS**
  current_version_index: string; // Active version ID
  versionId?: string;            // Optional API field
  userId: string;
  user?: User;
  versions: Version[];           // Version history
  conversation: Message[];       // Refinement chat
  isPublished?: boolean;         // Public/private
  createdAt, updatedAt: string;
}
```

**Key insight**: `current_code` is complete, self-contained HTML with embedded CDN Tailwind v4 + custom `<style>` blocks. Projects are data artifacts, not React components.

### Backend Data Model (Prisma)
- `User`, `WebsiteProject`, `Version`, `Conversation`, `Transaction`, plus better-auth tables (`Session`, `Account`, `Verification`).
- See [schema.prisma](server/prisma/schema.prisma) for authoritative fields and relations.

## Critical Patterns

### 1. **Route Param Usage** (Essential)
Use `useParams()` to access dynamic segments:
```tsx
// src/pages/Preview.tsx
const { projectId, versionId } = useParams();
const project = dummyProjects.find(p => p.id === projectId);
```

### 2. **iframe + postMessage Pattern** (ProjectPreview.tsx)
- Renders `current_code` HTML inside `<iframe>`
- Updates via `iframeRef.current?.contentWindow?.postMessage()`
- Injects `iframeScript` to enable element selection + editing
- `EditorPanel` updates selected element styles/text/className via `UPDATE_ELEMENT` messages

### 3. **Lazy Data Loading** (Preview.tsx)
```tsx
const fetchProject = async () => {
  const foundProject = dummyProjects.find(p => p.id === projectId);
  setTimeout(() => {
    setProject(foundProject);
    setLoading(false);
  }, 1000); // Simulated async
};
useEffect(() => { fetchProject(); }, [projectId]);
```

### 4. **Conditional Component Rendering** (Home.tsx)
Form submission with mock async:
```tsx
const onSubmitHandler = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  // Call AI API (not implemented)
  setTimeout(() => setLoading(false), 2000);
};
```

### 5. **Mobile Menu Pattern** (Navbar.tsx)
Uses state-driven modal overlay. No external menu library.

### 6. **Auth UI + Session**
- `AuthPage` renders `AuthView` from better-auth UI (`/auth/:pathname`).
- `Settings` uses better-auth account cards on `/account/settings`.
- `Providers` wraps app with `AuthUIProvider` and uses `auth-client`.

## Development Workflow

### Setup
```bash
cd client
npm install
npm run dev       # http://localhost:5173
npm run build     # TypeScript check + Vite bundle
npm run lint      # ESLint
```

```bash
cd server
npm install
npm run server    # nodemon + tsx
npm run start     # tsx server.ts
npm run build     # tsc
```

### Key Commands (from package.json)
- `npm run dev` - HMR enabled, restart for tsconfig changes
- `npm run build` - Runs `tsc -b && vite build`
- `npm run lint` - ESLint with flat config
- `npm run preview` - Serves built dist/

## Project-Specific Patterns

### Page Convention
- **File location**: `src/pages/PageName.tsx`
- **Export**: `export default function PageName() { ... }`
- **Must import Navbar** if not hiding it

### Tailwind v4 JIT (Browser-Based)
- **No `tailwind.config.js`** needed—browser processes classes via CDN
- **In generated HTML**: Embed CDN script + custom `<style>` tags
- Example: `<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>`
- Use arbitrary values: `w-[423px]`, `text-[#abc]`, custom gradients

### Component Styling
1. Page-level: Use Tailwind classes directly
2. Global styles: Add to `src/index.css` (wrapped in Tailwind `@layer` directives)
3. Generated HTML: Inline all CSS in `<style>` blocks within the HTML string

### Type Definitions
Define all types in [src/types/index.ts](src/types/index.ts):
- `User`, `Project`, `Plan`, `Message`, `Version`
- Extend when adding features (e.g., new payment model fields)

### Navigation & Links
- Use `<Link to="/">` from React Router (Navbar.tsx example)
- Navbar includes mobile responsive menu toggle
- Routes: `/auth/:pathname`, `/account/settings`, `/projects/:projectId`, `/preview/:projectId`, `/view/:projectId`

### Backend API (Express)
- Auth handler: `POST/GET /api/auth/*` (better-auth)
- Projects: `/api/project/*` (revision, save, rollback, publish, preview)
- Users: `/api/user/*` (credits, projects, publish toggle)
- All protected routes use `protect` middleware (better-auth session)

## File Reference

| File | Purpose |
|------|---------|
| [App.tsx](client/src/App.tsx) | Routes + navbar hide logic |
| [types/index.ts](client/src/types/index.ts) | TypeScript interfaces |
| [assets/assets.ts](client/src/assets/assets.ts) | appPlans, dummyUser, dummyProjects |
| [components/Navbar.tsx](client/src/components/Navbar.tsx) | Top nav + mobile menu |
| [components/ProjectPreview.tsx](client/src/components/ProjectPreview.tsx) | iframe renderer + editor |
| [components/EditorPanel.tsx](client/src/components/EditorPanel.tsx) | element editor UI |
| [components/Sidebar.tsx](client/src/components/Sidebar.tsx) | chat + versions |
| [pages/Preview.tsx](client/src/pages/Preview.tsx) | Edit project page |
| [pages/View.tsx](client/src/pages/View.tsx) | Public view (no Navbar) |
| [pages/AuthPage.tsx](client/src/pages/AuthPage.tsx) | Auth UI | 
| [pages/Settings.tsx](client/src/pages/Settings.tsx) | Account settings |
| [index.css](client/src/index.css) | Global Tailwind imports |
| [vite.config.ts](client/vite.config.ts) | Vite + tailwindcss plugin |
| [server.ts](server/server.ts) | Express app + better-auth handler |
| [lib/auth.ts](server/lib/auth.ts) | better-auth config |
| [schema.prisma](server/prisma/schema.prisma) | Prisma models |

## Known Constraints & Workarounds

1. **Demo Data Only**: Client still reads from `dummyProjects` and `dummyConversations`. API is present but not yet wired in UI. Data lost on page refresh.

2. **Sync Loading Pattern**: Preview page artificially delays with `setTimeout(1000)` to show loading state. Replace with real API call.

3. **HTML Rendering**: ProjectPreview uses iframe to isolate generated HTML. Direct `dangerouslySetInnerHTML` not used—safer for untrusted HTML from AI.

4. **Preview Editing**: `ProjectPreviewRef.getCode()` returns `project.current_code` rather than serialized DOM. Update if you want post-edit HTML from the iframe.

5. **Mobile Responsive**: All pages use Tailwind responsive classes (`md:`, `lg:`, `hidden md:block`). Test on 375px (mobile) and 1024px (tablet).

## Common Tasks

**Add a new page:**
1. Create `src/pages/NewPage.tsx` with default export
2. Add `<Route path="/new-path" element={<NewPage />} />` in App.tsx
3. If Navbar should hide: update hideNavbar condition in App.tsx
4. Import Navbar in component if needed: `import Navbar from "@/components/Navbar"`

**Add a new API route:**
1. Add handler in [controllers](server/controllers)
2. Wire in [routes](server/routes)
3. Apply `protect` for authenticated endpoints
4. Update client to call the route (fetch or React Query)

**Modify project structure:**
- Update interface in [types/index.ts](client/src/types/index.ts)
- Update `dummyProjects` in [assets/assets.ts](client/src/assets/assets.ts)
- Cascade changes to components using the type

**Style a component:**
- Use Tailwind classes inline (preferred for consistency)
- For complex animations, add `@keyframes` to `src/index.css` or component's `<style>` block
- Test responsive behavior with dev tools

**Test API integration point:**
- Mock data in `fetchProject()` or similar
- Use `setTimeout()` to simulate network delay
- Plan real API calls in Backend Integration phase

## Gotchas

- **Navbar always renders first** then conditionally hides by route—don't remove it from App.tsx
- **Generated HTML is canonical**—don't convert to React JSX; keep as HTML strings
- **Tailwind v4 browser JIT** processes classes at runtime; no build-time purging needed
- **Route params required**—every dynamic page must use `useParams()`
- **Auth routes are dynamic**—`/auth/:pathname` is required by better-auth UI
- **No global state manager** yet—pass data via route params or Context (if adding)

## Quick Wins

- HMR works instantly on `.tsx` changes during `npm run dev`
- Check `dummyProjects` structure before implementing new features
- Use React DevTools to inspect component props and state
- Lucide icons available: `import { Package, Settings, Heart } from "lucide-react"`
- TS strict mode enabled—fix type errors early

---
**Last Updated**: February 2026  
**Next Phase**: Backend API integration, user auth, database persistence
