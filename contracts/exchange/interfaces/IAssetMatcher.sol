// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../assets/LibAsset.sol";

interface IAssetMatcher {
    function matchAssets(
        LibAsset.AssetType memory leftAssetType,
        LibAsset.AssetType memory rightAssetType
    ) external pure returns (LibAsset.AssetType memory);
}