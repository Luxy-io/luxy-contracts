
const { ethers, upgrades } = require('hardhat');

const main = async () => {
    // Config for platform
    // Get contract factory
    const LUXYVOUCHER2 = await ethers.getContractFactory('ERC721Voucher');

    const ERC721LuxyDrop = await ethers.getContractFactory('ERC721LuxyVoucher');
    // Deploy contract proxy
    // const ProxyLuxy721DropFactory = await ERC721LuxyDrop.deployProxy(
    //     ERC721LuxyDrop,
    //     ["", "0x6ae23169D0809c5727f7bB1bF59335DbF9748fdd", "0xe3A66dc52Af65E9333c608A85bB5F3042B1e41Ef"],
    //     { initializer: '__ERC721LuxyDrop_init' }
    // );

    console.log('Deploying LUXYVOUCHER2 contract');
    const erc721voucher = await LUXYVOUCHER2.deploy()
    await erc721voucher.deployed()
    console.log('LUXYVOUCHER2 deployed at', erc721voucher.address);

    console.log('Deploying LUXY2 contract');
    const erc721Luxyvoucher = await ERC721LuxyDrop.deploy(erc721voucher.address, '0xd70c573b0f39a26c36e46f28d0dd02f3d0463f93', [1, 3, 4, 6, 9, 11, 14, 18, 20, 23, 26, 33, 35, 45], '0x6ae23169D0809c5727f7bB1bF59335DbF9748fdd')
    await erc721Luxyvoucher.deployed()
    // await erc721Luxyvoucher.setBaseURI('https://gateway.pinata.cloud/ipfs/QmZT4bGXQ6LAeRPitbaAmkeeov1Wo6UC6mLwC4o2RVB6Q9/')
    // await erc721Luxyvoucher.addToWhitelist(['0x85aaa5196D86D01ee09237bB0d81B4c07FF57363', '0xDa93AfFDC085ea77e7941B64fA16526eD171E6B8'])
    // await erc721voucher.setParent(erc721Luxyvoucher.address);
    console.log('LUXY2 deployed at', erc721Luxyvoucher.address);
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
