// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "hardhat-multichain-dev" is now active!'
  );

  let disposable = vscode.commands.registerCommand(
    "hardhat-multichain-dev.init",
    () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      console.log(workspaceFolders);
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage(
          "open a workspace with hardhat config to continue."
        );
        return;
      }

      const workspaceFolderUri = workspaceFolders[0].uri;
      const chainsConfigExpectedPath = `${workspaceFolderUri.fsPath}/multichain.config.json`;

      if (!fs.existsSync(chainsConfigExpectedPath)) {
        vscode.window.showErrorMessage(
          "multichain.config.json file not found. create it in the root of the workspace and populate it with the chain configs"
        );
        return;
      }

      const hardhatConfigExpectedPath = `${workspaceFolderUri.fsPath}/hardhat.config.ts`;

      if (!fs.existsSync(hardhatConfigExpectedPath)) {
        vscode.window.showErrorMessage(
          "hardhat.config.ts file was not found in the workspace"
        );
        return;
      }

      let chainsConfigJSON;
      try {
        chainsConfigJSON = JSON.parse(
          fs.readFileSync(chainsConfigExpectedPath, "utf8")
        );
      } catch (e) {
        if (e.message === "Unexpected end of JSON input") {
          vscode.window.showErrorMessage(
            "invalid JSON in hardhat-chains.config.json"
          );
        } else {
          vscode.window.showErrorMessage(
            "something went wrong while reading the hardhat-chains.config.json file"
          );
        }
        return;
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
