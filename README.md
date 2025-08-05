# Oceano Admin - Infrastructure Module

## Overview

This module provides comprehensive infrastructure management capabilities for the Oceano platform, following a scalable and maintainable architecture pattern.

## Folder Structure

```
src/
├── components/
│   ├── business/
│   │   └── infrastructure/           # Infrastructure-specific components
│   │       ├── MetricsCard.tsx       # Reusable metrics display card
│   │       ├── ServiceTable.tsx      # Service management table
│   │       ├── SystemOverview.tsx    # System metrics overview
│   │       ├── QuickActions.tsx      # Quick action buttons
│   │       ├── RecentEvents.tsx      # Recent events panel
│   │       ├── SystemHealth.tsx      # System health indicators
│   │       └── index.ts              # Barrel exports
│   └── common/
│       └── ui/                       # Shared UI components
├── lib/
│   ├── hooks/
│   │   └── useInfrastructure.ts      # Infrastructure data management hook
│   ├── stores/
│   │   └── infrastructure.store.ts   # Global infrastructure state
│   └── utils/
│       ├── format.ts                 # Formatting utilities
│       └── constants.ts              # Application constants
├── services/
│   └── infrastructure/
│       └── InfrastructureService.ts  # Infrastructure business logic
└── routes/
    └── home/
        └── infrastructure/
            └── index.tsx             # Main infrastructure page
```

## Architecture Principles

### 1. **Separation of Concerns**

- **Components**: Pure UI components with minimal business logic
- **Services**: Business logic and API communication
- **Hooks**: State management and component logic
- **Utils**: Reusable utility functions

### 2. **Component Hierarchy**

- **Common Components**: Shared across the entire application
- **Business Components**: Domain-specific (infrastructure, sales, etc.)
- **Feature Components**: Grouped by specific features

### 3. **Data Flow**

```
Service Layer → Hook → Component
     ↓           ↓        ↓
   API Calls   State    Render
```

## Usage Examples

### Using Infrastructure Components

```tsx
import {
  SystemOverview,
  ServiceTable,
} from "~/components/business/infrastructure";
import { useInfrastructure } from "~/lib/hooks/useInfrastructure";

export default component$(() => {
  const { services, metrics, refresh } = useInfrastructure();

  return (
    <div>
      <SystemOverview metrics={metrics} />
      <ServiceTable services={services} onServiceAction={handleAction} />
    </div>
  );
});
```

### Using Utilities

```tsx
import { formatBytes, formatUptime } from "~/lib/utils/format";
import { SERVICE_STATUS, STATUS_COLORS } from "~/lib/utils/constants";

const memoryUsage = formatBytes(service.memory * 1024 * 1024);
const uptime = formatUptime(service.uptimeSeconds);
```

## Benefits of This Structure

### 🎯 **Maintainability**

- Clear separation of concerns
- Easy to locate and modify specific functionality
- Consistent naming conventions

### 🔧 **Reusability**

- Components can be easily reused across different pages
- Utility functions shared across modules
- Service layer abstracts API complexity

### 📈 **Scalability**

- Easy to add new modules following the same pattern
- Components can be extended without affecting others
- Clear dependencies between layers

### 🧪 **Testability**

- Each layer can be tested independently
- Mock services for component testing
- Utility functions are pure and easily testable

### 👥 **Team Collaboration**

- Clear folder structure makes it easy for team members to find code
- Consistent patterns reduce learning curve
- Barrel exports simplify imports

## Adding New Features

### 1. **New Component**

```bash
# Create component
touch src/components/business/infrastructure/NewComponent.tsx

# Add to barrel export
echo 'export { default as NewComponent } from "./NewComponent";' >> src/components/business/infrastructure/index.ts
```

### 2. **New Service Method**

```tsx
// Add to InfrastructureService.ts
async newServiceMethod(): Promise<SomeType> {
  // Implementation
}
```

### 3. **New Hook**

```tsx
// Create in src/lib/hooks/
export function useNewFeature() {
  // Hook implementation
}
```

## Best Practices

1. **Keep components pure**: Minimize side effects in components
2. **Use TypeScript**: Leverage strong typing for better development experience
3. **Follow naming conventions**: Use descriptive names that indicate purpose
4. **Document complex logic**: Add comments for business logic and algorithms
5. **Test at the right level**: Unit test utilities, integration test hooks, e2e test pages

## Migration Guide

When refactoring existing code to this structure:

1. **Extract components**: Move large components into smaller, focused ones
2. **Create services**: Move API calls and business logic to service classes
3. **Use hooks**: Replace direct state management with custom hooks
4. **Add utilities**: Extract common functions to utility modules
5. **Update imports**: Use barrel exports for cleaner import statements
