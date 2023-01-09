const { expect } = require("chai");

const { ethers, upgrades } = require('hardhat');

describe("Tests For Luxy Royalties", function () {
  let royalties;
  let contractAddress;
  let accounts;
  let creator1;
  let creator2;
  let creator3;
  let newCreator1;
  var supply = ethers.utils.parseEther('100');

  beforeEach(async () => {
    accounts = await ethers.provider.listAccounts();
    creator1 = accounts[0];
    creator2 = accounts[1];
    creator3 = accounts[2];
    newCreator1 = accounts[3];

    const RoyaltiesV1LuxyTest = await ethers.getContractFactory(
      'RoyaltiesV1LuxyTest',
    );
    const _royalties = await upgrades.deployProxy(
      RoyaltiesV1LuxyTest
    );

    await _royalties.deployed();
    royalties = _royalties;
    contractAddress = _royalties.address;
  });
  it("Checking no repeated royalties", async function () {
    //Just to check the contract interface
    await royalties.setRoyalties(10, [{ account: creator1, value: 10 }]);

    const result = await royalties.getRoyalties(10);
    expect(result.length).to.be.equal(1);
    expect(result[0][0]).to.be.equal(creator1);
    expect(result[0][1]).to.be.equal(10);
    expect(royalties.setRoyalties(10, [{ account: creator1, value: 10 }])).to.be.revertedWith('Royalties already set');

  });


  it("Saving shared royalties", async function () {
    //Just to check the contract interface
    const tx = await royalties.setRoyalties(20, [{ account: creator1, value: 10 }, { account: creator2, value: 30 }, { account: creator3, value: 20 }]);

    const result = await royalties.getRoyalties(20);
    expect(result.length).to.be.equal(3);

    expect(result[0][0]).to.be.equal(creator1);
    expect(result[0][1]).to.be.equal(10);


    expect(result[1][0]).to.be.equal(creator2);
    expect(result[1][1]).to.be.equal(30);


    expect(result[2][0]).to.be.equal(creator3);
    expect(result[2][1]).to.be.equal(20);
  });

  it("Checking royalties update", async function () {
    // Checking royalties updates
    await royalties.setRoyalties(10, [{ account: creator1, value: 10 }]);
    await royalties.updateAccount(10, creator1, newCreator1);

    const result = await royalties.getRoyalties(10);


    expect(result.length).to.be.equal(1);
    expect(result[0][0]).to.be.equal(newCreator1);
    expect(result[0][1]).to.be.equal(10);
  });

});
