import * as fs from 'node:fs'

import logger from './logger.js'
import { LiquidNode, Manifest } from './types.js'

export function getManifest(path: string): Manifest {
  const data: Manifest = { collections: {}, files: { assets: {}, snippets: {} } }

  if (fs.existsSync(path)) {
    const manifestContent = fs.readFileSync(path, 'utf8')
    const parsedContent = JSON.parse(manifestContent)
    data.collections = parsedContent.collections || {}
    data.files.assets = parsedContent.files?.assets || {}
    data.files.snippets = parsedContent.files?.snippets || {}
  }

  return data
}

export interface ManifestOptions {
  componentSelector?: string;
  ignoreConflicts: boolean;
  ignoreOverrides: boolean;
}

// eslint-disable-next-line max-params
export async function generateManifestFile(
  oldFilesMap: Manifest['files'],
  destinationNodes: LiquidNode[],
  destinationName: string,
  sourceNodes: LiquidNode[],
  sourceName: string,
  options: ManifestOptions
): Promise<Manifest['files']> {
  const entryPointNodes = destinationNodes.filter(node => node.type === 'component' || node.type === 'entry')

  const newFilesMap: Manifest['files'] = {
    assets: {},
    snippets: {}
  }

  // Track source nodes that are selected or children of selected source nodes
  const selectedSourceNodes = new Set<LiquidNode>()
  
  function addNodeAndChildren(nodeName: string, visited = new Set<string>()) {
    if (visited.has(nodeName)) return // Prevent infinite recursion
    visited.add(nodeName)

    const node = sourceNodes.find(n => n.name === nodeName)
    if (!node) return
    
    selectedSourceNodes.add(node)

    // Add all child snippets and recursively check their children
    if (node.snippets) {
      for (const snippet of node.snippets) {
        const snippetNode = sourceNodes.find(n => n.name === snippet)
        if (snippetNode) {
          selectedSourceNodes.add(snippetNode)
          addNodeAndChildren(snippet, visited)
        }
      }
    }

    // Add all child assets and recursively check their dependencies
    if (node.assets) {
      for (const asset of node.assets) {
        const assetNode = sourceNodes.find(n => n.name === asset)
        if (assetNode) {
          selectedSourceNodes.add(assetNode)
          addNodeAndChildren(asset, visited)
        }
      }
    }
  }

  if (options.componentSelector && options.componentSelector !== '*') {
    const selectedComponents = options.componentSelector.split(',')
    for (const component of selectedComponents) addNodeAndChildren(`${component}.liquid`)
    // Throw error if no components were matched
    if (selectedSourceNodes.size === 0) {
      logger.error(`No components found matching selector: ${options.componentSelector}`)
    }
  }

  for (const node of destinationNodes) {
    // Add destination nodes not present in the old import map
    // They have been added manually by the user since the last time the import map was generated
    if ((node.type === 'snippet' || node.type === 'asset' || node.type === 'component') && !oldFilesMap[node.themeFolder]?.[node.name]) {
        const destinationNode = sourceNodes.find(n => n.themeFolder === node.themeFolder && n.name === node.name)

        if (destinationNode) {
          if (options.ignoreConflicts) {
            // If the user has passed the --ignore-conflicts flag, skip the node so it can be logged later as a source entry
            continue;
          } else {
            // If the node also exists in the source, warn the user of the potential conflict but keep as a destination entry
            newFilesMap[node.themeFolder][node.name] = destinationName
            logger.log(`Conflict Warning: Pre-existing file ${node.themeFolder}/${node.name} without mapping conflicts with file in ${sourceName}. Keeping the file from ${destinationName}.`)
          }
        } else {
          // If the node does not exist in the source, add it to the new import map as a destination entry
          newFilesMap[node.themeFolder][node.name] = destinationName
        }
      }

    // Persist prexisting asset entries from destination
    if (node.type === 'asset') {
      const oldImportMapValue = oldFilesMap[node.themeFolder]?.[node.name]
      if (oldImportMapValue !== sourceName && typeof oldImportMapValue === 'string') {
        newFilesMap[node.themeFolder][node.name] = oldImportMapValue
      }
    }
  }

  function addFilesMapEntry(themeFolder: LiquidNode['themeFolder'], name: string) {
    const oldImportMapValue = oldFilesMap[themeFolder]?.[name]
    const newImportMapValue = newFilesMap[themeFolder]?.[name]

    // If the new import map value is already defined, we don't need to add it again
    if (newImportMapValue !== undefined) return

    if (oldImportMapValue !== sourceName && typeof oldImportMapValue === 'string') {
      // If the import map value is not in our source but is defined
      let node = destinationNodes.find(node => node.themeFolder === themeFolder && node.name === name)
      if (node) {
        const destinationNode = sourceNodes.find(node => node.themeFolder === themeFolder && node.name === name)
        if (destinationNode) {
          // If the destination node also exists in our source, it's considered an override
          if (options.ignoreOverrides) {
            // If the user has passed the --ignore-overrides, set the new import map value to the source name
            newFilesMap[node.themeFolder][node.name] = sourceName
            node = destinationNode
          } else {
            // If the user has not passed the --ignore-overrides flag, keep the override
            newFilesMap[node.themeFolder][node.name] = oldImportMapValue
            logger.log(`Override Warning: ${node.themeFolder}/${node.name} is being overridden by the collection ${sourceName}.`)
          }
        } else {
          // If the node does not exist in the source, add it to the new import map
          newFilesMap[node.themeFolder][node.name] = oldImportMapValue
        }

        if (node.themeFolder === 'snippets') {
          // If the node is a snippet, add its snippets to the new import map
          for (const snippet of node.snippets) {
            addFilesMapEntry('snippets', snippet)
          }
        }
      }
    } else if (oldImportMapValue === sourceName || oldImportMapValue === undefined) {
      // Skip if we have a component selector (not '*') and this node is not selected or a child of a selected component
      if (options.componentSelector && options.componentSelector !== '*' && ![...selectedSourceNodes].some(node => node.name === name)) {
        return
      }
      
      // If the import map value is set our collection or undefined
      const node = sourceNodes.find(node => node.themeFolder === themeFolder && node.name === name)
      if (node) {
        // If the node exists in the collection, add it to the new import map
        newFilesMap[node.themeFolder][node.name] = sourceName
        if (node.assets.length > 0) {
          // If the node is a component, add its assets to the new import map
          for (const asset of node.assets) addFilesMapEntry('assets', asset)
        }

        if (node.themeFolder === 'snippets') {
          // If the node is a snippet, add its snippets to the new import map
          for (const snippet of node.snippets) {
            addFilesMapEntry('snippets', snippet)
          }
        }
      }
    }
  }

  // Build out the import map for the theme and collection
  for (const node of entryPointNodes) {
    if (node.type === 'component') {
      addFilesMapEntry('snippets', node.name)
    } else if (node.type === 'entry') {
      for (const snippet of node.snippets) {
        addFilesMapEntry('snippets', snippet)
      }
    }
  }

  return newFilesMap
}