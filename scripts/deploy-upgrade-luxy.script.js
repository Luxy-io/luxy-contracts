const { ethers, upgrades } = require('hardhat');
const dotenv = require('dotenv');
const { ERC20, ERC721, ERC1155} = require("../test/assets");
dotenv.config();
const main = async () => {
    // Config for platform
    // Get contract factory
    const TransferProxy = await ethers.getContractFactory('TransferProxyOperator');
    const ERC20TransferProxy = await ethers.getContractFactory('ERC20TransferProxyOperator');
    const contractAddress = "0x54aFAc0BF976958691cD948F19037A9F0dCAcE3f";
    const Luxy = await ethers.getContractAt("Luxy", contractAddress);


    const transferProxy = await upgrades.deployProxy(
        TransferProxy,
        [],
        { initializer: '__TransferProxy_init' }
    );
    erc20TransferProxy = await upgrades.deployProxy(
        ERC20TransferProxy,
        [],
        { initializer: '__ERC20TransferProxy_init' }
    );
    console.log('transferProxy', transferProxy.address);
    console.log('ERC20TransferProxy', erc20TransferProxy.address);
    await transferProxy.deployed();
    await erc20TransferProxy.deployed();
    await transferProxy.addOperator(contractAddress);
    await erc20TransferProxy.addOperator(contractAddress);
    // Log the address
    await Luxy.setTransferProxy(ERC721, transferProxy.address);
    await Luxy.setTransferProxy(ERC1155, transferProxy.address);
    await Luxy.setTransferProxy(ERC20,erc20TransferProxy.address);
    console.log('Done');
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });