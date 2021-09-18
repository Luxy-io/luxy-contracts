const { expect } = require('chai');
const { ethers } = require('hardhat');
const keccak256 = require('keccak256');
const { constants, expectRevert } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;
const order = require("../order");

describe ('LibOrder', function(){
    beforeEach(async () => {
        accounts = await ethers.provider.listAccounts();
        const LibOrderTest = await ethers.getContractFactory('LibOrderTest');
        lib = await LibOrderTest.deploy();
    });
    context('with math operations', function(){
        it("should calculate remaining amounts if fill=0", async () => {
            const make = order.Asset("0x00000000", "0x", 100);
            const take = order.Asset("0x00000000", "0x", 200);
            const result = await lib.calculateRemaining(order.Order(ZERO_ADDRESS, make, ZERO_ADDRESS, take, 1, 0, 0, "0xffffffff", "0x"), 0);
            expect(result[0]).to.be.equal(100)
            expect(result[1]).to.be.equal(200)
        });
    
        it("should calculate remaining amounts if fill is specified", async () => {
            const make = order.Asset("0x00000000", "0x", 100);
            const take = order.Asset("0x00000000", "0x", 200);
            const result = await lib.calculateRemaining(order.Order(ZERO_ADDRESS, make, ZERO_ADDRESS, take, 1, 0, 0, "0xffffffff", "0x"), 20);
            expect(result[0]).to.be.equal(90)
            expect(result[1]).to.be.equal(180)
        });
    
        it("should return 0s if filled fully", async () => {
            const make = order.Asset("0x00000000", "0x", 100);
            const take = order.Asset("0x00000000", "0x", 200);
            const result = await lib.calculateRemaining(order.Order(ZERO_ADDRESS, make, ZERO_ADDRESS, take, 1, 0, 0, "0xffffffff", "0x"), 200);
            expect(result[0]).to.be.equal(0)
            expect(result[1]).to.be.equal(0)
        });
    
        it("should throw if fill is more than in the order", async () => {
            const make = order.Asset("0x00000000", "0x", 100);
            const take = order.Asset("0x00000000", "0x", 200);
            await expectRevert.unspecified(
                lib.calculateRemaining(order.Order(ZERO_ADDRESS, make, ZERO_ADDRESS, take, 1, 0, 0, "0xffffffff", "0x"), 220)
            );
        });

    });
    context('with order validation', function(){
        describe("validate", () => {
            const testAsset = order.Asset("0x00000000", "0x", 100);
    
            it("should not throw if dates not set", async () => {
                await lib.validate(order.Order(ZERO_ADDRESS, testAsset, ZERO_ADDRESS, testAsset, 0, 0, 0, "0xffffffff", "0x"))
            })
    
            it("should not throw if dates are correct", async () => {
                const now = parseInt(new Date() / 1000);
                await lib.validate(order.Order(ZERO_ADDRESS, testAsset, ZERO_ADDRESS, testAsset, 0, now - 500, now + 500, "0xffffffff", "0x"))
            })
    
            it("should throw if start date error", async () => {
                const now = parseInt(new Date() / 1000);
                await expectRevert.unspecified(
                    lib.validate(order.Order(ZERO_ADDRESS, testAsset, ZERO_ADDRESS, testAsset, 0, now + 500, 0, "0xffffffff", "0x"))
                )
            })
    
            it("should throw if end date error", async () => {
                const now = parseInt(new Date() / 1000);
                await expectRevert.unspecified(
                    lib.validate(order.Order(ZERO_ADDRESS, testAsset, ZERO_ADDRESS, testAsset, 0, 0, now - 100, "0xffffffff", "0x"))
                )
            })
    
            it("should throw if both dates error", async () => {
                const now = parseInt(new Date() / 1000);
                await expectRevert.unspecified(
                    lib.validate(order.Order(ZERO_ADDRESS, testAsset, ZERO_ADDRESS, testAsset, 0, now + 100, now - 100, "0xffffffff", "0x"))
                )
            })
    
        })
    });
});