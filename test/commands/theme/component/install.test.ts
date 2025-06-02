import { expect } from 'chai'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import sinon from 'sinon'

import Clean from '../../../../src/commands/theme/component/clean.js'
import Copy from '../../../../src/commands/theme/component/copy.js'
import Install from '../../../../src/commands/theme/component/install.js'
import Manifest from '../../../../src/commands/theme/component/manifest.js'
import GenerateImportMap from '../../../../src/commands/theme/generate/import-map.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesPath = path.join(__dirname, '../../../fixtures')
const collectionPath = path.join(__dirname, '../../../fixtures/collection')
const themePath = path.join(__dirname, '../../../fixtures/theme')
const testCollectionPath = path.join(fixturesPath, 'test-collection')
const testCollectionBPath = path.join(fixturesPath, 'test-collection-b')
const testThemePath = path.join(fixturesPath, 'test-theme')

describe('theme component install', () => {
  let sandbox: sinon.SinonSandbox
  let manifestRunStub: sinon.SinonStub
  let copyRunStub: sinon.SinonStub
  let cleanRunStub: sinon.SinonStub
  let generateRunStub: sinon.SinonStub

  beforeEach(async () => {
    sandbox = sinon.createSandbox()
    manifestRunStub = sandbox.stub(Manifest.prototype, 'run').resolves()
    copyRunStub = sandbox.stub(Copy.prototype, 'run').resolves()
    cleanRunStub = sandbox.stub(Clean.prototype, 'run').resolves()
    generateRunStub = sandbox.stub(GenerateImportMap.prototype, 'run').resolves()

    fs.cpSync(collectionPath, testCollectionPath, { recursive: true })
    fs.cpSync(collectionPath, testCollectionBPath, { recursive: true })
    fs.cpSync(themePath, testThemePath, { recursive: true })
    process.chdir(testCollectionPath)
  })

  afterEach(() => {
    sandbox.restore()
    fs.rmSync(testCollectionPath, { force: true, recursive: true })
    fs.rmSync(testCollectionBPath, { force: true, recursive: true })
    fs.rmSync(testThemePath, { force: true, recursive: true })
  })

  it('runs the theme component manifest command', async () => {
    await Install.run([testThemePath])
    expect(manifestRunStub.calledOnce).to.be.true
  })

  it('runs the theme component copy command', async () => {
    await Install.run([testThemePath])
    expect(copyRunStub.calledOnce).to.be.true
  })

  it('runs the theme component clean command', async () => {
    await Install.run([testThemePath])
    expect(cleanRunStub.calledOnce).to.be.true
  })

  it('runs the theme component generate import map command if the destination is a theme repo', async () => {
    await Install.run([testThemePath])
    expect(generateRunStub.calledOnce).to.be.true
  })

  it('does not run the theme component generate import map command if the destination is not a theme repo', async () => {
    await Install.run([testCollectionBPath])
    expect(generateRunStub.calledOnce).to.be.false
  })

  it('runs sub-commands in correct order', async () => {
    await Install.run([testThemePath])
    sinon.assert.callOrder(manifestRunStub, copyRunStub, cleanRunStub, generateRunStub)
  })
})
