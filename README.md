# Decentralized Banking dApp

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Required
Node version: 14.19.3\
NPM version: 6.14.17

## Steps to run

### 1. Download and Setup [Ganache](https://trufflesuite.com/ganache/)

Ganache helps you run development Ethereum blockchains with multiple wallets containing fake Ether.

Start a new Ethereum chain on Ganache with:

`hostname: 127.0.0.1` \
`port number: 8545` \
`network ID: 1337`

### 2. Installing packages

Open the project directory and run `npm install` which will install the packages listed in `package.json`

### 3. Compiling Smart contracts

[truffle](https://trufflesuite.com/truffle/) development environment is installed in the previous step.\
The smart contracts present in `src/contracts` directory can be compiled using the `truffle compile` command.\
After compilation, the [abis](https://www.quicknode.com/guides/solidity/what-is-an-abi) are stored in the `src/abis` directory.

### 4. Deploying Contracts
Once the contracts are compiled, use the `truffle migrate` command to deploy the contracts to the Ethereum test chain earlier created on Ganache.

### 5. Testing contracts
Tests for the smart contracts are present in the `test` directory.\
Run the `truffle test` command to run these tests on the deployed smart contracts and view the results.\
These tests only check the basic functionality and sanity of the contracts.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
