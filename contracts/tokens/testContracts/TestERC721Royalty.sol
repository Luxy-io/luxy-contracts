// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "../../RoyaltiesV1Luxy.sol";

contract TestERC721Royalty is ERC721Upgradeable, RoyaltiesV1Luxy {
    function __TestERC721_init(string memory name_, string memory symbol_)
        public
        initializer
    {
        __Context_init_unchained();
        __ERC165_init_unchained();
        __ERC721_init_unchained(name_, symbol_);
    }

    function mint(address to, uint256 tokenId,
        LibPart.Part[] memory _royalties) external {
        _mint(to, tokenId);
        _setRoyalties(tokenId, _royalties);
    }
}
