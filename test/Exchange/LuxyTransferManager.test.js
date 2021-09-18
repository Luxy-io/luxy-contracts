const { Order, Asset, sign } = require("../order");
const EIP712 = require("../EIP712");
const { BN, constants, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ZERO_ADDRESS } = constants;
const { ETH, ERC20, ERC721, ERC1155, ORDER_DATA_V1, enc, id } = require("../assets");
const eth = "0x0000000000000000000000000000000000000000";
describe ('LuxyTransferManager:doTransferTest()', function(){ 
    let erc721TokenId0 = 52;
	let erc721TokenId1 = 53;
	let erc1155TokenId1 = 54;
	let erc1155TokenId2 = 55;
    beforeEach(async () => {
        accounts = await ethers.provider.listAccounts();
        community = accounts[8];
        protocol = accounts[9];
        [account0 ,account1, account2, owner, owner2, owner3] = await ethers.getSigners();
		const TransferProxyTest = await ethers.getContractFactory('TransferProxyTest');
		const ERC20TransferProxyTest = await ethers.getContractFactory('ERC20TransferProxyTest');
        const TestERC20 = await ethers.getContractFactory('TestERC20');
        const TestERC721 = await ethers.getContractFactory('TestERC721');
        const TestERC1155 = await ethers.getContractFactory('TestERC1155');
        const LuxyTransferManager = await ethers.getContractFactory('LuxyTransferManagerTest');
		// royaltiesRegistry = await TestRoyaltiesRegistry.new();
        transferProxy = await TransferProxyTest.deploy();
        erc20TransferProxy = await ERC20TransferProxyTest.deploy();
        // erc20Token = await TestERC20.deploy();
        t1 = await upgrades.deployProxy(
            TestERC20,
            ['SuperThom', 'THOM'],
            {initializer: '__TestERC20_init'}
        );
        await t1.deployed();
        t2 = await upgrades.deployProxy(
            TestERC20,
            ['SuperKaue', 'KAUE'],
            {initializer: '__TestERC20_init'}
        );
        await t2.deployed();
        erc721Token = await upgrades.deployProxy(
            TestERC721,
            ['SuperNina', 'NINA'],
            {initializer: '__TestERC721_init'}
        );
        await erc721Token.deployed();

        erc1155Token = await upgrades.deployProxy(
            TestERC1155,
            [''],
            {initializer: '__TestERC1155_init'}
        );
        await erc1155Token.deployed();
        testing = await upgrades.deployProxy(
            LuxyTransferManager,
            [transferProxy.address, erc20TransferProxy.address, 200, community],
            {initializer: '__TransferManager_init'}
        );
        await testing.deployed();
		await testing.setFeeReceiver(t1.address, protocol);//
        /*ETH*/
        await testing.setFeeReceiver(eth, protocol);//
        
        
    });
    context('Without Royalties test', function(){ 
        // it("should support ETH transfers", async () => {
        //     expect(await testing.checkFeeReceiver(eth)).to.equal(protocol);
        //     const { left, right } = await prepareETH_1155Orders(10)
        //     const beforeOwner = new BN(await web3.eth.getBalance(owner.address));
        //     const beforeSpender = new BN(await web3.eth.getBalance(account0.address));
        //     const beforeProtocol = new BN(await web3.eth.getBalance(protocol));
        //     await testing.connect(account0).checkDoTransfers(left.makeAsset.assetType, left.takeAsset.assetType, [100, 7], left, right,
        //     	{value: 102, gasPrice:10}
        //         );
        //         const afterOwner = new BN(await web3.eth.getBalance(owner.address));
        //         const afterSpender = new BN(await web3.eth.getBalance(account0.address));
        //         const afterProtocol = new BN(await web3.eth.getBalance(protocol));
        //         expect(afterOwner.sub(beforeOwner).toString()).to.equal("98");
        //         expect(afterProtocol.sub(beforeProtocol).toString()).to.equal("4");
        //         expect(afterSpender.sub(beforeSpender).toString()).to.equal("-1417613"); //including gas costs
        //         expect(await erc1155Token.balanceOf(account0.address,erc1155TokenId1)).to.equal(7);
        //         expect(await erc1155Token.balanceOf(owner.address,erc1155TokenId1)).to.equal(3);
        //     });

        //     async function prepareETH_1155Orders(t2Amount = 10) {
        //         await erc1155Token.mint(owner.address, erc1155TokenId1, t2Amount);
        //         await erc1155Token.connect(owner).setApprovalForAll(transferProxy.address, true);
                
        //         const left = Order(account0.address, Asset(ETH, "0x", 100), ZERO_ADDRESS, Asset(ERC1155, enc(erc1155Token.address, erc1155TokenId1), 7), 1, 0, 0, "0xffffffff", "0x");
        //         const right = Order(owner.address, Asset(ERC1155, enc(erc1155Token.address, erc1155TokenId1), 7), ZERO_ADDRESS, Asset(ETH, "0x", 100), 1, 0, 0, "0xffffffff", "0x");
        //         return { left, right }
        //     }

        //     it("Transfer from ERC721 to ERC721", async () => {
		// 	const { left, right } = await prepare721_721Orders()

		// 	await testing.checkDoTransfers(left.makeAsset.assetType, left.takeAsset.assetType, [1, 1], left, right);

        //     expect(await erc721Token.ownerOf(erc721TokenId1)).to.equal(owner2.address);
        //     expect(await erc721Token.ownerOf(erc721TokenId0)).to.equal(owner.address);
		// })

        // async function prepare721_721Orders() {
        //     await erc721Token.mint(owner.address, erc721TokenId1);
        //     await erc721Token.mint(owner2.address, erc721TokenId0);
        //     await erc721Token.connect(owner).setApprovalForAll(transferProxy.address, true);
        //     await erc721Token.connect(owner2).setApprovalForAll(transferProxy.address, true);
        //     let data = await encDataV1([ [], []]);
        //     const left = Order(owner.address, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), ZERO_ADDRESS, Asset(ERC721, enc(erc721Token.address, erc721TokenId0), 1), 1, 0, 0, ORDER_DATA_V1, data);
        //     const right = Order(owner2.address, Asset(ERC721, enc(erc721Token.address, erc721TokenId0), 1), ZERO_ADDRESS, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), 1, 0, 0, ORDER_DATA_V1, data);
        //     return { left, right }
        // }

        it("Transfer from ERC721 to ERC1155, (buyerFee2.0%, sallerFee2.0% = 5%) of ERC1155 transfer to community, orders dataType == V1", async () => {
			const { left, right } = await prepare721_1155Orders(110)

			await testing.checkDoTransfers(left.makeAsset.assetType, left.takeAsset.assetType, [1, 100], left, right);

            expect(await erc721Token.balanceOf(account1.address)).to.equal(0);
			expect(await erc721Token.balanceOf(account2.address)).to.equal(1);
			expect(await erc1155Token.balanceOf(account1.address, erc1155TokenId1)).to.equal(94);
            expect(await erc1155Token.balanceOf(account2.address, erc1155TokenId1)).to.equal(2);
            expect(await erc1155Token.balanceOf(accounts[3], erc1155TokenId1)).to.equal(1);
            expect(await erc1155Token.balanceOf(accounts[5], erc1155TokenId1)).to.equal(3);
            expect(await erc1155Token.balanceOf(accounts[4], erc1155TokenId1)).to.equal(2);
            expect(await erc1155Token.balanceOf(accounts[6], erc1155TokenId1)).to.equal(4);
            expect(await erc1155Token.balanceOf(community, erc1155TokenId1)).to.equal(4);
		})

        async function prepare721_1155Orders(t2Amount = 105) {
            await erc721Token.mint(account1.address, erc721TokenId1);
            await erc1155Token.mint(account2.address, erc1155TokenId1, t2Amount);
            await erc721Token.connect(account1).setApprovalForAll(transferProxy.address, true);
            await erc1155Token.connect(account2).setApprovalForAll(transferProxy.address, true);
            /*in this: accounts[3] - address originLeftOrder, 100 - originLeftOrderFee(bp%)*/
            let addrOriginLeft = [[accounts[3], 100], [accounts[5], 300]];
            let addrOriginRight = [[accounts[4], 200], [accounts[6], 400]];
            let encDataLeft = await encDataV1([ [[accounts[1], 10000]], addrOriginLeft]);
            let encDataRight = await encDataV1([ [[accounts[2], 10000]], addrOriginRight]);
            const left = Order(account1.address, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), ZERO_ADDRESS, Asset(ERC1155, enc(erc1155Token.address, erc1155TokenId1), 100), 1, 0, 0, ORDER_DATA_V1, encDataLeft);
            const right = Order(account2.address, Asset(ERC1155, enc(erc1155Token.address, erc1155TokenId1), 100), ZERO_ADDRESS, Asset(ERC721, enc(erc721Token.address, erc721TokenId1), 1), 1, 0, 0, ORDER_DATA_V1, encDataRight);
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
			let encDataLeft = await encDataV1([ [[accounts[3], 5000], [accounts[5], 5000]], []]);
			let encDataRight = await encDataV1([ [[accounts[4], 5000], [accounts[6], 5000]], []]);
			const left = Order(account1.address, Asset(ERC1155, enc(erc1155Token.address, erc1155TokenId1), 2), ZERO_ADDRESS, Asset(ERC1155, enc(erc1155Token.address, erc1155TokenId2), 10), 1, 0, 0, ORDER_DATA_V1, encDataLeft);
			const right = Order(account2.address, Asset(ERC1155, enc(erc1155Token.address, erc1155TokenId2), 10), ZERO_ADDRESS, Asset(ERC1155, enc(erc1155Token.address, erc1155TokenId1), 2), 1, 0, 0, ORDER_DATA_V1, encDataRight);
			return { left, right }
		}



	

    
    
    });

    function encDataV1(tuple) {
		return testing.encode(tuple)
	}

    
    
    

    





});