import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export async function readConfig(workspacePath: string): Promise<any> {
    const configPath = path.join(workspacePath, 'idBook.json');

    // Check if the file exists (you will implement this part)
    // ...
    try {
        await fs.promises.access(configPath);
    } catch {
        throw new Error('idBook.json file does not exist.');
    }


    try {
        // Read the file
        const fileContent = await fs.promises.readFile(configPath, 'utf-8');

        // Handle empty file
        if (!fileContent.trim()) {
            throw new Error('idBook.json is empty.');
        }

        // Parse the JSON
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('Error reading or parsing idBook.json:', error);
        return null; // Or return a default object if preferred
    }
}