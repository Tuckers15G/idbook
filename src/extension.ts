// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { readConfig } from './utils/readConfigs';
import { ensureGitIgnoreIncludesConfig } from './utils/gitIgnore';

let configWatcher: fs.FSWatcher | null = null;
// Extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


	// This line of code will only be executed once when extension is activated
	console.log('Congratulations, your extension "idbook" is now active!');

	
	const disposable = vscode.commands.registerCommand('idbook.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from idbook!');
	});

	context.subscriptions.push(disposable);

	// Command to create or locate idBook.json
	const createOrLocateConfigCommand = vscode.commands.registerCommand('idbook.createOrLocateConfig', async () => {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) {
			vscode.window.showErrorMessage('No workspace folder is open. Please open a workspace folder to use this extension.');
			return;
		}

		const workspacePath = workspaceFolders[0].uri.fsPath;
		const configPath = path.join(workspacePath, 'idBook.json');
		const gitIgnorePath = path.join(workspacePath, '.gitignore');

		if (!fs.existsSync(configPath)) {
			const defaultConfig = JSON.stringify({
				exampleKey: "exampleValue"
			}, null, 4);

			fs.writeFileSync(configPath, defaultConfig);
			vscode.window.showInformationMessage('idBook.json file created successfully!');
		} else {
			vscode.window.showInformationMessage('idBook.json file already exists.');
		}

		ensureGitIgnoreIncludesConfig(workspacePath);

		const document = await vscode.workspace.openTextDocument(configPath);
		await vscode.window.showTextDocument(document);
	});

	context.subscriptions.push(createOrLocateConfigCommand);

	const insertReferenceCommand = vscode.commands.registerCommand('idbook.insertReference', async () => {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) {
			vscode.window.showErrorMessage('No workspace folder is open. Please open a workspace folder to use this extension.');
			return;
		}

		const workspacePath = workspaceFolders[0].uri.fsPath;

		try {
			// Read the idBook.json file
			const config = await readConfig(workspacePath);
			if (!config) {
				vscode.window.showErrorMessage('Failed to load idBook.json. Please ensure it exists and is valid.');
				return;
			}

			// Get the keys from the config object
			const keys = Object.keys(config);
			if (keys.length === 0) {
				vscode.window.showErrorMessage('idBook.json is empty. Please add some keys to use this feature.');
				return;
			}

			const values = Object.values(config);
			if (values.length === 0) {
				vscode.window.showErrorMessage('idBook.json has no values. Please add some key-value pairs to use this feature.');
				return;
			}

			// Show a Quick Pick menu to select a key
			const selectedKey = await vscode.window.showQuickPick(keys, {
				placeHolder: 'Select a key to reference',
			});

			if (!selectedKey) {
				// User canceled the Quick Pick menu
				return;
			}

			//Gettting value from key
			const valueToInsert = config[selectedKey]

			// Get the active text editor
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showErrorMessage('No active editor found. Please open a file to insert the reference.');
				return;
			}

			// Insert the selected key or its value into the editor
			editor.edit((editBuilder) => {
				const position = editor.selection.active; // Current cursor position
				editBuilder.insert(position, valueToInsert);
			});

			vscode.window.showInformationMessage(`Inserted "${selectedKey}": ${valueToInsert}`);
		} catch (error) {
			vscode.window.showErrorMessage('An error occurred while inserting the reference.');
			console.error(error);
		}
	});

	context.subscriptions.push(insertReferenceCommand);



	if (vscode.workspace.workspaceFolders) {
		const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
		const configPath = path.join(workspacePath, 'idBook.json');

		// Watch for changes in idBook.json
		configWatcher = fs.watch(configPath, (eventType) => {
			if (eventType === 'change') {
				vscode.window.showInformationMessage('idBook.json has been updated.');
				// re-read the file here
				readConfig(workspacePath).then((config) => {
					console.log('Updated config:', config);
				}).catch((error) => {
					console.error('Error re-reading idBook.json:', error);
				});
			}
		});

		vscode.window.showInformationMessage('Watching for changes in idBook.json.');
	}
}

// Clean up the watcher when the extension is deactivated
export function deactivate() {
		if (configWatcher) {
			configWatcher.close();
			configWatcher = null;
		}
}
