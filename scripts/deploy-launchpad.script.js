const { ethers, upgrades } = require('hardhat');

const main = async () => {

    // const artist_ = "0x39599fee90874b03b8768D325b3c42d7b91549f7";
    // const luxyLaunchpadFeeManagerProxy_ = "0xe53a6a915bf51ef0b90411736fc93c3d79eac47b";
    // const fee = "200";
    // const team = "0x39599fee90874b03b8768D325b3c42d7b91549f7";
    // const luxyDropContract = await ethers.getContractFactory('ERC721LuxyDrop');
    // const LuxyFeeManager = await ethers.getContractFactory('LuxyLaunchpadFeeManager');

    // const luxyFeeManager = await upgrades.deployProxy(
    //     LuxyFeeManager,
    //     [fee, team],
    //     { initializer: '__LuxyLaunchpadFeeManager_init' }
    // );
    // console.log('luxyFeeManager: ', luxyFeeManager.address);

    // const luxyDrop = await upgrades.deployProxy(
    //     luxyDropContract,
    //     ["", artist_, luxyFeeManager.address],
    //     { initializer: '__ERC721LuxyDrop_init' }
    // );
    // console.log('luxyDrop: ', luxyDrop.address);

    const LuxyFeeManager = await ethers.getContractFactory('LuxyLaunchpadFeeManager');
    luxyFeeManager = LuxyFeeManager.attach("0xdb85388849DB4AE98Eb21d68FbA298eCB5ea29e3");
    await hre.tenderly.persistArtifacts({
        name: "LuxyLaunchpadFeeManager",
        address: luxyFeeManager.address,
    })

};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });