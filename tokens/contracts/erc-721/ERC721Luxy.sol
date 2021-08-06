pragma solidity ^0.8.0;
import "./ERC721Base.sol";

contract ERC721Luxy is ERC721Base {

    event CreateERC721Luxy(address owner, string name, string symbol);

    function __ERC721Luxy_init(string memory _name, string memory _symbol) external initializer {
        __Context_init_unchained();
        __ERC165_init_unchained();
        __Ownable_init_unchained();
        __ERC721URIStorage_init_unchained();
        __Mint721Validator_init_unchained();
        __ERC721_init_unchained(_name,_symbol);
        emit CreateERC721Luxy(_msgSender(), _name, _symbol);
    }
    uint256[50] private __gap;
}