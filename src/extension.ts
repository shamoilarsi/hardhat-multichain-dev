// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import fs from "fs";

let terminals = [] as vscode.Terminal[];
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "hardhat-multichain-dev.init",
    async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;

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

      const hardhatConfigPath = `${workspaceFolderUri.fsPath}/hardhat.config.cts`;

      if (!fs.existsSync(hardhatConfigPath)) {
        vscode.window.showErrorMessage(
          "hardhat.config.cts file was not found in the workspace"
        );
        return;
      }

      let multichainConfig: {
        name: string;
        chainId: number;
        port: number;
        url?: string;
      }[];

      try {
        multichainConfig = JSON.parse(
          fs.readFileSync(chainsConfigExpectedPath, "utf8")
        );
      } catch (e: any) {
        if (e.message === "Unexpected end of JSON input") {
          vscode.window.showErrorMessage(
            "invalid JSON in multichain.config.json"
          );
        } else {
          vscode.window.showErrorMessage(
            "something went wrong while reading the multichain.config.json file"
          );
        }
        return;
      }

      for (const chain of multichainConfig) {
        const hardhatConfig = fs.readFileSync(hardhatConfigPath, "utf8");

        const newHardhatConfig = hardhatConfig.replace(
          /hardhat: {[\s\S]*?}/g,
          "hardhat: { chainId:\t" + chain.chainId + " }"
        );
        fs.writeFileSync(hardhatConfigPath, newHardhatConfig);

        const terminal = vscode.window.createTerminal(chain.name + " Chain");
        terminals.push(terminal);

        terminal.sendText(
          `npx hardhat node ${chain.url ? `--fork ${chain.url}` : ""} --port ${
            chain.port
          }`
        );

        await sleep(5000);
      }

      const hardhatConfig = fs.readFileSync(hardhatConfigPath, "utf8");
      let extendEnvironment = "extendEnvironment((hre) => {";
      for (const chain of multichainConfig) {
        extendEnvironment += `\nconst provider${chain.chainId} = new hre.ethers.providers.JsonRpcProvider("http://localhost:${chain.port}");`;
        extendEnvironment += `\nhre.${chain.name}Chain = provider${chain.chainId};\n`;
      }
      extendEnvironment += "});";

      let hardhatConfigWithExtendEnvironment;
      if (hardhatConfig.includes("extendEnvironment")) {
        hardhatConfigWithExtendEnvironment = hardhatConfig.replace(
          /extendEnvironment\([\s\S]*?}\);/g,
          extendEnvironment
        );
      } else {
        hardhatConfigWithExtendEnvironment = hardhatConfig.replace(
          /export default config;/g,
          extendEnvironment + "\n\nexport default config;\n"
        );
      }
      fs.writeFileSync(hardhatConfigPath, hardhatConfigWithExtendEnvironment);
      vscode.window.showInformationMessage("Multichain networks running...");
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {
  console.log("closing all hardhat instances");
  terminals.map((_t) => _t.dispose());
  terminals = [];
}

async function sleep(milliseconds: number) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}
