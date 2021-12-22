const { ethers, upgrades } = require('hardhat');

const main = async () => {
    // Config for platform
    // Get contract factory
   const ERC1155Luxy = await ethers.getContractFactory('ERC1155Luxy');
    const _luxy1155 = await upgrades.deployProxy(
        ERC1155Luxy,
        ["ERC1155Luxy", "LUXY", ""],
        { initializer: '__ERC1155Luxy_init' }
    );
    await _luxy1155.deployed();
    ERC1155LuxyBeacon = await ethers.getContractFactory('ERC1155LuxyBeacon');
    const _luxyBeacon  = await ERC1155LuxyBeacon.deploy(_luxy1155.address);
    await _luxyBeacon.deployed();
    console.log('_luxyBeacon deployed at', _luxyBeacon.address);
    // Deploy token
    const LuxyFactory = await ethers.getContractFactory(
        'ERC1155LuxyFactory',
    );
    const _luxyFactory = await LuxyFactory.deploy(_luxyBeacon.address);
    console.log('LuxyFactory deployed at', _luxyFactory.address);
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });