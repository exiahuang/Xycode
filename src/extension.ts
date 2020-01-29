import * as vscode from 'vscode';
import path from 'path';
import { XycodeUI } from './XycodeUI';
import { Util } from './Util.js';
import { Config, TaskUtil } from './Config';
import { ConfigManager, ConfigDesc } from './ConfigManager';
import { ExtConst } from './ExtConst';
import { CommandRunner } from './CommandRunner';
import { CommandRunnerOptions } from './BaseCommandRunner';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const xycodeui = XycodeUI.instance;
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// The command has been defined in the package.json file

	context.subscriptions.push(vscode.commands.registerCommand(`${ExtConst.extName}.open`, async () => {
		const configData = Config.data;
		if(configData.tasks.length === 0){
			vscode.commands.executeCommand(`${ExtConst.extName}.config`);
			return;
		}
		const task = await vscode.window.showQuickPick(configData.tasks.filter(task => TaskUtil.isTaskActive(task)));
		if (!task) { return false; }
		const configVars = Util.getUserConfig(task.pConfigType.variables);
		const options :CommandRunnerOptions = {
			maxBuffer: Util.maxBuffer,
			encoding: task.encoding || Util.encoding,
			isWslMode: TaskUtil.isWslMode(task),
			isDockerMode: TaskUtil.isDockerMode(task),
			isBashMode: TaskUtil.isBashMode(task),
			shellPath: TaskUtil.getShellPath(task)
		};
		if(task.notShowProcess){
			new CommandRunner(options).run(task, configVars, Util.file, Util.workspaceFolder);
		} else {
			vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Window,
					title: `${ExtConst.extName} running ${task.label}`
				},
				async progress => {
					  // Progress is shown while this function runs.
					  // It can also return a promise which is then awaited
					await new CommandRunner(options).run(task, configVars, Util.file, Util.workspaceFolder);
				}
			);
		}
	}));

	if(ExtConst.isRegistOpenConfigCommand){
		context.subscriptions.push(vscode.commands.registerCommand(`${ExtConst.extName}.openconfig`, () => {
			vscode.commands.executeCommand('vscode.openFolder', 
				Util.getUri(Util.configdir), true
			);
		}));
	}

	if(ExtConst.isRegistConfigCommand){
		context.subscriptions.push(vscode.commands.registerCommand(`${ExtConst.extName}.config`, async () => {
		try {
			const cm = new ConfigManager();
			const configList = await cm.getConfigList();
			if(configList === undefined){
					xycodeui.showErrorMessage(`${ExtConst.extName} get config error`);
				return;
			}
			const selectList: Array<ConfigDesc> | undefined = await vscode.window.showQuickPick(configList, {
				canPickMany: true,
					placeHolder: "Please Download Config For ${ExtConst.extName}"
			});
			if(selectList){
				selectList.forEach(async (desc) => {
					try {
						await cm.download(desc);
						xycodeui.channelShow(`${desc.name} download ok!`);
					} catch (error) {
						xycodeui.showErrorMessage(`${ExtConst.extName} download config exception ${error}`);
					}
				});
					xycodeui.showInformationMessage(`${ExtConst.extName} Config Download done! Enjoy yourself!`);
			}
		} catch (error) {
			xycodeui.showErrorMessage(`${ExtConst.extName} ${error}`);
		}
	}));
	}

	vscode.workspace.onDidSaveTextDocument(async (doc) =>{
		const configData = Config.data;
		const fileType = path.extname(doc.fileName);
		const tasks = configData.onSaveEvents?.filter(task => TaskUtil.isTaskActive(task, fileType));
		await tasks?.forEach(async (task) => {
			const options :CommandRunnerOptions = {
				maxBuffer: Util.maxBuffer,
				encoding: task.encoding || Util.encoding,
				isWslMode: TaskUtil.isWslMode(task),
				isDockerMode: TaskUtil.isDockerMode(task),
				isBashMode: TaskUtil.isBashMode(task),
				shellPath: TaskUtil.getShellPath(task)
			};
			if(task.notShowProcess){
				new CommandRunner(options).run(task, Util.getUserConfig(task.pConfigType.variables), doc.fileName, Util.workspaceFolder);
			} else {
				vscode.window.withProgress(
					{
						location: vscode.ProgressLocation.Window,
						title: `${ExtConst.extName} running ${task.label}`
					},
					async progress => {
						  // Progress is shown while this function runs.
						  // It can also return a promise which is then awaited
						await new CommandRunner(options).run(task, Util.getUserConfig(task.pConfigType.variables), doc.fileName, Util.workspaceFolder);
					}
				);
			}
		});
	});

	if(ExtConst.isShowMessage){
		xycodeui.channelShow(ExtConst.message);
	}
}

// this method is called when your extension is deactivated
export function deactivate() {}

