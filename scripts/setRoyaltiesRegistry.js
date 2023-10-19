0x3ADde876af29e88363947298a98b1d2910634C65
const { ethers, upgrades } = require('hardhat');
const dotenv = require('dotenv');
dotenv.config();
const main = async () => {

    const registryAddress = "0x3ADde876af29e88363947298a98b1d2910634C65";
    const royaltiesRegistry = await ethers.getContractAt('RoyaltiesRegistry',registryAddress);
    const tokenAddress = "0x25C631eAAd701E07672cfB56A1a536fc1fd60f85";
    
    //await royaltiesRegistry.setRoyaltiesByToken(tokenAddress, [["0x624619c8397334CD2DAF159b78787a3b613357Ab", 600]]); //set royalties by token


    let part = await royaltiesRegistry.getRoyalties(tokenAddress, 1);
    let tx_receipt = await part.wait()
    // let = royaltiesResponse = tx_receipt.events[1].args.royalties    
    console.log(tx_receipt)
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });