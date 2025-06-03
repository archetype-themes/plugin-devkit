import { runCommand } from '@oclif/test'
import { expect } from 'chai'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import Flags from '../../../../src/utilities/flags.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesPath = path.join(__dirname, '../../../fixtures')
const themePath = path.join(__dirname, '../../../fixtures/theme')
const testThemePath = path.join(fixturesPath, 'test-theme')

describe('theme generate component', () => {
  beforeEach(() => {
    if (fs.existsSync(testThemePath)) {
      fs.rmSync(testThemePath, { force: true, recursive: true })
    }

    fs.cpSync(themePath, testThemePath, { recursive: true })
    process.chdir(testThemePath)
  })

  afterEach(() => {
    fs.rmSync(testThemePath, { force: true, recursive: true })
  })

  it('generates a simple element component with name argument', async () => {
    await runCommand(['theme:generate:component', 'element.button'])

    const componentDir = path.join(testThemePath, 'components', 'element.button')
    const liquidFile = path.join(componentDir, 'element.button.liquid')

    expect(fs.existsSync(componentDir)).to.be.true
    expect(fs.existsSync(liquidFile)).to.be.true

    const content = fs.readFileSync(liquidFile, 'utf8')
    expect(content).to.include('Renders the element.button component')
    expect(content).to.include('<div class="element-button">')
    expect(content).to.include('</div>')
    expect(content).to.not.include('stylesheet')
    expect(content).to.not.include('javascript')
  })

  it('generates a section component with name argument', async () => {
    await runCommand(['theme:generate:component', 'section.hero'])

    const componentDir = path.join(testThemePath, 'components', 'section.hero')
    const liquidFile = path.join(componentDir, 'section.hero.liquid')

    expect(fs.existsSync(liquidFile)).to.be.true

    const content = fs.readFileSync(liquidFile, 'utf8')
    expect(content).to.include('Renders the section.hero component')
    expect(content).to.include('<div class="section-hero">')
  })

  it('handles component names with hyphens and underscores', async () => {
    await runCommand(['theme:generate:component', 'element.multi-word_name'])

    const componentDir = path.join(testThemePath, 'components', 'element.multi-word_name')
    const liquidFile = path.join(componentDir, 'element.multi-word_name.liquid')

    expect(fs.existsSync(liquidFile)).to.be.true

    const content = fs.readFileSync(liquidFile, 'utf8')
    expect(content).to.include('Renders the element.multi-word_name component')
    expect(content).to.include('<div class="element-multi-word_name">')
  })

  it('generates component with inline CSS and JS assets', async () => {
    await runCommand(['theme:generate:component', 'element.button', '--assets'])

    const liquidFile = path.join(testThemePath, 'components', 'element.button', 'element.button.liquid')
    const content = fs.readFileSync(liquidFile, 'utf8')

    expect(content).to.include('{% stylesheet %}')
    expect(content).to.include('.element-button {')
    expect(content).to.include('{% endstylesheet %}')
    expect(content).to.include('{% javascript %}')
    expect(content).to.include('class ElementButton extends HTMLElement')
    expect(content).to.include('{% endjavascript %}')
    expect(content).to.include('<element-button class="element-button">')
    expect(content).to.include('</element-button>')
  })

  it('generates component with external CSS and JS assets', async () => {
    await runCommand(['theme:generate:component', 'element.button', '--assets', '--files'])

    const componentDir = path.join(testThemePath, 'components', 'element.button')
    const liquidFile = path.join(componentDir, 'element.button.liquid')
    const cssFile = path.join(componentDir, 'assets', 'element.button.css')
    const jsFile = path.join(componentDir, 'assets', 'element.button.js')

    expect(fs.existsSync(cssFile)).to.be.true
    expect(fs.existsSync(jsFile)).to.be.true

    const liquidContent = fs.readFileSync(liquidFile, 'utf8')
    expect(liquidContent).to.include("{{ 'element.button.css' | asset_url | stylesheet_tag }}")
    expect(liquidContent).to.include("import 'element.button'")
    expect(liquidContent).to.not.include('{% stylesheet %}')
    expect(liquidContent).to.not.include('{% javascript %}')

    const cssContent = fs.readFileSync(cssFile, 'utf8')
    expect(cssContent).to.include('.element-button {')
    expect(cssContent).to.include('/* Component styles go here */')

    const jsContent = fs.readFileSync(jsFile, 'utf8')
    expect(jsContent).to.include('class ElementButton extends HTMLElement')
    expect(jsContent).to.include("customElements.define('element-button', ElementButton)")
  })

  it('generates component with only CSS assets', async () => {
    await runCommand(['theme:generate:component', 'element.button', '--assets', '--asset-types=css'])

    const liquidFile = path.join(testThemePath, 'components', 'element.button', 'element.button.liquid')
    const content = fs.readFileSync(liquidFile, 'utf8')

    expect(content).to.include('{% stylesheet %}')
    expect(content).to.include('.element-button {')
    expect(content).to.not.include('{% javascript %}')
    expect(content).to.include('<div class="element-button">')
    expect(content).to.include('</div>')
  })

  it('generates component with only JS assets', async () => {
    await runCommand(['theme:generate:component', 'element.button', '--assets', '--asset-types=js'])

    const liquidFile = path.join(testThemePath, 'components', 'element.button', 'element.button.liquid')
    const content = fs.readFileSync(liquidFile, 'utf8')

    expect(content).to.not.include('{% stylesheet %}')
    expect(content).to.include('{% javascript %}')
    expect(content).to.include('class ElementButton extends HTMLElement')
    expect(content).to.include('<element-button>')
    expect(content).to.include('</element-button>')
  })

  it('generates external CSS and JS files with --files flag', async () => {
    await runCommand(['theme:generate:component', 'element.button', '--assets', '--files', '--asset-types=css,js'])

    const cssFile = path.join(testThemePath, 'components', 'element.button', 'assets', 'element.button.css')
    const jsFile = path.join(testThemePath, 'components', 'element.button', 'assets', 'element.button.js')

    expect(fs.existsSync(cssFile)).to.be.true
    expect(fs.existsSync(jsFile)).to.be.true
  })

  it('generates component with single snippet', async () => {
    await runCommand(['theme:generate:component', 'element.card', '--snippets=body'])

    const componentDir = path.join(testThemePath, 'components', 'element.card')
    const snippetFile = path.join(componentDir, 'snippets', 'element.card.body.liquid')

    expect(fs.existsSync(snippetFile)).to.be.true

    const content = fs.readFileSync(snippetFile, 'utf8')
    expect(content).to.include('Renders the element.card.body snippet')
    expect(content).to.include('<div class="element-card__body">')
  })

  it('generates component with multiple snippets', async () => {
    await runCommand(['theme:generate:component', 'element.card', '--snippets=header,body,footer'])

    const componentDir = path.join(testThemePath, 'components', 'element.card')
    const headerSnippet = path.join(componentDir, 'snippets', 'element.card.header.liquid')
    const bodySnippet = path.join(componentDir, 'snippets', 'element.card.body.liquid')
    const footerSnippet = path.join(componentDir, 'snippets', 'element.card.footer.liquid')

    expect(fs.existsSync(headerSnippet)).to.be.true
    expect(fs.existsSync(bodySnippet)).to.be.true
    expect(fs.existsSync(footerSnippet)).to.be.true

    const headerContent = fs.readFileSync(headerSnippet, 'utf8')
    expect(headerContent).to.include('Renders the element.card.header snippet')
    expect(headerContent).to.include('<div class="element-card__header">')
  })

  it('generates snippet assets with external files', async () => {
    await runCommand(['theme:generate:component', 'element.card', '--snippets=body', '--assets', '--files'])

    const componentDir = path.join(testThemePath, 'components', 'element.card')
    const snippetCssFile = path.join(componentDir, 'assets', 'element.card.body.css')
    const snippetJsFile = path.join(componentDir, 'assets', 'element.card.body.js')

    expect(fs.existsSync(snippetCssFile)).to.be.true
    expect(fs.existsSync(snippetJsFile)).to.be.true

    const cssContent = fs.readFileSync(snippetCssFile, 'utf8')
    expect(cssContent).to.include('.element-card__body {')

    const jsContent = fs.readFileSync(snippetJsFile, 'utf8')
    expect(jsContent).to.include('// Snippet: element.card.body')
  })

  it('does not generate snippet asset files with inline assets', async () => {
    await runCommand(['theme:generate:component', 'element.card', '--snippets=body', '--assets'])

    const componentDir = path.join(testThemePath, 'components', 'element.card')
    const snippetCssFile = path.join(componentDir, 'assets', 'element.card.body.css')
    const snippetJsFile = path.join(componentDir, 'assets', 'element.card.body.js')

    expect(fs.existsSync(snippetCssFile)).to.be.false
    expect(fs.existsSync(snippetJsFile)).to.be.false
  })

  it('generates setup section and template files', async () => {
    await runCommand(['theme:generate:component', 'section.hero', '--setup'])

    const componentDir = path.join(testThemePath, 'components', 'section.hero')
    const setupSectionFile = path.join(componentDir, 'setup', 'sections', 'section-hero.liquid')
    const setupTemplateFile = path.join(componentDir, 'setup', 'templates', 'index.section-hero.json')

    expect(fs.existsSync(setupSectionFile)).to.be.true
    expect(fs.existsSync(setupTemplateFile)).to.be.true

    const sectionContent = fs.readFileSync(setupSectionFile, 'utf8')
    expect(sectionContent).to.include("{% render 'section.hero' %}")
    expect(sectionContent).to.include('<section class="setup-section-hero">')
    expect(sectionContent).to.include('{% schema %}')
    expect(sectionContent).to.include('"name": "hero"')

    const templateContent = fs.readFileSync(setupTemplateFile, 'utf8')
    const templateJson = JSON.parse(templateContent)
    expect(templateJson.sections.main.type).to.equal('section-hero-setup')
    expect(templateJson.order).to.deep.equal(['main'])
  })

  it('does not generate setup files when flag is not provided', async () => {
    await runCommand(['theme:generate:component', 'section.hero'])

    const componentDir = path.join(testThemePath, 'components', 'section.hero')
    const setupDir = path.join(componentDir, 'setup')

    expect(fs.existsSync(setupDir)).to.be.false
  })

  it('generates component with all features enabled', async () => {
    await runCommand([
      'theme:generate:component',
      'element.card',
      '--assets',
      '--files',
      '--snippets=header,body,footer',
      '--setup'
    ])

    const componentDir = path.join(testThemePath, 'components', 'element.card')

    // Main component file
    expect(fs.existsSync(path.join(componentDir, 'element.card.liquid'))).to.be.true

    // Asset files
    expect(fs.existsSync(path.join(componentDir, 'assets', 'element.card.css'))).to.be.true
    expect(fs.existsSync(path.join(componentDir, 'assets', 'element.card.js'))).to.be.true

    // Snippet files
    expect(fs.existsSync(path.join(componentDir, 'snippets', 'element.card.header.liquid'))).to.be.true
    expect(fs.existsSync(path.join(componentDir, 'snippets', 'element.card.body.liquid'))).to.be.true
    expect(fs.existsSync(path.join(componentDir, 'snippets', 'element.card.footer.liquid'))).to.be.true

    // Snippet asset files
    expect(fs.existsSync(path.join(componentDir, 'assets', 'element.card.header.css'))).to.be.true
    expect(fs.existsSync(path.join(componentDir, 'assets', 'element.card.header.js'))).to.be.true

    // Setup files
    expect(fs.existsSync(path.join(componentDir, 'setup', 'sections', 'element-card.liquid'))).to.be.true
    expect(fs.existsSync(path.join(componentDir, 'setup', 'templates', 'index.element-card.json'))).to.be.true
  })

  it('skips existing files by default', async () => {
    // Create component first time
    await runCommand(['theme:generate:component', 'element.button'])

    const liquidFile = path.join(testThemePath, 'components', 'element.button', 'element.button.liquid')
    const originalContent = fs.readFileSync(liquidFile, 'utf8')

    // Modify the file
    const modifiedContent = originalContent.replace('Component content goes here', 'Modified content')
    fs.writeFileSync(liquidFile, modifiedContent)

    // Try to generate again
    await runCommand(['theme:generate:component', 'element.button'])

    // Content should remain modified
    const finalContent = fs.readFileSync(liquidFile, 'utf8')
    expect(finalContent).to.include('Modified content')
    expect(finalContent).to.not.include('Component content goes here')
  })

  it('overwrites existing files with --force flag', async () => {
    // Create component first time
    await runCommand(['theme:generate:component', 'element.button'])

    const liquidFile = path.join(testThemePath, 'components', 'element.button', 'element.button.liquid')
    const originalContent = fs.readFileSync(liquidFile, 'utf8')

    // Modify the file
    const modifiedContent = originalContent.replace('Component content goes here', 'Modified content')
    fs.writeFileSync(liquidFile, modifiedContent)

    // Generate again with force
    await runCommand(['theme:generate:component', 'element.button', '--force'])

    // Content should be restored to original
    const finalContent = fs.readFileSync(liquidFile, 'utf8')
    expect(finalContent).to.include('Component content goes here')
    expect(finalContent).to.not.include('Modified content')
  })

  it('errors when --files is used without --assets', async () => {
    const { error } = await runCommand(['theme:generate:component', 'element.button', '--files'])
    expect(error).to.be.instanceOf(Error)
    expect(error?.message).to.include('The --files flag can only be used together with --assets')
  })

  it('errors when --asset-types is used without --assets', async () => {
    const { error } = await runCommand(['theme:generate:component', 'element.button', '--asset-types=css'])
    expect(error).to.be.instanceOf(Error)
    expect(error?.message).to.include('The --asset-types flag can only be used together with --assets')
  })

  it('extracts type from dotted name format', async () => {
    await runCommand(['theme:generate:component', 'form.input'])

    const componentDir = path.join(testThemePath, 'components', 'form.input')
    const liquidFile = path.join(componentDir, 'form.input.liquid')

    expect(fs.existsSync(liquidFile)).to.be.true

    const content = fs.readFileSync(liquidFile, 'utf8')
    expect(content).to.include('Renders the form.input component')
  })

  it('suppresses output with --quiet flag', async () => {
    const { stdout } = await runCommand([
      'theme:generate:component',
      'element.button',
      `--${Flags.QUIET}`
    ])
    expect(stdout).to.equal('')
  })

  it('shows output without --quiet flag', async () => {
    const { stdout } = await runCommand(['theme:generate:component', 'element.button'])
    expect(stdout).to.not.equal('')
  })

  it('creates proper directory structure for components', async () => {
    await runCommand([
      'theme:generate:component',
      'element.card',
      '--assets',
      '--files',
      '--snippets=body',
      '--setup'
    ])

    const componentDir = path.join(testThemePath, 'components', 'element.card')

    expect(fs.existsSync(componentDir)).to.be.true
    expect(fs.existsSync(path.join(componentDir, 'assets'))).to.be.true
    expect(fs.existsSync(path.join(componentDir, 'snippets'))).to.be.true
    expect(fs.existsSync(path.join(componentDir, 'setup'))).to.be.true
    expect(fs.existsSync(path.join(componentDir, 'setup', 'sections'))).to.be.true
    expect(fs.existsSync(path.join(componentDir, 'setup', 'templates'))).to.be.true
  })

  it('creates nested directories as needed', async () => {
    await runCommand(['theme:generate:component', 'deeply.nested.component.name'])

    const componentDir = path.join(testThemePath, 'components', 'deeply.nested.component.name')
    const liquidFile = path.join(componentDir, 'deeply.nested.component.name.liquid')

    expect(fs.existsSync(componentDir)).to.be.true
    expect(fs.existsSync(liquidFile)).to.be.true
  })

  it('generates valid CSS class names from component names', async () => {
    await runCommand(['theme:generate:component', 'element.multi-word-component'])

    const liquidFile = path.join(testThemePath, 'components', 'element.multi-word-component', 'element.multi-word-component.liquid')
    const content = fs.readFileSync(liquidFile, 'utf8')

    expect(content).to.include('class="element-multi-word-component"')
  })

  it('generates valid custom element names', async () => {
    await runCommand(['theme:generate:component', 'element.custom-element', '--assets', '--asset-types=js'])

    const liquidFile = path.join(testThemePath, 'components', 'element.custom-element', 'element.custom-element.liquid')
    const content = fs.readFileSync(liquidFile, 'utf8')

    expect(content).to.include('<element-custom-element>')
    expect(content).to.include("customElements.define('element-custom-element'")
  })

  it('generates valid JavaScript class names', async () => {
    await runCommand(['theme:generate:component', 'element.multi-word-component', '--assets', '--asset-types=js'])

    const liquidFile = path.join(testThemePath, 'components', 'element.multi-word-component', 'element.multi-word-component.liquid')
    const content = fs.readFileSync(liquidFile, 'utf8')

    expect(content).to.include('class ElementMultiWordComponent extends HTMLElement')
  })
})
