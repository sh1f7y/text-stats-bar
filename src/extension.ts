import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    item.command = 'my-first-extension.copyStats';
    context.subscriptions.push(item);

    // Считает статистику выделения или всего документа
    function getStats(): string | undefined {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return undefined;
        }
        const doc = editor.document;
        const sel = editor.selection;
        const hasSelection = !sel.isEmpty;

        const text = hasSelection ? doc.getText(sel) : doc.getText();
        const lines = hasSelection ? sel.end.line - sel.start.line + 1 : doc.lineCount;
        const words = text.split(/\s+/).filter(w => w.length > 0).length;
        const chars = text.length;

        const prefix = hasSelection ? 'Выделено' : 'Файл';
        return `${prefix}: ${lines} стр., ${words} сл., ${chars} симв.`;
    }

    function updateStats() {
        const stats = getStats();
        if (stats === undefined) {
            item.hide();
            return;
        }
        item.text = `$(note) ${stats}`;
        item.tooltip = 'Нажмите, чтобы скопировать статистику';
        item.show();
    }

    // Команда: скопировать статистику в буфер обмена
    context.subscriptions.push(
        vscode.commands.registerCommand('my-first-extension.copyStats', async () => {
            const stats = getStats();
            if (stats === undefined) {
                vscode.window.showWarningMessage('Нет открытого файла');
                return;
            }
            await vscode.env.clipboard.writeText(stats);
            vscode.window.showInformationMessage('Статистика скопирована: ' + stats);
        })
    );

    // Обновление при событиях
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(updateStats),
        vscode.window.onDidChangeTextEditorSelection(updateStats),
        vscode.workspace.onDidChangeTextDocument(updateStats)
    );

    updateStats();
}

export function deactivate() {}
