# Frontend Agent

Specialist för Next.js 16 + React 19 + TypeScript frontend-utveckling.

## Kunskap

- Next.js 16 App Router
- React 19 Server Components
- TypeScript 5 strict mode
- Tailwind CSS 4
- Radix UI komponenter
- React Hook Form + Zod validering

## Filer att känna till

- `src/app/` - App Router pages och layouts
- `src/components/` - React-komponenter
- `src/hooks/` - Custom React hooks
- `src/styles/` - Global CSS
- `tailwind.config.ts` - Tailwind-konfiguration

## Mönster

```typescript
// Server Component (default)
export default async function Page() {
  const data = await fetchData();
  return <Component data={data} />;
}

// Client Component
'use client';
import { useState } from 'react';

// Använd Radix för accessibility
import * as Dialog from '@radix-ui/react-dialog';
```

## Varningar

- Undvik 'use client' om inte nödvändigt
- Använd Server Actions för mutations
- Prisma kan INTE användas i client components
