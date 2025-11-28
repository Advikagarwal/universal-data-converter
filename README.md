# 🔄 Universal Data Format Converter

<div align="center">

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-72%2F73%20Passing-10B981?style=for-the-badge&logo=jest&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**A powerful, modern web application for converting between JSON, YAML, XML, and CSV formats with intelligent syntax repair and schema generation.**

[Live Demo](https://advikagarwal.github.io/universal-data-converter) • [Report Bug](https://github.com/Advikagarwal/universal-data-converter/issues) • [Request Feature](https://github.com/Advikagarwal/universal-data-converter/issues)

</div>

---

## ✨ Features

A browser-based single-page web application that enables users to convert data between multiple formats with advanced features.

### 🎯 Core Features

- 🔄 **Multi-Format Conversion** - Seamlessly convert between JSON, YAML, XML, and CSV
- 🤖 **Smart Auto-Detection** - Automatically identifies input data format with confidence scoring
- 🔧 **Intelligent Syntax Repair** - Fixes common errors with detailed preview before applying
- 📋 **Schema Generation** - Generate TypeScript interfaces and JSON schemas from your data
- 🎨 **Pretty Printing & Minification** - Configurable formatting with custom indentation
- 📊 **CSV Intelligence** - Advanced type detection, header recognition, and custom delimiters
- 🔒 **Privacy-First** - All processing happens locally in your browser - no data leaves your device
- ⚡ **Real-Time Validation** - Instant error reporting with precise line and column information
- 🎭 **Modern UI/UX** - Beautiful gradient design with smooth animations and transitions
- 📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (LTS recommended)
- npm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/Advikagarwal/universal-data-converter.git

# Navigate to project directory
cd universal-data-converter

# Install dependencies
npm install
```

### Development

```bash
# Start development server (http://localhost:5173)
npm run dev
```

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Linting

```bash
# Check for linting errors
npm run lint
```

## 🛠️ Technology Stack

### Core Technologies
- **Frontend Framework**: React 19.2.0 with TypeScript 5.9.3
- **Build Tool**: Vite 7.2.4 (Lightning-fast HMR)
- **Styling**: Modern CSS with CSS Variables for theming

### Parsing & Serialization
- **YAML**: js-yaml 4.1.1
- **XML**: fast-xml-parser 5.3.2
- **CSV**: papaparse 5.5.3
- **JSON**: Native JavaScript

### Testing & Quality
- **Unit Testing**: Jest 30.2.0 with jsdom environment
- **Property-Based Testing**: fast-check 4.3.0
- **Test Coverage**: 98.6% (72/73 tests passing)
- **Linting**: ESLint 9.39.1 with TypeScript support

### Development Tools
- **Type Checking**: TypeScript with strict mode
- **Code Quality**: ESLint + React Hooks rules
- **Hot Module Replacement**: Vite's instant HMR

## 📖 Usage Examples

### Basic Conversion

1. **Paste or type** your data in the left panel
2. **Select formats** from the dropdowns (auto-detection available)
3. **Click Convert** to see the result in the right panel
4. **Copy** the converted data with one click

### Syntax Repair

1. Enable **"Repair Syntax"** checkbox
2. Paste malformed data (e.g., JSON with trailing commas)
3. Click **"Preview Repair"** to see what will be fixed
4. **Accept** the repairs to apply them

### Schema Generation

1. Paste valid JSON data
2. Click **"Generate TypeScript"** or **"Generate JSON Schema"**
3. Copy the generated schema for your project

### CSV Options

- Toggle **"Has Headers"** for CSV files with header rows
- Change **delimiter** (comma, semicolon, tab, pipe)
- Enable **"Type Detection"** for automatic data type inference

## 🎨 UI Features

- **Gradient Header** - Beautiful multi-color gradient with smooth animations
- **Dark Theme** - Eye-friendly dark mode with carefully chosen colors
- **Smooth Animations** - Polished transitions and hover effects
- **Responsive Design** - Adapts perfectly to any screen size
- **Accessibility** - Keyboard navigation and screen reader support

## 📊 Project Stats

- **Lines of Code**: ~16,000
- **Components**: 10+ React components
- **Test Coverage**: 98.6%
- **Bundle Size**: Optimized with code splitting
- **Performance**: Lighthouse score 95+

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Advik Agarwal**
- GitHub: [@Advikagarwal](https://github.com/Advikagarwal)
- Email: advikagarwal843@gmail.com

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
