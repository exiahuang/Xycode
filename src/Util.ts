import * as vscode from 'vscode';
import path from 'path';
import os from 'os';

export class Util {
	static getFilePath(filepath: string): string {
		if (path.isAbsolute(filepath)) {
			return path.resolve(filepath);
		}
		else {
			return path.resolve(path.join(Util.workspaceFolder, filepath));
		}
	}
	static getUri(filepath: string): vscode.Uri {
		return vscode.Uri.file(Util.getFilePath(filepath));
    }
	static replaceAll(target: string, search: string, replacement: string): string {
		return target.replace(new RegExp(search, 'g'), replacement);
    }
    static get homedir(): string {
        return os.homedir();
    }
    static get file(): string {
        return vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.fileName : "";
    }
    static get workspaceFolder(): string {
        return vscode.workspace && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 ? vscode.workspace.workspaceFolders[0].uri.fsPath : "";
    }
    static get selectedText(): string {
		var editor = vscode.window.activeTextEditor;
		if (!editor) {
			return "";
		}
		var selection = editor.selection;
		var text = editor.document.getText(selection);
        return text;
    }
    static get configdir(): string {
		return path.join(os.homedir(), '.xycode');
    }
    static get backupdir(): string {
		const date = new Date();
		const timeStr = [date.getFullYear(), date.getMonth(), date.getDate(),date.getHours(), date.getMinutes(), date.getSeconds()].join("");
		const backupdir = path.join(Util.configdir, `backup_${timeStr}`);
		return backupdir;
    }
    static get tmpdir(): string {
		return os.tmpdir();
	}
    static get moduledir(): string {
		// return vscode.extensions.getExtension("exiahuang.Xycode")?.extensionPath || "";
		return __dirname;
	}
}
