const { BN, constants, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ZERO_ADDRESS } = constants;
const order = require("../order");


describe ('LibFill', function(){
    beforeEach(async () => {
        accounts = await ethers.provider.listAccounts();
        const LibFillTest = await ethers.getContractFactory('LibFillTest');
        lib = await LibFillTest.deploy();
    });
    describe("right order fill", () => {
		it("should fill fully right order if amounts are fully matched", async () => {
			const left = order.Order(ZERO_ADDRESS, order.Asset("0x00000000", "0x", 100), ZERO_ADDRESS, order.Asset("0x00000000", "0x", 200), 1, 0, 0, "0xffffffff", "0x");
			const right = order.Order(ZERO_ADDRESS, order.Asset("0x00000000", "0x", 100), ZERO_ADDRESS, order.Asset("0x00000000", "0x", 50), 1, 0, 0, "0xffffffff", "0x");

			const fill = await lib.fillOrder(left, right, 0, 0);
            expect(fill[0]).to.be.equal(50);
            expect(fill[1]).to.be.equal(100);
		});

		it("should throw if right order is fully matched, but price is not ok", async () => {
			const left = order.Order(ZERO_ADDRESS, order.Asset("0x00000000", "0x", 100), ZERO_ADDRESS, order.Asset("0x00000000", "0x", 200), 1, 0, 0, "0xffffffff", "0x");
			const right = order.Order(ZERO_ADDRESS, order.Asset("0x00000000", "0x", 99), ZERO_ADDRESS, order.Asset("0x00000000", "0x", 50), 1, 0, 0, "0xffffffff", "0x");

            await expectRevert.unspecified(
                lib.fillOrder(left, right, 0, 0)
            )
		});

		it("should fill right order and return profit if more than needed", async () => {
			const left = order.Order(ZERO_ADDRESS, order.Asset("0x00000000", "0x", 100), ZERO_ADDRESS, order.Asset("0x00000000", "0x", 200), 1, 0, 0, "0xffffffff", "0x");
			const right = order.Order(ZERO_ADDRESS, order.Asset("0x00000000", "0x", 101), ZERO_ADDRESS, order.Asset("0x00000000", "0x", 50), 1, 0, 0, "0xffffffff", "0x");

			const fill = await lib.fillOrder(left, right, 0, 0);
			expect(fill[0]).to.be.equal(50);
            expect(fill[1]).to.be.equal(100);
		});
	})

	describe("left order fill", () => {
		it("should fill orders when prices match exactly", async () => {
			const left = order.Order(ZERO_ADDRESS, order.Asset("0x00000000", "0x", 100), ZERO_ADDRESS, order.Asset("0x00000000", "0x", 200), 1, 0, 0, "0xffffffff", "0x");
			const right = order.Order(ZERO_ADDRESS, order.Asset("0x00000000", "0x", 400), ZERO_ADDRESS, order.Asset("0x00000000", "0x", 200), 1, 0, 0, "0xffffffff", "0x");

			const fill = await lib.fillOrder(left, right, 0, 0);
            expect(fill[0]).to.be.equal(100);
            expect(fill[1]).to.be.equal(200);
		});

		it("should fill orders when right order has better price", async () => {
			const left = order.Order(ZERO_ADDRESS, order.Asset("0x00000000", "0x", 1000), ZERO_ADDRESS, order.Asset("0x00000000", "0x", 2000), 1, 0, 0, "0xffffffff", "0x");
			const right = order.Order(ZERO_ADDRESS, order.Asset("0x00000000", "0x", 4001), ZERO_ADDRESS, order.Asset("0x00000000", "0x", 2000), 1, 0, 0, "0xffffffff", "0x");

			const fill = await lib.fillOrder(left, right, 0, 0);
            expect(fill[0]).to.be.equal(1000);
            expect(fill[1]).to.be.equal(2000);
		});

		it("should throw if price is not ok", async () => {
			const left = order.Order(ZERO_ADDRESS, order.Asset("0x00000000", "0x", 1000), ZERO_ADDRESS, order.Asset("0x00000000", "0x", 2000), 1, 0, 0, "0xffffffff", "0x");
			const right = order.Order(ZERO_ADDRESS, order.Asset("0x00000000", "0x", 3990), ZERO_ADDRESS, order.Asset("0x00000000", "0x", 2000), 1, 0, 0, "0xffffffff", "0x");

			await expectRevert.unspecified(
                lib.fillOrder(left, right, 0, 0)
            )
		});

	})

	describe("both orders fill", () => {
		it("should fill orders when prices match exactly", async () => {
			const left = order.Order(ZERO_ADDRESS, order.Asset("0x00000000", "0x", 100), ZERO_ADDRESS, order.Asset("0x00000000", "0x", 200), 1, 0, 0, "0xffffffff", "0x");
			const right = order.Order(ZERO_ADDRESS, order.Asset("0x00000000", "0x", 200), ZERO_ADDRESS, order.Asset("0x00000000", "0x", 100), 1, 0, 0, "0xffffffff", "0x");

			const fill = await lib.fillOrder(left, right, 0, 0);
            expect(fill[0]).to.be.equal(100);
            expect(fill[1]).to.be.equal(200);
		});

		it("should fill orders when right order has better price", async () => {
			const left = order.Order(ZERO_ADDRESS, order.Asset("0x00000000", "0x", 100), ZERO_ADDRESS, order.Asset("0x00000000", "0x", 200), 1, 0, 0, "0xffffffff", "0x");
			const right = order.Order(ZERO_ADDRESS, order.Asset("0x00000000", "0x", 300), ZERO_ADDRESS, order.Asset("0x00000000", "0x", 100), 1, 0, 0, "0xffffffff", "0x");

			const fill = await lib.fillOrder(left, right, 0, 0);
            expect(fill[0]).to.be.equal(100);
            expect(fill[1]).to.be.equal(200);
		});

		it("should fill orders when right order has better price with less needed amount", async () => {
			const left = order.Order(ZERO_ADDRESS, order.Asset("0x00000000", "0x", 100), ZERO_ADDRESS, order.Asset("0x00000000", "0x", 200), 1, 0, 0, "0xffffffff", "0x");
			const right = order.Order(ZERO_ADDRESS, order.Asset("0x00000000", "0x", 300), ZERO_ADDRESS, order.Asset("0x00000000", "0x", 50), 1, 0, 0, "0xffffffff", "0x");

			const fill = await lib.fillOrder(left, right, 0, 0);
            expect(fill[0]).to.be.equal(50);
            expect(fill[1]).to.be.equal(100);
		});

		it("should throw if price is not ok", async () => {
			const left = order.Order(ZERO_ADDRESS, order.Asset("0x00000000", "0x", 100), ZERO_ADDRESS, order.Asset("0x00000000", "0x", 200), 1, 0, 0, "0xffffffff", "0x");
			const right = order.Order(ZERO_ADDRESS, order.Asset("0x00000000", "0x", 199), ZERO_ADDRESS, order.Asset("0x00000000", "0x", 100), 1, 0, 0, "0xffffffff", "0x");
            await expectRevert.unspecified(
                lib.fillOrder(left, right, 0, 0)
            );
		});

	})


});