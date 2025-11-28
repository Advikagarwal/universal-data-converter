# Implementation Plan

**Status**: 🔧 **MAINTENANCE** - Core implementation complete with one failing test to fix.

**Summary**:
- 72 tasks completed successfully
- 98.6% test coverage (72/73 tests passing)
- Application deployed and operational at https://advikagarwal.github.io/universal-data-converter
- 12 of 13 correctness properties validated (Property 12 has 1 failing test)
- All core features implemented and functional

- [x] 1. Set up project structure and core interfaces
  - Create React TypeScript project with Vite build tool
  - Set up directory structure for components, services, types, and tests
  - Install required dependencies (js-yaml, fast-xml-parser, papaparse, fast-check)
  - Define core TypeScript interfaces for parsers, serializers, and conversion results
  - _Requirements: 8.1, 8.2_

- [x] 1.1 Set up testing framework and configuration
  - Configure Jest for unit testing
  - Configure fast-check for property-based testinX3u29gf9guYcvfBg
  - Create test utilities and helper functions
  - _Requirements: 8.1_

- [x] 2. Implement format detection system
  - Create format detection service with pattern matching for JSON, YAML, XML, CSV
  - Implement confidence scoring for ambiguous inputs
  - Add fallback to manual format selection for uncertain cases
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 2.1 Write property test for format detection accuracy
  - **Property 5: Format detection accuracy**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

- [x] 3. Create format parsers
- [x] 3.1 Implement JSON parser with error handling
  - Create JSON parser wrapper with detailed error reporting
  - Add line/column error information extraction
  - _Requirements: 1.1, 7.1_

- [x] 3.2 Implement YAML parser with js-yaml integration
  - Create YAML parser wrapper with error handling
  - Add support for YAML-specific error reporting
  - _Requirements: 1.4, 7.1_

- [x] 3.3 Implement XML parser with fast-xml-parser integration
  - Create XML parser wrapper with error handling
  - Configure parser options for consistent JSON conversion
  - _Requirements: 1.5, 7.1_

- [x] 3.4 Implement CSV parser with papaparse integration
  - Create CSV parser with configurable options
  - Add support for header detection and type inference
  - _Requirements: 1.6, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 3.5 Write property test for CSV type detection consistency
  - **Property 8: CSV type detection consistency**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.5**

- [x] 3.6 Write property test for CSV header processing
  - **Property 9: CSV header processing**
  - **Validates: Requirements 6.4**

- [x] 4. Create format serializers
- [x] 4.1 Implement JSON serializer with formatting options
  - Create JSON serializer with pretty-print and minify options
  - Add configurable indentation support
  - _Requirements: 1.1, 5.1, 5.2, 5.3_

- [x] 4.2 Implement YAML serializer with js-yaml integration
  - Create YAML serializer with formatting options
  - Ensure proper YAML structure and spacing preservation
  - _Requirements: 1.2, 5.1, 5.5_

- [x] 4.3 Implement XML serializer with fast-xml-parser integration
  - Create XML serializer with proper tag hierarchy
  - Add pretty-printing with configurable indentation
  - _Requirements: 1.3, 5.1, 5.4_

- [x] 4.4 Implement CSV serializer with papaparse integration
  - Create CSV serializer handling flat data structures
  - Add support for header generation and custom delimiters
  - _Requirements: 1.6, 5.1_

- [x] 4.5 Write property test for pretty-printing preservation
  - **Property 6: Pretty-printing preservation**
  - **Validates: Requirements 5.1, 5.3, 5.4, 5.5**

- [x] 4.6 Write property test for minification preservation
  - **Property 7: Minification preservation**
  - **Validates: Requirements 5.2**

- [x] 5. Implement syntax repair engine
- [x] 5.1 Create JSON syntax repair functionality
  - Implement repair for missing commas, trailing commas, unclosed quotes
  - Add bracket/brace matching and repair
  - Track and report all applied fixes
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 5.2 Create basic syntax repair for other formats
  - Implement basic YAML indentation repair
  - Add XML tag closing repair
  - Create CSV delimiter and quote repair
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 5.3 Write property test for syntax repair effectiveness
  - **Property 2: Syntax repair effectiveness**
  - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

- [x] 5.4 Write property test for repair reporting completeness
  - **Property 3: Repair reporting completeness**
  - **Validates: Requirements 2.5**

- [x] 6. Create schema generation system
- [x] 6.1 Implement TypeScript interface generator
  - Create TypeScript AST generation from JSON objects
  - Handle nested objects, arrays, and primitive types
  - Generate proper TypeScript syntax with type annotations
  - _Requirements: 3.1, 3.3, 3.4_

- [x] 6.2 Implement JSON schema generator
  - Create JSON Schema specification compliant generator
  - Handle all JSON Schema types and constraints
  - Support nested schemas and array type inference
  - _Requirements: 3.2, 3.3, 3.4_

- [x] 6.3 Write property test for schema generation validity
  - **Property 4: Schema generation validity**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [x] 7. Build conversion controller
- [x] 7.1 Create main conversion orchestration service
  - Implement conversion workflow: detect → parse → convert → serialize
  - Add error handling and result aggregation
  - Integrate syntax repair into conversion pipeline
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 7.2_

- [x] 7.2 Add comprehensive error handling and reporting
  - Implement detailed error messages with location information
  - Add data loss warnings for incompatible conversions
  - Create problem highlighting for validation issues
  - Add repair preview functionality
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 7.3 Write property test for round-trip conversion consistency
  - **Property 1: Round-trip conversion consistency**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**

- [x] 7.4 Write property test for error message informativeness
  - **Property 10: Error message informativeness**
  - **Validates: Requirements 7.1, 7.2**

- [x] 7.5 Write property test for data loss warnings
  - **Property 11: Data loss warnings**
  - **Validates: Requirements 7.3**

- [x] 7.6 Write property test for problem highlighting
  - **Property 12: Problem highlighting**
  - **Validates: Requirements 7.4**

- [x] 7.7 Write property test for repair preview accuracy
  - **Property 13: Repair preview accuracy**
  - **Validates: Requirements 7.5**

- [x] 8. Fix failing property-based test for data loss warnings
  - Fix the XML array warning test - the warning message needs to match test expectations
  - The test expects warnings containing "root" or "xml" keywords
  - Ensure all property-based tests pass with 100+ iterations
  - _Requirements: 7.3_

- [x] 9. Checkpoint - Ensure all core services are working
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Create React UI components
- [x] 10.1 Build main application layout component
  - Create three-pane layout with input, controls, and output areas
  - Add responsive design for different screen sizes
  - Implement basic styling and user interface structure
  - _Requirements: 8.1_

- [x] 10.2 Create input/output text area components
  - Build text areas for input and output with proper styling
  - Add copy/paste functionality and keyboard shortcuts
  - Implement auto-resize and scroll handling
  - _Requirements: 8.1_

- [x] 10.3 Build format selection and conversion controls
  - Create dropdown selectors for input and output formats
  - Add conversion, repair, and schema generation buttons
  - Implement format auto-detection toggle
  - _Requirements: 4.5, 8.1_

- [x] 10.4 Create options and settings panel
  - Build collapsible options panel for conversion settings
  - Add CSV options (headers, type detection, delimiters)
  - Create formatting options (pretty-print, minify, indentation)
  - _Requirements: 5.1, 5.2, 5.3, 6.4, 6.5_

- [x] 10.5 Implement error display and user feedback components
  - Create error message display component
  - Add warning notifications for data loss scenarios
  - Implement repair preview modal with before/after comparison
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 11. Integrate services with UI components
- [x] 11.1 Connect conversion controller to UI
  - Wire up format selection to conversion service
  - Implement conversion on button click or input changes
  - Add loading states and progress indicators
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 11.2 Integrate format detection with UI
  - Connect auto-detection service to format selectors
  - Add visual feedback for detected formats
  - Implement manual override for uncertain detection
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 11.3 Connect syntax repair to UI workflow
  - Integrate repair engine with conversion pipeline
  - Add repair preview and confirmation dialogs
  - Display repair results and applied fixes
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 11.4 Wire up schema generation features
  - Connect schema generators to UI buttons
  - Add schema output display and copy functionality
  - Implement schema download options
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 12. Final checkpoint - Ensure all tests pass and application works
  - Ensure all tests pass, ask the user if questions arise.

---

## 🔧 Remaining Tasks

### Bug Fixes

- [x] 13. Fix failing Property 12 test for problem highlighting
  - The test "should highlight problematic sections for parsing errors" is failing
  - Counterexample: `{"key": "value}` (unclosed string)
  - The test expects `highlightProblems` to return highlights with proper structure
  - Issue: When parsing fails, the error may not have proper line/column info, or highlights array is empty
  - Debug the `highlightProblems` method in `conversionController.ts`
  - Ensure all parsing errors include line and column information
  - Verify highlight calculation logic handles edge cases
  - _Requirements: 7.4_
  - _Property: Property 12 - Problem highlighting_

---

## 🚀 Future Enhancements (Not Started)

The following tasks represent future enhancements identified in the requirements document (Requirements 9-13). These are not currently prioritized but represent valuable additions to the converter.

### Additional Format Support (Requirement 9)

- [ ] 14. Add TOML format support
- [ ] 14.1 Implement TOML parser using @iarna/toml or smol-toml
  - Create TomlParser class implementing FormatParser interface
  - Add error handling and line/column reporting
  - _Requirements: 9.1, 9.2_

- [ ] 14.2 Implement TOML serializer
  - Create TomlSerializer class implementing FormatSerializer interface
  - Support pretty-printing options
  - _Requirements: 9.1, 9.2_

- [ ] 14.3 Add TOML to format detection
  - Extend FormatDetectionService with TOML pattern matching
  - _Requirements: 9.1_

- [ ]* 14.4 Write property test for TOML round-trip consistency
  - **Property 14: Additional format round-trip consistency**
  - **Validates: Requirements 9.1, 9.2**

- [ ] 15. Add Protocol Buffers support
- [ ] 15.1 Implement Protocol Buffers parser using protobufjs
  - Handle schema-based parsing
  - _Requirements: 9.3_

- [ ] 15.2 Implement Protocol Buffers serializer
  - _Requirements: 9.3_

- [ ]* 15.3 Write property test for Protocol Buffers round-trip
  - **Property 14: Additional format round-trip consistency**
  - **Validates: Requirements 9.3**

- [ ] 16. Add MessagePack support
- [ ] 16.1 Implement MessagePack parser using @msgpack/msgpack
  - Handle binary data decoding
  - _Requirements: 9.4_

- [ ] 16.2 Implement MessagePack serializer
  - _Requirements: 9.4_

- [ ]* 16.3 Write property test for MessagePack round-trip
  - **Property 14: Additional format round-trip consistency**
  - **Validates: Requirements 9.4**

### Web Workers for Performance (Requirement 10)

- [ ] 17. Implement Web Worker support for large datasets
- [ ] 17.1 Create Web Worker file for parsing operations
  - Implement message-based communication protocol
  - Add support for all format parsers
  - _Requirements: 10.1_

- [ ] 17.2 Create Web Worker file for serialization operations
  - Implement message-based communication protocol
  - Add support for all format serializers
  - _Requirements: 10.1_

- [ ] 17.3 Implement WorkerController service
  - Add size threshold detection (1MB)
  - Implement progress reporting
  - Add graceful fallback to main thread
  - _Requirements: 10.1, 10.2, 10.4_

- [ ] 17.4 Integrate Web Workers into conversion controller
  - Update convert() method to use workers for large data
  - Add progress indicators in UI
  - _Requirements: 10.1, 10.2, 10.3_

- [ ]* 17.5 Write property test for worker processing equivalence
  - **Property 15: Worker processing equivalence**
  - **Validates: Requirements 10.1, 10.3**

### Conversion Presets (Requirement 11)

- [ ] 18. Implement conversion presets system
- [ ] 18.1 Create PresetManager service
  - Implement localStorage-based persistence
  - Add CRUD operations for presets
  - _Requirements: 11.1, 11.2_

- [ ] 18.2 Add preset UI components
  - Create preset save dialog
  - Add preset list/selector
  - Implement preset management (rename, delete)
  - _Requirements: 11.1, 11.3, 11.4_

- [ ] 18.3 Add preset import/export functionality
  - Allow sharing presets via JSON files
  - _Requirements: 11.1_

- [ ]* 18.4 Write property test for preset configuration fidelity
  - **Property 16: Preset configuration fidelity**
  - **Validates: Requirements 11.2, 11.3**

### Query-Based Data Extraction (Requirement 12)

- [ ] 19. Implement query engine for data extraction
- [ ] 19.1 Add JSONPath support using jsonpath-plus
  - Create QueryEngine service
  - Implement JSONPath query execution
  - Add query validation
  - _Requirements: 12.1, 12.3, 12.4_

- [ ] 19.2 Add XPath support for XML
  - Implement XPath query execution
  - Use browser's native XPath or xpath library
  - _Requirements: 12.2, 12.3, 12.4_

- [ ] 19.3 Add query UI components
  - Create optional query input field
  - Show match count and preview
  - Add query syntax help
  - _Requirements: 12.1, 12.2_

- [ ]* 19.4 Write property test for query result consistency
  - **Property 17: Query result consistency**
  - **Validates: Requirements 12.1, 12.2**

### Batch Conversion (Requirement 13)

- [ ] 20. Implement batch file conversion
- [ ] 20.1 Create BatchController service
  - Implement file processing queue
  - Add progress tracking per file
  - Handle errors without blocking other files
  - _Requirements: 13.1, 13.2, 13.4_

- [ ] 20.2 Add batch UI components
  - Create file input with multiple selection
  - Add batch progress indicators
  - Show per-file status
  - _Requirements: 13.1, 13.2_

- [ ] 20.3 Implement ZIP archive generation using JSZip
  - Generate downloadable ZIP of converted files
  - Add error report file
  - _Requirements: 13.3_

- [ ]* 20.4 Write property test for batch processing independence
  - **Property 18: Batch processing independence**
  - **Validates: Requirements 13.1, 13.4**

### Performance Optimizations

- [ ] 21. Add result caching for repeated conversions
  - Implement memoization for identical inputs
  - Add cache invalidation strategy
  - Measure performance improvements

- [ ] 22. Optimize bundle size
  - Implement dynamic imports for format libraries
  - Add code splitting for UI components
  - Measure and optimize bundle size

### Additional Improvements

- [ ] 23. Add keyboard shortcuts
  - Implement common shortcuts (Ctrl+Enter to convert, etc.)
  - Add shortcut help modal

- [ ] 24. Add light theme option
  - Create light theme CSS variables
  - Add theme toggle in UI
  - Persist theme preference

- [ ] 25. Add syntax highlighting in text areas
  - Integrate CodeMirror or Monaco Editor
  - Add format-specific syntax highlighting

- [ ] 26. Implement PWA support
  - Add service worker for offline usage
  - Create manifest.json
  - Add install prompt