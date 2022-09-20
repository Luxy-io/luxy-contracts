const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');
const { expectRevert } = require('@openzeppelin/test-helpers');

describe('LuxyLaunchpad', function () {

    beforeEach(async () => {
        accounts = await ethers.provider.listAccounts();
        [account0, account1, account2, owner, owner2, owner3, owner4] = await ethers.getSigners();
         const artist_ = account1.address;
         const luxyLaunchpadFeeManagerProxy_ = "0xe53a6a915bf51ef0b90411736fc93c3d79eac47b";
         const fee = "2";
         const team = owner.address;
         const LuxyFeeManager = await ethers.getContractFactory('LuxyLaunchpadFeeManager');
         const luxyDropContract = await ethers.getContractFactory('ERC721LuxyDrop');

        luxyFeeManager = await upgrades.deployProxy(
            LuxyFeeManager,
            [fee, team],
            { initializer: '__LuxyLaunchpadFeeManager_init' }
         );
         console.log('luxyFeeManager: ', luxyFeeManager.address);

         luxyDrop = await upgrades.deployProxy(
            luxyDropContract,
            ["", artist_, luxyFeeManager.address],
            { initializer: '__ERC721LuxyDrop_init' }
         );
         console.log('luxyDrop: ', luxyDrop.address);
        
    
    });
    context('Luxy Launchpad tests:', function () {
        it("Test mint function : check functionallity of mint ", async () => {
            await luxyFeeManager.connect(account1).mint(luxyDrop.address, "1", { value: "1000000000000000000" })
        });
    })


});