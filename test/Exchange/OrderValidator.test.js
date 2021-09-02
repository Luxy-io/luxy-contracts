const order = require("../order");
const { expect } = require('chai');
const sign = order.sign;
const { BN, constants, expectRevert } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

describe ('OrderValidator', function(){ 
    beforeEach(async () => {
        accounts = await ethers.provider.listAccounts();
        const OrderValidatorTest = await ethers.getContractFactory('OrderValidatorTest');
        lib = await OrderValidatorTest.deploy();
    });

    context('Validating Signatures', function(){ 
        it("should validate if signer is correct", async () => {
            const testOrder = order.Order(accounts[1], order.Asset("0xffffffff", "0x", 100), ZERO_ADDRESS, order.Asset("0xffffffff", "0x", 200), 1, 0, 0, "0xffffffff", "0x");
            console.log(testOrder)
            const signature = await getSignature(testOrder, accounts[1]);
            console.log(signature)
            await lib.validateOrderTest(testOrder, signature);
        });
    
        // it("should fail validate if signer is incorrect", async () => {
        //     const testOrder = order.Order(accounts[1], order.Asset("0xffffffff", "0x", 100), ZERO_ADDRESS, order.Asset("0xffffffff", "0x", 200), 1, 0, 0, "0xffffffff", "0x");
        //     const signature = await getSignature(testOrder, accounts[2]);
        //     await expectRevert(
        //         lib.validateOrderTest(testOrder, signature),
        //         "order signature verification error"
        //     );
        // });
    
        // it("should bypass signature if maker is msg.sender", async () => {
        //     const testOrder = order.Order(accounts[5], order.Asset("0xffffffff", "0x", 100), ZERO_ADDRESS, order.Asset("0xffffffff", "0x", 200), 1, 0, 0, "0xffffffff", "0x");
        //     await lib.validateOrderTest(testOrder, "0x", { from: accounts[5] });
        // });
    
        async function getSignature(order, signer) {
            return sign(order, signer, lib.address);
        }

    });


});
