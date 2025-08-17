### Tech Stack
- **Frontend**: Next.js 15 with TypeScript, React 18
- **Styling**: TailwindCSS with shadcn/ui components
- **State Management**: Entirely client-side state management using localStorage for persistence
- **UI Components**: shadcn/ui based on Radix UI primitives
- **Forms**: React Hook Form with Zod validation for name input textareas

### Component Architecture
- **UI Components**: Use shadcn/ui components exclusively (`@/components/ui/`)
- **Component Path Aliases**: `@/components`, `@/hooks`, `@/lib`, `@/utils`, `@/consts`
- **Constants**: All constants should be placed in `src/consts/` folder
- **Styling**: TailwindCSS only, configured with CSS variables for theming

### File Structure
```
src/
├── app/              # Next.js app directory
├── components/       # React components
│   └── ui/          # shadcn/ui components
├── consts/          # Constants and configuration values
├── hooks/           # Custom React hooks (including localStorage persistence)
├── lib/             # Utilities and configurations
└── utils/           # Helper functions (name combinations, filtering, sampling)
```

### Key Dependencies
- **UI**: @radix-ui/* primitives, lucide-react icons, tailwindcss
- **Forms**: react-hook-form, @hookform/resolvers, zod
- **Database**: Prisma ORM with PostgreSQL
- **AI**: OpenAI API for name suggestions
- **Development**: ESLint, TypeScript

## Development Guidelines

### Component Development
- Always use shadcn/ui components as base building blocks
- Follow the shadcn/ui component patterns and conventions
- Use TailwindCSS for all styling (no CSS modules or styled-components)
- Leverage the existing Radix UI primitives already installed

### Responsive Design Requirements
- ALL pages and components MUST be responsive and work across devices
- Use the `useIsMobile` hook from `@/hooks/use-mobile` for device-specific logic when needed
- Prefer TailwindCSS responsive utilities (sm:, md:, lg:, xl:) for layout adaptations
- Mobile breakpoint is set at 768px (as defined in use-mobile.ts)
- Test layouts on both mobile and desktop viewports
- Ensure forms, buttons, and interactive elements are touch-friendly on mobile
- Use appropriate spacing and sizing that works well on small screens

## Application Constants

### Name Combination Limits
- **COMBINATION_THRESHOLD**: 50 combinations (threshold for showing all vs sampling)
- **SAMPLE_SIZE**: When >50 combinations, show random sample of reasonable size

### Display Format
- **Name Display**: "First Middle Last" with initials in separate column ("F.M.L.")
- **Input Method**: Textarea inputs with newline-separated names
- **Multiple Middle Names**: Supported (space-separated)

## Data Architecture

### Application State Management
- **Storage**: Client-side localStorage with key 'name-tester-data'
- **State Shape**: Defined in `src/consts/app.ts` as `AppState` interface
- **Persistence**: Automatic via `useLocalStorage` hook in `src/hooks/use-local-storage.ts`
- **Hydration**: SSR-safe with initialization flag to prevent client/server mismatch

### Data Flow
1. **Input**: Names entered via textareas in NameManagerModal
2. **Processing**: Parsed for nickname syntax in `src/utils/name-combinations.ts`
3. **Generation**: All combinations computed with `generateCombinations()`
4. **Display**: Filtered, sorted, and optionally sampled for UI
5. **Persistence**: State automatically saved to localStorage on changes

### Name Processing Pipeline
```
Input: "Thomas (Tom)" → ParsedName { full: "Thomas", nicknames: ["Tom"] }
↓
Combination Generation: Creates variants for all nickname combinations
↓
ID Generation: Unique IDs based on full name + nickname variant
↓
Display: Shows "Legal Name" (full) and "Used Name" (nickname preference)
```

## Component Architecture

### Component Hierarchy
```
HomePage (src/app/page.tsx)
├── Tabs (All Combinations | Shortlist)
├── NameCombinationDisplay
│   ├── Search input
│   ├── Sampling alerts
│   ├── Combination table with shortlist controls
│   └── Action buttons (Settings, Manage Names)
├── ShortlistDisplay
│   ├── Shortlisted combinations table
│   └── Management controls (clear, remove)
├── NameManagerModal
│   ├── Name input textareas (first, middle, last)
│   ├── AI suggestion buttons with conditional enabling
│   └── Form validation and submission
└── SettingsModal
    ├── Display preferences toggles
    ├── Filtering options
    └── Sorting preferences
```

### State Management Patterns
- **Single Source of Truth**: All state in `appState` object
- **Immutable Updates**: State updates via `setAppState` with spread operator
- **Derived State**: Combinations computed via `useMemo` from name arrays
- **Event Handlers**: Passed down as props for state updates

## Feature Integration Points

### Shareable Links Integration
The shareable links feature is implemented with robust database retry functionality:
- **API Routes**: `src/app/api/share/route.ts` and `src/app/api/load/[shortlink]/route.ts`
- **Load Page**: `src/app/load/[shortlink]/page.tsx` for rehydration
- **Share Button**: Integrated in NameCombinationDisplay component header
- **Database Schema**: Prisma with shared_links table
- **State Serialization**: Complete `AppState` serialized to JSON for storage
- **Database Retry Logic**: Automatic retry with warming up messages for dev server scenarios

### Database Retry Architecture
- **Hook**: `useRetryWithWarmup` in `src/hooks/use-retry-with-warmup.ts` provides centralized retry logic
- **Timeout Configuration**: 30-second timeouts with automatic retries (up to 3 attempts)
- **Exponential Backoff**: 8s → 12s → 15s delays between retries for total 2.5+ minute retry window
- **User Feedback**: Progressive warming up messages and retry progress indication
- **Error Handling**: Graceful degradation with clear error messages for persistent failures

### AI Name Suggestions Integration
The AI name suggestions feature provides intelligent name recommendations using OpenAI's API:
- **API Route**: `src/app/api/suggest-names/route.ts` for OpenAI GPT-4.1-mini integration
- **Structured Outputs**: Uses Zod schema with `zodResponseFormat` to ensure clean response format
- **Schema Validation**: Multi-layer validation (OpenAI structured outputs + Zod parsing + regex validation)
- **Button Integration**: Suggestion buttons embedded in NameManagerModal component next to textarea labels
- **Requirements Logic**: Smart enabling/disabling based on minimum name criteria
- **Security**: Server-side API key handling with no client exposure
- **Error Handling**: Comprehensive error handling for API failures, rate limits, JSON parsing, and schema validation
- **Mobile Optimization**: Touch-friendly buttons with AlertDialog popups for disabled state feedback
- **Desktop UX**: Tooltip system for disabled button explanations
- **Loading States**: Spinner indicators during API calls with "Suggesting..." text
- **Toast Integration**: Success/error notifications via existing toast system
- **Name Processing**: Generated names use existing parsing pipeline for nickname syntax support
- **Response Processing**: JSON parsing → Schema validation → Regex validation → Client response

## Page Documentation

This section tracks what each page in the application does and where functionality should be placed. Update this whenever pages are added, modified, or removed.

### Current Pages

#### `/` (Home Page)
- **File**: `src/app/page.tsx`
- **Purpose**: Main application interface with name input, combination display, and shortlisting
- **Features**: 
  - Name input textareas (first, middle, last)
  - Combination generation and display
  - Shortlisting functionality
  - Inline and modal editing options
- **State Management**: Full `AppState` management with localStorage persistence
- **Key Components**: NameCombinationDisplay, ShortlistDisplay, NameManagerModal, SettingsModal

### Implemented Pages (Shareable Links Feature)

#### `/load/[shortlink]` (Load Shared Data)
- **File**: `src/app/load/[shortlink]/page.tsx`
- **Purpose**: Load shared name combinations from database and optionally replace local state
- **Features**:
  - Validate shortlink parameter
  - Fetch shared data from API with automatic retry functionality
  - Show warning modal before overwriting local data
  - Handle invalid/expired links gracefully
  - Database warming up notifications with progress indicators
- **Error States**: Invalid link, database unavailable, expired data
- **Retry Logic**: Uses `useRetryWithWarmup` hook for robust database connection handling
