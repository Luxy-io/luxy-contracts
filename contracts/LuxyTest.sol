//SPDX-License-Identifier: MIT
pragma solidity 0.7.1;

import "./token/eERC721.sol";
import "./access/Ownable.sol";
import "./utils/Counters.sol";

contract LuxyTest is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("LuxyTest", "LXT") {}

    function MintNFT(address recipient, string memory metadata)
        public
        onlyOwner
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, metadata);
        return newItemId;
    }
}
