// pragma solidity ^0.8.0;
// import "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165StorageUpgradeable.sol";



// //We will need to add this as dependecy for ERC721Base when we start using lazy minting or some specifc contract to add roayalties and other details on the contracts
// abstract contract HasContractURI is ERC165StorageUpgradeable {

//     string public contractURI;

//     /*
//      * bytes4(keccak256('contractURI()')) == 0xe8a3d485
//      */
//     bytes4 private constant _INTERFACE_ID_CONTRACT_URI = 0xe8a3d485;

//     function __HasContractURI_init_unchained(string memory _contractURI) internal initializer {
//         contractURI = _contractURI;
//         _registerInterface(_INTERFACE_ID_CONTRACT_URI);
//     }

//     /**
//      * @dev Internal function to set the contract URI
//      * @param _contractURI string URI prefix to assign
//      */
//     function _setContractURI(string memory _contractURI) internal {
//         contractURI = _contractURI;
//     }

//     uint256[49] private __gap;
// }