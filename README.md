# Buildlink

A professional networking and learning platform connecting students, mentors, and companies. Built with React, TypeScript, and Supabase.

## Tech Stack

- **Vite** — build tool and dev server
- **React + TypeScript** — UI framework
- **Tailwind CSS** — utility-first styling
- **shadcn-ui** — component library
- **Supabase** — backend, auth, and database
- **Bun** — package manager

## Project Structure

    ```
src/
├── components/
│   ├── admin/            # Admin-only views and controls
│   ├── auth/             # Login, signup, auth guards
│   ├── DirectMessages/   # DM/chat functionality
│   ├── feeds/            # Post feed and content
│   ├── notifications/    # Notification components
│   ├── profile/          # User profile views
│   ├── profile-sections/ # Modular profile sections
│   ├── ui/               # Base shadcn-ui components
│   └── *.tsx             # Shared/global components
├── contexts/
│   ├── AuthContext.tsx        # Auth state across the app
│   └── DataSaverContext.tsx   # Data saver mode state
├── hooks/              # Custom React hooks
├── integrations/
│   └── supabase/       # Supabase client and type definitions
├── lib/                # Utility functions and validation schemas
├── pages/              # Route-level page components
├── services/           # API and business logic calls
├── stores/             # Global state stores
├── types/              # Shared TypeScript types
├── App.tsx
├── AppRoutes.tsx       # Route definitions
└── main.tsx            # App entry point
```

## User Roles

The app supports multiple account types — **Student**, **Professional/Mentor**, and **Company** — each with their own dashboard and feature set.

## Getting Started

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd buildlink

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Fill in your Supabase URL and anon key in .env

# Start the development server
bun run dev
```

## Environment Variables

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Key Conventions

- Components are colocated by feature inside `src/components/`
- Shared/reusable UI primitives live in `src/components/ui/`
- All Supabase queries go through `src/services/` or `src/integrations/supabase/`
- Custom hooks live in `src/hooks/` — check here before writing new data-fetching logic
- Validation schemas are centralized in `src/lib/validationSchemas.ts`
```