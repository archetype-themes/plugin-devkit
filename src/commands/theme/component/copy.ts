/**
 * This command copies component files into a theme directory.
 *
 * - Copies rendered component files (snippets and assets) into the theme directory
 * - Updates the theme CLI config (shopify.theme.json) with the component collection details
 */

import fs from 'node:fs'
import path from 'node:path'

import Args from '../../../utilities/args.js'
import BaseCommand from '../../../utilities/base-command.js'
import { copyFileIfChanged } from '../../../utilities/files.js';
import Flags from '../../../utilities/flags.js'
import { getManifest } from '../../../utilities/manifest.js'
import { getCollectionNodes, getDuplicateFiles } from '../../../utilities/nodes.js'
import { getNameFromPackageJson, getVersionFromPackageJson } from '../../../utilities/package-json.js'
import { isComponentRepo, isThemeRepo } from '../../../utilities/validate.js'

export default class Copy extends BaseCommand {
  static override args = Args.getDefinitions([
    Args.DEST_DIR
  ])

  static override description = 'Copy files from a component collection into a theme'

  static override examples = [
    '<%= config.bin %> <%= command.id %> theme-directory'
  ]

  static override flags = Flags.getDefinitions([
    Flags.COLLECTION_NAME,
    Flags.COLLECTION_VERSION
  ])

  protected override async init(): Promise<void> {
    await super.init(Copy)
  }

  public async run(): Promise<void> {
    const currentDir = process.cwd()

    if (!isComponentRepo(currentDir)) {
      this.error('Warning: Current directory does not appear to be a component collection. Expected to find package.json and components directory.')
    }

    const destinationDir = path.resolve(currentDir, this.args[Args.DEST_DIR])
    const sourceName = this.flags[Flags.COLLECTION_NAME] || getNameFromPackageJson(process.cwd())
    const sourceVersion = this.flags[Flags.COLLECTION_VERSION] || getVersionFromPackageJson(process.cwd())

    if (!fs.existsSync(path.join(destinationDir, 'component.manifest.json'))) {
      this.error('Error: component.manifest.json file not found in the destination directory. Run "shopify theme component map" to generate a component.manifest.json file.');
    }

    const manifest = getManifest(path.join(destinationDir, 'component.manifest.json'))
    const componentNodes = await getCollectionNodes(currentDir)

    const duplicates = getDuplicateFiles(componentNodes);

    if (duplicates.size > 0) {
      const message: string[] = []
      for (const [key, nodes] of duplicates) {
        message.push(`Warning: Found duplicate files for ${key}:`)
        for (const node of nodes) {
          message.push(`  - ${node.file}`)
        }
      }

      this.error(message.join('\n'))
    }

    if (manifest.collections[sourceName].version !== sourceVersion) {
      this.error(`Version mismatch: Expected ${sourceVersion} but found ${manifest.collections[sourceName].version}. Run "shopify theme component map" to update the component.manifest.json file.`);
    }

    const copyManifestFiles = (fileType: 'assets' | 'snippets') => {
      for (const [fileName, fileCollection] of Object.entries(manifest.files[fileType])) {
        if (fileCollection !== sourceName) continue;

        const node = componentNodes.find(node => node.name === fileName && node.themeFolder === fileType);

        if (!node) continue;

        if (isThemeRepo(destinationDir)) {
          copyFileIfChanged(node.file, path.join(destinationDir, fileType, fileName));
        } else if (isComponentRepo(destinationDir)) {
          const dest = node.file.replace(currentDir, destinationDir)
          copyFileIfChanged(node.file, dest);

          if (node.type === 'component') {
            // Copy setup and test folders if they exist
            const setupSrcDir = path.join(path.dirname(node.file), 'setup');
            const setupDestDir = path.join(path.dirname(dest), 'setup');
            const testSrcDir = path.join(path.dirname(node.file), 'test');
            const testDestDir = path.join(path.dirname(dest), 'test');

            if (fs.existsSync(setupSrcDir)) {
              fs.mkdirSync(setupDestDir, { recursive: true });
              fs.cpSync(setupSrcDir, setupDestDir, { recursive: true });
            }

            if (fs.existsSync(testSrcDir)) {
              fs.mkdirSync(testDestDir, { recursive: true });
              fs.cpSync(testSrcDir, testDestDir, { recursive: true });
            }
          }
        }
      }
    };

    copyManifestFiles('snippets');
    copyManifestFiles('assets');
  }
}
