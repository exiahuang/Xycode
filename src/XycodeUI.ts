import * as vscode from 'vscode';
import { window } from 'vscode';
import { ExtConst } from './ExtConst';

export class XycodeUI {
    private static _instance:XycodeUI;
    private xycodeChannel = window.createOutputChannel(ExtConst.extName);

    private constructor() {
    }
    public static get instance():XycodeUI {
        if (!this._instance) {
          this._instance = new XycodeUI();
          this._instance.init();
        }
        return this._instance;
    }

	private init() {
        if(ExtConst.showStatusbar){
            this._init_statusbar();
        }
	}
	private _init_statusbar() {
		let xycodeButton = window.createStatusBarItem(vscode.StatusBarAlignment.Left, 4.5);
		xycodeButton.command = `${ExtConst.extName}.open`;
		xycodeButton.text = `${ExtConst.statusbarIcon} ${ExtConst.extName}`;
		xycodeButton.tooltip = `open ${ExtConst.extName}`;
		xycodeButton.show();
    }

    public getWriteEmitter() : vscode.EventEmitter<string>{
        const writeEmitter = new vscode.EventEmitter<string>();
        const pty = {
            onDidWrite: writeEmitter.event,
            open: () => writeEmitter.fire('Type and press enter to echo the text\r\n\r\n'),
            close: () => {},
            handleInput: (data: string) => {
            }
        };
        const terminal = (<any>vscode.window).createTerminal({ name: `xycode`, pty });
        terminal.show();
        return writeEmitter;
    }

    public getTerminal(name?: string, shellPath?: string, shellArgs?: string[] | string): vscode.Terminal{
        const terminal = (<any>vscode.window).createTerminal({ name: name, shellPath: shellPath, shellArgs:shellArgs });
        terminal.show();
        return terminal;
    }

    public channelShow(msg: any, showTimeStamp = true) {
        if(!msg){
            return;
        }
        if(showTimeStamp) {
            this.xycodeChannel.append("[" + new Date().toLocaleString() + "] ");
        }
        this.xycodeChannel.appendLine(msg.toString());
    }

    public openChannel() {
        this.xycodeChannel.show();
    }

    public async openChannelSync() {
        await this.xycodeChannel.show();
    }

    public console(msg: any) {
        // this.writeEmitter.fire(msg.toString());
    }
    
    public showInformationMessage(msg: any) {
        if(!msg){
            return;
        }
        window.showInformationMessage(msg.toString());
    }
    
    public showErrorMessage(msg: any) {
        if(!msg){
            return;
        }
        window.showErrorMessage(msg.toString());
    }
    
    /**
     * Shows a pick list using window.showQuickPick().
     */
	public async showQuickPick(msg: string, configVar: any) {
		const result = await window.showQuickPick(configVar["value"], {
			placeHolder: configVar["label"].toString()
		});
		// window.showInformationMessage(`Got: ${result}`);
		return result;
    }

    /**
     * Shows a pick list using window.showQuickPick().
     */
	public async showQuickMultiPick(msg: string, configVar: any) {
		const result = await window.showQuickPick(configVar["value"], {
            canPickMany: true,
			placeHolder: configVar["label"].toString()
		});
		// window.showInformationMessage(`Got: ${result}`);
		return result ? result.join(configVar["separator"] || " ") : undefined;
    }
    
    /**
     * Shows an input box using window.showInputBox().
     */
	public async showInputBox(msg: string, configVar: any) {
		const result = await window.showInputBox(
            {
			value: configVar && configVar.hasOwnProperty("value") ? configVar["value"].toString() : "",
			placeHolder: configVar && configVar.hasOwnProperty("label") ? configVar["label"].toString() : `Please input ${msg} `
		    });
		return result;
    }

    public async openFolderDialog(configVar: any) {
        let label = configVar && configVar.hasOwnProperty("label") ? configVar["label"].toString() : "select folder";
        const options: vscode.OpenDialogOptions = {
            canSelectFolders: true,
            canSelectFiles: false,
            openLabel: label
       };
       const fileUri = await window.showOpenDialog(options);
       return fileUri && fileUri[0] ? fileUri[0].fsPath : null;
    }
    
    public async openFileDialog(configVar: any) {
        let label = configVar && configVar.hasOwnProperty("label") ? configVar["label"].toString() : "select file";
        let filters = configVar && configVar.hasOwnProperty("filters") ? configVar["filters"] : { 'All files': ['*'] };
        const options: vscode.OpenDialogOptions = {
            canSelectMany: false,
            canSelectFolders: false,
            canSelectFiles: true,
            openLabel: label,
            filters: filters
       };
       const fileUri = await window.showOpenDialog(options);
       return fileUri && fileUri[0] ? fileUri[0].fsPath : null;
    }

    public async openFilesDialog(configVar: any) {
        let label = configVar && configVar.hasOwnProperty("label") ? configVar["label"].toString() : "select files";
        let separator = configVar && configVar.hasOwnProperty("separator") ? configVar["separator"] : " ";
        let filters = configVar && configVar.hasOwnProperty("filters") ? configVar["filters"] : { 'All files': ['*'] };
        const options: vscode.OpenDialogOptions = {
            canSelectMany: true,
            canSelectFiles: true,
            canSelectFolders: false,
            openLabel: label,
            filters: filters
       };
       const fileUri = await window.showOpenDialog(options);
       return fileUri ? fileUri.map(uri => "\"" + uri.fsPath + "\"").join(separator) : undefined;
    }

    public switchFolder(folder: string) {
        let uri = vscode.Uri.file(folder);
		vscode.commands.executeCommand('vscode.openFolder', uri);
    }
    
}

