// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../INftTransferProxy.sol";

contract TransferProxyTest is INftTransferProxy {
    function erc721safeTransferFrom(
        IERC721Upgradeable token,
        address from,
        address to,
        uint256 tokenId
    ) external override {
        token.safeTransferFrom(from, to, tokenId);
    }

    function erc1155safeTransferFrom(
        IERC1155Upgradeable token,
        address from,
        address to,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external override {
        token.safeTransferFrom(from, to, id, value, data);
    }
}
