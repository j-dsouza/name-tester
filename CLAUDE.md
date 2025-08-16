### Tech Stack
- **Frontend**: Next.js 15 with TypeScript, React 18
- **Styling**: TailwindCSS with shadcn/ui components
- **State Management**: Entirely client-side state management. State should be stored in the browser, allowing a user to re-load the page without state being removed
- **UI Components**: shadcn/ui based on Radix UI primitives
- **Forms**: React Hook Form with Zod validation

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
├── lib/             # Utilities and configurations
└── utils/           # Helper functions
```

### Key Dependencies
- **UI**: @radix-ui/* primitives, lucide-react icons, tailwindcss
- **Forms**: react-hook-form, @hookform/resolvers, zod
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

## Page Documentation

This section tracks what each page in the application does and where functionality should be placed. Update this whenever pages are added, modified, or removed.

### Current Pages

#### `/` (Home Page)
- **File**: `src/app/page.tsx`
- **Purpose**: Application landing page with basic homepage content
- **Status**: Minimal implementation
