/**
 * This command generates or updates a component.manifest.json file
 *
 * - Updates component files (assets and snippets) mapping
 * - Updates component collection details
 */

import fs from 'node:fs'
import path from 'node:path'

import Args from '../../../utilities/args.js'
import BaseCommand from '../../../utilities/base-command.js'
import Flags from '../../../utilities/flags.js'
import { getLastCommitHash } from '../../../utilities/git.js'
import { ManifestOptions, generateManifestFile, getManifest } from '../../../utilities/manifest.js'
import { getCollectionNodes, getDuplicateFiles, getThemeNodes } from '../../../utilities/nodes.js'
import { sortObjectKeys } from '../../../utilities/objects.js'
import { getNameFromPackageJson, getVersionFromPackageJson } from '../../../utilities/package-json.js'
import { LiquidNode } from '../../../utilities/types.js'
import { isComponentRepo, isThemeRepo } from '../../../utilities/validate.js'

export default class Manifest extends BaseCommand {
  static override args = Args.getDefinitions([
    Args.DEST_DIR,
    Args.COMPONENT_SELECTOR
  ])

  static override description = 'Generates or updates a component.manifest.json file with the component collection details and a file map'

  static override examples = [
    '<%= config.bin %> <%= command.id %> theme-directory',
    '<%= config.bin %> <%= command.id %> theme-directory header',
    '<%= config.bin %> <%= command.id %> theme-directory header,footer,navigation'
  ]

  static override flags = Flags.getDefinitions([
    Flags.COLLECTION_NAME,
    Flags.COLLECTION_VERSION,
    Flags.IGNORE_CONFLICTS,
    Flags.IGNORE_OVERRIDES
  ])

  protected override async init(): Promise<void> {
    await super.init(Manifest)
  }

  public async run(): Promise<void> {
    const sourceDir = process.cwd()

    if (!isComponentRepo(sourceDir)) {
      this.error('Warning: Current directory does not appear to be a component collection or theme repository. Expected to find package.json and components directory.')
    }

    const destinationDir = path.resolve(sourceDir, this.args[Args.DEST_DIR])
    const sourceName = this.flags[Flags.COLLECTION_NAME] || getNameFromPackageJson(process.cwd())
    const sourceVersion = this.flags[Flags.COLLECTION_VERSION] || getVersionFromPackageJson(process.cwd())
    const ignoreConflicts = this.flags[Flags.IGNORE_CONFLICTS]
    const ignoreOverrides = this.flags[Flags.IGNORE_OVERRIDES]
    const componentSelector = this.args[Args.COMPONENT_SELECTOR]
    
    const manifestPath = path.join(destinationDir, 'component.manifest.json')
    const manifest = getManifest(manifestPath);

    const options: ManifestOptions = {
      componentSelector,
      ignoreConflicts,
      ignoreOverrides
    }

    const sourceNodes = await getCollectionNodes(sourceDir)

    const duplicates = getDuplicateFiles(sourceNodes);

    if (duplicates.size > 0) {
      const message: string[] = []
      duplicates.forEach((nodes, key) => {
        message.push(`Warning: Found duplicate files for ${key}:`)
        nodes.forEach(node => {
          message.push(`  - ${node.file}`)
        })
      });
      this.error(message.join('\n'))
    }

    let destinationNodes: LiquidNode[]
    let destinationName: string
    
    if (isThemeRepo(destinationDir)) {
      destinationNodes = await getThemeNodes(destinationDir)
      destinationName = '@theme'
    } else if (isComponentRepo(destinationDir)) {
      destinationNodes = await getCollectionNodes(destinationDir)
      destinationName = '@collection'
    } else {
      this.error('Warning: Destination directory does not appear to be a theme repository or component collection.')
    }

    const files = await generateManifestFile(
      manifest.files,
      destinationNodes,
      destinationName,
      sourceNodes,
      sourceName,
      options
    )

    manifest.files = sortObjectKeys(files)
    manifest.collections[sourceName] = {
      commit: getLastCommitHash(sourceDir),
      version: sourceVersion
    }

    fs.writeFileSync(manifestPath, JSON.stringify(sortObjectKeys(manifest), null, 2))
  }
}
