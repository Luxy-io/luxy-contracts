// Selector.sol
pragma solidity ^0.8.0;
import "./RoyaltiesV2Impl.sol";
contract Selector {
  // 0x75b24222
  function calcStoreInterfaceId() external pure returns (bytes4) {
    RoyaltiesV2Impl i;
    return i.getRoyalties.selector;
  }
}