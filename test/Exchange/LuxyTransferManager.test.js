const { Order, Asset, sign } = require("../order");
const EIP712 = require("../EIP712");
const { BN, constants, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ZERO_ADDRESS } = constants;
const eth = "0x0000000000000000000000000000000000000000";
const { ETH, ERC20, ERC721, ERC1155, ORDER_DATA_V1, TO_MAKER, TO_TAKER, PROTOCOL, ROYALTY, ORIGIN, PAYOUT, enc, id } = require("../assets");


describe('LuxyExchange tests', function () {
    let erc721TokenId0 = 52;
    let erc721TokenId1 = 53;
    let erc1155TokenId1 = 54;

    beforeEach(async () => {
        accounts = await ethers.provider.listAccounts();
        community = accounts[8];
        protocol = accounts[9];
        burning = accounts[10];
        feeWallet = accounts[11];
        [account0, account1, account2, account3, owner, owner2, owner3, owner4] = await ethers.getSigners();
        const TransferProxy = await ethers.getContractFactory('TransferProxy');
        const ERC20TransferProxy = await ethers.getContractFactory('ERC20TransferProxy');
        const TestERC20 = await ethers.getContractFactory('TestERC20');
        const TestERC721 = await ethers.getContractFactory('TestERC721');
        const TestERC1155 = await ethers.getContractFactory('TestERC1155');
        const Luxy721 = await ethers.getContractFactory('ERC721Luxy');
        const Luxy1155 = await ethers.getContractFactory('ERC1155Luxy');
        const TestERC1155Royalties = await ethers.getContractFactory('TestERC1155Royalties');
        const LuxyTransferManager = await ethers.getContractFactory('LuxyTransferManagerTest');
        const RoyaltiesRegistry = await ethers.getContractFactory('RoyaltiesRegistry');
        const RoyaltiesRegistryTest = await ethers.getContractFactory('RoyaltiesRegistryTest');
        const LibOrderTest = await ethers.getContractFactory('LibOrderTest');
        const LuxyExchange = await ethers.getContractFactory('Luxy');
        libOrder = await LibOrderTest.deploy();
        royaltiesRegistryTest = await RoyaltiesRegistryTest.deploy();
        royaltiesRegistry = await upgrades.deployProxy(
            RoyaltiesRegistry,
            [],
            { initializer: '__RoyaltiesRegistry_init' }
        );
        luxy1155 = await upgrades.deployProxy(
            Luxy1155,
            ["ERC1155Luxy", "LUXY", "",false,0],
            { initializer: '__ERC1155Luxy_init' }
        );

        testERC1155_V1 = await upgrades.deployProxy(
            TestERC1155Royalties,
            [""],
            { initializer: '__TestERC1155Royalties_init' }
        );
        await luxy1155.deployed();
        // royaltiesRegistry = await TestRoyaltiesRegistry.new();
        transferProxy = await TransferProxy.deploy();
        erc20TransferProxy = await ERC20TransferProxy.deploy();
        // erc20Token = await TestERC20.deploy();
        luxy721 = await upgrades.deployProxy(
            Luxy721,
            ["ERC721Luxy", "LUXY", '', false,0],
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
        t3 = await upgrades.deployProxy(
            TestERC20,
            ['Luxy', 'Luxy'],
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
        luxyTransferManager = await upgrades.deployProxy(
            LuxyTransferManager,
            [transferProxy.address, erc20TransferProxy.address, 200, community, royaltiesRegistry.address, feeWallet, burning, t3.address, 10],
            { initializer: '__TransferManager_init' }
        );
        await luxyTransferManager.deployed();
        testing = await upgrades.deployProxy(
            LuxyExchange,
            [transferProxy.address, erc20TransferProxy.address, 200, community, royaltiesRegistry.address, feeWallet, burning, t3.address, 10],
            { initializer: '__LuxyCore_init' }
        );
        await testing.deployed();
        await testing.setFeeReceiver(t1.address, protocol);//
        await testing.setFeeReceiver(eth, protocol);//


    });

    context("matchOrders", () => {
        it("eth orders work, expect throw, not enough eth ", async () => {
            await t1.mint(account1.address, 100);
            await t1.connect(account1).approve(erc20TransferProxy.address, 10000000);

            const right = Order(account1.address, Asset(ERC20, enc(t1.address), 100), ZERO_ADDRESS, Asset(ETH, "0x", 200), 1, 0, 0, "0xffffffff", "0x");
            const left = Order(account2.address, Asset(ETH, "0x", 200), ZERO_ADDRESS, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
            await expectRevert(
                testing.connect(account2).matchOrders(left, "0x", right, await getSignature(right, account1.address), { value: 199 }),
                "transfer failed"
            );

        });
        it("eth orders work, expect throw, unknown Data type of Order ", async () => {
            await t1.mint(account1.address, 100);
            await t1.connect(account1).approve(erc20TransferProxy.address, 10000000);

            const right = Order(account1.address, Asset(ERC20, enc(t1.address), 100), ZERO_ADDRESS, Asset(ETH, "0x", 200), 1, 0, 0, "0xfffffffe", "0x");
            const left = Order(account2.address, Asset(ETH, "0x", 200), ZERO_ADDRESS, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
            await expectRevert(
                testing.connect(account2).matchOrders(left, "0x", right, await getSignature(right, account1.address), { value: 300 }),
                'Unknown Order data type'
            );
        })
        it("eth orders work, rest is returned to taker (other side) ", async () => {
            await t1.mint(account1.address, 100);
            await t1.connect(account1).approve(erc20TransferProxy.address, 10000000);

            const left = Order(account2.address, Asset(ETH, "0x", 200), ZERO_ADDRESS, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
            const right = Order(account1.address, Asset(ERC20, enc(t1.address), 100), ZERO_ADDRESS, Asset(ETH, "0x", 200), 1, 0, 0, "0xffffffff", "0x");
            const beforeProtocol = new BN(await web3.eth.getBalance(protocol));
            let signatureRight = await getSignature(right, account1.address);
            await expect(await testing.connect(account2).matchOrders(left, "0x", right, signatureRight, { value: 300, gasPrice: 20 }))
                .to.changeEtherBalances([account2, account1], [-204, 196]);
            const afterProtocol = new BN(await web3.eth.getBalance(protocol));
            expect(afterProtocol.sub(beforeProtocol).toString()).to.equal("8");
            expect(await t1.balanceOf(account1.address)).to.equal(0);
            expect(await t1.balanceOf(account2.address)).to.equal(100);
        })
        it("ERC721 to ETH order maker ETH != who pay, both orders have to be with signature ", async () => {
            await erc721Token.mint(account1.address, erc721TokenId1);
            await erc721Token.connect(account1).setApprovalForAll(transferProxy.address, true);
            const beforeProtocol = new BN(await web3.eth.getBalance(protocol));
            const left = Order(account1.address, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), ZERO_ADDRESS, Asset(ETH, "0x", 200), 1, 0, 0, "0xffffffff", "0x");
            const right = Order(account2.address, Asset(ETH, "0x", 200), ZERO_ADDRESS, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), 1, 0, 0, "0xffffffff", "0x");

            let signatureLeft = await getSignature(left, account1.address);
            let signatureRight = await getSignature(right, account2.address);
            await expect(await testing.connect(account3).matchOrders(left, signatureLeft, right, signatureRight, { value: 300, gasPrice: 20 }))
                .to.changeEtherBalances([account3, account1], [-204, 196]);
            const afterProtocol = new BN(await web3.eth.getBalance(protocol));
            expect(afterProtocol.sub(beforeProtocol).toString()).to.equal("8");
            expect(await erc721Token.balanceOf(account1.address)).to.equal(0);
            expect(await erc721Token.balanceOf(account2.address)).to.equal(1);
        })

        it("ERC721 to ETH order maker ETH != who pay, ETH orders have no signature, throw", async () => {
            await erc721Token.mint(account1.address, erc721TokenId1);
            await erc721Token.connect(account1).setApprovalForAll(transferProxy.address, true);

            const left = Order(account1.address, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), ZERO_ADDRESS, Asset(ETH, "0x", 200), 1, 0, 0, "0xffffffff", "0x");
            const right = Order(account2.address, Asset(ETH, "0x", 200), ZERO_ADDRESS, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), 1, 0, 0, "0xffffffff", "0x");

            let signatureLeft = await getSignature(left, account1.address);

            await expectRevert(
                testing.connect(account3).matchOrders(left, signatureLeft, right, "0x", { value: 300, gasPrice: 20 }),
                'ECDSA: invalid signature length'
            );
        })
    });
    context("Do matchOrders(), orders dataType == V1", () => {
        it("From ERC20(100) to ERC20(200) Protocol, Origin fees, no Royalties ", async () => {
            const { left, right } = await prepare2Orders()

            await testing.connect(account2).matchOrders(left, await getSignature(left, account1.address), right, "0x");

            expect(await testing.fills(await libOrder.hashKey(left))).to.equal(200);
            expect(await t1.balanceOf(account1.address)).to.equal(2);
            expect(await t1.balanceOf(account2.address)).to.equal(98);
            expect(await t2.balanceOf(account1.address)).to.equal(200);
            expect(await t2.balanceOf(account2.address)).to.equal(0);
        })

        it("From ERC20(10) to ERC20(20) Protocol, no fees because of rounding", async () => {
            const { left, right } = await prepare2Orders(10, 20, 10, 20)

            await testing.connect(account2).matchOrders(left, await getSignature(left, account1.address), right, "0x");

            expect(await testing.fills(await libOrder.hashKey(left))).to.equal(20);

            expect(await t1.balanceOf(account1.address)).to.equal(0);
            expect(await t1.balanceOf(account2.address)).to.equal(10);
            expect(await t2.balanceOf(account1.address)).to.equal(20);
            expect(await t2.balanceOf(account2.address)).to.equal(0);
        })

        async function prepare2Orders(t1Amount = 104, t2Amount = 200, makeAmount = 100, takeAmount = 200) {
            await t1.mint(account1.address, t1Amount);
            await t2.mint(account2.address, t2Amount);
            await t1.connect(account1).approve(erc20TransferProxy.address, 10000000);
            await t2.connect(account2).approve(erc20TransferProxy.address, 10000000);
            let encDataLeft = await encDataV1([[[account1.address, 10000]]]);
            let encDataRight = await encDataV1([[[account2.address, 10000]]]);
            const left = Order(account1.address, Asset(ERC20, enc(t1.address), makeAmount), ZERO_ADDRESS, Asset(ERC20, enc(t2.address), takeAmount), 1, 0, 0, ORDER_DATA_V1, encDataLeft);
            const right = Order(account2.address, Asset(ERC20, enc(t2.address), takeAmount), ZERO_ADDRESS, Asset(ERC20, enc(t1.address), makeAmount), 1, 0, 0, ORDER_DATA_V1, encDataRight);
            return { left, right }
        }

        it("From ERC721(DataV1) to ERC20(NO DataV1) Protocol, Origin fees, no Royalties ", async () => {
            const { left, right } = await prepare721DV1_20rders()

            await testing.connect(account2).matchOrders(left, await getSignature(left, account1.address), right, "0x");

            expect(await testing.fills(await libOrder.hashKey(left))).to.equal(100);

            expect(await t2.balanceOf(account1.address)).to.equal(98);
            expect(await t2.balanceOf(community)).to.equal(4);
            expect(await t2.balanceOf(account2.address)).to.equal(3);
            expect(await erc721Token.balanceOf(account1.address)).to.equal(0);
            expect(await erc721Token.balanceOf(account2.address)).to.equal(0);
            expect(await erc721Token.balanceOf(account3.address)).to.equal(1);
            // expect(await t2.balanceOf(community)).to.equal(4);
        })

        async function prepare721DV1_20rders(t2Amount = 105) {
            await erc721Token.mint(account1.address, erc721TokenId1);
            await t2.mint(account2.address, t2Amount);
            await erc721Token.connect(account1).setApprovalForAll(transferProxy.address, true);
            await t2.connect(account2).approve(erc20TransferProxy.address, 10000000);
            let encDataRight = await encDataV1([[[accounts[3], 10000]]]);
            const left = Order(account1.address, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), ZERO_ADDRESS, Asset(ERC20, enc(t2.address), 100), 1, 0, 0, "0xffffffff", "0x");
            const right = Order(account2.address, Asset(ERC20, enc(t2.address), 100), ZERO_ADDRESS, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), 1, 0, 0, ORDER_DATA_V1, encDataRight);
            return { left, right }
        }

        it("From ERC20(DataV1) to ERC1155(RoyV1, DataV1) Protocol, Royalties ", async () => {
            const { left, right } = await prepare20DV1_1155V1Orders()

            await testing.connect(account2).matchOrders(left, await getSignature(left, account1.address), right, "0x");

            expect(await testing.fills(await libOrder.hashKey(left))).to.equal(7);

            expect(await t1.balanceOf(account1.address)).to.equal(18);
            expect(await t1.balanceOf(account2.address)).to.equal(83);
            expect(await t1.balanceOf(accounts[6])).to.equal(10);
            expect(await t1.balanceOf(accounts[7])).to.equal(5);
            expect(await testERC1155_V1.balanceOf(account1.address, erc1155TokenId1)).to.equal(7);
            expect(await testERC1155_V1.balanceOf(account2.address, erc1155TokenId1)).to.equal(3);
            expect(await t1.balanceOf(protocol)).to.equal(4);
        })

        async function prepare20DV1_1155V1Orders(t1Amount = 120, t2Amount = 10) {
            await t1.mint(account1.address, t1Amount);
            await testERC1155_V1.mint(account2.address, erc1155TokenId1, [], t2Amount);
            await t1.connect(account1).approve(erc20TransferProxy.address, 10000000);
            await testERC1155_V1.connect(account2).setApprovalForAll(transferProxy.address, true);


            let encDataLeft = await encDataV1([[[account1.address, 10000]]]);
            let encDataRight = await encDataV1([[[account2.address, 10000]]]);

            await royaltiesRegistry.setRoyaltiesByToken(testERC1155_V1.address, [[accounts[6], 1000], [accounts[7], 500]]); //set royalties by token
            const left = Order(account1.address, Asset(ERC20, enc(t1.address), 100), ZERO_ADDRESS, Asset(ERC1155, enc(testERC1155_V1.address, erc1155TokenId1), 7), 1, 0, 0, ORDER_DATA_V1, encDataLeft);
            const right = Order(account2.address, Asset(ERC1155, enc(testERC1155_V1.address, erc1155TokenId1), 7), ZERO_ADDRESS, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, ORDER_DATA_V1, encDataRight);
            return { left, right }
        }

        it("From ERC1155(RoyV1, DataV1) to ERC20(DataV1):Protocol, Royalties ", async () => {
            const { left, right } = await prepare1155V1_20DV1Orders()

            await testing.connect(account1).matchOrders(left, await getSignature(left, account2.address), right, "0x");

            expect(await testing.fills(await libOrder.hashKey(left))).to.equal(100);

            expect(await t1.balanceOf(account1.address)).to.equal(18);
            expect(await t1.balanceOf(account2.address)).to.equal(83);
            expect(await t1.balanceOf(accounts[6])).to.equal(10);
            expect(await t1.balanceOf(accounts[7])).to.equal(5);
            expect(await testERC1155_V1.balanceOf(account1.address, erc1155TokenId1)).to.equal(7);
            expect(await testERC1155_V1.balanceOf(account2.address, erc1155TokenId1)).to.equal(3);
            expect(await t1.balanceOf(protocol)).to.equal(4);
        })

        async function prepare1155V1_20DV1Orders(t1Amount = 120, t2Amount = 10) {
            await testERC1155_V1.mint(account2.address, erc1155TokenId1, [], t2Amount);
            await t1.mint(account1.address, t1Amount);
            await testERC1155_V1.connect(account2).setApprovalForAll(transferProxy.address, true);
            await t1.connect(account1).approve(erc20TransferProxy.address, 10000000);


            let encDataLeft = await encDataV1([[[account2.address, 10000]]]);
            let encDataRight = await encDataV1([[[account1.address, 10000]]]);

            await royaltiesRegistry.setRoyaltiesByToken(testERC1155_V1.address, [[accounts[6], 1000], [accounts[7], 500]]); //set royalties by token
            const left = Order(account2.address, Asset(ERC1155, enc(testERC1155_V1.address, erc1155TokenId1), 7), ZERO_ADDRESS, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, ORDER_DATA_V1, encDataLeft);
            const right = Order(account1.address, Asset(ERC20, enc(t1.address), 100), ZERO_ADDRESS, Asset(ERC1155, enc(testERC1155_V1.address, erc1155TokenId1), 7), 1, 0, 0, ORDER_DATA_V1, encDataRight);
            return { left, right }
        }

        it("From ETH(DataV1) to ERC721(RoyV1, DataV1) Protocol, Royalties", async () => {
            await luxy721.mint(account1.address, 'TERERE', []);
            await luxy721.connect(account1).setApprovalForAll(transferProxy.address, true);

            let encDataLeft = await encDataV1([[[account2.address, 10000]]]);
            let encDataRight = await encDataV1([[[account1.address, 10000]]]);
            await royaltiesRegistry.setRoyaltiesByToken(luxy721.address, [[owner.address, 300], [owner2.address, 400]]); //set royalties by token
            const left = Order(account2.address, Asset(ETH, "0x", 200), ZERO_ADDRESS, Asset(ERC721, enc(luxy721.address, 0), 1), 1, 0, 0, ORDER_DATA_V1, encDataLeft);
            const right = Order(account1.address, Asset(ERC721, enc(luxy721.address, 0), 1), ZERO_ADDRESS, Asset(ETH, "0x", 200), 1, 0, 0, ORDER_DATA_V1, encDataRight);
            let signatureRight = await getSignature(right, account1.address);
            const beforeProtocol = new BN(await web3.eth.getBalance(protocol));
            await expect(await testing.connect(account2).matchOrders(left, "0x", right, signatureRight, { value: 300, gasPrice: 20 }))
                .to.changeEtherBalances([account2, account1, owner, owner2], [-204, 182, 6, 8]);
            const afterProtocol = new BN(await web3.eth.getBalance(protocol));
            expect(afterProtocol.sub(beforeProtocol).toString()).to.equal("8");
            expect(await luxy721.balanceOf(account1.address)).to.equal(0);
            expect(await luxy721.balanceOf(account2.address)).to.equal(1);
        })

        it("From ETH(DataV1) to ERC721(DataV1) Protocol, no Royalties", async () => {
            await erc721Token.mint(account1.address, erc721TokenId1);
            await erc721Token.connect(account1).setApprovalForAll(transferProxy.address, true);

            let encDataLeft = await encDataV1([[[account2.address, 10000]]]);
            let encDataRight = await encDataV1([[[account1.address, 10000]]]);

            const left = Order(account2.address, Asset(ETH, "0x", 200), ZERO_ADDRESS, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), 1, 0, 0, ORDER_DATA_V1, encDataLeft);
            const right = Order(account1.address, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), ZERO_ADDRESS, Asset(ETH, "0x", 200), 1, 0, 0, ORDER_DATA_V1, encDataRight);
            let signatureRight = await getSignature(right, account1.address);
            const beforeProtocol = new BN(await web3.eth.getBalance(protocol));
            await expect(await testing.connect(account2).matchOrders(left, "0x", right, signatureRight, { value: 300, gasPrice: 20 }))
                .to.changeEtherBalances([account2, account1], [-204, 196]);
            const afterProtocol = new BN(await web3.eth.getBalance(protocol));
            expect(afterProtocol.sub(beforeProtocol).toString()).to.equal("8");
            expect(await erc721Token.balanceOf(account1.address)).to.equal(0);
            expect(await erc721Token.balanceOf(account2.address)).to.equal(1);
        })


    });

    context("Catch emit event Transfer", () => {
        it("From ETH(DataV1) to ERC721(DataV1) Protocol, check emit ", async () => {
            const seller = account0;
            const sellerRoyaltiy = owner;
            const seller2 = account1;
            const buyer = account2;

            await luxy721.mint(seller.address, 'TERERE', [[sellerRoyaltiy.address, 1000]]);
            await luxy721.connect(seller).setApprovalForAll(transferProxy.address, true);

            let encDataLeft = await encDataV1([[[buyer.address, 10000]]]);
            let encDataRight = await encDataV1([[[seller.address, 5000], [seller2.address, 5000]]]);

            const left = Order(buyer.address, Asset(ETH, "0x", 200), ZERO_ADDRESS, Asset(ERC721, enc(luxy721.address, 0), 1), 1, 0, 0, ORDER_DATA_V1, encDataLeft);
            const right = Order(seller.address, Asset(ERC721, enc(luxy721.address, 0), 1), ZERO_ADDRESS, Asset(ETH, "0x", 200), 1, 0, 0, ORDER_DATA_V1, encDataRight);
            let signatureRight = await getSignature(right, seller.address);
            let tx = await testing.connect(buyer).matchOrders(left, "0x", right, signatureRight, { value: 300, gasPrice: 20 });
            tx_receipt = await tx.wait();
            let errorCounter = 0
            for (let i = 0; i < tx_receipt.events.length; i++) {
                ev = tx_receipt.events[i];
                if (ev.event == "Transfer") {
                    switch (ev.args.to) {

                        case protocol:
                            if ((ev.args.transferDirection != TO_TAKER) && (ev.args.transferType != PROTOCOL)) {
                                console.log("Error in protocol check:");
                                errorCounter++;
                            }
                            break;
                        case seller.address:
                            if ((ev.args.transferDirection != TO_TAKER) && (ev.args.transferType != PAYOUT)) {
                                console.log("Error in seller check:");
                                errorCounter++;
                            }
                            break
                        case sellerRoyaltiy.address:
                            if ((ev.args.transferDirection != TO_TAKER) && (ev.args.transferType != ROYALTY)) {
                                console.log("Error in seller check:");
                                errorCounter++;
                            }
                            break
                        case seller2.address:
                            if ((ev.args.transferDirection != TO_TAKER) && (ev.args.transferType != PAYOUT)) {
                                console.log("Error in seller2 check:");
                                errorCounter++;
                            }
                            break
                        case buyer.address:
                            if ((ev.args.transferDirection != TO_MAKER) && (ev.args.transferType != PAYOUT)) {
                                console.log("Error in buyer check:");
                                errorCounter++;
                            }
                            break
                    }

                }
            }
            expect(errorCounter).to.equal(0);

        })

        it("From ERC1155(DataV1) to ETH(DataV1) Protocol, check emit ", async () => {
            const seller = account1;
            const sellerRoyaltiy = owner;
            const seller2 = owner2;
            const buyer = owner3;

            await luxy1155.mint(seller.address, 10, [[sellerRoyaltiy.address, 1000]], '');
            await luxy1155.connect(seller).setApprovalForAll(transferProxy.address, true);

            let encDataLeft = await encDataV1([[[seller.address, 5000], [seller2.address, 5000]]]);
            let encDataRight = await encDataV1([[[buyer.address, 10000]]]);

            const left = Order(seller.address, Asset(ERC1155, enc(luxy1155.address, 0), 5), ZERO_ADDRESS, Asset(ETH, "0x", 200), 1, 0, 0, ORDER_DATA_V1, encDataLeft);
            const right = Order(buyer.address, Asset(ETH, "0x", 200), ZERO_ADDRESS, Asset(ERC1155, enc(luxy1155.address, 0), 5), 1, 0, 0, ORDER_DATA_V1, encDataRight);

            let signatureRight = await getSignature(right, buyer.address);
            let tx = await testing.connect(seller).matchOrders(left, "0x", right, signatureRight, { value: 300, gasPrice: 20 });
            tx_receipt = await tx.wait();
            let errorCounter = 0
            for (let i = 0; i < tx_receipt.events.length; i++) {
                ev = tx_receipt.events[i];
                if (ev.event == "Transfer") {
                    switch (ev.args.to) {

                        case protocol:
                            if ((ev.args.transferDirection != TO_MAKER) && (ev.args.transferType != PROTOCOL)) {
                                console.log("Error in protocol check:");
                                errorCounter++;
                            }
                            break;
                        case seller.address:
                            if ((ev.args.transferDirection != TO_MAKER) && (ev.args.transferType != PAYOUT)) {
                                console.log("Error in seller check:");
                                errorCounter++;
                            }
                            break
                        case sellerRoyaltiy.address:
                            if ((ev.args.transferDirection != TO_MAKER) && (ev.args.transferType != ROYALTY)) {
                                console.log("Error in seller check:");
                                errorCounter++;
                            }
                            break
                        case seller2.address:
                            if ((ev.args.transferDirection != TO_MAKER) && (ev.args.transferType != PAYOUT)) {
                                console.log("Error in seller2 check:");
                                errorCounter++;
                            }
                            break
                        case buyer.address:
                            if ((ev.args.transferDirection != TO_TAKER) && (ev.args.transferType != PAYOUT)) {
                                console.log("Error in buyer check:");
                                errorCounter++;
                            }
                            break
                    }

                }
            }
            expect(errorCounter).to.equal(0);
        })




    });

    context("Exchange with Royalties", () => {
        it("Royalties by owner, token 721 to ETH", async () => {
            await erc721Token.mint(account1.address, erc721TokenId1);
            await erc721Token.connect(account1).setApprovalForAll(transferProxy.address, true);
            await royaltiesRegistry.setRoyaltiesByToken(erc721Token.address, [[owner3.address, 500], [owner4.address, 1000]]); //set royalties by token


            let encDataLeft = await encDataV1([[[account2.address, 10000]]]);
            let encDataRight = await encDataV1([[[account1.address, 10000]]]);

            const left = Order(account2.address, Asset(ETH, "0x", 200), ZERO_ADDRESS, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), 1, 0, 0, ORDER_DATA_V1, encDataLeft);
            const right = Order(account1.address, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), ZERO_ADDRESS, Asset(ETH, "0x", 200), 1, 0, 0, ORDER_DATA_V1, encDataRight);
            let signatureRight = await getSignature(right, account1.address);
            const beforeProtocol = new BN(await web3.eth.getBalance(protocol));
            await expect(await testing.connect(account2).matchOrders(left, "0x", right, signatureRight, { value: 300, gasPrice: 20 }))
                .to.changeEtherBalances([account2, account1, owner3, owner4], [-204, 166, 10, 20]);
            const afterProtocol = new BN(await web3.eth.getBalance(protocol));
            expect(afterProtocol.sub(beforeProtocol).toString()).to.equal("8");
            expect(await erc721Token.balanceOf(account1.address)).to.equal(0);
            expect(await erc721Token.balanceOf(account2.address)).to.equal(1);

        })


    });

    context("Exchange with NFTHolders discount", () => {
        it("Checking NFTHOlder discount -- maker side", async () => {
            await erc721Token.mint(account1.address, erc721TokenId1);
            await erc721Token.connect(account1).setApprovalForAll(transferProxy.address, true);
            await luxy721.mint(account1.address, 'TERERE', []);
            await testing.setNFTHolder(luxy721.address, 0);
            await royaltiesRegistry.setRoyaltiesByToken(erc721Token.address, []); //set royalties by token
            const left = Order(account2.address, Asset(ETH, "0x", 200), ZERO_ADDRESS, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), 1, 0, 0, "0xffffffff", "0x");
            const right = Order(account1.address, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), ZERO_ADDRESS, Asset(ETH, "0x", 200), 1, 0, 0, "0xffffffff", "0x");
            let signatureRight = await getSignature(right, account1.address);
            const beforeProtocol = new BN(await web3.eth.getBalance(protocol));
            await expect(await testing.connect(account2).matchOrders(left, "0x", right, signatureRight, { value: 300, gasPrice: 20 }))
                .to.changeEtherBalances([account2, account1], [-204, 200]);
            const afterProtocol = new BN(await web3.eth.getBalance(protocol));
            expect(afterProtocol.sub(beforeProtocol).toString()).to.equal("4");
            expect(await erc721Token.balanceOf(account1.address)).to.equal(0);
            expect(await erc721Token.balanceOf(account2.address)).to.equal(1)


        })
        it("Checking NFTHOlder discount -- taker side", async () => {
            await erc721Token.mint(account1.address, erc721TokenId1);
            await erc721Token.connect(account1).setApprovalForAll(transferProxy.address, true);
            await luxy721.mint(account2.address, 'TERERE', []);
            await testing.setNFTHolder(luxy721.address, 0);
            await royaltiesRegistry.setRoyaltiesByToken(erc721Token.address, []); //set royalties by token
            const left = Order(account2.address, Asset(ETH, "0x", 200), ZERO_ADDRESS, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), 1, 0, 0, "0xffffffff", "0x");
            const right = Order(account1.address, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), ZERO_ADDRESS, Asset(ETH, "0x", 200), 1, 0, 0, "0xffffffff", "0x");
            let signatureRight = await getSignature(right, account1.address);
            const beforeProtocol = new BN(await web3.eth.getBalance(protocol));
            await expect(await testing.connect(account2).matchOrders(left, "0x", right, signatureRight, { value: 300, gasPrice: 20 }))
                .to.changeEtherBalances([account2, account1], [-200, 196]);
            const afterProtocol = new BN(await web3.eth.getBalance(protocol));
            expect(afterProtocol.sub(beforeProtocol).toString()).to.equal("4");
            expect(await erc721Token.balanceOf(account1.address)).to.equal(0);
            expect(await erc721Token.balanceOf(account2.address)).to.equal(1)


        })
    })

    context("Exchange with NFTHolders discount", () => {
        it("Revert must set tier token first", async () => {
            await expectRevert(
                testing.setTiers([[100, 150], [1000, 120], [10000, 100], [100000, 0]]),
                "You must first set address of the tierToken at setTierToken"
            );

        })
        it("Checking Tiers discount -- maker side", async () => {
            await erc721Token.mint(account1.address, erc721TokenId1);
            await erc721Token.connect(account1).setApprovalForAll(transferProxy.address, true);
            await royaltiesRegistry.setRoyaltiesByToken(erc721Token.address, []); //set royalties by token
            await t1.mint(account1.address, 100);
            await testing.setTierToken(t1.address);
            testing.setTiers([[100, 150], [1000, 120], [10000, 100], [100000, 0]]);
            const left = Order(account2.address, Asset(ETH, "0x", 200), ZERO_ADDRESS, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), 1, 0, 0, "0xffffffff", "0x");
            const right = Order(account1.address, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), ZERO_ADDRESS, Asset(ETH, "0x", 200), 1, 0, 0, "0xffffffff", "0x");
            let signatureRight = await getSignature(right, account1.address);
            const beforeProtocol = new BN(await web3.eth.getBalance(protocol));
            await expect(await testing.connect(account2).matchOrders(left, "0x", right, signatureRight, { value: 300, gasPrice: 20 }))
                .to.changeEtherBalances([account2, account1], [-204, 197]);
            const afterProtocol = new BN(await web3.eth.getBalance(protocol));
            expect(afterProtocol.sub(beforeProtocol).toString()).to.equal("7");
            expect(await erc721Token.balanceOf(account1.address)).to.equal(0);
            expect(await erc721Token.balanceOf(account2.address)).to.equal(1)

        })
        it("Checking Tiers discount -- taker side", async () => {
            await erc721Token.mint(account1.address, erc721TokenId1);
            await erc721Token.connect(account1).setApprovalForAll(transferProxy.address, true);
            await royaltiesRegistry.setRoyaltiesByToken(erc721Token.address, []); //set royalties by token
            await t1.mint(account2.address, 10000);
            await testing.setTierToken(t1.address);
            testing.setTiers([[100, 150], [1000, 120], [10000, 100], [100000, 0]]);
            const left = Order(account2.address, Asset(ETH, "0x", 200), ZERO_ADDRESS, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), 1, 0, 0, "0xffffffff", "0x");
            const right = Order(account1.address, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), ZERO_ADDRESS, Asset(ETH, "0x", 200), 1, 0, 0, "0xffffffff", "0x");
            let signatureRight = await getSignature(right, account1.address);
            const beforeProtocol = new BN(await web3.eth.getBalance(protocol));
            await expect(await testing.connect(account2).matchOrders(left, "0x", right, signatureRight, { value: 300, gasPrice: 20 }))
                .to.changeEtherBalances([account2, account1], [-202, 196]);
            const afterProtocol = new BN(await web3.eth.getBalance(protocol));
            expect(afterProtocol.sub(beforeProtocol).toString()).to.equal("6");
            expect(await erc721Token.balanceOf(account1.address)).to.equal(0);
            expect(await erc721Token.balanceOf(account2.address)).to.equal(1)

        })
        it("Checking Tiers discount -- both sides", async () => {
            await erc721Token.mint(account1.address, erc721TokenId1);
            await erc721Token.connect(account1).setApprovalForAll(transferProxy.address, true);
            await royaltiesRegistry.setRoyaltiesByToken(erc721Token.address, []); //set royalties by token
            await t1.mint(account2.address, '10000000000000000000000');
            await t1.mint(account1.address, '22000000000000000000000');
            await testing.setTierToken(t1.address);
            testing.setTiers([['1000000000000000000', 150], ['9000000000000000000', 120], ['10000000000000000000000', 100], ['20000000000000000000000', 0]]);
            const left = Order(account2.address, Asset(ETH, "0x", 200), ZERO_ADDRESS, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), 1, 0, 0, "0xffffffff", "0x");
            const right = Order(account1.address, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), ZERO_ADDRESS, Asset(ETH, "0x", 200), 1, 0, 0, "0xffffffff", "0x");
            let signatureRight = await getSignature(right, account1.address);
            const beforeProtocol = new BN(await web3.eth.getBalance(protocol));
            await expect(await testing.connect(account2).matchOrders(left, "0x", right, signatureRight, { value: 300, gasPrice: 20 }))
                .to.changeEtherBalances([account2, account1], [-202, 200]);
            const afterProtocol = new BN(await web3.eth.getBalance(protocol));
            expect(afterProtocol.sub(beforeProtocol).toString()).to.equal("2");
            expect(await erc721Token.balanceOf(account1.address)).to.equal(0);
            expect(await erc721Token.balanceOf(account2.address)).to.equal(1)
            testing.setTiers([['10000000000000000000000', 175], ['25000000000000000000000', 150], ['50000000000000000000000', 125], ['125000000000000000000000', 75], ['250000000000000000000000', 25]]);
        })

        it("Checking Tiers discount -- luxy case1", async () => {
            await erc721Token.mint(account1.address, erc721TokenId1);
            await erc721Token.connect(account1).setApprovalForAll(transferProxy.address, true);
            await royaltiesRegistry.setRoyaltiesByToken(erc721Token.address, []); //set royalties by token
            await t1.mint(account2.address, '10000000000000000000000');
            await t1.mint(account1.address, '26000000000000000000000');
            await testing.setTierToken(t1.address);
            testing.setTiers([['10000000000000000000000', 175], ['25000000000000000000000', 150], ['50000000000000000000000', 125], ['125000000000000000000000', 75], ['250000000000000000000000', 25]]);
            const left = Order(account2.address, Asset(ETH, "0x", 2000), ZERO_ADDRESS, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), 1, 0, 0, "0xffffffff", "0x");
            const right = Order(account1.address, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), ZERO_ADDRESS, Asset(ETH, "0x", 2000), 1, 0, 0, "0xffffffff", "0x");
            let signatureRight = await getSignature(right, account1.address);
            const beforeProtocol = new BN(await web3.eth.getBalance(protocol));
            await expect(await testing.connect(account2).matchOrders(left, "0x", right, signatureRight, { value: 3000, gasPrice: 20 }))
                .to.changeEtherBalances([account2, account1], [-2035, 1970]);
            const afterProtocol = new BN(await web3.eth.getBalance(protocol));
            expect(afterProtocol.sub(beforeProtocol).toString()).to.equal("65");
            expect(await erc721Token.balanceOf(account1.address)).to.equal(0);
            expect(await erc721Token.balanceOf(account2.address)).to.equal(1)
            
        })
        it("Checking Tiers discount -- luxy case 2", async () => {
            await erc721Token.mint(account1.address, erc721TokenId1);
            await erc721Token.connect(account1).setApprovalForAll(transferProxy.address, true);
            await royaltiesRegistry.setRoyaltiesByToken(erc721Token.address, []); //set royalties by token
            await t1.mint(account2.address, '125000000000000000000000');
            await t1.mint(account1.address, '250000000000000000000000');
            await testing.setTierToken(t1.address);
            testing.setTiers([['10000000000000000000000', 175], ['25000000000000000000000', 150], ['50000000000000000000000', 125], ['125000000000000000000000', 75], ['250000000000000000000000', 25]]);
            const left = Order(account2.address, Asset(ETH, "0x", 2000), ZERO_ADDRESS, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), 1, 0, 0, "0xffffffff", "0x");
            const right = Order(account1.address, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), ZERO_ADDRESS, Asset(ETH, "0x", 2000), 1, 0, 0, "0xffffffff", "0x");
            let signatureRight = await getSignature(right, account1.address);
            const beforeProtocol = new BN(await web3.eth.getBalance(protocol));
            await expect(await testing.connect(account2).matchOrders(left, "0x", right, signatureRight, { value: 3000, gasPrice: 20 }))
                .to.changeEtherBalances([account2, account1], [-2015, 1995]);
            const afterProtocol = new BN(await web3.eth.getBalance(protocol));
            expect(afterProtocol.sub(beforeProtocol).toString()).to.equal("20");
            expect(await erc721Token.balanceOf(account1.address)).to.equal(0);
            expect(await erc721Token.balanceOf(account2.address)).to.equal(1)
        })

    })
    context("With burning active", () => {
        beforeEach(async () => {
            await testing.setBurnMode(true);

        })
        it("From ETH(DataV1) to ERC721(RoyV1, DataV1) Protocol, Royalties", async () => {
            await luxy721.mint(account1.address, 'TERERE', []);
            await luxy721.connect(account1).setApprovalForAll(transferProxy.address, true);
            let encDataLeft = await encDataV1([[[account2.address, 10000]]]);
            let encDataRight = await encDataV1([[[account1.address, 10000]]]);
            await royaltiesRegistry.setRoyaltiesByToken(luxy721.address, [[owner.address, 300], [owner2.address, 400]]); //set royalties by token
            const left = Order(account2.address, Asset(ETH, "0x", 2000), ZERO_ADDRESS, Asset(ERC721, enc(luxy721.address, 0), 1), 1, 0, 0, ORDER_DATA_V1, encDataLeft);
            const right = Order(account1.address, Asset(ERC721, enc(luxy721.address, 0), 1), ZERO_ADDRESS, Asset(ETH, "0x", 2000), 1, 0, 0, ORDER_DATA_V1, encDataRight);
            let signatureRight = await getSignature(right, account1.address);
            const beforeProtocol = new BN(await web3.eth.getBalance(protocol));
            const beforeFeeWallet = new BN(await web3.eth.getBalance(feeWallet));
            const beforeBurning = new BN(await web3.eth.getBalance(burning));
            await expect(await testing.connect(account2).matchOrders(left, "0x", right, signatureRight, { value: 3000, gasPrice: 20 }))
                .to.changeEtherBalances([account2, account1, owner, owner2], [-2040, 1820, 60, 80]);
            const afterProtocol = new BN(await web3.eth.getBalance(protocol));
            const afterFeeWallet = new BN(await web3.eth.getBalance(feeWallet));
            const afterBurning = new BN(await web3.eth.getBalance(burning));
            expect(afterProtocol.sub(beforeProtocol).toString()).to.equal("0");
            expect(afterFeeWallet.sub(beforeFeeWallet).toString()).to.equal("72");
            expect(afterBurning.sub(beforeBurning).toString()).to.equal("8");
            expect(await luxy721.balanceOf(account1.address)).to.equal(0);
            expect(await luxy721.balanceOf(account2.address)).to.equal(1);
        })

        it("From ETH(DataV1) to ERC721(DataV1) Protocol, no Royalties", async () => {
            await erc721Token.mint(account1.address, erc721TokenId1);
            await erc721Token.connect(account1).setApprovalForAll(transferProxy.address, true);

            let encDataLeft = await encDataV1([[[account2.address, 10000]]]);
            let encDataRight = await encDataV1([[[account1.address, 10000]]]);

            const left = Order(account2.address, Asset(ETH, "0x", 2000), ZERO_ADDRESS, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), 1, 0, 0, ORDER_DATA_V1, encDataLeft);
            const right = Order(account1.address, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), ZERO_ADDRESS, Asset(ETH, "0x", 2000), 1, 0, 0, ORDER_DATA_V1, encDataRight);
            let signatureRight = await getSignature(right, account1.address);
            const beforeProtocol = new BN(await web3.eth.getBalance(protocol));
            const beforeFeeWallet = new BN(await web3.eth.getBalance(feeWallet));
            const beforeBurning = new BN(await web3.eth.getBalance(burning));
            await expect(await testing.connect(account2).matchOrders(left, "0x", right, signatureRight, { value: 3000, gasPrice: 20 }))
                .to.changeEtherBalances([account2, account1], [-2040, 1960]);
            const afterProtocol = new BN(await web3.eth.getBalance(protocol));
            const afterFeeWallet = new BN(await web3.eth.getBalance(feeWallet));
            const afterBurning = new BN(await web3.eth.getBalance(burning));
            expect(afterProtocol.sub(beforeProtocol).toString()).to.equal("0");
            expect(afterFeeWallet.sub(beforeFeeWallet).toString()).to.equal("72");
            expect(afterBurning.sub(beforeBurning).toString()).to.equal("8");
            expect(await erc721Token.balanceOf(account1.address)).to.equal(0);
            expect(await erc721Token.balanceOf(account2.address)).to.equal(1);
        })

        it("From ERC20(DataV1) to ERC1155(RoyV1, DataV1) Protocol, Royalties ", async () => {
            const { left, right } = await prepare20DV1_1155V1Orders()

            await testing.connect(account2).matchOrders(left, await getSignature(left, account1.address), right, "0x");

            expect(await testing.fills(await libOrder.hashKey(left))).to.equal(7);

            expect(await t1.balanceOf(account1.address)).to.equal(1800);
            expect(await t1.balanceOf(account2.address)).to.equal(8300);
            expect(await t1.balanceOf(accounts[6])).to.equal(1000);
            expect(await t1.balanceOf(accounts[7])).to.equal(500);
            expect(await testERC1155_V1.balanceOf(account1.address, erc1155TokenId1)).to.equal(7);
            expect(await testERC1155_V1.balanceOf(account2.address, erc1155TokenId1)).to.equal(3);
            expect(await t1.balanceOf(feeWallet)).to.equal(360);
            expect(await t1.balanceOf(burning)).to.equal(40);
        })

        async function prepare20DV1_1155V1Orders(t1Amount = 12000, t2Amount = 10) {
            await t1.mint(account1.address, t1Amount);
            await testERC1155_V1.mint(account2.address, erc1155TokenId1, [], t2Amount);
            await t1.connect(account1).approve(erc20TransferProxy.address, 10000000);
            await testERC1155_V1.connect(account2).setApprovalForAll(transferProxy.address, true);


            let encDataLeft = await encDataV1([[[account1.address, 10000]]]);
            let encDataRight = await encDataV1([[[account2.address, 10000]]]);

            await royaltiesRegistry.setRoyaltiesByToken(testERC1155_V1.address, [[accounts[6], 1000], [accounts[7], 500]]); //set royalties by token
            const left = Order(account1.address, Asset(ERC20, enc(t1.address), 10000), ZERO_ADDRESS, Asset(ERC1155, enc(testERC1155_V1.address, erc1155TokenId1), 7), 1, 0, 0, ORDER_DATA_V1, encDataLeft);
            const right = Order(account2.address, Asset(ERC1155, enc(testERC1155_V1.address, erc1155TokenId1), 7), ZERO_ADDRESS, Asset(ERC20, enc(t1.address), 10000), 1, 0, 0, ORDER_DATA_V1, encDataRight);
            return { left, right }
        }

        it("From ERC1155(RoyV1, DataV1) to ERC20(DataV1):Protocol, Royalties ", async () => {
            const { left, right } = await prepare1155V1_20DV1Orders()

            await testing.connect(account1).matchOrders(left, await getSignature(left, account2.address), right, "0x");

            expect(await testing.fills(await libOrder.hashKey(left))).to.equal(11040);

            expect(await t1.balanceOf(account1.address)).to.equal(740);
            expect(await t1.balanceOf(account2.address)).to.equal(9163);
            expect(await t1.balanceOf(accounts[6])).to.equal(1104);
            expect(await t1.balanceOf(accounts[7])).to.equal(552);
            expect(await testERC1155_V1.balanceOf(account1.address, erc1155TokenId1)).to.equal(7);
            expect(await testERC1155_V1.balanceOf(account2.address, erc1155TokenId1)).to.equal(3);
            expect(await t1.balanceOf(feeWallet)).to.equal(397);
            expect(await t1.balanceOf(burning)).to.equal(44);
        })

        async function prepare1155V1_20DV1Orders(t1Amount = 12000, t2Amount = 10, isFullBurning = false) {
            await testERC1155_V1.mint(account2.address, erc1155TokenId1, [], t2Amount);
            if (isFullBurning) {
                await t3.mint(account1.address, t1Amount);
            }
            else {
                await t1.mint(account1.address, t1Amount);
            }
            await testERC1155_V1.connect(account2).setApprovalForAll(transferProxy.address, true);
            if (isFullBurning) {
                await t3.connect(account1).approve(erc20TransferProxy.address, 10000000);
            }
            else {
                await t1.connect(account1).approve(erc20TransferProxy.address, 10000000);
            }

            let encDataLeft = await encDataV1([[[account2.address, 10000]]]);
            let encDataRight = await encDataV1([[[account1.address, 10000]]]);

            await royaltiesRegistry.setRoyaltiesByToken(testERC1155_V1.address, [[accounts[6], 1000], [accounts[7], 500]]); //set royalties by token
            if (isFullBurning) {
                const left = Order(account2.address, Asset(ERC1155, enc(testERC1155_V1.address, erc1155TokenId1), 7), ZERO_ADDRESS, Asset(ERC20, enc(t3.address), 11040), 1, 0, 0, ORDER_DATA_V1, encDataLeft);
                const right = Order(account1.address, Asset(ERC20, enc(t3.address), 11040), ZERO_ADDRESS, Asset(ERC1155, enc(testERC1155_V1.address, erc1155TokenId1), 7), 1, 0, 0, ORDER_DATA_V1, encDataRight);
                return { left, right }
            }
            const left = Order(account2.address, Asset(ERC1155, enc(testERC1155_V1.address, erc1155TokenId1), 7), ZERO_ADDRESS, Asset(ERC20, enc(t1.address), 11040), 1, 0, 0, ORDER_DATA_V1, encDataLeft);
            const right = Order(account1.address, Asset(ERC20, enc(t1.address), 11040), ZERO_ADDRESS, Asset(ERC1155, enc(testERC1155_V1.address, erc1155TokenId1), 7), 1, 0, 0, ORDER_DATA_V1, encDataRight);
            return { left, right }
        }

        it("From ERC1155(RoyV1, DataV1) to ERC20FullBurn(DataV1):Protocol, Royalties ", async () => {
            const { left, right } = await prepare1155V1_20DV1Orders(12000, 10, true)

            await testing.connect(account1).matchOrders(left, await getSignature(left, account2.address), right, "0x");

            expect(await testing.fills(await libOrder.hashKey(left))).to.equal(11040);

            expect(await t3.balanceOf(account1.address)).to.equal(740);
            expect(await t3.balanceOf(account2.address)).to.equal(9163);
            expect(await t3.balanceOf(accounts[6])).to.equal(1104);
            expect(await t3.balanceOf(accounts[7])).to.equal(552);
            expect(await testERC1155_V1.balanceOf(account1.address, erc1155TokenId1)).to.equal(7);
            expect(await testERC1155_V1.balanceOf(account2.address, erc1155TokenId1)).to.equal(3);
            expect(await t3.balanceOf(feeWallet)).to.equal(0);
            expect(await t3.balanceOf(burning)).to.equal(441);
        })

    })

    function encDataV1(tuple) {
        return luxyTransferManager.encode(tuple);
    }

    async function getSignature(order, signer) {
        return sign('LuxyValidator', '1', order, signer, testing.address);
    }


});