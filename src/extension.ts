import * as vscode from 'vscode';
// @ts-ignore
import { getTasks } from 'imdone-core/lib/usecases/get-tasks-in-file';
// @ts-ignore
import { getTags } from 'imdone-core/lib/usecases/get-project-tags';
// @ts-ignore
import { getCardData } from 'imdone-core/lib/usecases/get-card-data';

interface TodoSection {
  startLine: number;
  endLine: number;
  lineBackgroundStyle: vscode.TextEditorDecorationType;
  lineBackgroundRange: vscode.Range;
}

let todoSections: TodoSection[] = [];

export async function activate(context: vscode.ExtensionContext) {
  // vscode.window.showInformationMessage('Imdone Code Companion extension activated!');

  if (!context.subscriptions.some(sub => sub instanceof vscode.Disposable && (sub as any)['_command'] === 'imdone-code-companion.openCard')) {
    // Register the command that opens the Imdone card
    const disposable = vscode.commands.registerCommand('imdone-code-companion.openCard', () => {
      openImdoneCard();
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(imdoneCompletionProvider);
    context.subscriptions.push(cardDataCompletionProvider);
    const refreshCards = vscode.commands.registerCommand('imdone-code-companion.refreshCards', () => {
      refreshTodoCards();
    });

    context.subscriptions.push(refreshCards);
  }

  // Automatically refresh cards when the active editor or document changes
  vscode.window.onDidChangeActiveTextEditor(refreshTodoCards, null, context.subscriptions);
  vscode.workspace.onDidChangeTextDocument(refreshTodoCards, null, context.subscriptions);

  refreshTodoCards(); // Initial refresh on startup
}

// TODO Update this to work more like the imdone obsidian plugin
// <!--
// order:-10
// -->
const imdoneCompletionProvider = vscode.languages.registerCompletionItemProvider(
  { scheme: 'file', pattern: '**/*' },
  {
    async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
      const sections = await findTodoSections(document.getText());
      const lineNumber = position.line;
      const section = sections.find((section) => {
        return section.startLine <= lineNumber && section.endLine >= lineNumber;
      });
      if (!section) {
        return [];
      }
      const lineText = document.lineAt(position).text;
      const completionItems: vscode.CompletionItem[] = [];

      // Check for tag trigger: `#` anywhere on the line
      if (lineText.includes('#')) {
        let tags = [];
        try {
          tags = await getTags(document.uri.fsPath);
        } catch (error) {
          console.error('Error fetching tags:', error);
        }
        tags.forEach((tag: string) => {
          const item = new vscode.CompletionItem(tag, vscode.CompletionItemKind.Keyword);
          item.detail = 'Imdone Tag';
          item.insertText = tag;
          completionItems.push(item);
        });
      }

      return completionItems;
    }
  },
  '#' // Trigger on `#`
);

// Card data completion provider that triggers on `$`
const cardDataCompletionProvider = vscode.languages.registerCompletionItemProvider(
  { scheme: 'file', pattern: '**/*' },
  {
    async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
      const sections = await findTodoSections(document.getText());
      const lineNumber = position.line;
      const section = sections.find((section) => {
        return section.startLine <= lineNumber && section.endLine >= lineNumber;
      });
      
      if (!section) {
        return [];
      }
      
      const lineText = document.lineAt(position).text;
      const completionItems: vscode.CompletionItem[] = [];

      // Check for card data trigger: `$` 
      const dollarIndex = lineText.lastIndexOf('$', position.character);

      
      if (dollarIndex !== -1) {

        // Show an alert for testing
        // vscode.window.showInformationMessage('Dollar sign detected! Checking for completions...');
        
        // Get card data for the current line

        const cardData = {
          ...await getCardData({ 
            path: document.uri.fsPath, 
            line: lineNumber + 1 // Convert to 1-based line number
          }),
          content: undefined
        };

        try {
          
          if (cardData) {
            // Iterate through all properties in the already-flattened card data
            Object.keys(cardData).forEach(key => {
              if (!key.includes('template_')) return;
              const value = cardData[key];
              // Handle different data types properly
              let displayValue: string;
              if (typeof value === 'string') {
                displayValue = value;
              } else if (typeof value === 'number' || typeof value === 'boolean') {
                displayValue = String(value);
              } else if (Array.isArray(value)) {
                displayValue = value.join(', ');
              } else if (value === null || value === undefined) {
                displayValue = '';
              } else {
                displayValue = JSON.stringify(value);
              }

              const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Property);
              item.detail = displayValue;
              item.insertText = displayValue;
              item.filterText = key;
              
              // Replace the $ character with the completion
              const dollarPosition = new vscode.Position(position.line, dollarIndex);
              const dollarRange = new vscode.Range(dollarPosition, new vscode.Position(position.line, dollarIndex + 1));
              item.additionalTextEdits = [
                vscode.TextEdit.delete(dollarRange)
              ];
              
              completionItems.push(item);
            });

          } else {
            vscode.window.showErrorMessage(`❌ No card data found`);
          }
        } catch (error) {
          vscode.window.showErrorMessage(`❌ Error getting card data: ${error}`);
        }
      }

      // vscode.window.showInformationMessage(`Final completion items: ${completionItems.length}`);
      return completionItems;
    }
  },
  '$' // Trigger on `$`
);

async function refreshTodoCards() {
  
  const editor = vscode.window.activeTextEditor;
  if (!editor) { return; }

  const text = editor.document.getText();
  const sections = await findTodoSections(text);

  sections.forEach((section) => {
    editor.setDecorations(section.lineBackgroundStyle, [section.lineBackgroundRange]);
  });
}

// Function to find all #TODO sections in the text
async function findTodoSections(text: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) { return []; }

  const tasks = await getTasks({filePath: editor.document.uri.fsPath, content: text});

  clearTodoSections();

  todoSections = [];

  for (const task of tasks) {
    const startLine = task.line;
    const endLine = task.lastLine;
    todoSections.push({
      startLine,
      endLine,
      lineBackgroundStyle: vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(30, 144, 255, 0.1)',
        isWholeLine: true,
      }),
      lineBackgroundRange: new vscode.Range(startLine - 1, 0, endLine, Number.MAX_SAFE_INTEGER),
    });
  }

  return todoSections;
}

function openImdoneCard() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor.');
    return;
  }

  const document = editor.document;
  const cursorPosition = editor.selection.active;
  const lineNumber = cursorPosition.line + 1; // 1-based index for line numbers

  const filePath = document.uri.fsPath;

  const imdoneUrl = `imdone://card.select/${encodeURIComponent(filePath)}?line=${lineNumber}`;

  vscode.env.openExternal(vscode.Uri.parse(imdoneUrl));
}

function clearTodoSections() {
  todoSections.forEach((section) => {
    section.lineBackgroundStyle.dispose();
  });
}
// Clear previous decorations
export function deactivate() {
  clearTodoSections();
}
