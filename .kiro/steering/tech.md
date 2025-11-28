# Technology Stack

## Core Technologies

- **Frontend**: React 19.2.0 with TypeScript 5.9.3 (strict mode)
- **Build Tool**: Vite 7.2.4
- **Styling**: Modern CSS with CSS Variables (no CSS-in-JS or preprocessors)

## Key Libraries

### Parsing & Serialization
- **YAML**: js-yaml 4.1.1
- **XML**: fast-xml-parser 5.3.2
- **CSV**: papaparse 5.5.3
- **JSON**: Native JavaScript

### Testing
- **Unit Testing**: Jest 30.2.0 with jsdom environment
- **Property-Based Testing**: fast-check 4.3.0
- **Testing Library**: @testing-library/react 16.3.0

### Code Quality
- **Linting**: ESLint 9.39.1 with TypeScript support
- **Type Checking**: TypeScript with strict mode enabled

## Common Commands

```bash
# Development
npm run dev              # Start dev server at http://localhost:5173

# Building
npm run build            # TypeScript compile + Vite production build
npm run preview          # Preview production build locally

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # Check for linting errors
```

## Build Configuration

- **Module System**: ES Modules (type: "module" in package.json)
- **TypeScript Config**: Project references pattern (tsconfig.app.json, tsconfig.node.json)
- **Vite Plugin**: @vitejs/plugin-react for React Fast Refresh
