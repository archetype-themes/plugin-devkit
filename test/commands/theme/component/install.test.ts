import { expect } from 'chai'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import sinon from 'sinon'

import Clean from '../../../../src/commands/theme/component/clean.js'
import Copy from '../../../../src/commands/theme/component/copy.js'
import Install from '../../../../src/commands/theme/component/install.js'
import Map from '../../../../src/commands/theme/component/map.js'
import GenerateImportMap from '../../../../src/commands/theme/generate/import-map.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesPath = path.join(__dirname, '../../../fixtures')
const collectionPath = path.join(__dirname, '../../../fixtures/collection')
const themePath = path.join(__dirname, '../../../fixtures/theme')
const testCollectionPath = path.join(fixturesPath, 'test-collection')
const testThemePath = path.join(fixturesPath, 'test-theme')

describe('theme component install', () => {
  let sandbox: sinon.SinonSandbox
  let mapRunStub: sinon.SinonStub
  let copyRunStub: sinon.SinonStub
  let cleanRunStub: sinon.SinonStub
  let generateRunStub: sinon.SinonStub

  beforeEach(async () => {
    sandbox = sinon.createSandbox()
    mapRunStub = sandbox.stub(Map.prototype, 'run').resolves()
    copyRunStub = sandbox.stub(Copy.prototype, 'run').resolves()
    cleanRunStub = sandbox.stub(Clean.prototype, 'run').resolves()
    generateRunStub = sandbox.stub(GenerateImportMap.prototype, 'run').resolves()

    fs.cpSync(collectionPath, testCollectionPath, { recursive: true })
    fs.cpSync(themePath, testThemePath, { recursive: true })
    process.chdir(testCollectionPath)
  })

  afterEach(() => {
    sandbox.restore()
    fs.rmSync(testCollectionPath, { force: true, recursive: true })
    fs.rmSync(testThemePath, { force: true, recursive: true })
  })

  it('runs the theme component map command', async () => {
    await Install.run([testThemePath])
    expect(mapRunStub.calledOnce).to.be.true
  })

  it('runs the theme component copy command', async () => {
    await Install.run([testThemePath])
    expect(copyRunStub.calledOnce).to.be.true
  })

  it('runs the theme component clean command', async () => {
    await Install.run([testThemePath])
    expect(cleanRunStub.calledOnce).to.be.true
  })

  it('runs the theme component generate import map command', async () => {
    await Install.run([testThemePath])
    expect(generateRunStub.calledOnce).to.be.true
  })

  it('runs sub-commands in correct order', async () => {
    await Install.run([testThemePath])
    sinon.assert.callOrder(mapRunStub, copyRunStub, cleanRunStub, generateRunStub)
  })
})
