const { Order, Asset, signWithPrivateKey, sign } = require("../order");
const EIP712 = require("../EIP712");
const { BN, constants, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ZERO_ADDRESS } = constants;
const eth = "0x0000000000000000000000000000000000001010";
const { ETH, ERC1155,  enc, id } = require("../assets");
const automatedTest = true; //Change here to manual test;

describe('LuxyExchange tests', function () {

    let erc1155TokenId1 = 2;

    beforeEach(async () => {
        const pk1 = process.env.PRIVATE_KEY_1; // replace with your actual env variable name
        const pk2 = process.env.PRIVATE_KEY_2; // replace with your actual env variable name
         // create ethers.js Signer instances
        signer1 = new ethers.Wallet(pk1, ethers.provider);
        signer2 = new ethers.Wallet(pk2, ethers.provider);
        transferProxy = await ethers.getContractAt('TransferProxy', "0x1114D1D30cfeF3d7bd636Bc5911380b9673e8a57");
        console.log('Check address', transferProxy.address);
        testERC1155_V1 = await ethers.getContractAt('ERC1155LuxyPrivate', "0xe321941dC64aF3f0600d350e605386339995d0A8");
        testing = await ethers.getContractAt('Luxy', "0x297d6679A71087A089d98606dFA06Fb4cA2B2B7C");


    });

    context("Do matchOrders(), ", () => {
     
        it("From ERC1155 to ETH:Protocol, ", async () => {
            if(automatedTest) {
            const amountToFirstBuy = 100;
            const totalSellAmountETH = 1000000000000000;
            const totalSellAmountERC1155 = 100;
            // await testERC1155_V1.mint(account2.address, erc1155TokenId1, [], 1000);
            await testERC1155_V1.connect(signer1).setApprovalForAll(transferProxy.address, true);
            const { left, right } = await prepare1155V1_20DV1Orders(totalSellAmountERC1155, totalSellAmountETH, amountToFirstBuy)
            // console.log('Checking the signature', await getSignature(left, signer2.address));
            const response = await testing.connect(signer2).matchOrders(left, await getSignature(left, signer1.address), right, "0x",{ value: totalSellAmountETH*2});
            const receipt = await response.wait();
            console.log('response', receipt);
            expect(await testERC1155_V1.balanceOf(signer1.address, erc1155TokenId1)).to.equal(800);
            expect(await testERC1155_V1.balanceOf(signer2.address, erc1155TokenId1)).to.equal(200);

			// // const { left2, right2 } = await prepare1155V1_20DV1Orders(15,150 )
            // const { right : right2 } = await prepare20DV1Orders(6,100, totalSellAmountETH,totalSellAmountERC1155);
            // await testing.connect(account1).matchOrders(left, await getSignature(left, account2.address), right2, "0x",{ value: 300});

            // const { right : right3 } = await prepare20DV1Orders(9,100, totalSellAmountETH,totalSellAmountERC1155);
            // await testing.connect(account1).matchOrders(left, await getSignature(left, account2.address), right3, "0x",{ value: 300});

            // const { right : right4 } = await prepare20DV1Orders(3,100, totalSellAmountETH,totalSellAmountERC1155);
            // await testing.connect(account1).matchOrders(left, await getSignature(left, account2.address), right4, "0x",{ value: 300});
		
            // expect(await testERC1155_V1.balanceOf(account1.address, erc1155TokenId1)).to.equal(30);
            // expect(await testERC1155_V1.balanceOf(account2.address, erc1155TokenId1)).to.equal(70);
            } else {
                left = {
                    maker: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
                    makeAsset: {
                      assetType: {
                        assetClass: '0x973bb640',
                        data: '0x00000000000000000000000012456fa31e57f91b70629c1196337074c966492a0000000000000000000000000000000000000000000000000000000000000027'
                      },
                      value: 100
                    },
                    taker: '0x0000000000000000000000000000000000000000',
                    takeAsset: {
                      assetType: { assetClass: '0xaaaebeba', data: '0x' },
                      value: 1000000000000000
                    },
                    salt: 1688033990679,
                    start: 0,
                    end: 1690625990,
                    dataType: '0xffffffff',
                    data: '0x'
                  }
                right = {
                    maker: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
                    makeAsset: {
                        assetType: { assetClass: '0xaaaebeba', data: '0x' },
                        value: 1000000000000000
                    },
                    taker: '0x0000000000000000000000000000000000000000',
                    takeAsset: {
                        assetType: {
                        assetClass: '0x973bb640',
                        data: '0x00000000000000000000000012456fa31e57f91b70629c1196337074c966492a0000000000000000000000000000000000000000000000000000000000000027'
                        },
                        value: 100
                    },
                    salt: 1688036303157,
                    start: 0,
                    end: 1690625990,
                    dataType: '0xffffffff',
                    data: '0x'
                }
                leftSignature = "HEHUDNE";
                //   await testERC1155_V1.connect(signer1).setApprovalForAll(transferProxy.address, true);//Its assumed aprovalForAll has already been called here
                const response = await testing.connect(signer2).matchOrders(left, await getSignature(left, signer1.address), right, "0x",{ value: totalSellAmountETH*2});
                const receipt = await response.wait();
                console.log('receipt', receipt);
                expect(await testERC1155_V1.balanceOf(signer1.address, erc1155TokenId1)).to.equal(800);
                expect(await testERC1155_V1.balanceOf(signer2.address, erc1155TokenId1)).to.equal(200);
            }

        })
        ////
        async function prepare1155V1_20DV1Orders(erc1155Amount, etherAmount, amountToFirstBuy) {
   
            const saltVendedor =  new Date().getTime();
            const saltComprador =  new Date().getTime() + 1;
            const modulus = amountToFirstBuy* etherAmount % erc1155Amount; 
            if(modulus*1000 >= amountToFirstBuy*etherAmount){
            throw new Error("rounding error must be smaller than 0.1%");
            }
            const left = Order(signer1.address, Asset(ERC1155, enc(testERC1155_V1.address, erc1155TokenId1), erc1155Amount), ZERO_ADDRESS,Asset(ETH, eth, etherAmount), saltVendedor, 0, 1690625990, "0xffffffff", "0x");
            console.log('Vendedor:', left);
			const right = Order(signer2.address, Asset(ETH, eth, etherAmount), ZERO_ADDRESS,Asset(ERC1155, enc(testERC1155_V1.address, erc1155TokenId1), erc1155Amount), saltComprador, 0, 1690625990, "0xffffffff", "0x");
            console.log('Comprador:', right);
            return { left, right }
        }
        async function prepare20DV1Orders(erc1155Amount, etherAmount, target, totalErc1155 ) {
            const modulus = erc1155Amount* target % totalErc1155; 
            if(modulus*1000 >= target*erc1155Amount){
            throw new Error("rounding error must be smaller than 0.1%");
            }
   
            const salt =  new Date().getTime()
			const right = Order(signer1.address, Asset(ETH, eth, etherAmount), ZERO_ADDRESS,Asset(ERC1155, enc(testERC1155_V1.address, erc1155TokenId1), erc1155Amount), salt, 0, 0, "0xffffffff", "0x");
			
            return { right }
        }

    });


    async function getSignature(order, signer) {
        return signWithPrivateKey('LuxyValidator', '1', order, signer, testing.address, process.env.PRIVATE_KEY_1);
        // return sign('LuxyValidator', '1', order, signer, testing.address);
    }
   
      
});