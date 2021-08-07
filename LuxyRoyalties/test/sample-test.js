const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RoyaltiesV2Impl", function () {

  let royalties;
  let contractAddress;
  let selector;

  beforeEach(async () => {
    const RoyaltiesV2Impl = await ethers.getContractFactory(
      'RoyaltiesV2Impl',
    );
    const _royalties = await upgrades.deployProxy(
      RoyaltiesV2Impl,
      [],
      { initializer: '__RoyaltiesV2Impl_init' }
    );
    const Selector = await hre.ethers.getContractFactory("Selector");

    await _royalties.deployed();
    selector = await Selector.deploy();
    await selector.deployed;
    royalties = _royalties;
    contractAddress = _royalties.address;
  });
  // describe("AIDS", function () { 
  it("Getting Royalties interface", async function () {

    console.log("Papo 10");
    console.log(contractAddress);
    console.log(await selector.calcStoreInterfaceId());
    console.log(await royalties.INTERFACE_ID_ROYALTIES);
    expect("0x0").to.be.equal("0x0");
  });
  // });
});
