import { runCommand } from '@oclif/test'
import { expect } from 'chai'
import chokidar, { FSWatcher } from 'chokidar'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import sinon from 'sinon'

import Dev from '../../../../src/commands/theme/component/dev.js'
import Install from '../../../../src/commands/theme/component/install.js'
import GenerateTemplateMap from '../../../../src/commands/theme/generate/template-map.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesPath = path.join(__dirname, '../../../fixtures')
const collectionPath = path.join(__dirname, '../../../fixtures/collection')
const themePath = path.join(__dirname, '../../../fixtures/theme')
const testCollectionPath = path.join(fixturesPath, 'test-collection')
const testThemePath = path.join(fixturesPath, 'test-theme')

describe('theme component dev', () => {
  let sandbox: sinon.SinonSandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    fs.cpSync(collectionPath, testCollectionPath, { recursive: true })
    fs.cpSync(themePath, testThemePath, { recursive: true })
    process.chdir(testCollectionPath)
  })

  afterEach(() => {
    sandbox.restore()
    fs.rmSync(testCollectionPath, { force: true, recursive: true })
    fs.rmSync(testThemePath, { force: true, recursive: true })
  })

  it('copies the component setup files to the dev directory', async () => {
    await runCommand(['theme', 'component', 'dev', '-t', testThemePath])
    expect(fs.existsSync(path.join(testCollectionPath, '.dev', 'sections', 'with-setup.liquid'))).to.be.true
    expect(fs.existsSync(path.join(testCollectionPath, '.dev', 'templates', 'index.with-setup.liquid'))).to.be.true
    expect(fs.existsSync(path.join(testCollectionPath, '.dev', 'blocks', 'with-setup.liquid'))).to.be.true
    expect(fs.existsSync(path.join(testCollectionPath, '.dev', 'blocks', '_with-setup.liquid'))).to.be.true
  })

  it('merges the settings_schema.json setup files', async () => {
    await runCommand(['theme', 'component', 'dev', '-t', testThemePath])
    expect(fs.existsSync(path.join(testCollectionPath, '.dev', 'config', 'settings_schema.json'))).to.be.true
    const json = fs.readFileSync(path.join(testCollectionPath, '.dev', 'config', 'settings_schema.json'), 'utf8')
    const jsonObject = JSON.parse(json)
    expect(jsonObject).to.have.deep.members([{ name: "schema_1" }, { name: "schema_2" }, { name: "schema_3" }])
  })

  it('merges the settings_data.json setup files', async () => {
    await runCommand(['theme', 'component', 'dev', '-t', testThemePath])
    expect(fs.existsSync(path.join(testCollectionPath, '.dev', 'config', 'settings_data.json'))).to.be.true
    const json = fs.readFileSync(path.join(testCollectionPath, '.dev', 'config', 'settings_data.json'), 'utf8')
    const jsonObject = JSON.parse(json)
    expect(jsonObject.presets.Default.value_1).to.be.true
    expect(jsonObject.presets.Default.value_2).to.be.true
  })

  it('copies a selected component setup file to the dev directory', async () => {
    await runCommand(['theme', 'component', 'dev', 'with-setup', '-t', testThemePath])
    expect(fs.existsSync(path.join(testCollectionPath, '.dev', 'sections', 'with-setup.liquid'))).to.be.true
    expect(fs.existsSync(path.join(testCollectionPath, '.dev', 'templates', 'index.with-setup.liquid'))).to.be.true

    expect(fs.existsSync(path.join(testCollectionPath, '.dev', 'sections', 'with-setup-other.liquid'))).to.be.false
    expect(fs.existsSync(path.join(testCollectionPath, '.dev', 'templates', 'index.with-setup-other.liquid'))).to.be.false
  })

  it('runs the install command', async () => {
    const installRunStub = sandbox.stub(Install, 'run').resolves()
    sandbox.stub(Dev.prototype, 'log').returns()

    await Dev.run(['-t', testThemePath, '--no-preview', '--no-watch'])

    expect(installRunStub.called).to.be.true
  })

  it('runs the generate import map command', async () => {
    const installRunStub = sandbox.stub(Install, 'run').resolves()
    sandbox.stub(Dev.prototype, 'log').returns()

    await Dev.run(['-t', testThemePath, '--no-preview', '--no-watch'])

    expect(installRunStub.called).to.be.true
  })

  it('runs the generate template map command', async () => {
    const generateTemplateMapRunStub = sandbox.stub(GenerateTemplateMap, 'run').resolves()
    sandbox.stub(Dev.prototype, 'log').returns()
    sandbox.stub(Install, 'run').resolves()

    await Dev.run(['-t', testThemePath, '--no-preview', '--no-watch', '--generate-template-map'])

    expect(generateTemplateMapRunStub.called).to.be.true
  })

  it('watches for changes to the theme and components and rebuilds the theme', async () => {
    const watchStub = sandbox.stub(chokidar, 'watch')
    const onStub = sandbox.stub()
    const mockWatcher: Partial<FSWatcher> = {
      emit: sandbox.stub(),
      on: onStub
    }
    watchStub.returns(mockWatcher as FSWatcher)

    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'test'

    await runCommand(['theme', 'component', 'dev', '-t', testThemePath, '--watch', '--no-preview'])

    expect(watchStub.calledOnce).to.be.true
    expect(watchStub.firstCall.args[0]).to.deep.equal([path.join(testThemePath), path.join(testCollectionPath, 'components')])

    process.env.NODE_ENV = originalEnv
  })
})
