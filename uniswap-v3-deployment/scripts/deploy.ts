require('dotenv').config();
import { ethers, network, upgrades } from 'hardhat';
import { MockERC20, MockWETH9 } from '../typechain-types';

let num: number;

if (network.config.chainId != 31337) {
  throw new Error('Unsupported network');
}

async function main(): Promise<void> {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contract with account:', deployer.address);
  const mockWeth9_factory = await ethers.getContractFactory('MockWETH9', deployer);
  console.log('Deploying WETH9...');
  console.log('Network: ', (await ethers.provider.getNetwork()).chainId);
  const mockWeth9 = (await mockWeth9_factory.deploy()) as unknown as MockWETH9;
  console.log('Deployed WETH9');
  await mockWeth9.deployed();
  console.log('Waited for deployed');
  await mockWeth9.deployTransaction.wait(1);
  console.log('waited for transaction');
  console.log('Current total supply: ', await mockWeth9.totalSupply());
  const tx = await mockWeth9.deposit({ value: ethers.utils.parseEther('1') });
  await tx.wait(1);
  console.log('New total supply: ', await mockWeth9.totalSupply());
  console.log('MockWETH9 address:', mockWeth9.address);
  const mockUsdc_factory = await ethers.getContractFactory('MockERC20', deployer);
  const mockUsdc = (await mockUsdc_factory.deploy(
    'USD Coin',
    'USDC',
    6,
    ethers.utils.parseUnits('10000', 6)
  )) as MockERC20;
  await mockUsdc.deployed();
  await mockUsdc.deployTransaction.wait();
  const balance = await mockUsdc.balanceOf(deployer.address);
  console.log('USDC balance: ', balance);
  console.log('MockUSDC address:', mockUsdc.address);
  console.log('Minted USDC to:', await deployer.getAddress());
  const mockBtc_factory = await ethers.getContractFactory('MockERC20', deployer);
  const mockBtc = await mockBtc_factory.deploy('Wrapped BTC', 'WBTC', 8, ethers.utils.parseUnits('10000', 8));
  console.log('MockBTC address:', mockBtc.address);
  // const mockEth_factory = await ethers.getContractFactory('MockERC20', deployer);
  // const mockEth = await mockEth_factory.deploy('Ethereum', 'ETH');
  // console.log('MockETH address:', mockEth.address);
  const mockLink_factory = await ethers.getContractFactory('MockERC20', deployer);
  const mockLink = await mockLink_factory.deploy('ChainLink Token', 'LINK', 18, ethers.utils.parseUnits('10000', 18));
  console.log('MockLINK address:', mockLink.address);
  const deployerNonceAfter = await ethers.provider.getTransactionCount(deployer.address);
  console.log('Deployer nonce:', deployerNonceAfter);
  console.log('Finished deploying mocks!');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
