#!/bin/bash
source ~/.nvm/nvm.sh
# Step 0: Set yarn and node version
cd uniswap-v3-deployment
nvm use 18
yarn set version 3.2.3

# Step 2: Deploy token contracts
npx hardhat run scripts/deploy.ts --network localhost

# Step 3: Delete state.json in deploy-v3, if it exists
rm -f ../deploy-v3/state.json

# Step 4: Deploy Uniswap v3 contracts
echo 'Switching repo to deploy-v3...';
cd ../deploy-v3
nvm use 16
yarn set version 1.22.19
yarn start -pk 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 -j http://127.0.0.1:8545/ -w9 0x5FbDB2315678afecb367f032d93F642f64180aa3 -ncl ETH -o 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Step 4: Deploy CREATE2
echo 'Deploying CREATE2...';
cd ../deterministic-deployment-proxy;
./scripts/test.sh;
sleep 10; # Wait for CREATE2 to be deployed

# Step 5: Deploy Universal Router contract
echo 'Deploying PERMIT2...';
cd ../universal-router/permit2
nvm use 16
yarn set version 1.22.19
forge script --broadcast \
--rpc-url http://127.0.0.1:8545/ \
--private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
script/DeployPermit2.s.sol:DeployPermit2

cd ..
echo 'Deploying Universal Router contract...';
forge script --broadcast \
--rpc-url http://127.0.0.1:8545/ \
--private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
--sig 'run()' \
script/deployParameters/DeployHardhat.s.sol:DeployHardhat