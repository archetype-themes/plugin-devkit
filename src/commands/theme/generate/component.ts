/**
 * This command generates a new component with optional supporting files.
 *
 * - Creates the main component Liquid file
 * - Optionally generates CSS and JS assets (inline or as separate files)
 * - Optionally creates setup files (sections and templates)
 * - Optionally generates snippet files for component variations
 */

import { Args as OclifArgs } from '@oclif/core'
import { renderInfo, renderSelectPrompt, renderSuccess, renderTextPrompt, renderWarning } from '@shopify/cli-kit/node/ui'
import path from 'node:path'

import BaseCommand from '../../../utilities/base-command.js'
import {
  generateCSSContent,
  generateJSContent,
  generateLiquidContent,
  generateSetupSectionContent,
  generateSetupTemplateContent,
  generateSnippetContent,
  generateSnippetJSContent,
} from '../../../utilities/content-generation.js'
import { writeFileIfNotExists } from '../../../utilities/files.js'
import Flags from '../../../utilities/flags.js'
import { ComponentParts, DirectoryPaths, FileToCreate, GenerationContext } from '../../../utilities/types.js'

export default class GenerateComponent extends BaseCommand {
  static override args = {
    name: OclifArgs.string({
      description: 'component name (e.g., element.button)',
      required: false,
    }),
  }

  static override description = 'Generate a new component with optional supporting files'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> element.button',
    '<%= config.bin %> <%= command.id %> element.button --assets',
    '<%= config.bin %> <%= command.id %> element.button --assets --asset-types=css',
    '<%= config.bin %> <%= command.id %> section.hero --assets --files',
    '<%= config.bin %> <%= command.id %> element.text --assets --snippets=body,heading,rte --setup'
  ]

  static override flags = Flags.getDefinitions([
    Flags.ASSET_TYPES,
    Flags.ASSETS,
    Flags.FILES,
    Flags.FORCE,
    Flags.QUIET,
    Flags.SETUP,
    Flags.SNIPPETS,
    Flags.TYPE,
  ])

  protected override async init(): Promise<void> {
    await super.init(GenerateComponent)
  }

  public async run(): Promise<void> {
    const context = await this.buildGenerationContext()
    const directories = this.setupDirectoryPaths(context.component)
    const filesToCreate = this.buildFileList(context, directories)

    this.createFiles(context.component, filesToCreate)
  }

  private addAssetFiles(context: GenerationContext, directories: DirectoryPaths, files: FileToCreate[]): void {
    // Only create separate asset files if not inline
    if (!context.assets.inline) {
      if (context.assets.css) {
        files.push({
          content: generateCSSContent(context.component.fullName),
          description: `assets/${context.component.fullName}.css`,
          path: path.join(directories.assetsDir, `${context.component.fullName}.css`),
        })
      }

      if (context.assets.js) {
        files.push({
          content: generateJSContent(context.component.fullName),
          description: `assets/${context.component.fullName}.js`,
          path: path.join(directories.assetsDir, `${context.component.fullName}.js`),
        })
      }
    }
  }

  private addLiquidFile(context: GenerationContext, directories: DirectoryPaths, files: FileToCreate[]): void {
    const hasJs = context.assets.js
    const inlineAssets = context.assets.inline ? {
      css: context.assets.css,
      js: context.assets.js
    } : undefined

    const externalAssets = context.assets.inline ? undefined : {
      css: context.assets.css,
      js: context.assets.js
    }

    files.push({
      content: generateLiquidContent(context.component.fullName, hasJs, inlineAssets, externalAssets),
      description: `${context.component.fullName}.liquid`,
      path: path.join(directories.componentDir, `${context.component.fullName}.liquid`),
    })
  }

  private addSetupFiles(context: GenerationContext, directories: DirectoryPaths, files: FileToCreate[]): void {
    if (!this.flags[Flags.SETUP]) return

    files.push(
      {
        content: generateSetupSectionContent(context.component.fullName),
        description: `setup/sections/${context.component.fullName.replace('.', '-')}.liquid`,
        path: path.join(directories.setupSectionsDir, `${context.component.fullName.replace('.', '-')}.liquid`),
      },
      {
        content: generateSetupTemplateContent(context.component.fullName),
        description: `setup/templates/index.${context.component.fullName.replace('.', '-')}.json`,
        path: path.join(directories.setupTemplatesDir, `index.${context.component.fullName.replace('.', '-')}.json`),
      }
    )
  }

  private addSnippetFiles(context: GenerationContext, directories: DirectoryPaths, files: FileToCreate[]): void {
    if (context.snippets.length === 0) return

    for (const snippetName of context.snippets) {
      // Main snippet file
      files.push({
        content: generateSnippetContent(context.component.fullName, snippetName),
        description: `snippets/${context.component.fullName}.${snippetName}.liquid`,
        path: path.join(directories.snippetsDir, `${context.component.fullName}.${snippetName}.liquid`),
      })

      // Snippet assets (only create separate files if not inline)
      if (!context.assets.inline) {
        // Snippet CSS (if assets include CSS)
        if (context.assets.css) {
          files.push({
            content: generateCSSContent(`${context.component.fullName.replace('.', '-')}__${snippetName}`),
            description: `assets/${context.component.fullName}.${snippetName}.css`,
            path: path.join(directories.assetsDir, `${context.component.fullName}.${snippetName}.css`),
          })
        }

        // Snippet JavaScript (if assets include JS)
        if (context.assets.js) {
          files.push({
            content: generateSnippetJSContent(context.component.fullName, snippetName),
            description: `assets/${context.component.fullName}.${snippetName}.js`,
            path: path.join(directories.assetsDir, `${context.component.fullName}.${snippetName}.js`),
          })
        }
      }
    }
  }

  private buildFileList(context: GenerationContext, directories: DirectoryPaths): FileToCreate[] {
    const files: FileToCreate[] = []

    // Core component files
    this.addLiquidFile(context, directories, files)
    this.addAssetFiles(context, directories, files)

    // Optional files
    this.addSnippetFiles(context, directories, files)
    this.addSetupFiles(context, directories, files)

    return files
  }

  private async buildGenerationContext(): Promise<GenerationContext> {
    const component = await this.parseComponentName()
    const snippets = this.parseSnippetList()
    const assets = this.parseAssetTypes()

    return { assets, component, snippets }
  }

  private createFiles(component: ComponentParts, filesToCreate: FileToCreate[]): void {
    const created: string[] = []
    const skipped: string[] = []

    for (const file of filesToCreate) {
      try {
        const wasCreated = writeFileIfNotExists(file.path, file.content, this.flags[Flags.FORCE])
        if (wasCreated) {
          created.push(file.description)
        } else {
          skipped.push(file.description)
        }
      } catch (error) {
        this.error(`Failed to create file ${file.description}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    this.reportResults(component, created, skipped)
  }

  private extractTypeFromName(rawName: string): { name: string; type?: string } {
    const hasDot = rawName.includes('.')

    if (!hasDot) {
      return { name: rawName }
    }

    const parts = rawName.split('.')
    const type = parts[0]
    const name = parts.slice(1).join('.')

    // Check for type conflicts
    if (type && this.flags[Flags.TYPE] && type !== this.flags[Flags.TYPE]) {
      this.warn(`Name suggests type "${type}" but --type=${this.flags[Flags.TYPE]} was passed. Using "${type}".`)
    }

    return { name, type }
  }

  private getAssetTypesFromFlags(assetTypesFlag?: string): { css: boolean; js: boolean } {
    // If no asset types specified, default to both
    if (!assetTypesFlag) {
      return { css: true, js: true }
    }

    // Parse comma-separated values
    const types = new Set(assetTypesFlag.toLowerCase().split(',').map(t => t.trim()))

    return {
      css: types.has('css'),
      js: types.has('js')
    }
  }

  private parseAssetTypes(): { css: boolean; inline: boolean; js: boolean } {
    const assetsFlag = this.flags[Flags.ASSETS]
    const assetTypesFlag = this.flags[Flags.ASSET_TYPES]
    const filesFlag = this.flags[Flags.FILES]

    this.validateAssetDependencies(assetsFlag, assetTypesFlag, filesFlag)

    if (!assetsFlag) {
      return { css: false, inline: true, js: false }
    }

    const { css, js } = this.getAssetTypesFromFlags(assetTypesFlag)

    return {
      css,
      inline: !filesFlag,
      js
    }
  }

  private async parseComponentName(): Promise<ComponentParts> {
    const nameArg = this.args.name
    const rawName = nameArg || await this.promptForComponentName()

    const { name, type } = this.extractTypeFromName(rawName)
    const finalType = type || this.flags[Flags.TYPE] || await this.promptForComponentType()

    return {
      fullName: `${finalType}.${name}`,
      name,
      type: finalType,
    }
  }

  private parseSnippetList(): string[] {
    const snippetsFlag = this.flags[Flags.SNIPPETS]
    if (!snippetsFlag || snippetsFlag.length === 0) return []

    return snippetsFlag.flatMap((snippet: string | string[]) =>
      typeof snippet === 'string' ? snippet.split(',').map(s => s.trim()) : snippet
    ).filter(Boolean)
  }

  private async promptForComponentName(): Promise<string> {
    return renderTextPrompt({
      message: 'What should the component be called?',
      validate(input) {
        if (!input.trim()) return 'Component name is required'
        if (!/^[\w.-]+$/.test(input)) {
          return 'Component name can only contain letters, numbers, dots, hyphens, and underscores'
        }
      },
    })
  }

  private async promptForComponentType(): Promise<string> {
    const componentTypes = [
      { description: 'Resource-specific blocks', name: 'block' },
      { description: 'Basic UI primitives', name: 'element' },
      { description: 'Form-specific components', name: 'form' },
      { description: 'Structure and spacing primitives', name: 'layout' },
      { description: 'Sections rendered in templates', name: 'section' },
      { description: "Helper components that don't render UI elements", name: 'utility' },
    ] as const

    const type = await renderSelectPrompt({
      choices: [
        ...componentTypes.map(t => ({
          label: `${t.name.charAt(0).toUpperCase() + t.name.slice(1)} - ${t.description}`,
          value: t.name
        })),
        { label: 'Other (specify custom type)', value: 'other' },
      ],
      message: 'What type of component?',
    })

    if (type === 'other') {
      return renderTextPrompt({
        message: 'Enter custom component type:',
        validate(input) {
          if (!input.trim()) return 'Component type is required'
          if (!/^[A-Za-z][\dA-Za-z-]*$/.test(input)) {
            return 'Component type must start with a letter and contain only letters, numbers, and hyphens'
          }
        },
      })
    }

    return type
  }

  private reportResults(component: ComponentParts, created: string[], skipped: string[]): void {
    if (this.flags[Flags.QUIET]) return

    if (created.length > 0 && skipped.length === 0) {
      // All files created successfully
      renderSuccess({
        body: {
          list: {
            items: created.map(file => `components/${component.fullName}/${file}`)
          }
        },
        headline: `Component ${component.fullName} created successfully!`
      })
    } else if (created.length > 0 && skipped.length > 0) {
      // Some files created, some skipped - show success first, then warning
      renderWarning({
        body: [
          `Skipped ${skipped.length} existing file(s).`,
          'Use --force to overwrite existing files.'
        ],
        customSections: [
          {
            body: {
              list: {
                items: skipped.map(file => `components/${component.fullName}/${file}`)
              }
            },
            title: 'Existing files'
          }
        ],
        headline: 'Some files were skipped'
      })

      renderSuccess({
        body: {
          list: {
            items: created.map(file => `components/${component.fullName}/${file}`)
          }
        },
        headline: `Created ${created.length} new file(s) for ${component.fullName}`
      })
    } else if (created.length === 0 && skipped.length > 0) {
      // All files skipped
      renderInfo({
        body: [
          `Skipped ${skipped.length} existing file(s).`,
          'Use --force to overwrite existing files.'
        ],
        customSections: [
          {
            body: {
              list: {
                items: skipped.map(file => `components/${component.fullName}/${file}`)
              }
            },
            title: 'Existing files'
          }
        ],
        headline: `All files for ${component.fullName} already exist`
      })
    } else {
      // No files were processed
      renderInfo({
        body: 'No matching files were found to generate based on the current configuration.',
        headline: 'No files were created'
      })
    }
  }

  private setupDirectoryPaths(component: ComponentParts): DirectoryPaths {
    const currentDir = process.cwd()
    const componentDir = path.join(currentDir, 'components', component.fullName)

    return {
      assetsDir: path.join(componentDir, 'assets'),
      componentDir,
      setupSectionsDir: path.join(componentDir, 'setup', 'sections'),
      setupTemplatesDir: path.join(componentDir, 'setup', 'templates'),
      snippetsDir: path.join(componentDir, 'snippets'),
    }
  }

  private validateAssetDependencies(assetsFlag: boolean, assetTypesFlag: string | undefined, filesFlag: boolean): void {
    if (filesFlag && !assetsFlag) {
      this.error('The --files flag can only be used together with --assets')
    }

    if (assetTypesFlag && !assetsFlag) {
      this.error('The --asset-types flag can only be used together with --assets')
    }
  }
}
