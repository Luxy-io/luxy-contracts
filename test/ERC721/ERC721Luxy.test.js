const { expect, util } = require('chai');
const { ethers, upgrades } = require('hardhat');
const keccak256 = require('keccak256');
const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

describe('ERC721Luxy', function () {

    // Scope variable
    let luxy;
    let accounts;
    let owner;
    let newOwner;
    let approved;
    let anotherApproved;
    let operator;
    let other;


    beforeEach(async () => {
        accounts = await ethers.provider.listAccounts();
        [owner, newOwner, approved, anotherApproved, operator, other] = accounts;

        // Deploy token
        const Luxy = await ethers.getContractFactory(
            'ERC721Luxy',
        );
        const _luxy = await upgrades.deployProxy(
            Luxy,
            ["ERC721Luxy", "LUXY", 'ipfs:/', false,0],
            { initializer: '__ERC721Luxy_init' }
        );
        await _luxy.deployed();
        luxy = _luxy;
    });

    context('with minted tokens', function () {
        beforeEach(async function () {
            await luxy.mint(owner, "Claudio", [{ account: owner, value: 10 }]);
            await luxy.mint(owner, "Claudio", [{ account: owner, value: 10 }]);
        });

        describe('balanceOf', function () {
            context('when the given address owns some tokens', function () {
                it('returns the amount of tokens owned by the given address', async function () {
                    expect(await luxy.balanceOf(owner)).to.be.equal(2);
                });
            });

            context('when the given address does not own any tokens', function () {
                it('returns 0', async function () {
                    expect(await luxy.balanceOf(other)).to.be.equal(0);
                });
            });

            context('when querying the zero address', function () {
                it('throws', async function () {
                    await expectRevert(
                        luxy.balanceOf(ZERO_ADDRESS), 'ERC721: balance query for the zero address',
                    );
                });
            });
        });
        describe('ownerOf', function () {
            context('when the given token ID was tracked by this token', function () {

                it('returns the owner of the given token ID', async function () {
                    expect(await luxy.ownerOf(0)).to.be.equal(owner);
                });
            });

            context('when the given token ID was not tracked by this token', function () {
                it('reverts', async function () {
                    await expectRevert(
                        luxy.ownerOf(2), 'ERC721: owner query for nonexistent token',
                    );
                });
            });
        });

        describe('metadata', function () {
            it('has a name', async function () {
                expect(await luxy.name()).to.be.equal("ERC721Luxy");
            });

            it('has a symbol', async function () {
                expect(await luxy.symbol()).to.be.equal("LUXY");
            });
        });
    });
});