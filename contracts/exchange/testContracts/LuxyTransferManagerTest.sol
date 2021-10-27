// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../LuxyTransferManager.sol";
import "../interfaces/ITransferExecutor.sol";
import "../orderControl/OrderValidator.sol";
import "../../Royalties-registry/IRoyaltiesProvider.sol";

contract LuxyTransferManagerTest is
    LuxyTransferManager,
    TransferExecutor,
    OrderValidator
{
    function encode(LibOrderDataV1.DataV1 memory data)
        external
        pure
        returns (bytes memory)
    {
        return abi.encode(data);
    }

    function checkDoTransfers(
        LibAsset.AssetType memory makeMatch,
        LibAsset.AssetType memory takeMatch,
        LibFill.FillResult memory fill,
        LibOrder.Order memory leftOrder,
        LibOrder.Order memory rightOrder
    ) external payable {
        doTransfers(makeMatch, takeMatch, fill, leftOrder, rightOrder);
    }

    function checkFeeReceiver(address token) external view returns (address) {
        return getFeeReceiver(token);
    }

    function __TransferManager_init(
        INftTransferProxy _transferProxy,
        IERC20TransferProxy _erc20TransferProxy,
        uint256 newProtocolFee,
        address newCommunityWallet,
        IRoyaltiesProvider newRoyaltiesProvider
    ) external initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __TransferExecutor_init_unchained(_transferProxy, _erc20TransferProxy);
        __LuxyTransferManager_init_unchained(
            newProtocolFee,
            newCommunityWallet,
            newRoyaltiesProvider
        );
        __OrderValidator_init_unchained("Exchange", "1");
    }
}
