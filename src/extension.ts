import * as vscode from 'vscode';
// @ts-ignore
import { getTasks } from 'imdone-core/lib/usecases/get-tasks-in-file';
interface TodoSection {
  startLine: number;
  endLine: number;
  lineBackgroundStyle: vscode.TextEditorDecorationType;
  lineBackgroundRange: vscode.Range;
}

let todoSections: TodoSection[] = [];

export async function activate(context: vscode.ExtensionContext) {
  // Register the command that opens the Imdone card
  const disposable = vscode.commands.registerCommand('imdone-code-companion.openCard', () => {
    openImdoneCard();
  });

  context.subscriptions.push(disposable);


  // Register the command to refresh TODO cards
  const refreshCards = vscode.commands.registerCommand('imdone-code-companion.refreshCards', () => {
    refreshTodoCards();
  });

  context.subscriptions.push(refreshCards);

  // Automatically refresh cards when the active editor or document changes
  vscode.window.onDidChangeActiveTextEditor(refreshTodoCards, null, context.subscriptions);
  vscode.workspace.onDidChangeTextDocument(refreshTodoCards, null, context.subscriptions);

  refreshTodoCards(); // Initial refresh on startup
}

// Main function to refresh TODO card decorations
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
