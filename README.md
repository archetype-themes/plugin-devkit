# Devkit CLI plugin

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
![Node.js](https://img.shields.io/badge/Node.js-v18.12.0-blue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful Shopify CLI plugin that enhances theme development with modular, reusable Liquid components. The Devkit CLI plugin simplifies the process of building, managing, and maintaining Shopify themes by providing a component-based architecture.

## What is Devkit?

Devkit introduces a component-driven approach to Shopify theme development, allowing you to:

- Build themes using modular, reusable components
- Develop components in isolation before integrating them into your theme
- Generate import maps for JavaScript modules
- Synchronize and clean theme locale files efficiently
- And more!

The `plugin-devkit` repository is a foundational part of the [Archetype Devkit preview](https://github.com/archetype-themes/devkit).

## Getting started

### Prerequisites

You'll need to ensure you have the following installed on your local development machine:

- Latest version of [Node.js](https://nodejs.org/en/download/) and [npm](https://docs.npmjs.com/getting-started) (or another package manager of your choice)
- [Shopify CLI](https://shopify.dev/docs/themes/tools/cli/install)

### Installation

Install the Shopify CLI plugin:

```bash
shopify plugins install plugin-devkit
```

## Available commands

<!-- commands -->

- [`shopify theme component`](#shopify-theme-component)
- [`shopify theme component clean [THEMEDIR]`](#shopify-theme-component-clean-themedir)
- [`shopify theme component copy THEMEDIR`](#shopify-theme-component-copy-themedir)
- [`shopify theme component dev [COMPONENTSELECTOR]`](#shopify-theme-component-dev-componentselector)
- [`shopify theme component install THEMEDIR [COMPONENTSELECTOR]`](#shopify-theme-component-install-themedir-componentselector)
- [`shopify theme component map THEMEDIR [COMPONENTSELECTOR]`](#shopify-theme-component-map-themedir-componentselector)
- [`shopify theme generate import-map [THEMEDIR]`](#shopify-theme-generate-import-map-themedir)
- [`shopify theme generate template-map [THEMEDIR]`](#shopify-theme-generate-template-map-themedir)
- [`shopify theme locale clean [THEMEDIR]`](#shopify-theme-locale-clean-themedir)
- [`shopify theme locale sync [THEMEDIR]`](#shopify-theme-locale-sync-themedir)

## `shopify theme component`

Devkit CLI plugin by Archetype Themes

```
USAGE
  $ shopify theme component [-v]

FLAGS
  -v, --version  Display plugin version

DESCRIPTION
  Devkit CLI plugin by Archetype Themes
```

_See code: [src/commands/theme/component/index.ts](https://github.com/archetype-themes/plugin-devkit/blob/v1.0.0/src/commands/theme/component/index.ts)_

## `shopify theme component clean [THEMEDIR]`

Remove unused component files in a theme

```
USAGE
  $ shopify theme component clean [THEMEDIR] [-q]

ARGUMENTS
  THEMEDIR  [default: .] path to theme directory

FLAGS
  -q, --[no-]quiet  Suppress non-essential output

DESCRIPTION
  Remove unused component files in a theme

EXAMPLES
  $ shopify theme component clean theme-directory
```

_See code: [src/commands/theme/component/clean.ts](https://github.com/archetype-themes/plugin-devkit/blob/v1.0.0/src/commands/theme/component/clean.ts)_

## `shopify theme component copy THEMEDIR`

Copy files from a component collection into a theme

```
USAGE
  $ shopify theme component copy THEMEDIR [-n <value>] [-v <value>]

ARGUMENTS
  THEMEDIR  path to theme directory

FLAGS
  -n, --collection-name=<value>     Name of the component collection
  -v, --collection-version=<value>  Version of the component collection

DESCRIPTION
  Copy files from a component collection into a theme

EXAMPLES
  $ shopify theme component copy theme-directory
```

_See code: [src/commands/theme/component/copy.ts](https://github.com/archetype-themes/plugin-devkit/blob/v1.0.0/src/commands/theme/component/copy.ts)_

## `shopify theme component dev [COMPONENTSELECTOR]`

Start a sandboxed development environment for components

```
USAGE
  $ shopify theme component dev [COMPONENTSELECTOR] [-n <value>] [-v <value>] [-t <value>] [-s] [-w] [-y] [-i] [-m]
    [--host <value>] [--live-reload] [--port <value>] [--store-password <value>] [--theme <value>] [--store <value>]
    [--environment <value>] [--password <value>]

ARGUMENTS
  COMPONENTSELECTOR  [default: *] component name or names (comma-separated) or "*" for all components

FLAGS
  -i, --generate-import-map         Generate import map
  -m, --generate-template-map       Generate template map
  -n, --collection-name=<value>     Name of the component collection
  -s, --[no-]setup-files            Copy setup files to theme directory
  -t, --theme-dir=<value>           [default: https://github.com/archetype-themes/explorer] Directory that contains
                                    theme files for development
  -v, --collection-version=<value>  Version of the component collection
  -w, --[no-]watch                  Watch for changes in theme and component directories
  -y, --[no-]preview                Sync changes to theme directory
      --environment=<value>         The environment to apply to the current command.
      --host=<value>                Set which network interface the web server listens on. The default value is
                                    127.0.0.1.
      --live-reload                 Reload the browser when changes are made.
      --password=<value>            Password generated from the Theme Access app.
      --port=<value>                Local port to serve theme preview from.
      --store=<value>               Store URL. It can be the store prefix (example.myshopify.com) or the complete URL.
      --store-password=<value>      The password for storefronts with password protection.
      --theme=<value>               Theme ID or name of the remote theme.

DESCRIPTION
  Start a sandboxed development environment for components

EXAMPLES
  $ shopify theme component dev

  $ shopify theme component dev header

  $ shopify theme component dev header,footer,navigation
```

_See code: [src/commands/theme/component/dev.ts](https://github.com/archetype-themes/plugin-devkit/blob/v1.0.0/src/commands/theme/component/dev.ts)_

## `shopify theme component install THEMEDIR [COMPONENTSELECTOR]`

Runs the map, copy, clean, and generate import-map commands in sequence

```
USAGE
  $ shopify theme component install THEMEDIR [COMPONENTSELECTOR] [-n <value>] [-v <value>]

ARGUMENTS
  THEMEDIR           path to theme directory
  COMPONENTSELECTOR  [default: *] component name or names (comma-separated) or "*" for all components

FLAGS
  -n, --collection-name=<value>     Name of the component collection
  -v, --collection-version=<value>  Version of the component collection

DESCRIPTION
  Runs the map, copy, clean, and generate import-map commands in sequence

EXAMPLES
  $ shopify theme component install theme-directory

  $ shopify theme component install theme-directory header

  $ shopify theme component install theme-directory header,footer,navigation
```

_See code: [src/commands/theme/component/install.ts](https://github.com/archetype-themes/plugin-devkit/blob/v1.0.0/src/commands/theme/component/install.ts)_

## `shopify theme component map THEMEDIR [COMPONENTSELECTOR]`

Generates or updates a component.manifest.json file with the component collection details and a file map

```
USAGE
  $ shopify theme component map THEMEDIR [COMPONENTSELECTOR] [-n <value>] [-v <value>] [-f] [-o]

ARGUMENTS
  THEMEDIR           path to theme directory
  COMPONENTSELECTOR  [default: *] component name or names (comma-separated) or "*" for all components

FLAGS
  -f, --ignore-conflicts            Ignore conflicts when mapping components
  -n, --collection-name=<value>     Name of the component collection
  -o, --ignore-overrides            Ignore overrides when mapping components
  -v, --collection-version=<value>  Version of the component collection

DESCRIPTION
  Generates or updates a component.manifest.json file with the component collection details and a file map

EXAMPLES
  $ shopify theme component map theme-directory

  $ shopify theme component map theme-directory header

  $ shopify theme component map theme-directory header,footer,navigation
```

_See code: [src/commands/theme/component/map.ts](https://github.com/archetype-themes/plugin-devkit/blob/v1.0.0/src/commands/theme/component/map.ts)_

## `shopify theme generate import-map [THEMEDIR]`

Generate an import map for JavaScript files in the assets directory

```
USAGE
  $ shopify theme generate import-map [THEMEDIR] [-q]

ARGUMENTS
  THEMEDIR  [default: .] path to theme directory

FLAGS
  -q, --[no-]quiet  Suppress non-essential output

DESCRIPTION
  Generate an import map for JavaScript files in the assets directory
```

_See code: [src/commands/theme/generate/import-map.ts](https://github.com/archetype-themes/plugin-devkit/blob/v1.0.0/src/commands/theme/generate/import-map.ts)_

## `shopify theme generate template-map [THEMEDIR]`

Generate a template map for component routes in the templates directory

```
USAGE
  $ shopify theme generate template-map [THEMEDIR] [-q]

ARGUMENTS
  THEMEDIR  [default: .] path to theme directory

FLAGS
  -q, --[no-]quiet  Suppress non-essential output

DESCRIPTION
  Generate a template map for component routes in the templates directory
```

_See code: [src/commands/theme/generate/template-map.ts](https://github.com/archetype-themes/plugin-devkit/blob/v1.0.0/src/commands/theme/generate/template-map.ts)_

## `shopify theme locale clean [THEMEDIR]`

Remove unreferenced translations from theme locale files

```
USAGE
  $ shopify theme locale clean [THEMEDIR] [--format] [--target all|schema|storefront]

ARGUMENTS
  THEMEDIR  [default: .] path to theme directory

FLAGS
  --format           Format locale files by sorting keys alphabetically
  --target=<option>  [default: all] Target locale files to process:
                     - all: Process all locale files
                     - schema: Process only schema translations (*.schema.json)
                     - storefront: Process only storefront translations
                     <options: all|schema|storefront>

DESCRIPTION
  Remove unreferenced translations from theme locale files

EXAMPLES
  $ shopify theme locale clean theme-directory

  $ shopify theme locale clean theme-directory --target=schema

  $ shopify theme locale clean theme-directory --target=storefront
```

_See code: [src/commands/theme/locale/clean.ts](https://github.com/archetype-themes/plugin-devkit/blob/v1.0.0/src/commands/theme/locale/clean.ts)_

## `shopify theme locale sync [THEMEDIR]`

Sync theme locale files with source translations

```
USAGE
  $ shopify theme locale sync [THEMEDIR] [-c] [--format] [-l <value>] [-m
    add-missing|add-and-override|replace-existing] [--target all|schema|storefront]

ARGUMENTS
  THEMEDIR  [default: .] path to theme directory

FLAGS
  -c, --clean
      Remove unreferenced translations from theme locale files

  -l, --locales-source=<value>
      [default: https://github.com/archetype-themes/locales] Directory that contains a "locales" folder with locale files

  -m, --mode=<option>
      [default: add-missing] Sync mode for locale files (only translations used in the theme will be processed):
      - add-missing: Only add new translations that do not exist in theme locale files
      - add-and-override: Add new translations and override existing ones with source values
      - replace-existing: Replace values of existing translations with source values
      <options: add-missing|add-and-override|replace-existing>

  --format
      Format locale files by sorting keys alphabetically

  --target=<option>
      [default: all] Target locale files to process:
      - all: Process all locale files
      - schema: Process only schema translations (*.schema.json)
      - storefront: Process only storefront translations
      <options: all|schema|storefront>

DESCRIPTION
  Sync theme locale files with source translations

EXAMPLES
  $ shopify theme locale sync theme-directory

  $ shopify theme locale sync theme-directory --clean

  $ shopify theme locale sync theme-directory --clean --target=schema

  $ shopify theme locale sync theme-directory --locales-source=path/to/directory
```

_See code: [src/commands/theme/locale/sync.ts](https://github.com/archetype-themes/plugin-devkit/blob/v1.0.0/src/commands/theme/locale/sync.ts)_

<!-- commandsstop -->

## Contributing

Interested in shaping the future of theme development with us? We welcome you to join our community! Your insights and discussions play a crucial role in our continuous improvement. We encourage you to:

- Start [discussions](https://github.com/archetype-themes/devkit/discussions)
- Ask questions
- Provide feedback on our approach
- [Report bugs](https://github.com/archetype-themes/plugin-devkit/issues/new/choose)
- [Submit pull requests](https://github.com/archetype-themes/plugin-devkit/pulls)

For more detailed information on contributing, please see our [CONTRIBUTING.md](CONTRIBUTING.md) guide.

## Local development

If you already have the plugin installed via npm, you'll need to uninstall it before developing locally:

```bash
# Uninstall the plugin
shopify plugins uninstall plugin-devkit
```

Then, follow these steps to set up local development:

1. Clone the repository:

```bash
git clone https://github.com/archetype-themes/plugin-devkit.git
```

2. Install dependencies:

```bash
cd plugin-devkit
npm install
```

3. Build or watch for changes:

```bash
npm run watch  # For development
# or
npm run build  # For a one-time build
```

4. Link the plugin to Shopify CLI:

```bash
shopify plugins link
```

Now you can make changes to the plugin code and test them locally.
