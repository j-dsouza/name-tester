# Overview

This is a baby name combination explorer that helps users test different combinations of first names, middle names, and last names to find the perfect name for their baby. The application is built as a client-side React application with localStorage persistence and includes advanced features like nickname support and shareable links.

# High-level user journey

The user needs to:
1. Enter first names, middle names, and last names
2. View combinations of those names
3. Be able to re-visit the initial lists of names, and add/remove things, based on the combined view that they have seen
4. Shortlist certain combinations of names that the user likes

# Features

1. **Name Input & Storage**
   - Users can enter multiple names in text areas, separated by newlines
   - Names are categorized into first names, middle names, and last names
   - Multiple middle names are supported per combination
   - Names are stored client-side with persistence across browser refreshes
   - **Nickname Support**: Names support optional nickname syntax: "Full Name (Nick1, Nick2)"

2. **Name Combination Display**
   - Generate all possible combinations of first + middle + last names
   - Display combinations side-by-side with initials in a separate column
   - **Small number threshold**: If ≤50 combinations, display all on one page
   - **Large number threshold**: If >50 combinations, show random sample arranged alphabetically
   - When sampling is active, clearly indicate that names are being sampled
   - Provide user-controlled filtering options alongside sampling
   - **Dual Name Display**: Shows both "Legal Name" (full names) and "Used Name" (nickname preferences)
   - **Search Functionality**: Real-time search across all name combinations and initials
   - **Duplicate Filtering**: Option to hide combinations where middle names match last names

3. **Name Management**
   - Users can edit name lists through both:
     - Inline editing in the combination view
     - Separate "manage names" modal
   - Add/remove names from lists and see immediate updates to combinations
   - **Auto-open Modal**: Automatically opens name manager when no names are present

4. **Shortlisting**
   - Users can shortlist favorite name combinations
   - No limit on number of shortlisted names
   - Simple add/remove functionality (no ratings, notes, or sharing features)
   - Dedicated shortlist view with management options

5. **Display Preferences**
   - **Sorting Options**: Alphabetical or random arrangement
   - **Name Display**: Toggle between full names and preferred nicknames
   - **Responsive Design**: Mobile-first design that works across all device sizes

6. **Shareable Links**
   - Create shareable links to allow sharing name lists and shortlists
   - 16-character shortlinks with collision-resistant hashing
   - Database-backed persistence with usage tracking
   - Warning system before overwriting local data
   - **Database Retry System**: Automatic retry functionality for dev server environments
   - **Warming Up Messages**: Clear user feedback during database startup delays
   - **Progressive Retry**: Exponential backoff with up to 3 retry attempts over 2.5+ minutes

# Data Structure

## Application State (`AppState`)
```typescript
interface AppState {
  firstNames: string[];           // First names with optional nickname syntax
  middleNames: string[];          // Middle names with optional nickname syntax  
  lastNames: string[];            // Last names with optional nickname syntax
  shortlistedCombinations: string[]; // Array of combination IDs
  hideDuplicateMiddleLastNames: boolean; // Filter duplicate middle/last names
  showAlphabetical: boolean;      // Sort combinations alphabetically
  useShortNames: boolean;         // Display nicknames instead of full names
}
```

## Name Combinations (`NameCombination`)
```typescript
interface NameCombination {
  firstName: string;              // Full first name
  middleName: string;             // Full middle name(s)
  lastName: string;               // Full last name
  fullName: string;               // Complete legal name
  initials: string;               // Initials from full names
  id: string;                     // Unique identifier
  firstNameShort?: string;        // Preferred nickname for first name
  middleNameShort?: string;       // Preferred nickname for middle name
  lastNameShort?: string;         // Preferred nickname for last name
  shortName?: string;             // Complete name using nicknames
  shortInitials?: string;         // Initials from nickname variants
}
```

# Technical Architecture

## Frontend Stack
- **Framework**: Next.js 15 with TypeScript and React 18
- **Styling**: TailwindCSS with shadcn/ui components
- **State Management**: Client-side state with localStorage persistence
- **UI Components**: shadcn/ui based on Radix UI primitives
- **Forms**: React Hook Form with Zod validation

## Component Structure
- **Pages**: Next.js App Router (`src/app/` directory)
- **Components**: Modular React components in `src/components/`
- **UI Components**: shadcn/ui library in `src/components/ui/`
- **Hooks**: Custom React hooks in `src/hooks/` (including `useRetryWithWarmup`)
- **Utils**: Helper functions in `src/utils/`
- **Constants**: Configuration values in `src/consts/`
- **Database**: Prisma configuration in `src/lib/prisma.ts` with 30-second timeout settings

## Key Constants
- **COMBINATION_THRESHOLD**: 50 combinations (threshold for showing all vs sampling)
- **DEFAULT_SAMPLE_SIZE**: 30 combinations (when >50 combinations exist)
- **STORAGE_KEY**: 'name-tester-data' (localStorage key for persistence)
- **Mobile Breakpoint**: 768px (defined in `use-mobile.ts`)

## Performance Features
- **Sampling**: When >50 combinations, shows random sample of 30 by default
- **Lazy Loading**: Combinations generated only when needed
- **Efficient Updates**: State updates minimize re-renders using React optimization patterns
- **Client-side Filtering**: Real-time search and filtering without server round-trips

## Accessibility
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Proper ARIA labels and semantic HTML structure
- **Mobile Touch**: Touch-friendly interface with appropriate sizing
- **Responsive Design**: Adapts layout for different screen sizes

# Technical details

- **State Management**: All state stored client-side using browser localStorage
- **Data Persistence**: State persists across browser refreshes and sessions
- **Project Scope**: Single active set of names (no multiple projects support)
- **Backend**: Prisma + PostgreSQL backend for shareable links feature
- **Database**: PostgreSQL with connection via `DATABASE_URL` environment variable
- **Database Resilience**: Configured for dev server environments with automatic retry logic
- **Timeout Configuration**: 30-second database timeouts with progressive retry delays (8s → 12s → 15s)
- **User Experience**: Clear feedback during database warming periods with retry progress indication
