const { BN, constants, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const { ethers } = require('hardhat');
const { ZERO_ADDRESS } = constants;


describe('VoucherContract tests', function () {
    beforeEach(async () => {
        [account0, account1, account2, account3, owner, owner2, owner3, artist] = await ethers.getSigners();
        const ERC721LuxyVoucher = await ethers.getContractFactory('ERC721LuxyVoucherTest');
        const ERC721Voucher = await ethers.getContractFactory('ERC721Voucher');
        const LuxyLaunchpadFeeManager = await ethers.getContractFactory('LuxyLaunchpadFeeManager');
        luxyLaunchpadFeeManager = await upgrades.deployProxy(
            LuxyLaunchpadFeeManager,
            ["100", account0.address],
            { initializer: '__LuxyLaunchpadFeeManager_init' }
        );
        await luxyLaunchpadFeeManager.deployed();
        erc721Voucher = await ERC721Voucher.deploy();
        await erc721Voucher.deployed();
        erc721LuxyVoucher = await ERC721LuxyVoucher.deploy(erc721Voucher.address, luxyLaunchpadFeeManager.address, [1, 3, 4, 6, 9, 11, 14, 18, 20, 23, 26, 33, 35, 89, 101, 121, 131, 145, 143, 33], artist.address);
        await erc721LuxyVoucher.deployed();
        await erc721Voucher.setParent(erc721LuxyVoucher.address);
    });
    context("Functionality test", () => {
        it("Validate mint reversion", async () => {
            await expectRevert(
                erc721Voucher.connect(account2).mint(1, account2.address),
                "Not allowed"
            );
            await expectRevert(
                erc721LuxyVoucher.connect(account2).mint(1, account2.address)
                , "Not allowed"
            )

        });
        it("Validate Mint with no child nft creation", async () => {
            await luxyLaunchpadFeeManager.connect(account1).mint(erc721LuxyVoucher.address, 1, account1.address, { value: "1000000000000000000" });
            expect(await erc721LuxyVoucher.ownerOf(0)).to.equal(account1.address);
            await expectRevert(
                erc721Voucher.ownerOf(0)
                , "ERC721: invalid token ID"
            );
        });

        it("Validate Mint with child nft creation", async () => {
            await luxyLaunchpadFeeManager.connect(account1).mint(erc721LuxyVoucher.address, 3, account1.address, { value: "3000000000000000000" });
            expect(await erc721LuxyVoucher.ownerOf(0)).to.equal(account1.address);
            await expectRevert(
                erc721Voucher.ownerOf(0)
                , "ERC721: invalid token ID"
            );
            expect(await erc721LuxyVoucher.ownerOf(1)).to.equal(account1.address);
            expect(await erc721Voucher.ownerOf(1)).to.equal(account1.address);
            expect(await erc721LuxyVoucher.ownerOf(2)).to.equal(account1.address);
            await expectRevert(
                erc721Voucher.ownerOf(2)
                , "ERC721: invalid token ID"
            );
        });

        it("Validate no child allowed to be transfered", async () => {
            
            await luxyLaunchpadFeeManager.connect(account1).mint(erc721LuxyVoucher.address, 3, account1.address, { value: "3000000000000000000" });
            expect(await erc721Voucher.ownerOf(1)).to.equal(account1.address);
            await expectRevert( erc721Voucher.connect(account1).transferFrom(account1.address, account3.address, 1),
            "Voucher: You only can transfer the voucher along with the P24 NFT"
            );
          
            await expectRevert(
                erc721Voucher.connect(account1).burn(1),
                'Voucher: Not allowed'
            );
        });

        it("Validate child transfered with parent NFT", async () => {
          //  expect(await erc721Voucher.ownerOf(1)).to.equal(account1.address);
            await luxyLaunchpadFeeManager.connect(account1).mint(erc721LuxyVoucher.address, 3, account1.address, { value: "3000000000000000000" });
            expect(await erc721LuxyVoucher.ownerOf(1)).to.equal(account1.address);
            expect(await erc721Voucher.ownerOf(1)).to.equal(account1.address);
            await erc721LuxyVoucher.connect(account1).transferFrom(account1.address, account3.address, 1);
            expect(await erc721LuxyVoucher.ownerOf(1)).to.equal(account3.address);
            expect(await erc721Voucher.ownerOf(1)).to.equal(account3.address);
        })
        it("Validate parent NFT transfer", async () => {
            await luxyLaunchpadFeeManager.connect(account1).mint(erc721LuxyVoucher.address, 2, account1.address, { value: "3000000000000000000" });
            await erc721LuxyVoucher.connect(account1).transferFrom(account1.address, account3.address, 0);
            expect(await erc721LuxyVoucher.ownerOf(0)).to.equal(account3.address);
            await expectRevert(
                erc721Voucher.ownerOf(0)
                , "ERC721: invalid token ID"
            );
        })
        it("Validate claim system", async () => {
            await luxyLaunchpadFeeManager.connect(account1).mint(erc721LuxyVoucher.address, 2, account1.address, { value: "3000000000000000000" });
            await expectRevert(
                erc721LuxyVoucher.isClaimed(0),
                "ERC721LuxyVoucher: There is no prize associated to this NFT"
            )
            expect(await erc721LuxyVoucher.isClaimed(1)).to.equal(false);
            expect(await erc721LuxyVoucher.ownerOf(1)).to.equal(account1.address);
            expect(await erc721Voucher.ownerOf(1)).to.equal(account1.address);
            await erc721LuxyVoucher.connect(account1).claim(1);
            expect(await erc721LuxyVoucher.isClaimed(1)).to.equal(true);
            expect(await erc721LuxyVoucher.claimer(1)).to.equal(account1.address);
            expect(await erc721LuxyVoucher.ownerOf(1)).to.equal(account1.address);
            await expectRevert(
                erc721Voucher.ownerOf(1)
                , "ERC721: invalid token ID"
            );
            await erc721LuxyVoucher.connect(account1).transferFrom(account1.address, account2.address, 1);
            expect(await erc721LuxyVoucher.ownerOf(1)).to.equal(account2.address);
            await expectRevert(
                erc721LuxyVoucher.connect(account2).claim(1)
                , "ERC721LuxyVoucher: Already Claimed"
            );

        })

    });

});