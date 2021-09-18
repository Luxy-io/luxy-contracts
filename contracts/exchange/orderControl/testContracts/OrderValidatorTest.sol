
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "../OrderValidator.sol";
contract OrderValidatorTest is OrderValidator {
    function __OrderValidatorTest_init(string memory name, string memory version) external initializer {
        __OrderValidator_init(name,version);
    }
    function domainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
    function validateOrderTest(LibOrder.Order calldata order, bytes calldata signature) external view {
        return validate(order, signature);
    }
}