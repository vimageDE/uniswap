#!/bin/bash
source ~/.nvm/nvm.sh
# Step 1: build sdk-core
cd sdk-core
nvm use 16
yarn set version 1.22.19

yarn build
echo 'Built sdk-core'

# Step 2: install dependencies in uniswap interface
cd ../interface
nvm use 18.12.1
yarn set version 3.2.3

yarn install
echo 'Installed dependencies in interface'

