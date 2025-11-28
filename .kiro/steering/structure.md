# Project Structure

## Directory Organization

```
src/
├── components/          # React UI components
│   ├── *.tsx           # Component implementation
│   ├── *.css           # Component-specific styles
│   └── index.ts        # Barrel export
├── services/           # Business logic and data processing
│   ├── parsers/        # Format-specific parsers (JSON, YAML, XML, CSV)
│   ├── serializers/    # Format-specific serializers
│   ├── repair/         # Syntax repair engines
│   ├── schema/         # Schema generation (TypeScript, JSON Schema)
│   ├── conversionController.ts  # Main orchestration service
│   ├── formatDetection.ts       # Auto-detection logic
│   └── index.ts        # Service exports
├── types/              # TypeScript type definitions
│   ├── core.ts         # Core types (formats, results, options)
│   ├── parser.ts       # Parser interfaces
│   ├── serializer.ts   # Serializer interfaces
│   ├── controller.ts   # Controller interfaces
│   ├── repair.ts       # Repair types
│   └── index.ts        # Type exports
├── tests/              # Test utilities and setup
├── utils/              # Shared utility functions
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Architecture Patterns

### Service Layer Pattern
- Business logic isolated in `services/` directory
- Each service has a clear responsibility (parsing, serialization, repair, detection)
- Services are instantiated as singletons (e.g., `conversionController`)

### Parser/Serializer Pattern
- Each format has dedicated parser and serializer classes
- Parsers implement `FormatParser` interface
- Serializers implement `FormatSerializer` interface
- Registered in maps for dynamic lookup

### Component Organization
- Each component has co-located `.tsx` and `.css` files
- Barrel exports via `index.ts` for clean imports
- Components are functional with hooks (no class components)

### Type Organization
- Types grouped by domain (core, parser, serializer, controller, repair)
- Interfaces for extensibility (e.g., adding new formats)
- Strict TypeScript mode enforced

## Naming Conventions

- **Components**: PascalCase (e.g., `ControlPanel.tsx`)
- **Services**: camelCase (e.g., `conversionController.ts`)
- **Types**: PascalCase for interfaces/types (e.g., `SupportedFormat`)
- **Files**: Match primary export name
- **Test Files**: `*.test.ts` or `*.pbt.test.ts` (property-based tests)

## Import Patterns

- Use barrel exports (`index.ts`) for cleaner imports
- Prefer named exports over default exports for services/utilities
- Default exports for React components
- Type imports use `import type` syntax
