const { ethers, upgrades } = require('hardhat');
const dotenv = require('dotenv');
dotenv.config();
const main = async () => {
    // Config for platform
    // Get contract factory
    const TransferProxy = await ethers.getContractFactory('TransferProxy');
    const RoyaltiesRegistry = await ethers.getContractFactory('RoyaltiesRegistry');
    const ERC20TransferProxy = await ethers.getContractFactory('ERC20TransferProxy');
    const Luxy = await ethers.getContractFactory('Luxy');
    royaltiesRegistry = await upgrades.deployProxy(
        RoyaltiesRegistry,
        [],
        { initializer: '__RoyaltiesRegistry_init' }
    );
    transferProxy = await TransferProxy.deploy();
    erc20TransferProxy = await ERC20TransferProxy.deploy();
    console.log('transferProxy', transferProxy.address);
    console.log('ERC20TransferProxy', erc20TransferProxy.address);
    console.log('RoyaltiesRegistry', royaltiesRegistry.address);
    
    const ProxyLuxyFactory = await upgrades.deployProxy(
        Luxy,
        [transferProxy.address, erc20TransferProxy.address, 200, process.env.LUXY_MARKETPLACE_FEE_ADDRESS, 
            royaltiesRegistry.address, process.env.LUXY_MARKETPLACE_FEE_ADDRESS,process.env.LUXY_BURNING_ADDRESS,
            process.env.LUXY_TOKEN,10],
        { initializer: '__LuxyCore_init' }
    );
    console.log('Deploying contract');
    // Wait for campaign factory deploy success
    await ProxyLuxyFactory.deployed();
    await ProxyLuxyFactory.setBurnMode(true);
    await ProxyLuxyFactory.setTierToken(process.env.LUXY_TOKEN);
    await ProxyLuxyFactory.setTiers([['10000000000000000000000', 175], ['25000000000000000000000', 150], ['50000000000000000000000', 125], ['125000000000000000000000', 75], ['250000000000000000000000', 25]]);
    // Log the address
    console.log('ProxyLuxyFactory deployed at', ProxyLuxyFactory.address);
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });