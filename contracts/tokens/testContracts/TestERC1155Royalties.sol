//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "../../RoyaltiesV1Luxy.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165StorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/IERC1155MetadataURIUpgradeable.sol";

contract TestERC1155Royalties is
    ERC165StorageUpgradeable,
    RoyaltiesV1Luxy,
    ERC1155Upgradeable
{
    function __TestERC1155Royalties_init(string memory uri_)
        public
        initializer
    {
        __Context_init_unchained();
        __ERC165_init_unchained();
        __ERC1155_init_unchained(uri_);
    }

    function mint(
        address to,
        uint256 tokenId,
        LibPart.Part[] memory _fees,
        uint256 amount
    ) external {
        _registerInterface(type(RoyaltiesV1Luxy).interfaceId);
        _mint(to, tokenId, amount, "");
        _setRoyalties(tokenId, _fees);
    }

    function supportsInterface(bytes4 _interfaceId)
        public
        view
        override(
            ERC165StorageUpgradeable,
            ERC1155Upgradeable,
            IERC165Upgradeable
        )
        returns (bool)
    {
        return
            _interfaceId == type(RoyaltiesV1Luxy).interfaceId ||
            _interfaceId == type(ERC165StorageUpgradeable).interfaceId ||
            _interfaceId == type(IERC1155Upgradeable).interfaceId ||
            _interfaceId == type(IERC1155MetadataURIUpgradeable).interfaceId ||
            super.supportsInterface(_interfaceId);
    }

    function getRoyalties(uint256)
        public
        pure
        override
        returns (LibPart.Part[] memory)
    {
        revert("getRaribleV2Royalties failed");
    }
}
