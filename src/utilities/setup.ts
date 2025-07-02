import * as fs from 'node:fs'
import path from 'node:path'

import { copyFileIfChanged, writeFileIfChanged } from './files.js'
import logger from './logger.js'
import { getCollectionNodes } from './nodes.js'
import { DeepObject, deepMerge } from './objects.js'
import { LiquidNode } from './types.js'

export async function copySetupComponentFiles(
  collectionDir: string,
  destination: string,
  componentSelector: string
): Promise<void> {
  const collectionNodes = await getCollectionNodes(collectionDir)
  const setupFiles = collectionNodes
    .filter(node => componentSelector === '*' || componentSelector.includes(path.basename(node.file, '.liquid')))
    .flatMap(node => node.setup)

  const settingsSchema: object[] = []
  const settingsData: DeepObject = {}
  let hasSchemaFiles = false
  let hasDataFiles = false

  // Process all files in parallel
  await Promise.all(setupFiles.map(async (setupFile) => {
    const node = collectionNodes.find(n => n.file === setupFile)
    if (!node) return

    if (node.name === 'settings_schema.json') {
      const schemaItems = await processSettingsSchema(setupFile, node)
      settingsSchema.push(...schemaItems)
      hasSchemaFiles = true
    } else if (node.name === 'settings_data.json') {
      const dataItems = await processSettingsData(setupFile, node)
      deepMerge(settingsData, dataItems)
      hasDataFiles = true
    } else {
      copyFileIfChanged(node.file, path.join(destination, node.themeFolder, node.name))
    }
  }))

  // Only write combined settings files if we found setup files for them
  if (hasSchemaFiles) {
    writeFileIfChanged(
      JSON.stringify(settingsSchema, null, 2),
      path.join(destination, 'config', 'settings_schema.json')
    )
  } else {
    // If no schema files found, copy existing file from theme if it exists
    const existingSchemaPath = path.join(destination, 'config', 'settings_schema.json')
    if (!fs.existsSync(existingSchemaPath)) {
      // Only create an empty schema file if none exists
      writeFileIfChanged('[]', existingSchemaPath)
    }
  }

  if (hasDataFiles) {
    writeFileIfChanged(
      JSON.stringify(settingsData, null, 2),
      path.join(destination, 'config', 'settings_data.json')
    )
  } else {
    // If no data files found, copy existing file from theme if it exists
    const existingDataPath = path.join(destination, 'config', 'settings_data.json')
    if (!fs.existsSync(existingDataPath)) {
      // Only create an empty data file if none exists
      writeFileIfChanged('{}', existingDataPath)
    }
  }
}

export async function processSettingsSchema(
  setupFile: string,
  node: LiquidNode
): Promise<object[]> {
  if (node?.name !== 'settings_schema.json') {
    return []
  }

  try {
    const schema = JSON.parse(node.body)
    if (!Array.isArray(schema)) {
      logger.warn(`Invalid schema format in ${setupFile}: Expected an array`)
      return []
    }

    return schema
  } catch (error) {
    logger.warn(`Failed to parse settings schema from ${setupFile}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return []
  }
}

export async function processSettingsData(
  setupFile: string,
  node: LiquidNode
): Promise<DeepObject> {
  if (node?.name !== 'settings_data.json') {
    return {}
  }

  try {
    const data = JSON.parse(node.body)
    if (typeof data !== 'object' || data === null) {
      logger.warn(`Invalid settings data format in ${setupFile}: Expected an object`)
      return {}
    }

    return data as DeepObject
  } catch (error) {
    logger.warn(`Failed to parse settings data from ${setupFile}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return {}
  }
}
