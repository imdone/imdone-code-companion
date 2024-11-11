# imdone-code-companion README

This extension provides a seamless way to open Imdone directly to the specific card the cursor is currently in, right from Visual Studio Code.

## Features

- **Open Imdone Card with Keyboard Shortcut**: Place your cursor inside a `TODO` comments and press `Ctrl+I` to open Imdone directly to the card.
- **Efficient Card Location Detection**: Automatically gathers the active file path and line number, generating a link to open Imdone at the exact location.

### Example of Usage

![Open Card in Imdone](imdone-code-companion.gif)

This command works in any file that contains Imdone-compatible `TODO` comments, making it easy to track and manage tasks without leaving your coding environment.

## Requirements

- **Imdone**: Make sure Imdone is installed and configured to manage your project's `TODO` comments. Learn more at [Imdone.io](https://imdone.io).
- **VS Code Workspace**: The extension requires an open workspace for it to locate files and manage relative paths correctly.

## Extension Settings

This extension doesn’t currently add any specific settings but is enabled as long as VS Code is active.

## Known Issues

None reported yet. Please create an issue if you experience any problems.

## Release Notes

### 0.0.2

- Initial release of `imdone-code-companion`, featuring keyboard shortcut support for opening Imdone at specific cards.

---

## Following Extension Guidelines

We strive to follow best practices for VS Code extensions. Please see the official [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines) for more information.

## Working with Markdown

You can use Visual Studio Code to edit and preview this README:

* **Split the editor** (`Cmd+\` on macOS or `Ctrl+\` on Windows/Linux).
* **Toggle preview** (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows/Linux).
* **View Markdown snippets** (`Ctrl+Space` on any platform).

**Enjoy using imdone-code-companion to streamline your task management in VS Code!**
