
const { ethers } = require('hardhat');

const address = "";
const metadata = { "name": "Claudio" };
const royalties = [{ account: address, value: 10 }];

const main = async () => {
    const ERC721Luxy = await ethers.getContractFactory("LPBankFactory");
    const Luxy = await ERC721Luxy.attach(contractFactoryAddress);
    const txid = await Luxy.mint(
        address, metadata, royalties
    );
    console.log("Txid: ", txid);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });