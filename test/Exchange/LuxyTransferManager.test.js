const { Order, Asset } = require("../order");
const EIP712 = require("../EIP712");
const { BN, constants, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ZERO_ADDRESS } = constants;
const { ETH, ERC20, ERC721, ERC1155, ORDER_DATA_V1, enc, id } = require("../assets");
const eth = "0x0000000000000000000000000000000000000000";
describe('LuxyTransferManager:doTransferTest()', function () {
    let erc721TokenId0 = 52;
    let erc721TokenId1 = 53;
    let erc1155TokenId1 = 54;
    let erc1155TokenId2 = 55;
    beforeEach(async () => {
        accounts = await ethers.provider.listAccounts();
        community = accounts[8];
        protocol = accounts[9];
        [account0, account1, account2, account3,owner, owner2, owner3, owner4] = await ethers.getSigners();
        const TransferProxyTest = await ethers.getContractFactory('TransferProxyTest');
        const ERC20TransferProxyTest = await ethers.getContractFactory('ERC20TransferProxyTest');
        const TestERC20 = await ethers.getContractFactory('TestERC20');
        const TestERC721 = await ethers.getContractFactory('TestERC721');
        const TestERC1155 = await ethers.getContractFactory('TestERC1155');
        const Luxy721 = await ethers.getContractFactory('ERC721Luxy');
        const Luxy1155 = await ethers.getContractFactory('ERC1155Luxy');
        const TestERC1155Royalties = await ethers.getContractFactory('TestERC1155Royalties');
        const LuxyTransferManager = await ethers.getContractFactory('LuxyTransferManagerTest');
        const RoyaltiesRegistry = await ethers.getContractFactory('RoyaltiesRegistry');
        const RoyaltiesRegistryTest = await ethers.getContractFactory('RoyaltiesRegistryTest');
        royaltiesRegistryTest = await RoyaltiesRegistryTest.deploy();
        royaltiesRegistry = await upgrades.deployProxy(
            RoyaltiesRegistry,
            [],
            { initializer: '__RoyaltiesRegistry_init' }
        );
        luxy1155 = await upgrades.deployProxy(
            Luxy1155,
            ["ERC1155Luxy", "LUXY", ""],
            { initializer: '__ERC1155Luxy_init' }
        );

        testERC1155_V1 = await upgrades.deployProxy(
            TestERC1155Royalties,
            [""],
            { initializer: '__TestERC1155Royalties_init' }
        );
        await luxy1155.deployed();
        // royaltiesRegistry = await TestRoyaltiesRegistry.new();
        transferProxy = await TransferProxyTest.deploy();
        erc20TransferProxy = await ERC20TransferProxyTest.deploy();
        // erc20Token = await TestERC20.deploy();
        luxy721 = await upgrades.deployProxy(
            Luxy721,
            ["ERC721Luxy", "LUXY", ''],
            { initializer: '__ERC721Luxy_init' }
        );
        await luxy721.deployed();

        t1 = await upgrades.deployProxy(
            TestERC20,
            ['SuperThom', 'THOM'],
            { initializer: '__TestERC20_init' }
        );
        await t1.deployed();
        t2 = await upgrades.deployProxy(
            TestERC20,
            ['SuperKaue', 'KAUE'],
            { initializer: '__TestERC20_init' }
        );
        await t2.deployed();
        erc721Token = await upgrades.deployProxy(
            TestERC721,
            ['SuperNina', 'NINA'],
            { initializer: '__TestERC721_init' }
        );
        await erc721Token.deployed();

        erc1155Token = await upgrades.deployProxy(
            TestERC1155,
            [''],
            { initializer: '__TestERC1155_init' }
        );
        await erc1155Token.deployed();
        testing = await upgrades.deployProxy(
            LuxyTransferManager,
            [transferProxy.address, erc20TransferProxy.address, 200, community, royaltiesRegistry.address],
            { initializer: '__TransferManager_init' }
        );
        await testing.deployed();
        await testing.setFeeReceiver(t1.address, protocol);//
        /*ETH*/
        await testing.setFeeReceiver(eth, protocol);//


    });
    context('Without Royalties test', function(){ 
        it("should support ETH transfers", async () => {
            expect(await testing.checkFeeReceiver(eth)).to.equal(protocol);
            const { left, right } = await prepareETH_1155Orders(10)
            const beforeProtocol = new BN(await web3.eth.getBalance(protocol));
            await expect(await testing.connect(account0).checkDoTransfers(left.makeAsset.assetType, left.takeAsset.assetType, [100, 7], left, right,
                    {value: 102, gasPrice:10}
                    )
                )
                .to.changeEtherBalances([owner,account0], [98,-102]);

                const afterProtocol = new BN(await web3.eth.getBalance(protocol));
                expect(afterProtocol.sub(beforeProtocol).toString()).to.equal("4");
                expect(await erc1155Token.balanceOf(account0.address,erc1155TokenId1)).to.equal(7);
                expect(await erc1155Token.balanceOf(owner.address,erc1155TokenId1)).to.equal(3);
            });

            async function prepareETH_1155Orders(t2Amount = 10) {
                await erc1155Token.mint(owner.address, erc1155TokenId1, t2Amount);
                await erc1155Token.connect(owner).setApprovalForAll(transferProxy.address, true);

                const left = Order(account0.address, Asset(ETH, "0x", 100), ZERO_ADDRESS, Asset(ERC1155, enc(erc1155Token.address, erc1155TokenId1), 7), 1, 0, 0, "0xffffffff", "0x");
                const right = Order(owner.address, Asset(ERC1155, enc(erc1155Token.address, erc1155TokenId1), 7), ZERO_ADDRESS, Asset(ETH, "0x", 100), 1, 0, 0, "0xffffffff", "0x");
                return { left, right }
            }

            it("Transfer from ERC721 to ERC721", async () => {
    		const { left, right } = await prepare721_721Orders()

    		await testing.checkDoTransfers(left.makeAsset.assetType, left.takeAsset.assetType, [1, 1], left, right);

            expect(await erc721Token.ownerOf(erc721TokenId1)).to.equal(owner2.address);
            expect(await erc721Token.ownerOf(erc721TokenId0)).to.equal(owner.address);
    	})

        async function prepare721_721Orders() {
            await erc721Token.mint(owner.address, erc721TokenId1);
            await erc721Token.mint(owner2.address, erc721TokenId0);
            await erc721Token.connect(owner).setApprovalForAll(transferProxy.address, true);
            await erc721Token.connect(owner2).setApprovalForAll(transferProxy.address, true);
            let data = await encDataV1([[]]);
            const left = Order(owner.address, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), ZERO_ADDRESS, Asset(ERC721, enc(erc721Token.address, erc721TokenId0), 1), 1, 0, 0, ORDER_DATA_V1, data);
            const right = Order(owner2.address, Asset(ERC721, enc(erc721Token.address, erc721TokenId0), 1), ZERO_ADDRESS, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), 1, 0, 0, ORDER_DATA_V1, data);
            return { left, right }
        }


        it("Transfer from ERC1155 to ERC1155: 2 to 10, 50% 50% for payouts", async () => {
    		const { left, right } = await prepare1155_1155Orders();

    		await testing.checkDoTransfers(left.makeAsset.assetType, left.takeAsset.assetType, [2, 10], left, right);

            expect(await erc1155Token.balanceOf(account1.address, erc1155TokenId1)).to.equal(98);
            expect(await erc1155Token.balanceOf(account2.address, erc1155TokenId1)).to.equal(0);
            expect(await erc1155Token.balanceOf(account1.address, erc1155TokenId2)).to.equal(0);
            expect(await erc1155Token.balanceOf(account2.address, erc1155TokenId2)).to.equal(90);
            expect(await erc1155Token.balanceOf(accounts[3], erc1155TokenId2)).to.equal(5);
            expect(await erc1155Token.balanceOf(accounts[5], erc1155TokenId2)).to.equal(5);
            expect(await erc1155Token.balanceOf(accounts[4], erc1155TokenId1)).to.equal(1);
            expect(await erc1155Token.balanceOf(accounts[6], erc1155TokenId1)).to.equal(1);
            expect(await erc1155Token.balanceOf(accounts[6], erc1155TokenId1)).to.equal(1);
            expect(await erc1155Token.balanceOf(community, erc1155TokenId1)).to.equal(0);
            expect(await erc1155Token.balanceOf(community, erc1155TokenId2)).to.equal(0);
    	});
        async function prepare1155_1155Orders() {
    		await erc1155Token.mint(account1.address, erc1155TokenId1, 100);
    		await erc1155Token.mint(account2.address, erc1155TokenId2, 100);
    		await erc1155Token.connect(account1).setApprovalForAll(transferProxy.address, true);
    		await erc1155Token.connect(account2).setApprovalForAll(transferProxy.address, true);
    		let encDataLeft = await encDataV1([ [[accounts[3], 5000], [accounts[5], 5000]]]);
    		let encDataRight = await encDataV1([ [[accounts[4], 5000], [accounts[6], 5000]]]);
    		const left = Order(account1.address, Asset(ERC1155, enc(erc1155Token.address, erc1155TokenId1), 2), ZERO_ADDRESS, Asset(ERC1155, enc(erc1155Token.address, erc1155TokenId2), 10), 1, 0, 0, ORDER_DATA_V1, encDataLeft);
    		const right = Order(account2.address, Asset(ERC1155, enc(erc1155Token.address, erc1155TokenId2), 10), ZERO_ADDRESS, Asset(ERC1155, enc(erc1155Token.address, erc1155TokenId1), 2), 1, 0, 0, ORDER_DATA_V1, encDataRight);
    		return { left, right }
    	}
        it("rounding error Transfer from ERC1155 to ERC1155: 1 to 5, 50% 50% for payouts", async () => {
    		const { left, right } = await prepare1155_1155Orders();

    		await testing.checkDoTransfers(left.makeAsset.assetType, left.takeAsset.assetType, [1, 5], left, right);
            expect(await erc1155Token.balanceOf(account1.address, erc1155TokenId1)).to.equal(99);
            expect(await erc1155Token.balanceOf(account2.address, erc1155TokenId1)).to.equal(0);
            expect(await erc1155Token.balanceOf(account1.address, erc1155TokenId2)).to.equal(0);
            expect(await erc1155Token.balanceOf(account2.address, erc1155TokenId2)).to.equal(95);

            expect(await erc1155Token.balanceOf(accounts[3], erc1155TokenId2)).to.equal(2);
            expect(await erc1155Token.balanceOf(accounts[5], erc1155TokenId2)).to.equal(3);
            expect(await erc1155Token.balanceOf(accounts[4], erc1155TokenId1)).to.equal(0);
            expect(await erc1155Token.balanceOf(accounts[6], erc1155TokenId1)).to.equal(1);
            expect(await erc1155Token.balanceOf(community, erc1155TokenId1)).to.equal(0);

    	});

        it("Transfer from ERC1155 to ERC721, (buyerFee2%, sallerFee2% = 4%) of ERC1155 protocol (buyerFee2%, sallerFee2%)", async () => {
    		const { left, right } = await prepare1155O_721rders(105)

    		await testing.checkDoTransfers(left.makeAsset.assetType, left.takeAsset.assetType, [100, 1], left, right);

            expect(await erc721Token.balanceOf(account2.address)).to.equal(0);
            expect(await erc721Token.balanceOf(account1.address)).to.equal(1);
            expect(await erc1155Token.balanceOf(account2.address, erc1155TokenId1)).to.equal(98);
            expect(await erc1155Token.balanceOf(account1.address, erc1155TokenId1)).to.equal(3);
            expect(await erc1155Token.balanceOf(protocol, erc1155TokenId1)).to.equal(4);

    	})

    	async function prepare1155O_721rders(t2Amount = 105) {
    		await erc1155Token.mint(account1.address, erc1155TokenId1, t2Amount);
    		await erc721Token.mint(account2.address, erc721TokenId1);
    		await erc1155Token.connect(account1).setApprovalForAll(transferProxy.address, true);
    		await erc721Token.connect(account2).setApprovalForAll(transferProxy.address, true);
    		await testing.setFeeReceiver(erc1155Token.address, protocol);
    		const left = Order(account1.address, Asset(ERC1155, enc(erc1155Token.address, erc1155TokenId1), 100), ZERO_ADDRESS, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), 1, 0, 0, "0xffffffff", "0x");
    		const right =Order(account2.address, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), ZERO_ADDRESS, Asset(ERC1155, enc(erc1155Token.address, erc1155TokenId1), 100), 1, 0, 0, "0xffffffff", "0x");
    		return { left, right }
    	}

        it("Transfer from ERC20 to ERC1155, protocol fee 4% (buyerFee2%, sallerFee2%)", async () => {
    		const { left, right } = await prepare20_1155Orders(105, 10)

    		await testing.checkDoTransfers(left.makeAsset.assetType, left.takeAsset.assetType, [100, 7], left, right);

            expect(await t1.balanceOf(account1.address)).to.equal(3);
            expect(await t1.balanceOf(account2.address)).to.equal(98);
            expect(await erc1155Token.balanceOf(account1.address, erc1155TokenId1)).to.equal(7);
            expect(await erc1155Token.balanceOf(account2.address, erc1155TokenId1)).to.equal(3);
            expect(await t1.balanceOf(protocol)).to.equal(4);
    	})

    	async function prepare20_1155Orders(t1Amount = 105, t2Amount = 10) {
    		await t1.mint(account1.address, t1Amount);
    		await erc1155Token.mint(account2.address, erc1155TokenId1, t2Amount);
    		await t1.connect(account1).approve(erc20TransferProxy.address, 10000000);
    		await erc1155Token.connect(account2).setApprovalForAll(transferProxy.address, true);

    		const left = Order(account1.address, Asset(ERC20, enc(t1.address), 100), ZERO_ADDRESS, Asset(ERC1155, enc(erc1155Token.address, erc1155TokenId1), 7), 1, 0, 0, "0xffffffff", "0x");
    		const right = Order(account2.address, Asset(ERC1155, enc(erc1155Token.address, erc1155TokenId1), 7), ZERO_ADDRESS, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
    		return { left, right }
    	}

        it("Transfer from ERC1155 to ERC20, protocol fee 4% (buyerFee2%, sallerFee2%)", async () => {
    		const { left, right } = await prepare1155_20Orders(10, 105)

    		await testing.checkDoTransfers(left.makeAsset.assetType, left.takeAsset.assetType, [7, 100], left, right);

            expect(await t1.balanceOf(owner3.address)).to.equal(98);
            expect(await t1.balanceOf(owner4.address)).to.equal(3);
            expect(await erc1155Token.balanceOf(owner3.address, erc1155TokenId2)).to.equal(3);
            expect(await erc1155Token.balanceOf(owner4.address, erc1155TokenId2)).to.equal(7);
            expect(await t1.balanceOf(protocol)).to.equal(4);
    	})

    	async function prepare1155_20Orders(t1Amount = 10, t2Amount = 105) {
    		await erc1155Token.mint(owner3.address, erc1155TokenId2, t1Amount);
    		await t1.mint(owner4.address, t2Amount);
    		await erc1155Token.connect(owner3).setApprovalForAll(transferProxy.address, true);
    		await t1.connect(owner4).approve(erc20TransferProxy.address, 10000000);

    		const left = Order(owner3.address, Asset(ERC1155, enc(erc1155Token.address, erc1155TokenId2), 7), ZERO_ADDRESS, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
    		const right = Order(owner4.address, Asset(ERC20, enc(t1.address), 100), ZERO_ADDRESS, Asset(ERC1155, enc(erc1155Token.address, erc1155TokenId2), 7), 1, 0, 0, "0xffffffff", "0x");
    		return { left, right }
    	}

    	it("Transfer from ERC20 to ERC721, protocol fee 4% (buyerFee2%, sallerFee2%)", async () => {
    		const { left, right } = await prepare20_721Orders()

    		await testing.checkDoTransfers(left.makeAsset.assetType, left.takeAsset.assetType, [100, 1], left, right);

            expect(await t1.balanceOf(account2.address)).to.equal(98);
            expect(await t1.balanceOf(account1.address)).to.equal(3);
            expect(await erc721Token.balanceOf(account1.address)).to.equal(1);
            expect(await erc721Token.balanceOf(account2.address)).to.equal(0);
            expect(await t1.balanceOf(protocol)).to.equal(4);
    	})

    	async function prepare20_721Orders(t1Amount = 105) {
    		await t1.mint(account1.address, t1Amount);
    		await erc721Token.mint(account2.address, erc721TokenId1);
    		await t1.connect(account1).approve(erc20TransferProxy.address, 10000000);
    		await erc721Token.connect(account2).setApprovalForAll(transferProxy.address, true);

    		const left = Order(account1.address, Asset(ERC20, enc(t1.address), 100), ZERO_ADDRESS, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), 1, 0, 0, "0xffffffff", "0x");
    		const right = Order(account2.address, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), ZERO_ADDRESS, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
    		return { left, right }
    	}

    	it("Transfer from ERC721 to ERC20, protocol fee 4% (buyerFee2%, sallerFee2%)", async () => {
    		const { left, right } = await prepare721_20Orders()

    		await testing.checkDoTransfers(left.makeAsset.assetType, left.takeAsset.assetType, [1, 100], left, right);


            expect(await t1.balanceOf(account2.address)).to.equal(3);
            expect(await t1.balanceOf(account1.address)).to.equal(98);
            expect(await erc721Token.balanceOf(account1.address)).to.equal(0);
            expect(await erc721Token.balanceOf(account2.address)).to.equal(1);
            expect(await t1.balanceOf(protocol)).to.equal(4);

    	})

    	async function prepare721_20Orders(t1Amount = 105) {
    		await erc721Token.mint(account1.address, erc721TokenId1);
    		await t1.mint(account2.address, t1Amount);
    		await erc721Token.connect(account1).setApprovalForAll(transferProxy.address, true);
    		await t1.connect(account2).approve(erc20TransferProxy.address, 10000000);

    		const left = Order(account1.address, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), ZERO_ADDRESS, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
    		const right = Order(account2.address, Asset(ERC20, enc(t1.address), 100), ZERO_ADDRESS, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), 1, 0, 0, "0xffffffff", "0x");
    		return { left, right }
    	}

    	it("Transfer from ERC20 to ERC20, protocol fee 6% (buyerFee3%, sallerFee3%)", async () => {
    		const { left, right } = await prepare2Orders()

    		await testing.checkDoTransfers(left.makeAsset.assetType, left.takeAsset.assetType, [100, 200], left, right);

            expect(await t1.balanceOf(account2.address)).to.equal(98);
            expect(await t1.balanceOf(account1.address)).to.equal(3);
            expect(await t2.balanceOf(account1.address)).to.equal(200);
            expect(await t2.balanceOf(account2.address)).to.equal(20);
            expect(await t1.balanceOf(protocol)).to.equal(4);

    	})
    async function prepare2Orders(t1Amount = 105, t2Amount = 220) {
      await t1.mint(account1.address, t1Amount);
      await t2.mint(account2.address, t2Amount);
      await t1.connect(account1).approve(erc20TransferProxy.address, 10000000);
      await t2.connect(account2).approve(erc20TransferProxy.address, 10000000);

      const left = Order(account1.address, Asset(ERC20, enc(t1.address), 100), ZERO_ADDRESS, Asset(ERC20, enc(t2.address), 200), 1, 0, 0, "0xffffffff", "0x");
      const right = Order(account2.address, Asset(ERC20, enc(t2.address), 200), ZERO_ADDRESS, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
      return { left, right }
    }









    });

    context('With Royalties test', function () {

        it("Transfer from ERC721(RoyaltiesV1 - Token) to ERC20 , protocol fee 4% (buyerFee2%, sallerFee2%)", async () => {
            const { left, right } = await prepareLuxy721_20Orders(105)

            await testing.checkDoTransfers(left.makeAsset.assetType, left.takeAsset.assetType, [1, 100], left, right);

            expect(await t1.balanceOf(account1.address)).to.equal(3);
            expect(await t1.balanceOf(accounts[0])).to.equal(83);
            expect(await t1.balanceOf(accounts[2])).to.equal(10);
            expect(await t1.balanceOf(accounts[3])).to.equal(5);
            expect(await t1.balanceOf(protocol)).to.equal(4);
            expect(await luxy721.balanceOf(accounts[1])).to.equal(1);
            expect(await luxy721.balanceOf(accounts[0])).to.equal(0);
            expect(await t1.balanceOf(protocol)).to.equal(4);
        })

        async function prepareLuxy721_20Orders(t1Amount = 105) {
            await luxy721.mint(accounts[0], 'TERERE', []);
            await t1.mint(account1.address, t1Amount);
            await luxy721.setApprovalForAll(transferProxy.address, true);
            await t1.connect(account1).approve(erc20TransferProxy.address, 10000000);

            await royaltiesRegistry.setRoyaltiesByToken(luxy721.address, [[accounts[2], 1000], [accounts[3], 500]]); //set royalties by token
            const left = Order(accounts[0], Asset(ERC721, enc(luxy721.address, 0), 1), ZERO_ADDRESS, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
            const right = Order(account1.address, Asset(ERC20, enc(t1.address), 100), ZERO_ADDRESS, Asset(ERC721, enc(luxy721.address, 0), 1), 1, 0, 0, "0xffffffff", "0x");
            return { left, right }
        }

        it("Transfer from ERC20 to ERC1155(RoyaltiesV1 - Token), protocol fee 4% (buyerFee2%, sallerFee2%)", async () => {
            const { left, right } = await prepare20_1155V2Orders(105, 8)

            await testing.checkDoTransfers(left.makeAsset.assetType, left.takeAsset.assetType, [100, 6], left, right);

            expect(await t1.balanceOf(account1.address)).to.equal(3);
            expect(await t1.balanceOf(accounts[0])).to.equal(83);
            expect(await t1.balanceOf(accounts[2])).to.equal(10);
            expect(await t1.balanceOf(accounts[3])).to.equal(5);
            expect(await luxy1155.balanceOf(account1.address, 0)).to.equal(6);
            expect(await luxy1155.balanceOf(accounts[0], 0)).to.equal(2);
            expect(await t1.balanceOf(protocol)).to.equal(4);
        })

        it("Transfer from ERC20 to ERC1155(RoyaltiesV1), accept up to [30%,68%] of royalties [Token, TokenID]", async () => {
            const { left, right } = await prepare20_1155V2Orders_2(105, 8, 2000, 1000)
            await testing.checkDoTransfers(left.makeAsset.assetType, left.takeAsset.assetType, [100, 6], left, right);
            expect(await t1.balanceOf(account1.address)).to.equal(3);
            expect(await t1.balanceOf(accounts[0])).to.equal(0);
            expect(await t1.balanceOf(accounts[2])).to.equal(20);
            expect(await t1.balanceOf(accounts[3])).to.equal(10);
            expect(await t1.balanceOf(accounts[4])).to.equal(40);
            expect(await t1.balanceOf(accounts[5])).to.equal(28);
            expect(await luxy1155.balanceOf(account1.address, 0)).to.equal(6);
            expect(await luxy1155.balanceOf(accounts[0], 0)).to.equal(2);
            expect(await t1.balanceOf(protocol)).to.equal(4);
            // await expectRevert(
            //     testing.checkDoTransfers(left.makeAsset.assetType, left.takeAsset.assetType, [100, 6], left, right),
            //     "Royalties are too high (>100%)"

            // );
        })

        async function prepare20_1155V2Orders(t1Amount = 105, t2Amount = 10, account2Royalty = 1000, account3Royalty = 500) {
            await t1.mint(account1.address, t1Amount);
            await luxy1155.mint(accounts[0], t2Amount, [] , '' );
            await t1.connect(account1).approve(erc20TransferProxy.address, 10000000);
            await luxy1155.setApprovalForAll(transferProxy.address, true);

            await royaltiesRegistry.setRoyaltiesByToken(luxy1155.address, [[accounts[2], account2Royalty], [accounts[3], account3Royalty]]); //set royalties by token
            const left = Order(account1.address, Asset(ERC20, enc(t1.address), 100), ZERO_ADDRESS, Asset(ERC1155, enc(luxy1155.address, 0), 6), 1, 0, 0, "0xffffffff", "0x");
            const right = Order(accounts[0], Asset(ERC1155, enc(luxy1155.address, 0), 6), ZERO_ADDRESS, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");

            return { left, right }
        }
        async function prepare20_1155V2Orders_2(t1Amount = 105, t2Amount = 10, account2Royalty = 1000, account3Royalty = 500) {
            await t1.mint(account1.address, t1Amount);
            await luxy1155.mint(accounts[0], t2Amount, [[accounts[4], 4000], [accounts[5], 2800]] , '' );
            await t1.connect(account1).approve(erc20TransferProxy.address, 10000000);
            await luxy1155.setApprovalForAll(transferProxy.address, true);

            await royaltiesRegistry.setRoyaltiesByToken(luxy1155.address, [[accounts[2], account2Royalty], [accounts[3], account3Royalty]]); //set royalties by token
            const left = Order(account1.address, Asset(ERC20, enc(t1.address), 100), ZERO_ADDRESS, Asset(ERC1155, enc(luxy1155.address, 0), 6), 1, 0, 0, "0xffffffff", "0x");
            const right = Order(accounts[0], Asset(ERC1155, enc(luxy1155.address, 0), 6), ZERO_ADDRESS, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");

            return { left, right }
        }

        it("Transfer from ETH to ERC1155V1, protocol fee 4% (buyerFee2%, sallerFee2%)", async () => {
            const { left, right } = await prepareETH_1155V2Orders(10)
            const beforeProtocol = new BN(await web3.eth.getBalance(protocol));
            await expect(await testing.connect(account0).checkDoTransfers(left.makeAsset.assetType, left.takeAsset.assetType, [100, 7], left, right,{value: 102, gasPrice:20}))
                .to.changeEtherBalances([account0,account1,account2,account3], [-102,83,10,5]);
            const afterProtocol = new BN(await web3.eth.getBalance(protocol));
            expect(afterProtocol.sub(beforeProtocol).toString()).to.equal("4");
            expect(await luxy1155.balanceOf(account0.address, 0)).to.equal(7);
            expect(await luxy1155.balanceOf(account1.address, 0)).to.equal(3);
        })

        async function prepareETH_1155V2Orders(t2Amount = 10) {
            await luxy1155.mint(account1.address, t2Amount, [], '');
            await luxy1155.connect(account1).setApprovalForAll(transferProxy.address, true);
            await royaltiesRegistry.setRoyaltiesByToken(luxy1155.address, [[account2.address, 1000], [account3.address, 500]]); //set royalties by token
            const left = Order(account0.address, Asset(ETH, "0x", 100), ZERO_ADDRESS, Asset(ERC1155, enc(luxy1155.address, 0), 7), 1, 0, 0, "0xffffffff", "0x");
            const right = Order(account1.address, Asset(ERC1155, enc(luxy1155.address, 0), 7), ZERO_ADDRESS, Asset(ETH, "0x", 100), 1, 0, 0, "0xffffffff", "0x");
            return { left, right }
        }

        it("Transfer from ERC1155(RoyaltiesV1 With Error) to ERC20, protocol fee 4% (buyerFee2%, sallerFee2%)", async () => {
			const { left, right } = await prepare1155V2_20ErOrders(12, 105)

			await testing.checkDoTransfers(left.makeAsset.assetType, left.takeAsset.assetType, [5, 100], left, right);

            expect(await t1.balanceOf(account1.address)).to.equal(3);
            expect(await t1.balanceOf(accounts[0])).to.equal(98);
            expect(await t1.balanceOf(accounts[2])).to.equal(0);
            expect(await t1.balanceOf(accounts[3])).to.equal(0);
            expect(await testERC1155_V1.balanceOf(account1.address, erc1155TokenId1)).to.equal(5);
            expect(await testERC1155_V1.balanceOf(accounts[0], erc1155TokenId1)).to.equal(7);
            expect(await t1.balanceOf(protocol)).to.equal(4);
		})

		async function prepare1155V2_20ErOrders(t1Amount = 12, t2Amount = 105) {
			await testERC1155_V1.mint(accounts[0], erc1155TokenId1, [[accounts[2], 1000], [accounts[3], 500]], t1Amount);
			await t1.mint(account1.address, t2Amount);
			await testERC1155_V1.setApprovalForAll(transferProxy.address, true);
			await t1.connect(account1).approve(erc20TransferProxy.address, 10000000);

			const left = Order(accounts[0], Asset(ERC1155, enc(testERC1155_V1.address, erc1155TokenId1), 5), ZERO_ADDRESS, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
			const right = Order(account1.address, Asset(ERC20, enc(t1.address), 100), ZERO_ADDRESS, Asset(ERC1155, enc(testERC1155_V1.address, erc1155TokenId1), 5), 1, 0, 0, "0xffffffff", "0x");
			return { left, right }
		}

        it("Transfer from ERC721(RoyaltiesV1 - Token and TokenID) to ERC20 , protocol fee 4% (buyerFee2%, sellerFee2%)", async () => {
            const { left, right } = await prepareLuxy721_20Orders_2(105)

            await testing.checkDoTransfers(left.makeAsset.assetType, left.takeAsset.assetType, [1, 100], left, right);

            expect(await t1.balanceOf(account1.address)).to.equal(3);
            expect(await t1.balanceOf(accounts[0])).to.equal(81);
            expect(await t1.balanceOf(accounts[2])).to.equal(10);
            expect(await t1.balanceOf(accounts[3])).to.equal(5);
            expect(await t1.balanceOf(accounts[4])).to.equal(1);
            expect(await t1.balanceOf(accounts[5])).to.equal(1);
            expect(await t1.balanceOf(protocol)).to.equal(4);
            expect(await luxy721.balanceOf(accounts[1])).to.equal(1);
            expect(await luxy721.balanceOf(accounts[0])).to.equal(0);
        })

        async function prepareLuxy721_20Orders_2(t1Amount = 105) {
            //			await erc721V1.mint(accounts[0], erc721TokenId1, [[accounts[2], 1000], [accounts[3], 500]]);
            part = await luxy721.mint(accounts[0], 'TERERE', [[accounts[4], 100], [accounts[5], 100]]);
            tx_receipt = await part.wait()
            await t1.mint(account1.address, t1Amount);
            await luxy721.setApprovalForAll(transferProxy.address, true);
            await t1.connect(account1).approve(erc20TransferProxy.address, 10000000);

            await royaltiesRegistry.setRoyaltiesByToken(luxy721.address, [[accounts[2], 1000], [accounts[3], 500]]); //set royalties by token
            const left = Order(accounts[0], Asset(ERC721, enc(luxy721.address, 0), 1), ZERO_ADDRESS, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
            const right = Order(account1.address, Asset(ERC20, enc(t1.address), 100), ZERO_ADDRESS, Asset(ERC721, enc(luxy721.address, 0), 1), 1, 0, 0, "0xffffffff", "0x");
            return { left, right }
        }

        it("Transfer from ERC721(RoyaltiesV1 - Token and TokenID) to ERC20 , protocol fee 3% (buyerFee1%, sellerFee2%)", async () => {
            const { left, right } = await prepareLuxy721_20Orders_2(105)
            await testing.setSpecialProtocolFee(luxy721.address,100,200);
            await testing.checkDoTransfers(left.makeAsset.assetType, left.takeAsset.assetType, [1, 100], left, right);

            expect(await t1.balanceOf(account1.address)).to.equal(4);
            expect(await t1.balanceOf(accounts[0])).to.equal(81);
            expect(await t1.balanceOf(accounts[2])).to.equal(10);
            expect(await t1.balanceOf(accounts[3])).to.equal(5);
            expect(await t1.balanceOf(accounts[4])).to.equal(1);
            expect(await t1.balanceOf(accounts[5])).to.equal(1);
            expect(await t1.balanceOf(protocol)).to.equal(3);
            expect(await luxy721.balanceOf(accounts[1])).to.equal(1);
            expect(await luxy721.balanceOf(accounts[0])).to.equal(0);
        })



    });

    function encDataV1(tuple) {
        return testing.encode(tuple)
    }











});