import * as vscode from 'vscode';

interface TodoSection {
  startLine: number;
  endLine: number;
  borderTopLeftRightRange: vscode.Range;
  borderTopLeftRight: vscode.TextEditorDecorationType;
  borderLeftRightRange: vscode.Range;
  borderLeftRight: vscode.TextEditorDecorationType;
  borderBottomLeftRightRange: vscode.Range;
  borderBottomLeftRight: vscode.TextEditorDecorationType;
}

let todoSections: TodoSection[] = [];

export function activate(context: vscode.ExtensionContext) {
  // Register the command to refresh TODO cards
  let disposable = vscode.commands.registerCommand('open-in-imdone.refreshCards', () => {
    refreshTodoCards();
  });

  context.subscriptions.push(disposable);

  // Automatically refresh cards when the active editor or document changes
  vscode.window.onDidChangeActiveTextEditor(refreshTodoCards, null, context.subscriptions);
  vscode.workspace.onDidChangeTextDocument(refreshTodoCards, null, context.subscriptions);

  refreshTodoCards(); // Initial refresh on startup
}

// Main function to refresh TODO card decorations
function refreshTodoCards() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  // Clear any previous decorations
  deactivate();

  const text = editor.document.getText();
  const sections = findTodoSections(text);

  sections.forEach((section) => {
    editor.setDecorations(section.borderTopLeftRight, [section.borderTopLeftRightRange]);
    editor.setDecorations(section.borderLeftRight, [section.borderLeftRightRange]);
    editor.setDecorations(section.borderBottomLeftRight, [section.borderBottomLeftRightRange]);
  });
}

// Function to find all #TODO sections in the text
function findTodoSections(text: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return [];
  const regex = /(^#TODO[\s\S]*?)(\n\s*\n|$)/gm;
  todoSections = [];

  let match;
  while ((match = regex.exec(text)) !== null) {
    const startLine = text.slice(0, match.index).split('\n').length - 1;
    const endLine = text.slice(0, regex.lastIndex).split('\n').length - 1;

    todoSections.push({
      startLine,
      endLine,
      borderTopLeftRight: vscode.window.createTextEditorDecorationType({
        borderWidth: '1px 0 0 0',
        borderStyle: 'solid',
        borderColor: 'rgba(30, 144, 255, 0.8)',
        backgroundColor: 'rgba(30, 144, 255, 0.1)',
        isWholeLine: true,
      }),
      borderTopLeftRightRange: new vscode.Range(startLine, 0, startLine, Number.MAX_SAFE_INTEGER),
      borderLeftRight: vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(30, 144, 255, 0.1)',
        isWholeLine: true,
      }),
      borderLeftRightRange: new vscode.Range(startLine + 1, 0, endLine - 1, Number.MAX_SAFE_INTEGER),
      borderBottomLeftRight: vscode.window.createTextEditorDecorationType({
        borderWidth: '0 0 1px 0',
        borderStyle: 'solid',
        borderColor: 'rgba(30, 144, 255, 0.8)',
        backgroundColor: 'rgba(30, 144, 255, 0.1)',
        isWholeLine: true,
      }),
      borderBottomLeftRightRange: new vscode.Range(endLine, 0, endLine, Number.MAX_SAFE_INTEGER),
    });
  }

  return todoSections;
}

// Clear previous decorations
export function deactivate() {
  todoSections.forEach((section) => {
    section.borderTopLeftRight.dispose();
    section.borderLeftRight.dispose();
    section.borderBottomLeftRight.dispose();
  });
}
