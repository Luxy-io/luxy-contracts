const { expect, util } = require('chai');
const { ethers, upgrades } = require('hardhat');
const keccak256 = require('keccak256');
const { BN, constants, expectRevert } = require('@openzeppelin/test-helpers');
const ethSigUtil = require('eth-sig-util');
const { ZERO_ADDRESS } = constants;


describe('ERC721LuxyFactory', function () {

    beforeEach(async () => {
        [creator1, creator2, factoryOwner, minter1, minter2, minter3] = await ethers.getSigners();
        const LuxyFactory = await ethers.getContractFactory(
            'ERC721LuxyFactory',
        );
        const _luxyFactory = await LuxyFactory.connect(factoryOwner).deploy();
        testing = _luxyFactory;
        let tx = await testing.connect(creator1).createToken('Creation1', 'Cri1', '', false, 0, 231);
        tx_receipt = await tx.wait();
        for (let i = 0; i < tx_receipt.events.length; i++) {
            ev = tx_receipt.events[i];
            if (ev.event == "Create721LuxyContract") {
                luxyCreator1address = ev.args.erc721;
                const response = await testing.connect(creator1).getAddress('Creation1', 'Cri1', '', false, 0, 231);
                console.log('contract address: ' + luxyCreator1address);
                console.log(response);
                const tokenArtifact = await artifacts.readArtifact("ERC721Luxy");
                creator1Contract = new ethers.Contract(luxyCreator1address, tokenArtifact.abi, ethers.provider);

            }
        }
        // await creator1Contract.connect(creator1).__ERC721Luxy_init('Creation1', 'Cri1', '');

    });
    context('factory with minted tokens', function () {
        beforeEach(async function () {
            await creator1Contract.connect(minter1).mint(minter1.address, "Thom", [{ account: factoryOwner.address, value: 10 }]);
            await creator1Contract.connect(minter2).mint(minter2.address, "Thom", [{ account: minter2.address, value: 5 }]);
        });

        describe('check factory contract', function () {
            it('should be equal to creator1 address', async function () {
                expect(await (creator1Contract.address)).to.be.equal(await testing.connect(creator1).getAddress('Creation1', 'Cri1', '', false, 0, 231));
            });
            it('should be equal to creator1 address', async function () {
                expect(await (creator1Contract.owner())).to.be.equal(creator1.address);
            });
        })

        describe('balanceOf', function () {
            context('when the given address owns some tokens', function () {
                it('returns the amount of tokens owned by the given address', async function () {
                    expect(await creator1Contract.balanceOf(minter1.address)).to.be.equal(1);
                    expect(await creator1Contract.balanceOf(minter2.address)).to.be.equal(1);
                });
            });
        });
        context('when the given address does not own any tokens', function () {
            it('returns 0', async function () {
                expect(await creator1Contract.balanceOf(factoryOwner.address)).to.be.equal(0);
            });
        });

        context('Royalties for ERC721', function () {
            it('checking royalties', async function () {
                const result = await creator1Contract.getRoyalties(0);
                expect(result.length).to.be.equal(1);
                expect(result[0][0]).to.be.equal(factoryOwner.address);
                expect(result[0][1]).to.be.equal(10);

            })
        })




        context('when querying the zero address', function () {
            it('throws', async function () {
                await expectRevert(
                    creator1Contract.balanceOf(ZERO_ADDRESS), 'ERC721: address zero is not a valid owner',
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