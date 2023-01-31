const { expect, util } = require('chai');
const { ethers, upgrades } = require('hardhat');
const keccak256 = require('keccak256');
const { BN, constants, expectRevert } = require('@openzeppelin/test-helpers');
const ethSigUtil = require('eth-sig-util');
const { ZERO_ADDRESS } = constants;


describe('ERC1155LuxyPrivateFactory', function () {

    beforeEach(async () => {
        [creator1, creator2, factoryOwner, minter1, minter2, minter3] = await ethers.getSigners();
        const LuxyFactory = await ethers.getContractFactory(
            'ERC1155LuxyPrivateFactory',
        );
        const _luxyFactory = await LuxyFactory.connect(factoryOwner).deploy();
        testing = _luxyFactory;
        let tx = await testing.connect(creator1).createToken('Creation1', 'Cri1', '', [minter1.address, minter2.address], false, 0, 1);
        tx_receipt = await tx.wait();
        for (let i = 0; i < tx_receipt.events.length; i++) {
            ev = tx_receipt.events[i];
            if (ev.event == "Create1155LuxyContract") {
                luxyCreator1address = ev.args.erc1155;
                const response = await testing.connect(creator1).getAddress('Creation1', 'Cri1', '', [minter1.address, minter2.address], false, 0, 1);
                console.log('contract address: ' + luxyCreator1address);
                console.log(response);
                const tokenArtifact = await artifacts.readArtifact("ERC1155Luxy");
                creator1Contract = new ethers.Contract(luxyCreator1address, tokenArtifact.abi, ethers.provider);

            }
        }

    });
    context('factory with minted tokens', function () {
        beforeEach(async function () {
            await creator1Contract.connect(minter1).mint(minter1.address, 10, [{ account: factoryOwner.address, value: 10 }], "Thom");
            await creator1Contract.connect(minter2).mint(minter2.address, 8, [{ account: minter2.address, value: 5 }], "Thom");
        });

        describe('check factory contract', function () {
            it('should be equal to creator1 address', async function () {
                expect(await (creator1Contract.address)).to.be.equal(await testing.connect(creator1).getAddress('Creation1', 'Cri1', '', [minter1.address, minter2.address], false, 0, 1));
            });
            it('should be equal to creator1 address', async function () {
                expect(await (creator1Contract.owner())).to.be.equal(creator1.address);
            });
            it('should revert if not allowed minter', async function () {
                await expectRevert(
                    creator1Contract.connect(minter3).mint(minter1.address, 10, [{ account: factoryOwner.address, value: 10 }], "Thom"),
                    "Sender must be an approved minter or owner"
                )
            });
        })

        describe('balanceOf', function () {
            context('when the given address owns some tokens', function () {
                it('returns the amount of tokens owned by the given address', async function () {
                    expect(await creator1Contract.balanceOf(minter1.address, 0)).to.be.equal(10);
                    expect(await creator1Contract.balanceOf(minter2.address, 1)).to.be.equal(8);
                });
            });
        });
        context('when the given address does not own any tokens', function () {
            it('returns 0', async function () {
                expect(await creator1Contract.balanceOf(factoryOwner.address, 0)).to.be.equal(0);
            });
        });

        context('getting token URI', function () {
            it('returns the URI of the token', async function () {
                expect(await creator1Contract.uri(0)).to.be.equal("Thom");
            });
        })

        context('URI defined event', function () {
            it("Emits event on the transfer to the first receiver", async () => {
                await expect(creator1Contract.connect(minter1).mint(creator1.address, 12, [{ account: creator1.address, value: 10 }], "Thom"))
                    .to.emit(creator1Contract, "URI")
                    .withArgs("Thom", 2)
            })
        });

        context('Royalties for ERC1155', function () {
            it('checking royalties', async function () {
                const result = await creator1Contract.getRoyalties(0);
                expect(result.length).to.be.equal(1);
                expect(result[0][0]).to.be.equal(factoryOwner.address);
                expect(result[0][1]).to.be.equal(10);

            })
        })

        context('TransferFrom ERC1155', function () {
            it('transfering to new account', async function () {
                await creator1Contract.connect(minter1).transferFrom(0, minter1.address, minter3.address, 3);
                expect(await creator1Contract.balanceOf(minter1.address, 0)).to.be.equal(7);
                expect(await creator1Contract.balanceOf(minter3.address, 0)).to.be.equal(3);

            })
        })



        context('when querying the zero address', function () {
            it('throws', async function () {
                await expectRevert(
                    creator1Contract.balanceOf(ZERO_ADDRESS, 0), 'ERC1155: address zero is not a valid owner',
                );
            });
        });
        describe('metadata', function () {
            it('has a name', async function () {
                expect(await creator1Contract.name()).to.be.equal("Creation1");
            });

            it('has a symbol', async function () {
                expect(await creator1Contract.symbol()).to.be.equal("Cri1");
            });
        });

    });

})