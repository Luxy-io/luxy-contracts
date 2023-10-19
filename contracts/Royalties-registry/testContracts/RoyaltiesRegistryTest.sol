
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../IRoyaltiesProvider.sol";
import "../../LibPart.sol";

contract RoyaltiesRegistryTest {

    event getRoyaltiesTest(LibPart.Part[] royalties);

    function _getRoyalties(address royaltiesTest, address token, uint tokenId) external returns (LibPart.Part[] memory) {
        IRoyaltiesProvider withRoyalties = IRoyaltiesProvider(royaltiesTest);
        LibPart.Part[] memory royalties = withRoyalties.getRoyalties(token, tokenId);
        emit getRoyaltiesTest(royalties);
        return royalties;
        
    }
}