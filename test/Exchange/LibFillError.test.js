const { Order, Asset, sign } = require("../order");
const EIP712 = require("../EIP712");
const { BN, constants, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ZERO_ADDRESS } = constants;
const eth = "0x0000000000000000000000000000000000001010";
const { ETH, ERC1155,  enc, id } = require("../assets");


describe('LuxyExchange tests', function () {

    let erc1155TokenId1 = 39;

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
        const TestERC1155 = await ethers.getContractFactory('TestERC1155');

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

    context("Do matchOrders(), ", () => {
     
        it("From ERC1155 to ETH:Protocol, ", async () => {
            const amountToFirstBuy = 100;
            const totalSellAmountETH = 1000000000000000;
            const totalSellAmountERC1155 = 100;
            await testERC1155_V1.mint(account2.address, erc1155TokenId1, [], 1000);
            await testERC1155_V1.connect(account2).setApprovalForAll(transferProxy.address, true);
            const { left, right } = await prepare1155V1_20DV1Orders(totalSellAmountERC1155, totalSellAmountETH, amountToFirstBuy)
            await testing.connect(account1).matchOrders(left, await getSignature(left, account2.address), right, "0x",{ value: totalSellAmountETH*2});
		
            expect(await testERC1155_V1.balanceOf(account1.address, erc1155TokenId1)).to.equal(100);
            expect(await testERC1155_V1.balanceOf(account2.address, erc1155TokenId1)).to.equal(900);

			// // const { left2, right2 } = await prepare1155V1_20DV1Orders(15,150 )
            // const { right : right2 } = await prepare20DV1Orders(6,100, totalSellAmountETH,totalSellAmountERC1155);
            // await testing.connect(account1).matchOrders(left, await getSignature(left, account2.address), right2, "0x",{ value: 300});

            // const { right : right3 } = await prepare20DV1Orders(9,100, totalSellAmountETH,totalSellAmountERC1155);
            // await testing.connect(account1).matchOrders(left, await getSignature(left, account2.address), right3, "0x",{ value: 300});

            // const { right : right4 } = await prepare20DV1Orders(3,100, totalSellAmountETH,totalSellAmountERC1155);
            // await testing.connect(account1).matchOrders(left, await getSignature(left, account2.address), right4, "0x",{ value: 300});
		
            // expect(await testERC1155_V1.balanceOf(account1.address, erc1155TokenId1)).to.equal(30);
            // expect(await testERC1155_V1.balanceOf(account2.address, erc1155TokenId1)).to.equal(70);


        })
        ////
        async function prepare1155V1_20DV1Orders(erc1155Amount, etherAmount, amountToFirstBuy) {
   
            const saltVendedor =  1688033990679;
            const saltComprador =  1688036303157;
            const modulus = amountToFirstBuy* etherAmount % erc1155Amount; 
            if(modulus*1000 >= amountToFirstBuy*etherAmount){
            throw new Error("rounding error must be smaller than 0.1%");
            }
            const left = Order(account2.address, Asset(ERC1155, enc(testERC1155_V1.address, erc1155TokenId1), erc1155Amount), ZERO_ADDRESS,Asset(ETH, eth, etherAmount), saltVendedor, 0, 1690625990, "0xffffffff", "0x");
            console.log('Vendedor:', left);
			const right = Order(account1.address, Asset(ETH, eth, etherAmount), ZERO_ADDRESS,Asset(ERC1155, enc(testERC1155_V1.address, erc1155TokenId1), erc1155Amount), saltComprador, 0, 1690625990, "0xffffffff", "0x");
            console.log('Comprador:', right);
            return { left, right }
        }
        async function prepare20DV1Orders(erc1155Amount, etherAmount, target, totalErc1155 ) {
            const modulus = erc1155Amount* target % totalErc1155; 
            if(modulus*1000 >= target*erc1155Amount){
            throw new Error("rounding error must be smaller than 0.1%");
            }
   
            const salt =  new Date().getTime()
			const right = Order(account1.address, Asset(ETH, eth, etherAmount), ZERO_ADDRESS,Asset(ERC1155, enc(testERC1155_V1.address, erc1155TokenId1), erc1155Amount), salt, 0, 0, "0xffffffff", "0x");
			
            return { right }
        }

    });


    async function getSignature(order, signer) {
        return sign('LuxyValidator', '1', order, signer, testing.address);
    }
});