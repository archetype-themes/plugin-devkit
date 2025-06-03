const COPYRIGHT_NOTICE = 'Copyright © 2025 Archetype Themes LP. All rights reserved.'

export function generateLiquidContent(fullName: string, hasJs: boolean = false, inlineAssets?: { css: boolean; js: boolean }, externalAssets?: { css: boolean; js: boolean }): string {
  const elementName = fullName.replace('.', '-')
  const hasCss = inlineAssets?.css || externalAssets?.css

  // Ensure class is added when CSS is generated
  const wrapper = hasJs
    ? (hasCss ? `${elementName} class="${elementName}"` : elementName)
    : `div class="${elementName}"`
  const closingTag = hasJs ? elementName : 'div'

  let content = `{%- doc -%}
  ${COPYRIGHT_NOTICE}

  Renders the ${fullName} component

  @example
  {% render '${fullName}' %}
{%- enddoc -%}
`

  // Add external CSS reference right after enddoc
  if (externalAssets?.css) {
    content += `
{{ '${fullName}.css' | asset_url | stylesheet_tag }}
`
  }

  content += `
<${wrapper}>
  <!-- Component content goes here -->
</${closingTag}>
`

  // Add inline CSS if requested
  if (inlineAssets?.css) {
    content += `
{% stylesheet %}
  .${elementName} {
    /* Component styles go here */
  }
{% endstylesheet %}
`
  }

  // Add inline JS if requested
  if (inlineAssets?.js) {
    const className = generateClassName(fullName)
    content += `
{% javascript %}
  class ${className} extends HTMLElement {
    constructor() {
      super()
    }

    connectedCallback() {}

    disconnectedCallback() {}
  }

  customElements.define('${elementName}', ${className})
{% endjavascript %}
`
  }

  // Add external JS reference if requested
  if (externalAssets?.js) {
    content += `
<script type="module">
  import '${fullName}'
</script>
`
  }

  return content
}

export function generateCSSContent(className: string): string {
  return `.${className.replace('.', '-')} {
  /* Component styles go here */
}
`
}

export function generateJSContent(fullName: string): string {
  const customElementName = fullName.replace('.', '-')
  const className = generateClassName(fullName)

  return `class ${className} extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {}

  disconnectedCallback() {}
}

customElements.define('${customElementName}', ${className})
`
}

export function generateClassName(fullName: string): string {
  return fullName.split('.').map(part =>
    part.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')
  ).join('')
}

export function generateSnippetContent(fullName: string, snippetName: string): string {
  const className = fullName.replace('.', '-')

  return `{%- doc -%}
  Renders the ${fullName}.${snippetName} snippet

  @example
  {% render '${fullName}.${snippetName}' %}
{%- enddoc -%}

<div class="${className}__${snippetName}">
  <!-- Snippet content goes here -->
</div>
`
}

export function generateSnippetJSContent(fullName: string, snippetName: string): string {
  return `// Snippet: ${fullName}.${snippetName}

// Snippet JavaScript goes here
`
}

export function generateSetupSectionContent(fullName: string): string {
  const [type, name] = fullName.split('.')

  return `<section class="setup-${type}-${name}">
  {% render '${fullName}' %}
</section>

{% schema %}
{
  "name": "${name}",
  "settings": []
}
{% endschema %}
`
}

export function generateSetupTemplateContent(fullName: string): string {
  return `{
  "sections": {
    "main": {
      "type": "${fullName.replace('.', '-')}-setup"
    }
  },
  "order": ["main"]
}
`
}
