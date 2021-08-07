pragma solidity ^0.8.0;
import "./RoyaltiesV1Luxy.sol";

contract RoyaltiesV1LuxyTest is RoyaltiesV1Luxy {
   function setRoyalties(uint256 _id, Royalties[] memory _royalties) external {
        _setRoyalties(_id, _royalties);
    }

    function updateAccount(uint256 id, address from, address to) external {
        _updateAccount(id, from, to);
    }



}