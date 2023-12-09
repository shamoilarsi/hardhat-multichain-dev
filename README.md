# Multichain Hardhat Development

## Table of Contents

- [Introduction](#introduction)
- [Usage](#usage)
- [Future](#future)

## Introduction

Multichain Hardhat Development is a vscode extension that simplifies the process of setting up a local multichain environment for your EVM development needs. You can easily create and manage forked blockchain networks within your Hardhat projects, allowing you to test and debug your smart contracts and decentralized applications easily.

## Usage

### Setup in Project

0. Make sure you have your hardhat config file in root of the project.
1. Create a file `multichain.config.json` in root directory.
2. Here's the schema for the file

   ```JSON
   [
       {
           "name": "Goerli",
           "chainId": 5,
           "port": 1000, // port should be empty
           "url": "https://rpc.url.com/yoururl", // RPC URL to interact with the chain
       }, {
           "name": "Hardhat",
           "chainId": 17080,
           "port": 1001
       }
   ]
   ```

3. Press `Cmd + Shift + P`, and search and hit "**hardhat multichain: init network chains**".
4. Wait for the notification in the right bottom corner of your screen saying "**Multichain networks running...**".

## Future

- Add support for all hardhat config extensions.
- Find a better way to parse and modify the hardhat config file.
- Better error handling.
