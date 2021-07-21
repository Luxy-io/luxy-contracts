pragma solidity ^0.8.0;
import "../../contracts/RoyaltiesV2.sol";

contract RoyaltiesV2Test {
    RoyaltiesV2 immutable royalties;

    constructor(RoyaltiesV2 _royalties) {
        royalties = _royalties;
    }

    event Test(address account, uint value);

    function royaltiesTest(uint id) public {
        LibPart.Part[] memory result = royalties.getRoyalties(id);

        for (uint i = 0; i < result.length; i++) {
            emit Test(result[i].account, result[i].value);
        }
    }
}