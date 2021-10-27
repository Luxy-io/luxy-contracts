const order = require("../order");
const EIP712 = require("../EIP712");
const { constants, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ZERO_ADDRESS } = constants;
const { enc, ETH, ERC20, ERC721, ERC1155, id } = require("../assets");


describe('AssetMatcher', function () {
    beforeEach(async () => {
        accounts = await ethers.provider.listAccounts();
        const AssetMatcherTest = await ethers.getContractFactory('AssetMatcherTest');
        const TestAssetMatcher = await ethers.getContractFactory('TestAssetMatcher');
        assetMatcher = await upgrades.deployProxy(
            AssetMatcherTest,
            { initializer: '__AssetMatcherTest_init' }
        );
        testAssetMatcher = await TestAssetMatcher.deploy();
        await assetMatcher.deployed();
        await testAssetMatcher.deployed();
    });

    context('Validating Signatures', function () {
        it("setAssetMatcher works", async () => {
            const encoded = enc(accounts[5]);
            await expectRevert(
                assetMatcher.matchAssetsTest(order.AssetType(ERC20, encoded), order.AssetType(id("BLA"), encoded)),
                "not found IAssetMatcher"
            );
            await expect(assetMatcher.setAssetMatcher(id("BLA"), testAssetMatcher.address))
                .to.emit(assetMatcher, "MatcherChange")
                .withArgs(id("BLA"), testAssetMatcher.address)
            const result = await assetMatcher.matchAssetsTest(order.AssetType(ERC20, encoded), order.AssetType(id("BLA"), encoded));
            expect(result[0]).to.equal(ERC20);
            expect(result[1]).to.equal(encoded);
        });
        describe("ETH", () => {
            it("should extract ETH type if both are ETHs", async () => {
                const result = await assetMatcher.matchAssetsTest(order.AssetType(ETH, "0x"), order.AssetType(ETH, "0x"))
                expect(result[0]).to.equal(ETH);
            });

            it("should extract nothing if one is not ETH", async () => {
                const result = await assetMatcher.matchAssetsTest(order.AssetType(ETH, "0x"), order.AssetType(ERC20, "0x"))
                expect(result[0]).to.equal("0x00000000");
            });
        })

        describe("ERC20", () => {
            it("should extract ERC20 type if both are and addresses equal", async () => {
                const encoded = enc(accounts[5])
                const result = await assetMatcher.matchAssetsTest(order.AssetType(ERC20, encoded), order.AssetType(ERC20, encoded))
                expect(result[0]).to.equal(ERC20);
                expect(result[1]).to.equal(encoded);
            });

            it("should extract nothing if erc20 don't match", async () => {
                const result = await assetMatcher.matchAssetsTest(order.AssetType(ERC20, enc(accounts[1])), order.AssetType(ERC20, enc(accounts[2])))
                expect(result[0]).to.equal("0x00000000");
            });

            it("should extract nothing if other type is not ERC20", async () => {
                const result = await assetMatcher.matchAssetsTest(order.AssetType(ERC20, enc(accounts[1])), order.AssetType(ETH, "0x"))
                expect(result[0]).to.equal("0x00000000");
            });
        })

        describe("ERC721", () => {
            it("should extract ERC721 type if both are equal", async () => {
                const encoded = enc(accounts[5], 100)
                const result = await assetMatcher.matchAssetsTest(order.AssetType(ERC721, encoded), order.AssetType(ERC721, encoded))
                expect(result[0]).to.equal(ERC721);
                expect(result[1]).to.equal(encoded);
            });

            it("should extract nothing if tokenIds don't match", async () => {
                const result = await assetMatcher.matchAssetsTest(order.AssetType(ERC721, enc(accounts[5], 100)), order.AssetType(ERC721, enc(accounts[5], 101)))
                expect(result[0]).to.equal("0x00000000");
            });

            it("should extract nothing if addresses don't match", async () => {
                const result = await assetMatcher.matchAssetsTest(order.AssetType(ERC721, enc(accounts[4], 100)), order.AssetType(ERC721, enc(accounts[5], 100)))
                expect(result[0]).to.equal("0x00000000");
            });

            it("should extract nothing if other type is not ERC721", async () => {
                const result = await assetMatcher.matchAssetsTest(order.AssetType(ERC721, enc(accounts[5], 100)), order.AssetType(ETH, "0x"))
                expect(result[0]).to.equal("0x00000000");
            });
        })

        describe("ERC1155", () => {
            it("should extract ERC1155 type if both are equal", async () => {
                const encoded = enc(accounts[5], 100)
                const result = await assetMatcher.matchAssetsTest(order.AssetType(ERC1155, encoded), order.AssetType(ERC1155, encoded))
                expect(result[0]).to.equal(ERC1155);
                expect(result[1]).to.equal(encoded);
            });

            it("should extract nothing if tokenIds don't match", async () => {
                const result = await assetMatcher.matchAssetsTest(order.AssetType(ERC1155, enc(accounts[5], 100)), order.AssetType(ERC1155, enc(accounts[5], 101)))
                expect(result[0]).to.equal("0x00000000");
            });

            it("should extract nothing if addresses don't match", async () => {
                const result = await assetMatcher.matchAssetsTest(order.AssetType(ERC1155, enc(accounts[4], 100)), order.AssetType(ERC1155, enc(accounts[5], 100)))
                expect(result[0]).to.equal("0x00000000");
            });

            it("should extract nothing if other type is not erc1155", async () => {
                const encoded = enc(accounts[5], 100);
                const result = await assetMatcher.matchAssetsTest(order.AssetType(ERC1155, encoded), order.AssetType(ERC721, encoded))
                expect(result[0]).to.equal("0x00000000");
            });
        })

        describe("generic", () => {
            it("should extract left type if asset types are equal", async () => {
                const result = await assetMatcher.matchAssetsTest(order.AssetType("0x00112233", "0x1122"), order.AssetType("0x00112233", "0x1122"))
                expect(result[0]).to.equal("0x00112233");
                expect(result[1]).to.equal("0x1122");
            });

            it("should extract nothing single byte differs", async () => {
                const result = await assetMatcher.matchAssetsTest(order.AssetType("0x00112233", "0x1122"), order.AssetType("0x00112233", "0x1111"))
                expect(result[0]).to.equal("0x00000000");
                expect(result[1]).to.equal('0x');
            });
        })


    });




});