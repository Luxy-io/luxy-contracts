// pragma solidity ^0.8.0;
// import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
// import "./ERC721DefaultApproval.sol";
// import "../HasContractURI.sol";

// abstract contract ERC721Base is OwnableUpgradeable, ERC721DefaultApproval, ERC721BurnableUpgradeable, HasContractURI {

//     // function setDefaultApproval(address operator, bool hasApproval) external onlyOwner {
//     //     _setDefaultApproval(operator, hasApproval);
//     // }

//     // function _isApprovedOrOwner(address spender, uint256 tokenId) internal virtual override(ERC721Upgradeable, ERC721DefaultApproval) view returns (bool) {
//     //     return ERC721DefaultApproval._isApprovedOrOwner(spender, tokenId);
//     // }

//     // function isApprovedForAll(address owner, address operator) public view virtual override(ERC721DefaultApproval, ERC721Upgradeable, IERC721Upgradeable) returns (bool) {
//     //     return ERC721DefaultApproval.isApprovedForAll(owner, operator);
//     // }
    
//     uint256[50] private __gap;
// }