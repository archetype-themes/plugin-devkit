import { Command, Flags } from '@oclif/core'

export default class Component extends Command {
  static description = 'Devkit CLI plugin by Archetype Themes'

  static flags = {
    version: Flags.boolean({
      char: 'v',
      description: 'Display plugin version',
      required: false,
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Component)

    if (flags.version) {
      this.log(`\nShopify CLI version: ${this.config.version}`)

      const plugin = this.config.plugins.get('plugin-devkit')
      this.log(`Devkit CLI plugin version: ${plugin?.version ?? 'unknown'}`)
    } else {
      this.log(
        '\nWelcome to the Devkit CLI plugin by Archetype Themes.\n' +
        '\nUse the "--help" or "-h" flag to list available commands'
      )
    }
  }
}
