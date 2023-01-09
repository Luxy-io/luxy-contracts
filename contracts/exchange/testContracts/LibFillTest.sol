// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "../LibFill.sol";
import "../orderControl/LibOrder.sol";

contract LibFillTest {
    function fillOrder(
        LibOrder.Order calldata leftOrder,
        LibOrder.Order calldata rightOrder,
        uint256 leftOrderFill,
        uint256 rightOrderFill
    ) external pure returns (LibFill.FillResult memory) {
        return
            LibFill.fillOrder(
                leftOrder,
                rightOrder,
                leftOrderFill,
                rightOrderFill
            );
    }
}
