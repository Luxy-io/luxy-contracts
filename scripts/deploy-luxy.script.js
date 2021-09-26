const { ethers, upgrades } = require('hardhat');

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
    // Deploy contract proxy
    const ProxyLuxyFactory = await upgrades.deployProxy(
        Luxy, 
        [transferProxy.address, erc20TransferProxy.address, 200, '0x39599fee90874b03b8768D325b3c42d7b91549f7', royaltiesRegistry.address],
        { initializer: '__LuxyCore_init' }
    );
    console.log('Deploying contract');
    // Wait for campaign factory deploy success
    await ProxyLuxyFactory.deployed();
    // Log the address
    console.log('ProxyLuxyFactory deployed at', ProxyLuxyFactory.address);
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });