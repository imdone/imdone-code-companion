"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode = __toESM(require("vscode"));
var todoSections = [];
function activate(context) {
  let disposable = vscode.commands.registerCommand("open-in-imdone.refreshCards", () => {
    refreshTodoCards();
  });
  context.subscriptions.push(disposable);
  vscode.window.onDidChangeActiveTextEditor(refreshTodoCards, null, context.subscriptions);
  vscode.workspace.onDidChangeTextDocument(refreshTodoCards, null, context.subscriptions);
  refreshTodoCards();
}
function refreshTodoCards() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  deactivate();
  const text = editor.document.getText();
  const sections = findTodoSections(text);
  sections.forEach((section) => {
    editor.setDecorations(section.borderTopLeftRight, [section.borderTopLeftRightRange]);
    editor.setDecorations(section.borderLeftRight, [section.borderLeftRightRange]);
    editor.setDecorations(section.borderBottomLeftRight, [section.borderBottomLeftRightRange]);
  });
}
function findTodoSections(text) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return [];
  const regex = /(^#TODO[\s\S]*?)(\n\s*\n|$)/gm;
  todoSections = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const startLine = text.slice(0, match.index).split("\n").length - 1;
    const endLine = text.slice(0, regex.lastIndex).split("\n").length - 1;
    todoSections.push({
      startLine,
      endLine,
      borderTopLeftRight: vscode.window.createTextEditorDecorationType({
        borderWidth: "1px 0 0 0",
        borderStyle: "solid",
        borderColor: "rgba(30, 144, 255, 0.8)",
        backgroundColor: "rgba(30, 144, 255, 0.1)",
        isWholeLine: true
      }),
      borderTopLeftRightRange: new vscode.Range(startLine, 0, startLine, Number.MAX_SAFE_INTEGER),
      borderLeftRight: vscode.window.createTextEditorDecorationType({
        backgroundColor: "rgba(30, 144, 255, 0.1)",
        isWholeLine: true
      }),
      borderLeftRightRange: new vscode.Range(startLine + 1, 0, endLine - 1, Number.MAX_SAFE_INTEGER),
      borderBottomLeftRight: vscode.window.createTextEditorDecorationType({
        borderWidth: "0 0 1px 0",
        borderStyle: "solid",
        borderColor: "rgba(30, 144, 255, 0.8)",
        backgroundColor: "rgba(30, 144, 255, 0.1)",
        isWholeLine: true
      }),
      borderBottomLeftRightRange: new vscode.Range(endLine, 0, endLine, Number.MAX_SAFE_INTEGER)
    });
  }
  return todoSections;
}
function deactivate() {
  todoSections.forEach((section) => {
    section.borderTopLeftRight.dispose();
    section.borderLeftRight.dispose();
    section.borderBottomLeftRight.dispose();
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
