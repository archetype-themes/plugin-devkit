/**
 * This command installs component files into a theme directory.
 *
 * - Maps the components in the theme directory
 * - Copies rendered component files (snippets and assets) into the theme directory
 * - Cleans up unnecessary component files in the theme directory
 * - Generates a head.import-map.liquid snippet file based on JS assets
 */

import Args from '../../../utilities/args.js'
import BaseCommand from '../../../utilities/base-command.js'
import Flags from '../../../utilities/flags.js'
import {isThemeRepo} from '../../../utilities/validate.js'
import GenerateImportMap from '../generate/import-map.js'
import Clean from './clean.js'
import Copy from './copy.js'
import Manifest from './manifest.js'

export default class Install extends BaseCommand {
  static override args = Args.getDefinitions([
    Args.DEST_DIR,
    Args.COMPONENT_SELECTOR
  ])

  static override description = 'Runs the map, copy, clean, and generate import-map commands in sequence'

  static override examples = [
    '<%= config.bin %> <%= command.id %> theme-directory',
    '<%= config.bin %> <%= command.id %> theme-directory header',
    '<%= config.bin %> <%= command.id %> theme-directory header,footer,navigation'
  ]

  static override flags = Flags.getDefinitions([
    Flags.COLLECTION_NAME,
    Flags.COLLECTION_VERSION
  ])

  protected override async init(): Promise<void> {
    await super.init(Copy)
  }

  public async run(): Promise<void> {
    await Manifest.run([this.args[Args.DEST_DIR]!])
    await Copy.run([this.args[Args.DEST_DIR]!])
    await Clean.run([this.args[Args.DEST_DIR]!])

    if (isThemeRepo(this.args[Args.DEST_DIR])) {
      await GenerateImportMap.run([this.args[Args.DEST_DIR]!, '--quiet'])
    }
  }
}
