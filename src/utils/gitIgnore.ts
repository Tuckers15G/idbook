import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

/**
 * Ensure gitignore is present and includes idBook.json
 * @param workspacePath The path to the workspace
 */
export function ensureGitIgnoreIncludesConfig(workspacePath: string): void {
    const gitIgnorePath = path.join(workspacePath, '.gitignore');
    let gitIgnoreContent = '';

    //check gitignore exists
    if (fs.existsSync(gitIgnorePath)){
        gitIgnoreContent = fs.readFileSync(gitIgnorePath, 'utf-8');
    }

    //check if idBook.json is ignored, if not add it to gitignore
    if (!gitIgnoreContent.includes('idBook.json')) {
        gitIgnoreContent += '\n# Ignore idBook.json\nidBook.json\n';
        fs.writeFileSync(gitIgnorePath, gitIgnoreContent.trim());
        vscode.window.showInformationMessage('Added idBook.json to .gitignore.');
    }
}