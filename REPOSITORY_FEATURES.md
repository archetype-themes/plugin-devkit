# Plugin Devkit Repository - Comprehensive Feature Analysis

## Overview

**plugin-devkit** is a Shopify CLI plugin (v1.0.8) developed by Archetype Themes Limited Partnership. It's a TypeScript-based CLI tool built with oclif that enhances Shopify theme development with a component-driven architecture. The plugin enables developers to build modular, reusable Liquid components for Shopify themes.

## Project Structure

### Technology Stack
- **Language**: TypeScript (ES2022 target, Node16 modules)
- **CLI Framework**: oclif (@oclif/core v4)
- **Build System**: TypeScript compiler
- **Package Manager**: npm
- **Node.js Version**: v18.12.0+

### Key Dependencies
- `@oclif/core`: CLI framework
- `chokidar`: File watching
- `deepmerge`: Object merging
- `fs-extra`: File system operations
- `glob`: File pattern matching
- `jsonc`: JSON with comments support
- `parse-imports`: JavaScript import parsing
- `smol-toml`: TOML parsing

### Architecture
- Commands organized under `src/commands/theme/`
- Shared utilities in `src/utilities/`
- Base command class for common functionality
- Argument and flag definitions centralized

## Core Features

### 1. Component Management System

#### Component Collection Structure
Components are organized in a collection directory with:
- `components/` - Contains component folders
- Each component folder contains:
  - `*.liquid` - Main component file (same name as folder)
  - `snippets/` - Related snippet files
  - `assets/` - Component assets (JS, CSS)
  - `setup/` - Setup files (settings_schema.json, settings_data.json, etc.)
- `scripts/` - Global JavaScript files
- `package.json` - Collection metadata

#### Component Node System
The plugin uses a `LiquidNode` data structure to track:
- **Type**: `component`, `snippet`, `asset`, `entry`, `setup`
- **Dependencies**: Snippets referenced via `render`, `include`, `inject`
- **Assets**: JavaScript files referenced via `asset_url` filter or ES6 imports
- **Body**: File content for analysis
- **Theme Folder**: Target location (`assets`, `snippets`, `layout`, `sections`, `templates`, `blocks`)

### 2. Commands

#### Component Commands (`shopify theme component`)

##### `map` - Generate Component Manifest
- **Purpose**: Creates/updates `component.manifest.json` file
- **Features**:
  - Maps component files (snippets and assets) to their source collection
  - Tracks component collection version and commit hash
  - Supports component selection (single, comma-separated, or `*` for all)
  - Handles conflicts and overrides with warnings
  - Recursively processes component dependencies
  - Flags:
    - `--ignore-conflicts` (`-f`): Ignore conflicts when mapping
    - `--ignore-overrides` (`-o`): Ignore overrides when mapping
    - `--collection-name` (`-n`): Override collection name
    - `--collection-version` (`-v`): Override collection version

##### `copy` - Copy Component Files
- **Purpose**: Copies rendered component files into theme directory
- **Features**:
  - Copies snippets and assets from collection to theme
  - Validates manifest exists and version matches
  - Only copies files belonging to current collection
  - Updates files only if changed

##### `clean` - Remove Unused Files
- **Purpose**: Removes component files not in manifest
- **Features**:
  - Scans theme directory for snippets and assets
  - Removes files not listed in `component.manifest.json`
  - Prevents orphaned component files
  - Supports quiet mode (`-q`)

##### `install` - Complete Installation
- **Purpose**: Runs full component installation workflow
- **Features**:
  - Executes in sequence: `map` → `copy` → `clean` → `generate import-map`
  - One-command setup for components
  - Supports component selector

##### `dev` - Development Environment
- **Purpose**: Creates sandboxed development environment
- **Features**:
  - Removes existing `.dev` directory
  - Clones/fetches theme from GitHub or local directory
  - Copies component files and setup files
  - Integrates with `shopify theme dev` for preview
  - File watching with chokidar for auto-sync
  - Flags:
    - `--theme-dir` (`-t`): Theme directory (default: GitHub Explorer theme)
    - `--setup-files` (`-s`): Copy setup files (default: true)
    - `--watch` (`-w`): Watch for changes (default: true)
    - `--preview` (`-y`): Sync to theme directory (default: true)
    - `--generate-import-map` (`-i`): Generate import map
    - `--generate-template-map` (`-m`): Generate template map
    - Theme dev flags: `--host`, `--port`, `--live-reload`, `--store`, `--theme`, `--password`, `--store-password`, `--environment`

#### Generate Commands (`shopify theme generate`)

##### `import-map` - Generate JavaScript Import Map
- **Purpose**: Creates `snippets/head.import-map.liquid` for ES6 module imports
- **Features**:
  - Scans `assets/` directory for `.js` files
  - Creates import map with Shopify `asset_url` filter
  - Supports both `.js` and `.min.js` extensions
  - Generates `<script type="importmap">` snippet

##### `template-map` - Generate Template Route Map
- **Purpose**: Creates `snippets/template-map.liquid` for component routing
- **Features**:
  - Scans `templates/` directory recursively
  - Maps component names to Shopify route templates
  - Supports category-based routing (product, collection, page, etc.)
  - Generates JSON template map with Liquid variables
  - Handles special routes (404, cart, customers, search, etc.)

#### Locale Commands (`shopify theme locale`)

##### `sync` - Sync Locale Files
- **Purpose**: Synchronizes theme locale files with source translations
- **Features**:
  - Fetches locales from GitHub repository or local directory
  - Scans theme files for translation key usage
  - Three sync modes:
    - `add-missing`: Only add new translations
    - `add-and-override`: Add new and override existing
    - `replace-existing`: Replace existing translations only
  - Supports schema and storefront translations separately
  - Handles dynamic translation keys (prefix patterns)
  - Formats locale files (alphabetical sorting)
  - Flags:
    - `--locales-source` (`-l`): Source directory/URL (default: Archetype locales repo)
    - `--mode` (`-m`): Sync mode (default: `add-missing`)
    - `--target`: Process `all`, `schema`, or `storefront` translations
    - `--format`: Sort keys alphabetically
    - `--clean` (`-c`): Remove unreferenced translations after sync

##### `clean` - Remove Unreferenced Translations
- **Purpose**: Removes unused translation keys from locale files
- **Features**:
  - Scans theme files for translation key references
  - Identifies unused keys in locale files
  - Supports prefix-based dynamic keys
  - Formats output files
  - Flags:
    - `--target`: Process `all`, `schema`, or `storefront` translations
    - `--format`: Sort keys alphabetically

### 3. Translation Key Detection

The plugin uses sophisticated regex patterns to detect translation keys:

#### Schema Translations (`t:` pattern)
- Pattern: `"t:translation.key"`
- Scanned directories: `config/`, `blocks/`, `sections/`
- Used in: Schema JSON files

#### Storefront Translations
- Standard Liquid patterns:
  - `{{ 'key' | t }}`
  - `{% assign var = 'key' | t %}`
  - Dynamic prefixes: `'prefix.' | append: x | t`
- `render` locale parameter: `render 'snippet' locale: 'key'`
- `utility.translate` snippet:
  - `key:` parameter
  - `t:` parameter (string or variable)
- Scanned directories: `blocks/`, `layout/`, `sections/`, `snippets/`, `templates/`

### 4. File Processing Utilities

#### Node Analysis
- Parses Liquid files to extract:
  - Snippet dependencies (`render`, `include`, `inject`)
  - JavaScript asset references (`asset_url` filter)
  - ES6 import statements in JS files
  - Component structure and relationships

#### Manifest Management
- `component.manifest.json` structure:
  ```json
  {
    "collections": {
      "collection-name": {
        "commit": "git-commit-hash",
        "version": "1.0.0"
      }
    },
    "files": {
      "snippets": {
        "snippet-name.liquid": "collection-name"
      },
      "assets": {
        "asset.js": "collection-name"
      }
    }
  }
  ```
- Tracks file ownership
- Handles conflicts and overrides
- Supports multiple collections

#### Setup Files Processing
- Merges `settings_schema.json` from multiple components
- Deep merges `settings_data.json` from components
- Copies other setup files to appropriate theme directories

### 5. Git Integration

- Clones theme repositories from GitHub URLs
- Retrieves commit hash for component collections
- Used for version tracking in manifests

### 6. File Watching

- Uses `chokidar` for file system watching
- Watches theme and component directories
- Auto-rebuilds theme on changes
- Syncs changes to development directory

## Utility Functions

### File Operations
- `syncFiles`: Copy entire directory structures
- `cleanDir`: Remove directory contents
- `copyFileIfChanged`: Copy only if file changed
- `writeFileIfChanged`: Write only if content changed

### Object Operations
- `sortObjectKeys`: Alphabetically sort object keys
- `flattenObject`: Flatten nested objects
- `unflattenObject`: Restore nested structure
- `deepMerge`: Deep merge objects

### Logger
- Centralized logging with debug, info, warn, error levels
- Integration with oclif command logging

### Argument & Flag Parsing
- Centralized argument definitions with validation
- Component selector validation
- Theme directory validation
- Flag definitions with defaults

## Testing

- Test files in `test/` directory mirroring `src/` structure
- Uses Mocha test framework
- Test fixtures include:
  - Component collection examples
  - Theme directory structure
  - Locale files

## Development Workflow

### Local Development
1. Clone repository
2. Install dependencies: `npm install`
3. Build: `npm run build` or `npm run watch`
4. Link plugin: `shopify plugins link`
5. Test commands locally

### Component Development Workflow
1. Create component collection structure
2. Develop components in `components/` directory
3. Use `shopify theme component dev` for isolated development
4. Use `shopify theme component install` to integrate into theme
5. Use `shopify theme component map` to update manifest

## Key Design Patterns

### Command Pattern
- All commands extend `BaseCommand`
- Shared initialization logic
- Consistent argument/flag handling

### Node-Based Architecture
- Components, snippets, and assets represented as nodes
- Dependency graph built from nodes
- Recursive dependency resolution

### Manifest-Driven
- Single source of truth: `component.manifest.json`
- Tracks file ownership and versions
- Enables conflict resolution

### Separation of Concerns
- Commands: User-facing CLI operations
- Utilities: Reusable business logic
- Types: Shared type definitions

## Integration Points

### Shopify CLI
- Registered as oclif plugin
- Commands prefixed with `shopify theme`
- Integrates with `shopify theme dev` command

### Shopify Theme Structure
- Respects Shopify theme directory structure
- Works with standard theme folders:
  - `assets/`
  - `config/`
  - `layout/`
  - `sections/`
  - `snippets/`
  - `templates/`
  - `blocks/`
  - `locales/`

## Configuration

### Component Collection
- Requires `package.json` with name and version
- Collection name and version used in manifest
- Can be overridden via flags

### Theme Directory
- Validates theme directory structure
- Requires: `layout/`, `templates/`, `config/` directories
- Supports local paths and GitHub URLs

## Error Handling

- Validates component collection structure
- Validates theme directory structure
- Warns on missing components
- Handles version mismatches
- Provides clear error messages

## Performance Considerations

- Parallel file processing where possible
- File change detection to avoid unnecessary writes
- Efficient glob patterns for file discovery
- Lazy evaluation of file contents

## Future Extensibility

- Plugin architecture allows adding new commands
- Utility functions can be extended
- Node system supports new file types
- Manifest structure can accommodate new metadata

## Security Considerations

- File system operations validate paths
- Git operations use standard git commands
- No arbitrary code execution
- Input validation on all user inputs

## Documentation

- README with command documentation
- CONTRIBUTING guide for developers
- CHANGELOG for version history
- Code comments explain complex logic

## Limitations

- GitHub-only theme cloning (no other Git providers)
- Component selector validation requires components directory
- Manifest must exist before copy operations
- Version checking requires exact match

## Use Cases

1. **Component Library Development**: Build reusable Shopify components
2. **Theme Customization**: Add components to existing themes
3. **Translation Management**: Sync and clean locale files
4. **Isolated Development**: Develop components separately from theme
5. **Import Map Generation**: Enable ES6 modules in Shopify themes
6. **Template Routing**: Map components to theme routes
