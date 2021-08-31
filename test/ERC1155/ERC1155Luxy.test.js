const { expect, util } = require('chai');
const { ethers, upgrades } = require('hardhat');
const keccak256 = require('keccak256');
const { BN, constants, expectRevert } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;


describe('ERC1155Luxy', function () {

    beforeEach(async () => {
        accounts = await ethers.provider.listAccounts();
        [owner, newOwner, approved, anotherApproved, operator, other] = accounts;

        // Deploy token
        const Luxy = await ethers.getContractFactory(
            'ERC1155Luxy',
        );
        const _luxy = await upgrades.deployProxy(
            Luxy,
            ["ERC1155Luxy", "LUXY", ""],
            { initializer: '__ERC1155Luxy_init' }
        );
        await _luxy.deployed();
        luxy = _luxy;
    });

    context('with minted tokens', function () {
        beforeEach(async function () {
            await luxy.mint(owner, 10 ,[{ account: owner, value: 10 }],"Thom");
            await luxy.mint(owner, 8,[{ account: operator, value: 5 }],"Thom");
        });
        describe('balanceOf', function () {
            context('when the given address owns some tokens', function () {
                it('returns the amount of tokens owned by the given address', async function () {
                    expect(await luxy.balanceOf(owner,0)).to.be.equal(10);
                    expect(await luxy.balanceOf(owner,1)).to.be.equal(8);
                });
            });
        });
            context('when the given address does not own any tokens', function () {
                it('returns 0', async function () {
                    expect(await luxy.balanceOf(other,0)).to.be.equal(0);
                });
            });

            context('getting token URI', function (){
                it('returns the URI of the token', async function () {
                    expect(await luxy.uri(0)).to.be.equal("Thom");
                });
            })

            context('URI defined event', function (){
                it("Emits event on the transfer to the first receiver", async () => {
                    await expect(luxy.mint(owner, 12 ,[{ account: owner, value: 10 }],"Thom"))
                      .to.emit(luxy, "URI")
                      .withArgs("Thom", 2)
                  })
            });

            context('Royalties for ERC1155', function() {
                it('checking royalties', async function () {
                    const result = await luxy.getRoyalties(0);
                    expect(result.length).to.be.equal(1);
                    expect(result[0][0]).to.be.equal(owner);
                    expect(result[0][1]).to.be.equal(10);
    
                })
            })

            context('TransferFrom ERC1155', function() {
                it('transfering to new account', async function () {
                    await luxy.transferFrom(0, owner,newOwner, 3);
                    expect(await luxy.balanceOf(owner,0)).to.be.equal(7);
                    expect(await luxy.balanceOf(newOwner,0)).to.be.equal(3);
    
                })
            })



            context('when querying the zero address', function () {
                it('throws', async function () {
                    await expectRevert(
                        luxy.balanceOf(ZERO_ADDRESS,0), 'ERC1155: balance query for the zero address',
                    );
                });
            });
            describe('metadata', function () {
                it('has a name', async function () {
                    expect(await luxy.name()).to.be.equal("ERC1155Luxy");
                });
    
                it('has a symbol', async function () {
                    expect(await luxy.symbol()).to.be.equal("LUXY");
                });
            });
            
    });   
    });

