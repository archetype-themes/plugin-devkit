import { Flags as OclifFlags } from '@oclif/core'
import { FlagInput } from '@oclif/core/interfaces';

import { ComponentConfig } from './types.js'

export default class Flags {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  static readonly ASSET_TYPES = 'asset-types';
  static readonly ASSETS = 'assets';
  static readonly CLEAN = 'clean';
  static readonly COLLECTION_NAME = 'collection-name';
  static readonly COLLECTION_PACKAGE_JSON = 'collection-package-json';
  static readonly COLLECTION_VERSION = 'collection-version';
  static readonly ENVIRONMENT = 'environment';
  static readonly FILES = 'files';
  static readonly FORCE = 'force';
  static readonly FORMAT = 'format';
  static readonly GENERATE_IMPORT_MAP = 'generate-import-map';
  static readonly GENERATE_TEMPLATE_MAP = 'generate-template-map';
  static readonly HOST = 'host';
  static readonly IGNORE_CONFLICTS = 'ignore-conflicts';
  static readonly IGNORE_OVERRIDES = 'ignore-overrides';
  static readonly LIVE_RELOAD = 'live-reload';
  static readonly LOCALES_SOURCE = 'locales-source';
  static readonly MODE = 'mode';
  static readonly PASSWORD = 'password';
  static readonly PORT = 'port';
  static readonly PREVIEW = 'preview';
  static readonly QUIET = 'quiet';
  static readonly SETUP = 'setup';
  static readonly SETUP_FILES = 'setup-files';
  static readonly SNIPPETS = 'snippets';
  static readonly STORE = 'store';
  static readonly STORE_PASSWORD = 'store-password';
  static readonly TARGET = 'target';
  static readonly THEME = 'theme';
  static readonly THEME_DIR = 'theme-dir';
  static readonly TYPE = 'type';
  static readonly WATCH = 'watch';

  private flagValues: Record<string, FlagInput<object>>;
  constructor(flags: Record<string, FlagInput<object>>) {
    this.flagValues = flags
    Object.assign(this, flags)
  }

  static getDefinitions(keys: string[]) {
    return Object.fromEntries(
      keys.map(key => [key, flagDefinitions[key]])
    )
  }

  get values(): Partial<ComponentConfig> {
    return this.flagValues
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const flagDefinitions: Record<string, any> = {
  [Flags.ASSET_TYPES]: OclifFlags.string({
    description: "The asset types to generate: 'css', 'js', or 'css,js' (defaults to both)",
    helpValue: '[css|js|css,js]',
    required: false,
  }),

  [Flags.ASSETS]: OclifFlags.boolean({
    char: 'a',
    default: false,
    description: "Generate CSS and JS assets. Defaults to inline references in the component's Liquid file inside {% stylesheet %} and {% javascript %} tags",
  }),

  [Flags.CLEAN]: OclifFlags.boolean({
    char: 'c',
    default: false,
    description: 'Remove unreferenced translations from theme locale files',
  }),

  [Flags.COLLECTION_NAME]: OclifFlags.string({
    char: 'n',
    description: 'Name of the component collection',
  }),

  [Flags.COLLECTION_VERSION]: OclifFlags.string({
    char: 'v',
    description: 'Version of the component collection',
  }),

  [Flags.ENVIRONMENT]: OclifFlags.string({
    description: 'The environment to apply to the current command.',
  }),

  [Flags.FILES]: OclifFlags.boolean({
    char: 'f',
    default: false,
    description: "Create separate CSS and JS files instead of inline references in the component's Liquid file",
  }),

  [Flags.FORCE]: OclifFlags.boolean({
    default: false,
    description: 'Overwrite existing files if they exist',
  }),

  [Flags.FORMAT]: OclifFlags.boolean({
    default: false,
    description: 'Format locale files by sorting keys alphabetically',
  }),

  [Flags.GENERATE_IMPORT_MAP]: OclifFlags.boolean({
    char: 'i',
    default: true,
    description: 'Generate import map',
  }),

  [Flags.GENERATE_TEMPLATE_MAP]: OclifFlags.boolean({
    char: 'm',
    default: true,
    description: 'Generate template map',
  }),

  [Flags.HOST]: OclifFlags.string({
    description: 'Set which network interface the web server listens on. The default value is 127.0.0.1.',
  }),

  [Flags.IGNORE_CONFLICTS]: OclifFlags.boolean({
    char: 'f',
    default: false,
    description: 'Ignore conflicts when mapping components',
  }),

  [Flags.IGNORE_OVERRIDES]: OclifFlags.boolean({
    char: 'o',
    default: false,
    description: 'Ignore overrides when mapping components',
  }),

  [Flags.LIVE_RELOAD]: OclifFlags.boolean({
    description: 'Reload the browser when changes are made.',
  }),

  [Flags.LOCALES_SOURCE]: OclifFlags.string({
    char: 'l',
    default: 'https://github.com/archetype-themes/locales',
    description: 'Directory that contains a "locales" folder with locale files',
  }),

  [Flags.MODE]: OclifFlags.string({
    char: 'm',
    default: 'add-missing',
    description: 'Sync mode for locale files (only translations used in the theme will be processed):\n' +
      '- add-missing: Only add new translations that do not exist in theme locale files\n' +
      '- add-and-override: Add new translations and override existing ones with source values\n' +
      '- replace-existing: Replace values of existing translations with source values',
    options: ['add-missing', 'add-and-override', 'replace-existing'],
  }),

  [Flags.PASSWORD]: OclifFlags.string({
    description: 'Password generated from the Theme Access app.',
  }),

  [Flags.PORT]: OclifFlags.integer({
    description: 'Local port to serve theme preview from.',
  }),

  [Flags.PREVIEW]: OclifFlags.boolean({
    allowNo: true,
    char: 'y',
    default: true,
    description: 'Sync changes to theme directory',
  }),

  [Flags.QUIET]: OclifFlags.boolean({
    allowNo: true,
    char: 'q',
    default: false,
    description: 'Suppress non-essential output',
  }),

  [Flags.SETUP]: OclifFlags.boolean({
    char: 's',
    default: false,
    description: 'Generate section and template files to preview component in component explorer',
  }),

  [Flags.SETUP_FILES]: OclifFlags.boolean({
    allowNo: true,
    char: 's',
    default: true,
    description: 'Copy setup files to theme directory',
  }),

  [Flags.SNIPPETS]: OclifFlags.string({
    description: 'Generate component snippets (e.g., "body,heading,rte")',
    multiple: true,
  }),

  [Flags.STORE]: OclifFlags.string({
    description: 'Store URL. It can be the store prefix (example.myshopify.com) or the complete URL.',
  }),

  [Flags.STORE_PASSWORD]: OclifFlags.string({
    description: 'The password for storefronts with password protection.',
  }),

  [Flags.TARGET]: OclifFlags.string({
    default: 'all',
    description: 'Target locale files to process:\n' +
      '- all: Process all locale files\n' +
      '- schema: Process only schema translations (*.schema.json)\n' +
      '- storefront: Process only storefront translations',
    options: ['all', 'schema', 'storefront'],
  }),

  [Flags.THEME]: OclifFlags.string({
    description: 'Theme ID or name of the remote theme.',
  }),

  [Flags.THEME_DIR]: OclifFlags.string({
    char: 't',
    default: 'https://github.com/archetype-themes/explorer',
    description: 'Directory that contains theme files for development',
  }),

  [Flags.TYPE]: OclifFlags.string({
    char: 't',
    description: 'Component type (e.g., block, element, section, my-custom-type)',
  }),

  [Flags.WATCH]: OclifFlags.boolean({
    allowNo: true,
    char: 'w',
    default: true,
    description: 'Watch for changes in theme and component directories',
  }),
}
