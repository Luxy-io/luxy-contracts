
const {  upgrades } = require('hardhat');

const main = async () => {
    // Config for platform
    // Get contract factory
    const response = await upgrades.erc1967.getImplementationAddress('0x688a87fc248A25822cA41f24cfCc414515839d87')
    console.log('Look response', response);
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
