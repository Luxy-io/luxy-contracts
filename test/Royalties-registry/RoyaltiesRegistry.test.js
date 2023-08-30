const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');
const { expectRevert } = require('@openzeppelin/test-helpers');

describe('RoyaltiesRegistry', function () {
    let erc721TokenId1 = 0;
    let erc721TokenId2 = 1;

    beforeEach(async () => {
        accounts = await ethers.provider.listAccounts();
        [account0, account1, account2, owner, owner2, owner3, owner4] = await ethers.getSigners();
        const RoyaltiesRegistry = await ethers.getContractFactory('RoyaltiesRegistry');
        const RoyaltiesRegistryTest = await ethers.getContractFactory('RoyaltiesRegistryTest');
        const TestERC721 = await ethers.getContractFactory('TestERC721');
        const Luxy721 = await ethers.getContractFactory('ERC721Luxy');
        royaltiesRegistryTest = await RoyaltiesRegistryTest.deploy();
        royaltiesRegistry = await upgrades.deployProxy(
            RoyaltiesRegistry,
            [],
            { initializer: '__RoyaltiesRegistry_init' }
        );
        await royaltiesRegistry.deployed();

        erc721Token = await upgrades.deployProxy(
            TestERC721,
            ['SuperNina', 'NINA'],
            { initializer: '__TestERC721_init' }
        );
        await erc721Token.deployed();

        luxy721 = await upgrades.deployProxy(
            Luxy721,
            ["ERC721Luxy", "LUXY", '', false,0],
            { initializer: '__ERC721Luxy_init' }
        );
        await luxy721.deployed();

    });
    context('RoyaltiesRegistry methods works:', function () {
        it("simple Luxy royalties : default royalties check ", async () => {

            await luxy721.mint(accounts[2], 'TERERE', [[accounts[5], 700], [accounts[6], 800], [accounts[7], 900], [accounts[8], 1000]]);  //set royalties by contract
            part = await royaltiesRegistry.getRoyalties(luxy721.address, erc721TokenId1);
            const tx_receipt = await part.wait()
            console.log(tx_receipt)
            const royaltiesResponse = tx_receipt.events[0].args.royalties
            console.log(royaltiesResponse)
            expect(royaltiesResponse.length).to.be.equal(4);
            expect(royaltiesResponse[0].account).to.be.equal(accounts[5]);
            expect(royaltiesResponse[0].value.toNumber()).to.be.equal(700);
            expect(royaltiesResponse[1].account).to.be.equal(accounts[6]);
            expect(royaltiesResponse[1].value.toNumber()).to.be.equal(800);
            expect(royaltiesResponse[2].account).to.be.equal(accounts[7]);
            expect(royaltiesResponse[2].value.toNumber()).to.be.equal(900);
            expect(royaltiesResponse[3].account).to.be.equal(accounts[8]);
            expect(royaltiesResponse[3].value.toNumber()).to.be.equal(1000);
        });
        it("simple Luxy royalties: no royalties", async () => {

            await luxy721.mint(accounts[2], 'TERERE', []);  //set royalties by contract
            part = await royaltiesRegistry.getRoyalties(luxy721.address, erc721TokenId1);
            const tx_receipt = await part.wait()
            const royaltiesResponse = tx_receipt.events[0].args.royalties
            expect(royaltiesResponse.length).to.be.equal(0);
        });

        it("Luxy royalties: royalties set upon collection", async () => {

            await royaltiesRegistry.setRoyaltiesByToken(erc721Token.address, [[accounts[3], 600], [accounts[4], 1100]]); //set royalties by token


            await erc721Token.mint(accounts[0], erc721TokenId1); //Testing if royalties will be added upon after created token
            part = await royaltiesRegistryTest._getRoyalties(royaltiesRegistry.address, erc721Token.address, erc721TokenId1);
            tx_receipt = await part.wait()
            royaltiesResponse = tx_receipt.events[1].args.royalties
            expect(royaltiesResponse.length).to.be.equal(2);
            expect(royaltiesResponse[0].account).to.be.equal(accounts[3]);
            expect(royaltiesResponse[0].value.toNumber()).to.be.equal(600);
            expect(royaltiesResponse[1].account).to.be.equal(accounts[4]);
            expect(royaltiesResponse[1].value.toNumber()).to.be.equal(1100);
            part = await royaltiesRegistryTest._getRoyalties(royaltiesRegistry.address, erc721Token.address, 14); //Any token from this collection should have royalties
            tx_receipt = await part.wait()
            royaltiesResponse = tx_receipt.events[1].args.royalties
            expect(royaltiesResponse.length).to.be.equal(2);
            expect(royaltiesResponse[0].account).to.be.equal(accounts[3]);
            expect(royaltiesResponse[0].value.toNumber()).to.be.equal(600);
            expect(royaltiesResponse[1].account).to.be.equal(accounts[4]);
            expect(royaltiesResponse[1].value.toNumber()).to.be.equal(1100);
        });

        it("Luxy Royalties: royaltiesSum>68% throw detected ", async () => {
            const Luxy721 = await ethers.getContractFactory('ERC721Luxy');
            externalLuxy = await upgrades.deployProxy(
                Luxy721,
                ['Owner', 'own', '', false,0],
                { initializer: '__ERC721Luxy_init' }
            );
            await luxy721.mint(owner.address, 'TERERE', [[accounts[3], 5000], [accounts[4], 1801]]);  //set royalties by contract
            await externalLuxy.deployed();
            await externalLuxy.transferOwnership(owner.address);
            await expectRevert(
                royaltiesRegistry.connect(owner).getRoyalties(luxy721.address, erc721TokenId1),
                "Set by token and tokenId royalties sum more, than 68%"
            );
        })
        it("Luxy Royalties: royaltiesSum>30% throw detected ", async () => {
            const Luxy721 = await ethers.getContractFactory('ERC721Luxy');
            externalLuxy = await upgrades.deployProxy(
                Luxy721,
                ['Owner', 'own', '', false,0],
                { initializer: '__ERC721Luxy_init' }
            );
            await externalLuxy.deployed();
            await externalLuxy.transferOwnership(owner.address);
            await expectRevert(
                royaltiesRegistry.connect(owner).setRoyaltiesByToken(externalLuxy.address, [[accounts[3], 2000], [accounts[4], 1001]]),
                "Set by token royalties sum more than 30%"
            );
        })



    });



});