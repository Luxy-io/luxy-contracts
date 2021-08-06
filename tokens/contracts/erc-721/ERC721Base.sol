pragma solidity ^0.8.0;
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";

import "./ERC721DefaultApproval.sol";
import "../HasContractURI.sol";
import "./Mint721Validator.sol";

abstract contract ERC721Base is OwnableUpgradeable, ERC721DefaultApproval,Mint721Validator {

    function setDefaultApproval(address operator, bool hasApproval) external onlyOwner {
        _setDefaultApproval(operator, hasApproval);
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId) internal virtual override( ERC721DefaultApproval) view returns (bool) {
        return ERC721DefaultApproval._isApprovedOrOwner(spender, tokenId);
    }

    function isApprovedForAll(address owner, address operator) public view virtual override(ERC721DefaultApproval) returns (bool) {
        return ERC721DefaultApproval.isApprovedForAll(owner, operator);
    }
    function Mint(address recipient, string memory metadata, uint256 tokenId)
        public
        returns (uint256)
    {
        uint256 newItemId = tokenId;
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, metadata);
        return newItemId;
    }

    
    
    uint256[50] private __gap;
}