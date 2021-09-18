const order = require("../order");
const { expect } = require('chai');
const sign = order.sign;
const domainSeparator = order.domainSeparator
const { BN, constants, expectRevert } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;
const name = "Exchange"
const version = "1"
describe ('OrderValidator', function(){ 
    beforeEach(async () => {
        accounts = await ethers.provider.listAccounts();
        const OrderValidatorTest = await ethers.getContractFactory('OrderValidatorTest');
        orderValidator = await upgrades.deployProxy(
            OrderValidatorTest,
            [name, version],
            { initializer: '__OrderValidatorTest_init' }
        );
        await orderValidator.deployed();
    });

    context('Validating Signatures', function(){ 

        it("should validate domain separator", async() =>{
            expect(
                await orderValidator.domainSeparator(),
              ).to.equal(
                await domainSeparator(name,version,orderValidator.address),
              );
        })
        it("should validate if signer is correct", async () => {
            const testOrder = order.Order(accounts[1], order.Asset("0xffffffff", "0x", 100), ZERO_ADDRESS, order.Asset("0xffffffff", "0x", 200), 1, 0, 0, "0xffffffff", "0x");
            const signature = await getSignature(testOrder, accounts[1]);
            await orderValidator.validateOrderTest(testOrder, signature);
        });
    
        it("should fail validate if signer is incorrect", async () => {
            const testOrder = order.Order(accounts[1], order.Asset("0xffffffff", "0x", 100), ZERO_ADDRESS, order.Asset("0xffffffff", "0x", 200), 1, 0, 0, "0xffffffff", "0x");
            const signature = await getSignature(testOrder, accounts[2]);
            await expectRevert(
                orderValidator.validateOrderTest(testOrder, signature),
                "order signature verification error"
            );
        });
    
        it("should bypass signature if maker is msg.sender", async () => {
            const testOrder = order.Order(accounts[5], order.Asset("0xffffffff", "0x", 100), ZERO_ADDRESS, order.Asset("0xffffffff", "0x", 200), 1, 0, 0, "0xffffffff", "0x");
            await orderValidator.connect(accounts[5]).validateOrderTest(testOrder, "0x");
        });
    
        async function getSignature(order, signer) {
            return sign(name,version,order, signer, orderValidator.address);
        }

    });


});
