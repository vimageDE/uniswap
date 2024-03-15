#!/bin/bash
source ~/.nvm/nvm.sh
# Step 1: install and build sdk-core
cd sdk-core
nvm use 16
yarn set version 1.22.19

npm install
npm run build
echo '---installed and build sdk-core---'

sleep 4

# Step 2: install and build smart-order-router
nvm use 18.12.1

cd ../smart-order-router
npm install
npm run build
echo '---installed and build smart-order-router---'

sleep 4

# Step 3: install and build universal-router-sdk
nvm use 16
yarn set version 1.22.19

cd ../universal-router-sdk
yarn install
yarn build
echo '---installed and build universal-router-sdk---'

sleep 4

# Step 4: install dependencies in uniswap interface
cd ../interface
nvm use 18.12.1
yarn set version 3.2.3

rm -rf node_modules
cd apps/web
rm -rf node_modules
cd ../..

yarn cache clean
yarn install
echo '---installed interface---'
yarn g:build
echo '---build interface---'

