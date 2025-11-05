# Component Dev Command - Deep Dive

## Overview

The `shopify theme component dev` command creates a **sandboxed development environment** for developing Shopify theme components in isolation. It sets up a temporary theme directory, integrates your components, and optionally launches a live preview server with file watching.

## Command Signature

```bash
shopify theme component dev [COMPONENTSELECTOR] [FLAGS]
```

### Arguments

- **`COMPONENTSELECTOR`** (optional, default: `*`)
  - Component name(s) to include in dev environment
  - Can be:
    - Single component: `header`
    - Multiple components: `header,footer,navigation`
    - All components: `*` (default)
  - Validates component names exist in collection
  - Only allows alphanumeric, hyphens, and underscores

### Flags

#### Component Collection Flags
- **`--collection-name` (`-n`)** - Override collection name from package.json
- **`--collection-version` (`-v`)** - Override collection version from package.json

#### Theme Source Flags
- **`--theme-dir` (`-t`)** - Theme directory path or GitHub URL
  - Default: `https://github.com/archetype-themes/explorer`
  - Can be:
    - Local path: `./my-theme` or `/absolute/path/to/theme`
    - GitHub URL: `https://github.com/user/repo`
    - Only GitHub URLs are supported (not GitLab, Bitbucket, etc.)

#### Development Flags
- **`--setup-files` (`-s`)** - Copy setup files to theme directory
  - Default: `true`
  - Copies files from `components/*/setup/` directories
  - Merges `settings_schema.json` and `settings_data.json`
- **`--watch` (`-w`)** - Watch for changes and rebuild
  - Default: `true`
  - Watches both theme directory and components directory
- **`--preview` (`-y`)** - Launch Shopify theme dev server
  - Default: `true`
  - Runs `shopify theme dev` after building
- **`--generate-import-map` (`-i`)** - Generate import map
  - Default: `true`
  - Creates `snippets/head.import-map.liquid`
- **`--generate-template-map` (`-m`)** - Generate template map
  - Default: `true`
  - Creates `snippets/template-map.liquid`
  - Only runs if `--setup-files` is enabled

#### Shopify Theme Dev Flags (passed through)
- **`--host`** - Network interface for web server (default: `127.0.0.1`)
- **`--port`** - Local port for preview server
- **`--live-reload`** - Enable browser auto-reload
- **`--store`** - Store URL (e.g., `example.myshopify.com`)
- **`--theme`** - Remote theme ID or name
- **`--password`** - Theme Access app password
- **`--store-password`** - Storefront password protection
- **`--environment`** - Environment configuration

## Execution Flow

### Phase 1: Initialization

1. **Parse Arguments & Flags**
   - Validates component selector
   - Resolves theme directory source
   - Sets up working directories

2. **Directory Setup**
   - Collection directory: `process.cwd()` (where command is run)
   - Components directory: `./components/`
   - Dev directory: `./.dev/` (created in collection directory)
   - Watch directory: `./.dev/.watch/` (staging area for rebuilds)

3. **Clean Dev Directory**
   - Removes existing `.dev/` directory if present
   - Creates fresh `.dev/` directory
   - Ensures clean state for each dev session

### Phase 2: Theme Acquisition

The command determines the theme source based on `--theme-dir`:

#### GitHub URL (Default)
```typescript
if (themeDir.startsWith('http')) {
  // Clone repository
  const themeDir = path.join(devDir, '.repo')
  await cloneTheme(url, themeDir)
  return themeDir
}
```

- Uses `git clone` to fetch theme repository
- Cloned to `.dev/.repo/` subdirectory
- Only supports GitHub URLs (`github.com` or `*.github.com`)
- Throws error for unsupported Git providers

#### Local Path
```typescript
return path.resolve(process.cwd(), themeDir)
```

- Resolves relative or absolute paths
- Validates theme directory structure
- Must contain: `layout/`, `templates/`, `config/` directories

### Phase 3: Theme Building

The `buildTheme()` method orchestrates the build process:

#### Step 1: Copy Theme Files
```typescript
syncFiles(params.themeDir, destination)
```

- Recursively copies all theme files to `.dev/` directory
- Uses content comparison to avoid unnecessary copies
- Removes files not present in source
- Ignores dotfiles (`.git`, `.dev`, etc.)

#### Step 2: Copy Setup Files (if enabled)
```typescript
if (params.setupFiles) {
  await copySetupComponentFiles(
    process.cwd(),
    destination,
    params.componentSelector
  )
}
```

Setup files are found in `components/*/setup/` directories:

**Settings Schema Merging:**
- Finds all `settings_schema.json` files
- Parses each as JSON array
- Merges arrays together (concatenates)
- Writes to `config/settings_schema.json`

**Settings Data Merging:**
- Finds all `settings_data.json` files
- Parses each as JSON object
- Deep merges objects (preserves nested structure)
- Writes to `config/settings_data.json`

**Other Setup Files:**
- Copies other files (e.g., templates, sections, blocks) to appropriate theme folders
- Respects component selector - only includes selected components

**Example Setup File Structure:**
```
components/
  header/
    setup/
      templates/
        index.header.liquid
      sections/
        header.liquid
      config/
        settings_schema.json
        settings_data.json
```

#### Step 3: Install Components
```typescript
await Install.run([destination])
```

This runs the full component installation workflow:

1. **Map** (`shopify theme component map`)
   - Generates/updates `component.manifest.json`
   - Maps component files to collection
   - Tracks dependencies recursively
   - Handles conflicts and overrides

2. **Copy** (`shopify theme component copy`)
   - Copies component snippets and assets from collection to theme
   - Only copies files belonging to current collection
   - Validates manifest exists and version matches

3. **Clean** (`shopify theme component clean`)
   - Removes files not in manifest
   - Prevents orphaned files

4. **Generate Import Map** (`shopify theme generate import-map`)
   - Creates `snippets/head.import-map.liquid`
   - Maps JavaScript files to Shopify asset URLs
   - Enables ES6 module imports

#### Step 4: Generate Template Map (conditional)
```typescript
if (params.generateTemplateMap && params.setupFiles) {
  await GenerateTemplateMap.run([destination, '--quiet'])
}
```

- Only runs if both flags are enabled
- Scans `templates/` directory recursively
- Creates `snippets/template-map.liquid`
- Maps component routes for navigation

### Phase 4: Preview Server (if enabled)

```typescript
if (preview) {
  const additionalArgs = this.getThemeDevFlags()
  await this.config.runCommand(`theme:dev`, ['--path', devDir, ...additionalArgs])
}
```

- Calls Shopify CLI's `theme:dev` command
- Passes `--path` pointing to `.dev/` directory
- Forwards all Shopify theme dev flags
- Launches live preview server
- Connects to Shopify store for real-time preview

### Phase 5: File Watching (if enabled)

```typescript
if (watch) {
  return this.setupWatcher(devDir, themeDir, componentsDir, buildThemeParams)
}
```

#### Watcher Setup

**Watched Directories:**
- Theme directory (source, not `.dev/`)
- Components directory (`./components/`)

**Watcher Configuration:**
```typescript
chokidar.watch([themeDir, componentsDir], {
  ignoreInitial: true,  // Don't trigger on initial scan
  ignored: /(^|[/\\])\../,  // Ignore dotfiles
  persistent: true  // Keep watching
})
```

#### Rebuild Process

When changes are detected:

1. **Rebuild to Staging Directory**
   ```typescript
   await this.buildTheme(watchDir, buildThemeParams)
   ```
   - Builds theme to `.dev/.watch/` directory
   - Re-runs entire build process
   - Includes all component installation steps

2. **Sync to Dev Directory**
   ```typescript
   syncFiles(watchDir, devDir)
   ```
   - Syncs changes from staging to `.dev/`
   - Only copies changed files
   - Removes deleted files

3. **Shopify Theme Dev Auto-Reload**
   - Shopify CLI's `theme dev` watches `.dev/` directory
   - Automatically syncs changes to Shopify
   - Browser auto-reloads (if `--live-reload` enabled)

## Directory Structure

After running the command, the directory structure looks like:

```
collection-directory/
├── components/              # Source components
│   ├── header/
│   │   ├── header.liquid
│   │   ├── snippets/
│   │   ├── assets/
│   │   └── setup/
│   └── footer/
│       └── ...
├── scripts/                 # Global scripts
├── package.json
└── .dev/                    # Generated dev environment
    ├── .repo/               # Cloned theme (if from GitHub)
    ├── .watch/              # Staging directory for rebuilds
    ├── assets/
    ├── config/
    ├── layout/
    ├── locales/
    ├── sections/
    ├── snippets/
    ├── templates/
    └── component.manifest.json
```

## Use Cases

### 1. Isolated Component Development

Develop a single component without affecting the main theme:

```bash
shopify theme component dev header --no-preview
```

- Creates isolated environment
- Only includes `header` component
- No preview server (build only)

### 2. Multi-Component Development

Develop multiple related components together:

```bash
shopify theme component dev header,footer,navigation
```

- Includes all three components
- Includes their dependencies
- Full preview environment

### 3. Full Theme Integration Testing

Test components in a complete theme context:

```bash
shopify theme component dev \
  --theme-dir https://github.com/archetype-themes/explorer \
  --store myshop.myshopify.com \
  --live-reload
```

- Uses official Explorer theme
- Connects to Shopify store
- Live preview with auto-reload

### 4. Local Theme Integration

Use a local theme directory:

```bash
shopify theme component dev \
  --theme-dir ./my-custom-theme \
  --watch \
  --preview
```

- Works with local theme files
- Watches for changes
- Launches preview server

### 5. Build-Only Mode

Build without watching or preview:

```bash
shopify theme component dev \
  --no-watch \
  --no-preview
```

- One-time build
- Useful for CI/CD
- Validates component integration

## Component Selection Logic

The component selector affects what gets included:

### Selector: `*` (Default)
- Includes ALL components from collection
- Processes all dependencies
- Full manifest generated

### Selector: `header`
- Includes only `header` component
- Recursively includes dependencies:
  - Child snippets referenced in `header.liquid`
  - Assets referenced in component
  - Dependencies of dependencies

### Selector: `header,footer`
- Includes both components
- Includes all dependencies of both
- Deduplicates shared dependencies

## Setup Files Processing

Setup files enable components to contribute theme configuration:

### Settings Schema
Multiple `settings_schema.json` files are merged:

**Component 1:**
```json
[
  { "name": "header_settings", "type": "header" },
  { "name": "logo_settings", "type": "image_picker" }
]
```

**Component 2:**
```json
[
  { "name": "footer_settings", "type": "header" },
  { "name": "social_settings", "type": "checkbox" }
]
```

**Result:**
```json
[
  { "name": "header_settings", "type": "header" },
  { "name": "logo_settings", "type": "image_picker" },
  { "name": "footer_settings", "type": "header" },
  { "name": "social_settings", "type": "checkbox" }
]
```

### Settings Data
Deep merged with priority:

**Component 1:**
```json
{
  "presets": {
    "Default": {
      "logo": "logo.png"
    }
  }
}
```

**Component 2:**
```json
{
  "presets": {
    "Default": {
      "social_enabled": true
    }
  }
}
```

**Result:**
```json
{
  "presets": {
    "Default": {
      "logo": "logo.png",
      "social_enabled": true
    }
  }
}
```

## File Watching Behavior

### What Gets Watched

1. **Theme Directory** (source)
   - All theme files
   - Changes trigger rebuild

2. **Components Directory**
   - All component files
   - Changes trigger rebuild

### What Gets Ignored

- Dotfiles (`.git`, `.dev`, `.watch`)
- Hidden files/directories

### Rebuild Process

1. **Change Detected** → File watcher fires
2. **Build to Staging** → `.dev/.watch/` directory
3. **Sync to Dev** → Copy changes to `.dev/`
4. **Shopify Sync** → Shopify CLI detects changes
5. **Browser Reload** → If live-reload enabled

### Performance Considerations

- Only changed files are copied
- Content comparison prevents unnecessary writes
- Parallel processing where possible
- Rebuilds are incremental (not full resets)

## Integration with Shopify CLI

The command integrates seamlessly with Shopify CLI's `theme dev`:

### Flag Forwarding

All Shopify theme dev flags are forwarded:

```typescript
const themeDevFlags = new Set([
  'host', 'live-reload', 'port', 'store-password',
  'theme', 'store', 'environment', 'password', 'path'
])
```

### Command Execution

```typescript
await this.config.runCommand(`theme:dev`, [
  '--path', devDir,
  ...additionalArgs
])
```

- Uses oclif's command runner
- Maintains CLI context
- Preserves error handling

## Error Handling

### Validation Errors

**Invalid Component Selector:**
```
Error: Invalid component name(s): invalid-name!
Component names can only contain letters, numbers, hyphens, and underscores.
```

**Missing Theme Directory:**
```
Error: The provided path ./invalid-path does not appear to contain valid theme files.
```

**Unsupported Theme URL:**
```
Error: Unsupported theme URL: https://gitlab.com/user/repo
```

### Runtime Errors

- Git clone failures (network issues, invalid repo)
- File system errors (permissions, disk space)
- Component installation failures (missing dependencies)
- Manifest validation errors

## Testing Considerations

The command includes test-specific behavior:

```typescript
if (process.env.NODE_ENV === 'test') {
  themeWatcher.emit('all', 'change', themeDir)
  resolve()
}
```

- Watcher resolves immediately in test mode
- Triggers rebuild event for testing
- Allows testing without waiting for file changes

## Best Practices

### 1. Use Component Selectors
Develop specific components rather than all:
```bash
shopify theme component dev header --watch
```

### 2. Clean Dev Directory
The command cleans automatically, but you can manually remove:
```bash
rm -rf .dev
```

### 3. Use Local Themes for Fast Iteration
Clone theme once, then use local path:
```bash
shopify theme component dev --theme-dir ./my-theme
```

### 4. Disable Preview for CI/CD
```bash
shopify theme component dev --no-preview --no-watch
```

### 5. Combine with Git
Keep `.dev/` in `.gitignore`:
```
.dev/
```

## Limitations

1. **GitHub Only** - Cannot clone from GitLab, Bitbucket, etc.
2. **Single Theme Source** - Cannot mix multiple theme sources
3. **No Component Versioning** - Uses current collection version
4. **Watch Performance** - May be slow with large component collections
5. **Preview Requires Shopify CLI** - Must have Shopify CLI installed

## Comparison with Other Commands

| Command | Purpose | Output Location | Preview |
|---------|---------|----------------|---------|
| `dev` | Sandboxed development | `.dev/` | Yes (optional) |
| `install` | Production integration | Theme directory | No |
| `copy` | Copy files only | Theme directory | No |
| `map` | Generate manifest | Theme directory | No |

## Example Workflow

```bash
# 1. Start dev environment
shopify theme component dev header \
  --theme-dir https://github.com/archetype-themes/explorer \
  --watch \
  --preview \
  --store myshop.myshopify.com \
  --live-reload

# 2. Edit component files
# File: components/header/header.liquid
# Changes automatically trigger rebuild

# 3. See changes in browser
# Shopify CLI syncs to store
# Browser auto-reloads

# 4. Stop dev environment
# Ctrl+C stops watcher and preview server

# 5. Install to production theme
shopify theme component install ./production-theme header
```

This command provides a complete development workflow for Shopify theme components, enabling isolated development, live preview, and seamless integration.
