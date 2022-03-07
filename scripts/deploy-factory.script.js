const { ethers, upgrades } = require('hardhat');

const main = async () => {
    // Deploy token
    const LuxyFactory1155 = await ethers.getContractFactory(
        'ERC1155LuxyFactory',
    );

    const LuxyPrivateFactory1155 = await ethers.getContractFactory(
        'ERC1155LuxyPrivateFactory',
    );
    const LuxyFactory721 = await ethers.getContractFactory(
        'ERC721LuxyFactory',
    );
    const LuxyPrivateFactory721 = await ethers.getContractFactory(
        'ERC721LuxyPrivateFactory',
    );
    
    const _luxyFactory1155 = await LuxyFactory1155.deploy();
    console.log('LuxyFactory1155 deployed at', _luxyFactory1155.address);

    const _luxyPrivateFactory1155 = await LuxyPrivateFactory1155.deploy();
    console.log('LuxyPrivateFactory1155 deployed at', _luxyPrivateFactory1155.address);

    const _luxyFactory721 = await LuxyFactory721.deploy();
    console.log('LuxyFactory721 deployed at', _luxyFactory721.address);
    
    const _luxyPrivateFactory721 = await LuxyPrivateFactory721.deploy();
    console.log('LuxyPrivateFactory721 deployed at', _luxyPrivateFactory721.address);
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });