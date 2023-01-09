// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../TransferExecutor.sol";

contract TransferExecutorTest is
    Initializable,
    OwnableUpgradeable,
    TransferExecutor
{
    function __TransferExecutorTest_init(
        INftTransferProxy _transferProxy,
        IERC20TransferProxy _erc20TransferProxy,
        address _feeWallet,
        address _burningWallet,
        address _luxyAddress,
        uint256 _burningPercent
    ) external initializer {
        __Ownable_init_unchained();
        __TransferExecutor_init_unchained(
            _transferProxy,
            _erc20TransferProxy,
            _feeWallet,
            _burningWallet,
            _luxyAddress,
            _burningPercent
        );
    }

    function transferTest(
        LibAsset.Asset calldata asset,
        address from,
        address to
    ) external payable {
        TransferExecutor.transfer(asset, from, to, 0x00000000, 0x00000000);
    }
}
