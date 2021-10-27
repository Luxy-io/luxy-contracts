const order = require("../order");
const { BN, constants, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ZERO_ADDRESS } = constants;
const { ETH, ERC20, ERC721, ERC1155, enc } = require("../assets");
const ether = require("@openzeppelin/test-helpers/src/ether");


describe('TransferExecutor', function () {

    beforeEach(async () => {

        accounts = await ethers.provider.listAccounts();
        prov = ethers.getDefaultProvider();
        [owner, spender, holder] = await ethers.getSigners();
        const TransferProxyTest = await ethers.getContractFactory('TransferProxyTest');
        const ERC20TransferProxyTest = await ethers.getContractFactory('ERC20TransferProxyTest');
        const TestERC20 = await ethers.getContractFactory('TestERC20');
        const TestERC721 = await ethers.getContractFactory('TestERC721');
        const TestERC721Dep = await ethers.getContractFactory('TestERC721Dep');
        const TestERC1155 = await ethers.getContractFactory('TestERC1155');
        const TransferExecutorTest = await ethers.getContractFactory('TransferExecutorTest');
        transferProxy = await TransferProxyTest.deploy();
        erc20TransferProxy = await ERC20TransferProxyTest.deploy();
        // erc20Token = await TestERC20.deploy();
        erc20Token = await upgrades.deployProxy(
            TestERC20,
            ['SuperThom', 'THOM'],
            { initializer: '__TestERC20_init' }
        );
        erc721Token = await TestERC721.deploy();
        erc721DepToken = await TestERC721Dep.deploy();
        erc1155Token = await TestERC1155.deploy();
        testing = await upgrades.deployProxy(
            TransferExecutorTest,
            [transferProxy.address, erc20TransferProxy.address],
            { initializer: '__TransferExecutorTest_init' }
        );
        await testing.deployed();
    });

    context('Testing Transfer', function () {

        it("should support ETH transfers", async () => {
            await testing.connect(spender).transferTest(order.Asset(ETH, "0x", 500), spender.address, holder.address, { value: 500 })
            await expect(await testing.connect(spender).transferTest(order.Asset(ETH, "0x", 500), spender.address, holder.address, { value: 500 }))
                .to.changeEtherBalances([spender, holder], [-500, 500]);
        })

        it("should support ERC20 transfers", async () => {
            await erc20Token.mint(holder.address, 100);

            await erc20Token.connect(holder).approve(erc20TransferProxy.address, 99);

            await testing.transferTest(order.Asset(ERC20, enc(erc20Token.address), 40), holder.address, accounts[6])
            expect(await erc20Token.balanceOf(holder.address)).to.equal(60);
            expect(await erc20Token.balanceOf(accounts[6])).to.equal(40);
        })

        it("should support ERC721 transfers", async () => {
            await erc721Token.mint(holder.address, 1);
            await erc721Token.connect(holder).setApprovalForAll(transferProxy.address, true);

            await expectRevert(
                testing.transferTest(order.Asset(ERC721, enc(erc721Token.address, 1), 2), holder.address, accounts[6]),
                "erc721 value error"
            );
            await testing.transferTest(order.Asset(ERC721, enc(erc721Token.address, 1), 1), holder.address, accounts[6])
            expect(await erc721Token.ownerOf(1)).to.equal(accounts[6]);
        })

        it("should support ERC1155 transfers", async () => {
            await erc1155Token.mint(owner.address, 1, 100);
            await erc1155Token.connect(owner).setApprovalForAll(transferProxy.address, true);

            await testing.transferTest(order.Asset(ERC1155, enc(erc1155Token.address, 1), 40), owner.address, spender.address)
            expect(await erc1155Token.balanceOf(owner.address, 1)).to.equal(60);
            expect(await erc1155Token.balanceOf(spender.address, 1)).to.equal(40);
        })

    });


});
