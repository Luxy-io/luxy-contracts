//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "../RoyaltiesV2Impl.sol";

contract ERC721Luxy is ERC721URIStorageUpgradeable, RoyaltiesV2Impl {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private _tokenIds;

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    function __ERC721Luxy_init(string memory name_, string memory symbol_)
        external
        initializer
    {
        __Context_init_unchained();
        __ERC165_init_unchained();
        __ERC721_init_unchained(name_, symbol_);
        __RoyaltiesV2Impl_init_unchained();
        __ERC721Luxy_init_unchained();
    }

    function __ERC721Luxy_init_unchained() internal initializer {}

    function MintNFT(
        address _recipient,
        string memory _metadata,
        Royalties[] memory _royalties
    ) external returns (uint256) {
        uint256 itemId = _tokenIds.current();
        _mint(_recipient, itemId);
        _setTokenURI(itemId, _metadata);
        _setRoyalties(itemId, _royalties);
        _tokenIds.increment();
        return itemId;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 _interfaceId)
        public
        view
        override
        returns (bool)
    {
        return
            _interfaceId == type(RoyaltiesV2Impl).interfaceId ||
            _interfaceId == type(ERC721URIStorageUpgradeable).interfaceId ||
            super.supportsInterface(_interfaceId);
    }
}
