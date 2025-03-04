# Contributing to the DevKit CLI plugin

Thank you for your interest in contributing to the DevKit CLI plugin! All contributions are welcome. This guide will help you get started with the development process.

## Getting started

### Prerequisites

Before you begin, make sure you have the [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) installed on your system.

### Installation

Follow these steps to set up the plugin for local development:

1. **Install the Shopify CLI** (if you haven't already):

```shell
# On macOS using npm
npm install -g @shopify/cli@latest

# On macOS using Homebrew
brew tap shopify/shopify
brew install shopify-cli

# For other platforms, see the Shopify CLI documentation
```

2. **Clone the repository**:

```shell
# Clone to your preferred location
cd ~/projects
git clone https://github.com/archetype-themes/plugin-devkit.git
```

3. **Link your local copy to the Shopify CLI**:

```shell
cd plugin-devkit
shopify plugins link
```

This will allow you to test your changes locally before submitting them.

## Development workflow

1. **Find or create an issue** in the [GitHub Issues](https://github.com/archetype-themes/plugin-devkit/issues) section
2. **Assign yourself** to the issue you're working on
3. **Create a new branch** for your feature or bugfix
4. **Make your changes** and test them thoroughly
5. **Submit a pull request** targeting the `main` branch

## Uninstalling the plugin

If you need to uninstall the plugin, you can do so with one of these commands:

```shell
# From the project directory
cd ~/projects/plugin-devkit
shopify plugins uninstall

# From anywhere
shopify plugins uninstall plugin-devkit
```

## Need help?

If you have questions or need assistance:

1. Check the existing [documentation](https://github.com/archetype-themes/plugin-devkit/blob/main/README.md)
2. Comment on the relevant GitHub issue
3. Reach out to the maintainers through the project's communication channels

We appreciate your contributions and look forward to your pull requests!
