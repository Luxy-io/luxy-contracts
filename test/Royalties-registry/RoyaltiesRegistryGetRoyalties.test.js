const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { expectRevert } = require("@openzeppelin/test-helpers");

describe("RoyaltiesRegistry", function () {
  let erc721TokenId1 = 0;
  let erc721TokenId2 = 1;

  beforeEach(async () => {
    accounts = await ethers.provider.listAccounts();
    [account0, account1, account2, owner, owner2, owner3, owner4] =
      await ethers.getSigners();
    const RoyaltiesRegistry = await ethers.getContractFactory(
      "RoyaltiesRegistry"
    );
    const RoyaltiesRegistryTest = await ethers.getContractFactory(
      "RoyaltiesRegistryTest"
    );
    const TestERC721 = await ethers.getContractFactory("TestERC721");
    const Luxy721 = await ethers.getContractFactory("ERC721Luxy");
    royaltiesRegistryTest = await RoyaltiesRegistryTest.deploy();
    royaltiesRegistry = await upgrades.deployProxy(RoyaltiesRegistry, [], {
      initializer: "__RoyaltiesRegistry_init",
    });
    await royaltiesRegistry.deployed();

    erc721Token = await upgrades.deployProxy(
      TestERC721,
      ["SuperNina", "NINA"],
      { initializer: "__TestERC721_init" }
    );
    await erc721Token.deployed();

    luxy721 = await upgrades.deployProxy(
      Luxy721,
      ["ERC721Luxy", "LUXY", "", false, 0],
      { initializer: "__ERC721Luxy_init" }
    );
    await luxy721.deployed();
  });
  context("RoyaltiesRegistry methods works:", function () {
    it("simple Luxy royalties : default royalties check ", async () => {
      await luxy721.mint(accounts[2], "TERERE", [[accounts[5], 700]]); //set royalties by contract
      part = await royaltiesRegistry.getRoyalties(
        luxy721.address,
        erc721TokenId1
      );
      const tx_receipt = await part.wait();
      const royaltiesResponse = tx_receipt.events[0].args.royalties;
      expect(royaltiesResponse.length).to.be.equal(1);
      expect(royaltiesResponse[0].account).to.be.equal(accounts[5]);
      expect(royaltiesResponse[0].value.toNumber()).to.be.equal(700);
    });

    it("Luxy royalties: royalties set upon collection and call for non-existent tokenId", async () => {
      await royaltiesRegistry.setRoyaltiesByToken(
        luxy721.address,
        [[accounts[3], 600]]
      ); 

      part = await royaltiesRegistryTest._getRoyalties(
        royaltiesRegistry.address,
        luxy721.address,
        14
      );
      tx_receipt = await part.wait();
      royaltiesResponse = tx_receipt.events[1].args.royalties;
      console.log("non-existent tokenid");
      console.log(royaltiesResponse);
      expect(royaltiesResponse[0].account).to.be.equal(accounts[3]);
      expect(royaltiesResponse[0].value.toNumber()).to.be.equal(600);

    });
    it("Luxy royalties: royalties set for collection", async () => {
      await royaltiesRegistry.setRoyaltiesByToken(
        luxy721.address,
        [[accounts[3], 600]]
      ); 

      await luxy721.mint(accounts[2], "TERERE", [[accounts[3], 700], [accounts[2], 200]]); //set royalties by contract

      let partCollection = await royaltiesRegistry.getRoyaltiesByToken(
        luxy721.address
      );
      console.log("collection");
      console.log(partCollection);
      expect(partCollection[0].account).to.be.equal(accounts[3]);
      expect(partCollection[0].value.toNumber()).to.be.equal(600);

    });

    it("Luxy royalties: royalties set upon collection and token 1 and token 2", async () => {
      await royaltiesRegistry.setRoyaltiesByToken(
        luxy721.address,
        [[accounts[3], 600]]
      ); 

      await luxy721.mint(accounts[2], "TERERE", [[accounts[3], 700], [accounts[2], 200]]); //set royalties by contract
      await luxy721.mint(accounts[2], "TERERE2", [[accounts[3], 500]]);

      let part = await royaltiesRegistryTest._getRoyalties(
        royaltiesRegistry.address,
        luxy721.address,
        erc721TokenId1
      );
      let tx_receipt = await part.wait();
      tx_length = tx_receipt.events.length;
      royaltiesResponse = tx_receipt.events[1].args.royalties;
      console.log("token1 and collection");
      console.log(royaltiesResponse);
      expect(royaltiesResponse.length).to.be.equal(3);
      expect(royaltiesResponse[0].account).to.be.equal(accounts[3]);
      expect(royaltiesResponse[1].account).to.be.equal(accounts[3]);
      expect(royaltiesResponse[2].account).to.be.equal(accounts[2]);
      expect(royaltiesResponse[0].value.toNumber()).to.be.equal(600);
      expect(royaltiesResponse[1].value.toNumber()).to.be.equal(700);
      expect(royaltiesResponse[2].value.toNumber()).to.be.equal(200);

      let partCollection = await royaltiesRegistry.getRoyaltiesByToken(
        luxy721.address
      );
      console.log("collection");
      console.log(partCollection);
      expect(partCollection[0].account).to.be.equal(accounts[3]);
      expect(partCollection[0].value.toNumber()).to.be.equal(600);

      part = await royaltiesRegistryTest._getRoyalties(
        royaltiesRegistry.address,
        luxy721.address,
        erc721TokenId2
      );
      tx_receipt = await part.wait();
      royaltiesResponse = tx_receipt.events[1].args.royalties;
      console.log("token2 and collection");
      console.log(royaltiesResponse);
      expect(royaltiesResponse.length).to.be.equal(2);
      expect(royaltiesResponse[0].account).to.be.equal(accounts[3]);
      expect(royaltiesResponse[1].account).to.be.equal(accounts[3]);
      expect(royaltiesResponse[0].value.toNumber()).to.be.equal(600);
      expect(royaltiesResponse[1].value.toNumber()).to.be.equal(500);
    });
    
    it("simple Luxy royalties: no royalties", async () => {

      await luxy721.mint(accounts[2], 'TERERE', []);  //set royalties by contract
      part = await royaltiesRegistry.getRoyalties(luxy721.address, erc721TokenId1);
      const tx_receipt = await part.wait()
      const royaltiesResponse = tx_receipt.events[0].args.royalties
      expect(royaltiesResponse.length).to.be.equal(0);
  });

    it("Luxy royalties: set repetitive address to setRoyaltiesByToken", async () => {
        await expectRevert( royaltiesRegistry.setRoyaltiesByToken(
          luxy721.address,
          [[accounts[3], 600], [accounts[3], 600]]
        ), "Duplicate account detected in royalties"); 

      });
  });
});
