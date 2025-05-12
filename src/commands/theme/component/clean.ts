/**
 * This command cleans up component files in a theme directory.
 *
 * - Removes component files (snippets and assets) that are not listed in the component map
 * - Ensures the theme directory only contains necessary component files
 */

import fs from 'node:fs'
import path from 'node:path'

import Args from '../../../utilities/args.js'
import BaseCommand from '../../../utilities/base-command.js'
import { getManifest } from '../../../utilities/manifest.js'
import { getCollectionNodes, getThemeNodes } from '../../../utilities/nodes.js'
import { LiquidNode } from '../../../utilities/types.js'
import { isComponentRepo, isThemeRepo } from '../../../utilities/validate.js'

export default class Clean extends BaseCommand {
  static override args = Args.getDefinitions([
    Args.override(Args.DEST_DIR, { default: '.', required: false })
  ])

  static override description = 'Remove unused component files in a theme'

  static override examples = [
    '<%= config.bin %> <%= command.id %> theme-directory'
  ]

  protected override async init(): Promise<void> {
    await super.init(Clean)
  }

  public async run(): Promise<void> {
    const destinationDir = path.resolve(process.cwd(), this.args[Args.DEST_DIR])

    const manifest = getManifest(path.join(destinationDir, 'component.manifest.json'))

    let destinationNodes: LiquidNode[]
    if (isThemeRepo(destinationDir)) {
      destinationNodes = await getThemeNodes(destinationDir)
    } else if (isComponentRepo(destinationDir)) {
      destinationNodes = await getCollectionNodes(destinationDir)
    } else {
      this.error('Warning: Destination directory does not appear to be a theme or component collection.')
    }

    // Remove files that are not in the component manifest
    for (const node of destinationNodes) {
      if (node.type === 'snippet' || node.type === 'asset') {
        const collection = node.type === 'snippet' ? manifest.files.snippets : manifest.files.assets;
        if (!collection[node.name] && fs.existsSync(node.file)) {
          fs.rmSync(node.file);
        }
      } else if (node.type === 'component' && !manifest.files.snippets[node.name] && fs.existsSync(node.file)) {
        fs.rmSync(path.dirname(node.file), { recursive: true });
      }
    }
  }
}
