// pragma solidity ^0.8.0;
// import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
// import "../HasContractURI.sol";

// contract ERC721LuxyUser is OwnableUpgradeable, ERC721BurnableUpgradeable, HasContractURI {

//     event CreateERC721LuxyUser(address owner, string name, string symbol);

//     function __ERC721LuxyUser_init(string memory _name, string memory _symbol, string memory baseURI, string memory contractURI, address[] memory operators) external initializer {
//         // _setBaseURI(baseURI);
//         // __ERC721Lazy_init_unchained();
//         __Context_init_unchained();
//         __ERC165_init_unchained();
//         __Ownable_init_unchained();
//         __ERC721Burnable_init_unchained();
//         // __Mint721Validator_init_unchained();
//         // __HasContractURI_init_unchained(contractURI);
//         // __RoyaltiesV2Upgradeable_init_unchained();
//         __ERC721_init_unchained(_name, _symbol);
//         for(uint i = 0; i < operators.length; i++) {
//             setApprovalForAll(operators[i], true);
//         }
//         emit CreateERC721LuxyUser(_msgSender(), _name, _symbol);
//     }

//     // function mintAndTransfer(LibERC721LazyMint.Mint721Data memory data, address to) public override virtual {
//     //     require(owner() == data.creators[0].account, "minter is not the owner");
//     //     super.mintAndTransfer(data, to);
//     // }
//     uint256[50] private __gap;
// }