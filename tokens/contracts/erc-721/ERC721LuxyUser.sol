pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "./Mint721Validator.sol";

contract ERC721LuxyUser is
    OwnableUpgradeable,
    ERC721URIStorageUpgradeable,
    Mint721Validator
{
    event CreateERC721LuxyUser(address owner, string name, string symbol);

    function __ERC721LuxyUser_init(
        string memory _name,
        string memory _symbol,
        address[] memory operators
    ) external initializer {
        // _setBaseURI(baseURI);
        // __ERC721Lazy_init_unchained();
        __Context_init_unchained();
        __ERC165_init_unchained();
        __Ownable_init_unchained();
        __ERC721URIStorage_init_unchained();
        // __Mint721Validator_init_unchained();
        // __HasContractURI_init_unchained(contractURI);
        // __RoyaltiesV2Upgradeable_init_unchained();
        __ERC721_init_unchained(_name, _symbol);
        for (uint256 i = 0; i < operators.length; i++) {
            setApprovalForAll(operators[i], true);
        }
        emit CreateERC721LuxyUser(_msgSender(), _name, _symbol);
    }

    function Mint(
        address recipient,
        string memory metadata,
        uint256 tokenId
    ) public returns (uint256) {
        uint256 newItemId = tokenId;
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, metadata);
        return newItemId;
    }

    uint256[50] private __gap;
}
