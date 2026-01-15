# PersonProfile Component

Dynamisk React-komponent för personprofiler. Visar automatiskt endast sektioner där data finns.

## Installation

```tsx
import { PersonProfile, PersonData } from '@/components/person';
```

## Grundläggande användning

```tsx
// Minimal data - visar endast namn och tillgänglig info
const person: PersonData = {
  id: '123',
  name: 'Erik Fernholm',
};

<PersonProfile person={person} />
```

## Med fullständig data

```tsx
const person: PersonData = {
  id: '123',
  name: 'Erik Fernholm',
  firstName: 'Erik',
  lastName: 'Fernholm',
  birthYear: 1983,
  location: 'Stockholm, Sverige',
  personType: 'FOUNDER',

  // Kontaktinfo (visas i sidebar om finns)
  email: 'erik@example.com',
  phone: '+46701234567',
  linkedinSlug: 'erikfernholm',

  // Bio (visas om finns)
  bio: 'Award winning speaker and entrepreneur...',
  headline: 'Co-founder Inner Development Goals & 29k',

  // Profilbild (initialer visas som fallback)
  imageUrl: '/images/erik.jpg',

  // Aggregerade siffror
  totalCompanies: 12,
  activeCompanies: 5,
  totalBoardSeats: 5,
  totalInvestments: 3,

  // Kompetenser
  tags: ['Public Speaking', 'Leadership', 'Coaching'],

  // Roller (från PersonRole-tabellen)
  roles: [
    {
      id: '1',
      orgNumber: '559xxx-xxxx',
      companyName: 'Ekskäret Foundation',
      roleType: 'CHAIRMAN',
      roleTitle: 'Ordförande',
      isActive: true,
      startDate: '2013-01-01',
    },
  ],

  // Ägarstruktur (från CompanyOwner)
  ownerships: [
    {
      id: '1',
      orgNumber: '559xxx-xxxx',
      companyName: 'Ekskäret Foundation',
      percentage: 100,
      ownershipType: 'direct',
    },
  ],

  // Portfolio-aggregering (beräknas)
  portfolio: {
    totalValue: 847000000,
    totalRevenue: 523000000,
    totalProfit: 67000000,
    totalFunding: 124000000,
    totalEmployees: 342,
  },
};

<PersonProfile person={person} />
```

## Dynamisk visning

Komponenten visar automatiskt endast sektioner där data finns:

| Sektion | Visas om |
|---------|----------|
| Hero | Alltid (namn krävs) |
| Stats | `totalCompanies`, `totalBoardSeats`, etc > 0 |
| Portfolio | `portfolio` med värden |
| Ägarstruktur | `ownerships` eller `beneficialOwnerships` finns |
| Bio | `bio` har innehåll |
| Engagemang | `roles` finns |
| Utbildning | `educations` finns |
| Kompetenser | `tags` finns |
| Språk | `languages` finns |
| Sidebar | Kontaktinfo finns |

## Hämta data från Supabase

```tsx
// app/person/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';
import { PersonProfile, PersonData } from '@/components/person';

export default async function PersonPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  // Hämta person med roller
  const { data: person } = await supabase
    .from('Person')
    .select(`
      *,
      roles:PersonRole(*)
    `)
    .eq('id', params.id)
    .single();

  if (!person) {
    return <PersonProfileEmpty />;
  }

  // Transformera till PersonData
  const personData: PersonData = {
    id: person.id,
    name: person.name,
    firstName: person.firstName,
    lastName: person.lastName,
    birthYear: person.birthYear,
    location: person.location,
    personType: person.personType,
    email: person.email,
    phone: person.phone,
    linkedinSlug: person.linkedinSlug,
    bio: person.bio,
    imageUrl: person.imageUrl,
    totalCompanies: person.totalCompanies,
    activeCompanies: person.activeCompanies,
    totalBoardSeats: person.totalBoardSeats,
    totalInvestments: person.totalInvestments,
    tags: person.tags,
    roles: person.roles?.map(r => ({
      ...r,
      isActive: r.isActive ?? true,
    })),
  };

  return <PersonProfile person={personData} />;
}
```

## Hämta ägardata via namn-matchning

```tsx
// Eftersom CompanyOwner inte har personId, matcha på namn
async function fetchOwnerships(personName: string) {
  const { data } = await supabase
    .from('CompanyOwner')
    .select('*')
    .eq('entityType', 'person')
    .ilike('entityName', `%${personName}%`);

  return data?.map(o => ({
    id: o.id,
    orgNumber: o.orgNumber,
    companyName: o.companyname || 'Okänt bolag',
    percentage: o.percentage,
    nbrShares: o.nbrShares,
    ownershipType: 'direct' as const,
  }));
}
```

## Loading state

```tsx
import { PersonProfileSkeleton } from '@/components/person';

// I en Suspense boundary
<Suspense fallback={<PersonProfileSkeleton />}>
  <PersonProfile person={person} />
</Suspense>
```

## Filstruktur

```
components/person/
├── PersonProfile.tsx       # Huvudkomponent
├── PersonProfile.module.css # All styling
├── types.ts                # TypeScript interfaces
├── index.ts                # Exports
├── sections/
│   ├── PersonHero.tsx
│   ├── PersonStats.tsx
│   ├── PersonPortfolio.tsx
│   ├── PersonOwnership.tsx
│   ├── PersonBio.tsx
│   ├── PersonEngagements.tsx
│   ├── PersonEducation.tsx
│   ├── PersonSkills.tsx
│   ├── PersonLanguages.tsx
│   └── PersonQuickSidebar.tsx
└── modals/
    └── ContactModal.tsx
```
